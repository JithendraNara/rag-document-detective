import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

// Disable worker for serverless environment
GlobalWorkerOptions.workerSrc = '';

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

async function extractTextFromPDF(arrayBuffer: ArrayBuffer): Promise<string> {
    const pdf = await getDocument({
        data: new Uint8Array(arrayBuffer),
        useSystemFonts: true,
        disableFontFace: true,
    }).promise;

    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((item: any) => item.str || '')
            .join(' ');
        fullText += pageText + '\n';
    }

    return fullText;
}

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const password = formData.get('password') as string;

        // 1. Simple Security Check
        if (password !== process.env.ADMIN_PASSWORD) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // 2. Read PDF
        const arrayBuffer = await file.arrayBuffer();
        const text = await extractTextFromPDF(arrayBuffer);

        if (!text || text.trim().length === 0) {
            return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 });
        }

        // 3. Chunk Text
        const chunkSize = 1000;
        const overlap = 200;
        const chunks: string[] = [];

        for (let i = 0; i < text.length; i += chunkSize - overlap) {
            chunks.push(text.slice(i, i + chunkSize));
        }

        // 4. Generate Embeddings & Upload to Pinecone
        const index = pinecone.index(process.env.PINECONE_INDEX_NAME || 'doc-chat');

        // Process in batches
        const batchSize = 10;
        for (let i = 0; i < chunks.length; i += batchSize) {
            const batch = chunks.slice(i, i + batchSize);

            const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    input: batch,
                    model: 'text-embedding-3-small'
                })
            });

            const embeddingData = await embeddingResponse.json();

            if (embeddingData.error) {
                console.error('OpenAI Error:', embeddingData.error);
                throw new Error(embeddingData.error.message);
            }

            const vectors = batch.map((chunk, idx) => ({
                id: `${file.name}-${Date.now()}-${i + idx}`,
                values: embeddingData.data[idx].embedding,
                metadata: {
                    text: chunk,
                    source: file.name
                }
            }));

            await index.upsert(vectors);
        }

        return NextResponse.json({ success: true, chunks: chunks.length });

    } catch (error: unknown) {
        console.error('Ingestion error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
