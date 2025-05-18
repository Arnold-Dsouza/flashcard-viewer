export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category?: string;
  hint?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
}

export interface AIGenerateRequest {
  topic: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  count?: number;
}
