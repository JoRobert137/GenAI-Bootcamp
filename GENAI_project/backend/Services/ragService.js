import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5173";

class RAGService {
  
  // Query LawBot with RAG
  async queryLawBot(question) {
    try {
      const response = await axios.post(`${API_BASE_URL}/lawbot`, {
        question: question
      });
      
      return response.data;
    } catch (error) {
      console.error('RAG Service error:', error);
      throw new Error('Failed to get legal information');
    }
  }

  // For other modules (Scheme Finder, etc.)
  async querySchemeFinder(userProfile) {
    // Similar implementation for schemes
    // You can expand this later
  }
}

export const ragService = new RAGService();