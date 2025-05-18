// Flashcard AI mock service
// This simulates an AI service for generating flashcards without requiring external dependencies

export const ai = {
  // Mock implementation of flashcard generation
  generateFlashcards: async (topic: string, difficulty: string, count: number = 5) => {
    console.log(`Generating ${count} flashcards about "${topic}" with ${difficulty} difficulty`);
    
    // In a real implementation, this would call an actual AI service
    // For now, we'll return mock flashcards with the topic incorporated
    const mockCards = Array(count).fill(null).map((_, i) => ({
      id: `generated-${Date.now()}-${i}`,
      question: `Sample question ${i+1} about ${topic}?`,
      answer: `Sample answer ${i+1} about ${topic}`,
      category: 'Generated',
      difficulty,
    }));
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return mockCards;
  }
};
