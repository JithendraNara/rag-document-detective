import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { Pinecone } from '@pinecone-database/pinecone';

// 1. Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export async function POST(req: Request) {
  // 2. Get the list of messages from the frontend
  const { messages } = await req.json();
  const lastMessage = messages[messages.length - 1].content;

  // 3. Turn the user's question into a "vector" (numbers)
  // MUST use the same model as your ingest.py script!
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME || "doc-chat");

  // We use OpenAI directly to generate the embedding for the query
  const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: lastMessage,
      model: 'text-embedding-3-small'
    })
  });
  const embeddingData = await embeddingResponse.json();
  const queryVector = embeddingData.data[0].embedding;

  // 4. Query Pinecone for the 3 most relevant paragraphs
  const queryResponse = await index.query({
    vector: queryVector,
    topK: 3,
    includeMetadata: true,
  });

  // 5. Combine the found text into a big string
  // LangChain stores content in 'pageContent' field, but sometimes 'text' is used
  const contextText = queryResponse.matches
    .map(match => (match.metadata?.pageContent || match.metadata?.text || '') as string)
    .join('\n\n---\n\n');

  console.log('Context found:', contextText.length > 0 ? 'Yes' : 'No');
  console.log('Number of matches:', queryResponse.matches.length);

  // 6. Send everything to ChatGPT (using gpt-4o-mini for cost efficiency)
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    system: `You are a helpful assistant. Use the specific Context below to answer the user. 
    If the answer is not in the Context, say "I don't know based on this document."
    
    Context:
    ${contextText}`,
    messages,
  });

  return result.toTextStreamResponse();
}
