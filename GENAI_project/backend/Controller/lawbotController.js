const { GoogleGenerativeAI } = require('@google/generative-ai');
const lawsData = require('../data/laws.json');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Simple keyword search function
function findRelevantLaws(question, lawsData) {
  const query = question.toLowerCase();
  
  return lawsData.legalDocuments.filter(law => {
    return law.keywords.some(keyword => 
      query.includes(keyword.toLowerCase())
    );
  }).slice(0, 3);
}

// Original LawBot controller
const handleLawBotQuery = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Your existing logic here
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(message);
    const response = await result.response;
    
    res.json({ 
      reply: {
        summary: "Legal information",
        sections: [
          {
            title: "Legal Guidance",
            content: [{ text: response.text() }]
          }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// RAG LawBot controller
const handleRAGLawBotQuery = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Find relevant laws
    const relevantLaws = findRelevantLaws(question, lawsData);
    
    if (relevantLaws.length === 0) {
      return res.json({
        response: "I don't have specific information about this legal topic in my knowledge base. Please consult official sources or legal professionals.",
        sources: []
      });
    }

    // 2. Build context
    const context = relevantLaws.map(law => 
      `Law: ${law.title}\nContent: ${law.content}`
    ).join('\n\n');

    // 3. Create RAG prompt
    const prompt = `
CONTEXT:
${context}

QUESTION: ${question}

IMPORTANT: Answer using ONLY the context above. If context doesn't have information, say so. Keep responses simple.

RESPONSE:`;

    // 4. Call Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    res.json({
      response: response.text(),
      sources: relevantLaws.map(law => ({ 
        title: law.title, 
        category: law.category 
      }))
    });
    
  } catch (error) {
    console.error('RAG LawBot error:', error);
    res.status(500).json({ 
      error: 'RAG system error',
      details: error.message 
    });
  }
};

module.exports = {
  handleLawBotQuery,
  handleRAGLawBotQuery
};