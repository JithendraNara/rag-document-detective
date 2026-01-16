// Polyfills MUST be defined before any imports that use pdfjs-dist
declare const globalThis: typeof global;

// @ts-expect-error - Polyfill for serverless
globalThis.DOMMatrix = globalThis.DOMMatrix || class DOMMatrix {
    m11 = 1; m12 = 0; m13 = 0; m14 = 0;
    m21 = 0; m22 = 1; m23 = 0; m24 = 0;
    m31 = 0; m32 = 0; m33 = 1; m34 = 0;
    m41 = 0; m42 = 0; m43 = 0; m44 = 1;
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0;
    is2D = true; isIdentity = true;
    inverse() { return new DOMMatrix(); }
    multiply() { return new DOMMatrix(); }
    scale() { return new DOMMatrix(); }
    translate() { return new DOMMatrix(); }
    transformPoint() { return { x: 0, y: 0, z: 0, w: 1 }; }
};

// @ts-expect-error - Polyfill for serverless
globalThis.Path2D = globalThis.Path2D || class Path2D {
    addPath() {} closePath() {} moveTo() {} lineTo() {}
    bezierCurveTo() {} quadraticCurveTo() {} arc() {}
    arcTo() {} ellipse() {} rect() {}
};

// @ts-expect-error - Polyfill for serverless
globalThis.ImageData = globalThis.ImageData || class ImageData {
    width = 0; height = 0; data = new Uint8ClampedArray();
    colorSpace = 'srgb';
    constructor(w?: number, h?: number) {
        this.width = w || 0; this.height = h || 0;
        this.data = new Uint8ClampedArray((w || 0) * (h || 0) * 4);
    }
};

import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require('pdf-parse');

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

        // 2. Read PDF
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const data = await pdf(buffer);
        const text: string = data.text;

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
