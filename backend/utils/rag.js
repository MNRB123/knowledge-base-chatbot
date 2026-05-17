const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Split text into chunks of ~500 tokens
function chunkText(text, chunkSize = 500, overlap = 50) {
  const words = text.split(/\s+/);
  const chunks = [];
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim()) chunks.push(chunk.trim());
    if (i + chunkSize >= words.length) break;
  }
  return chunks;
}

// Generate embedding for a text string
async function generateEmbedding(text) {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text.slice(0, 8000) // limit to 8k chars
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error('Embedding error:', error.message);
    return [];
  }
}

// Cosine similarity between two vectors
function cosineSimilarity(vecA, vecB) {
  if (!vecA.length || !vecB.length || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Retrieve top-K relevant chunks from all documents
function retrieveRelevantChunks(queryEmbedding, documents, topK = 5) {
  const allChunks = [];

  for (const doc of documents) {
    for (const chunk of doc.chunks) {
      if (chunk.embedding && chunk.embedding.length > 0) {
        const score = cosineSimilarity(queryEmbedding, chunk.embedding);
        allChunks.push({
          docId: doc._id,
          title: doc.title,
          content: chunk.content,
          score,
          chunkIndex: chunk.chunkIndex
        });
      }
    }
  }

  return allChunks
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// Generate answer using GPT with retrieved context
async function generateAnswer(question, context, language = 'en') {
  const langInstruction = language === 'hi' 
    ? 'Answer in Hindi (Devanagari script). Keep the answer clear and helpful.'
    : 'Answer in English. Keep the answer clear and helpful.';

  const systemPrompt = `You are a helpful knowledge base assistant for a company. 
Your job is to answer user questions accurately based ONLY on the provided context documents.
${langInstruction}
If the answer is not in the context, say so clearly and suggest the user contact support.
Always cite which document the information comes from when possible.
Format your response with clear paragraphs. Use bullet points when listing items.`;

  const userPrompt = `Context from knowledge base:
${context}

---
User Question: ${question}

Please provide a helpful, accurate answer based on the context above.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: 800,
    temperature: 0.3
  });

  return {
    answer: response.choices[0].message.content,
    tokensUsed: response.usage?.total_tokens || 0
  };
}

module.exports = {
  chunkText,
  generateEmbedding,
  retrieveRelevantChunks,
  generateAnswer
};
