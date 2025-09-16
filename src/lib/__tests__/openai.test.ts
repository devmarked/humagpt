import { 
  createFreelancerEmbeddingText, 
  cosineSimilarity, 
  isOpenAIConfigured 
} from '../openai';

describe('OpenAI Utilities', () => {
  describe('createFreelancerEmbeddingText', () => {
    it('should combine freelancer data into searchable text', () => {
      const freelancerData = {
        title: 'Full Stack Developer',
        description: 'Experienced developer with React and Node.js',
        skills: ['React', 'Node.js', 'TypeScript'],
        specializations: ['web_development', 'fullstack_development'],
        location: 'San Francisco',
        experience_level: 'expert'
      };

      const result = createFreelancerEmbeddingText(freelancerData);
      
      expect(result).toContain('Full Stack Developer');
      expect(result).toContain('Experienced developer with React and Node.js');
      expect(result).toContain('React, Node.js, TypeScript');
      expect(result).toContain('web_development, fullstack_development');
      expect(result).toContain('San Francisco');
      expect(result).toContain('expert');
    });

    it('should handle empty/undefined values gracefully', () => {
      const freelancerData = {
        title: 'Developer',
        description: 'Great developer',
        skills: [],
        specializations: [],
        location: undefined,
        experience_level: undefined
      };

      const result = createFreelancerEmbeddingText(freelancerData);
      
      expect(result).toBe('Developer Great developer');
    });

    it('should filter out empty strings', () => {
      const freelancerData = {
        title: '',
        description: 'Good developer',
        skills: ['React'],
        specializations: ['web_development'],
        location: '',
        experience_level: 'intermediate'
      };

      const result = createFreelancerEmbeddingText(freelancerData);
      
      expect(result).toBe('Good developer React web_development intermediate');
    });
  });

  describe('cosineSimilarity', () => {
    it('should calculate cosine similarity correctly', () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBe(0); // Orthogonal vectors
    });

    it('should return 1 for identical vectors', () => {
      const vectorA = [1, 2, 3];
      const vectorB = [1, 2, 3];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBe(1);
    });

    it('should handle zero vectors', () => {
      const vectorA = [0, 0, 0];
      const vectorB = [1, 2, 3];
      
      const similarity = cosineSimilarity(vectorA, vectorB);
      expect(similarity).toBe(0);
    });

    it('should throw error for different length vectors', () => {
      const vectorA = [1, 2];
      const vectorB = [1, 2, 3];
      
      expect(() => cosineSimilarity(vectorA, vectorB))
        .toThrow('Vectors must have the same length');
    });
  });

  describe('isOpenAIConfigured', () => {
    const originalEnv = process.env.OPENAI_API_KEY;

    afterEach(() => {
      process.env.OPENAI_API_KEY = originalEnv;
    });

    it('should return true when API key is configured', () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      expect(isOpenAIConfigured()).toBe(true);
    });

    it('should return false when API key is not configured', () => {
      delete process.env.OPENAI_API_KEY;
      expect(isOpenAIConfigured()).toBe(false);
    });

    it('should return false when API key is empty string', () => {
      process.env.OPENAI_API_KEY = '';
      expect(isOpenAIConfigured()).toBe(false);
    });
  });
});
