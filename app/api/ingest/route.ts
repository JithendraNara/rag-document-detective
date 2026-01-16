
import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

// Polyfill for Vercel Serverless environment to prevent DOMMatrix errors
if (typeof global.DOMMatrix === 'undefined') {
    // @ts-ignore
    global.DOMMatrix = class DOMMatrix { };
}
if (typeof global.ImageData === 'undefined') {
    // @ts-ignore
    global.ImageData = class ImageData { };
}
if (typeof global.Path2D === 'undefined') {
    // @ts-ignore
    global.Path2D = class Path2D { };
}

// Use require for pdf-parse (it works best with next.config.ts canvas: false)
// @ts-ignore
let pdf = require('pdf-parse');
// Handle ES Module default export if present
if (typeof pdf !== 'function' && pdf.default) {
    pdf = pdf.default;
}

const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
});

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

        // 2. Read PDF using pdf-parse
        const buffer = Buffer.from(await file.arrayBuffer());

        // pdf-parse is synchronous/promise-based and simple
        const data = await pdf(buffer);
        const text = data.text;

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

    } catch (error: any) {
        console.error('Ingestion error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
