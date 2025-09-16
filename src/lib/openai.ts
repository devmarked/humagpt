import OpenAI from 'openai';

// Initialize OpenAI client - only on server side
function createOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
  }
  
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Cache client instance
let openai: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    openai = createOpenAIClient();
  }
  return openai;
}

/**
 * Generate embedding for text using OpenAI's text-embedding-3-small model
 * @param text - Text to embed
 * @param model - OpenAI embedding model (default: text-embedding-3-small)
 * @returns Promise<number[]> - 1536-dimensional embedding vector
 */
export async function generateEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text cannot be empty');
  }

  try {
    const client = getOpenAIClient();
    
    const response = await client.embeddings.create({
      model,
      input: text.trim(),
      encoding_format: 'float',
    });

    if (!response.data || response.data.length === 0) {
      throw new Error('No embedding data received from OpenAI');
    }

    const embedding = response.data[0].embedding;
    
    // Validate embedding dimensions (should be 1536 for text-embedding-3-small)
    if (embedding.length !== 1536) {
      throw new Error(`Expected 1536 dimensions, got ${embedding.length}`);
    }

    return embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate embedding: ${error.message}`);
    }
    
    throw new Error('Failed to generate embedding: Unknown error');
  }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @param model - OpenAI embedding model (default: text-embedding-3-small)
 * @returns Promise<number[][]> - Array of 1536-dimensional embedding vectors
 */
export async function generateEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-small'
): Promise<number[][]> {
  if (!texts || texts.length === 0) {
    return [];
  }

  // Filter out empty texts
  const validTexts = texts.filter(text => text && text.trim().length > 0);
  
  if (validTexts.length === 0) {
    throw new Error('No valid texts provided');
  }

  try {
    const client = getOpenAIClient();
    
    const response = await client.embeddings.create({
      model,
      input: validTexts.map(text => text.trim()),
      encoding_format: 'float',
    });

    if (!response.data || response.data.length !== validTexts.length) {
      throw new Error(`Expected ${validTexts.length} embeddings, got ${response.data?.length || 0}`);
    }

    return response.data.map((item: any, index: number) => {
      const embedding = item.embedding;
      
      // Validate embedding dimensions
      if (embedding.length !== 1536) {
        throw new Error(`Expected 1536 dimensions for text ${index}, got ${embedding.length}`);
      }
      
      return embedding;
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    
    if (error instanceof Error) {
      throw new Error(`Failed to generate embeddings: ${error.message}`);
    }
    
    throw new Error('Failed to generate embeddings: Unknown error');
  }
}

/**
 * Create searchable text from freelancer data for embedding generation
 * @param freelancerData - Freelancer profile data
 * @returns string - Combined text for embedding
 */
export function createFreelancerEmbeddingText(freelancerData: {
  title: string;
  description: string;
  skills: string[];
  specializations: string[];
  location?: string;
  experience_level?: string;
}): string {
  const parts = [
    freelancerData.title,
    freelancerData.description,
    freelancerData.skills.join(', '),
    freelancerData.specializations.join(', '),
    freelancerData.location || '',
    freelancerData.experience_level || '',
  ];

  return parts
    .filter(part => part && part.trim().length > 0)
    .join(' ')
    .trim();
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param a - First embedding vector
 * @param b - Second embedding vector
 * @returns number - Cosine similarity score (0-1)
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  normA = Math.sqrt(normA);
  normB = Math.sqrt(normB);

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (normA * normB);
}

/**
 * Validate that the OpenAI API key is configured
 * @returns boolean - True if API key is available
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
