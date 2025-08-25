const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiManager {
  constructor(questionCache = null) {
    this.questionCache = questionCache;
    this.genAI = null;
    this.model = null;
    this.apiKey = null;
    this.isConfigured = false;
    
    // Default prompt for generating questions (same structure as OpenAI)
    this.defaultPrompt = `Generate a multiple-choice question about the given topic and difficulty level. 

Requirements:
- Create 1 question with exactly 4 options (A, B, C, D)
- Make the question appropriate for the specified difficulty level
- Ensure only one correct answer
- Provide a clear, concise explanation (exactly 2 lines) for the correct answer
- Focus on practical, applicable knowledge
- Make explanations educational and helpful for learning

Topic: {topic}
Difficulty Level: {level}

Response format (JSON):
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "explanation": "First line: Why the correct answer is right. Second line: Additional context or why other options are wrong."
}

IMPORTANT: The explanation must be exactly 2 lines - first line explains why the correct answer is right, second line provides additional learning context or explains why other options are incorrect. Make sure the question tests understanding, not just memorization.`;

    this.customPrompt = null;
  }

  configure(apiKey) {
    try {
      this.apiKey = apiKey;
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      this.isConfigured = true;
      return { success: true };
    } catch (error) {
      console.error('Failed to configure Gemini:', error);
      this.isConfigured = false;
      return { success: false, error: error.message };
    }
  }

  isReady() {
    return this.isConfigured && this.apiKey && this.model;
  }

  setCustomPrompt(prompt) {
    this.customPrompt = prompt;
  }

  resetPrompt() {
    this.customPrompt = null;
  }

  getCurrentPrompt() {
    return this.customPrompt || this.defaultPrompt;
  }

  getDefaultPrompt() {
    return this.defaultPrompt;
  }

  async generateQuestion(topic, level = 'intermediate', customTopicDetails = '') {
    if (!this.isReady()) {
      throw new Error('Gemini not configured. Please set your API key in settings.');
    }

    try {
      const prompt = this.getCurrentPrompt()
        .replace('{topic}', topic + (customTopicDetails ? ` (${customTopicDetails})` : ''))
        .replace('{level}', level);

      const fullPrompt = `You are an expert educator who creates high-quality multiple-choice questions for learning. Always respond with valid JSON in the exact format requested.

${prompt}`;

      const result = await this.model.generateContent(fullPrompt);

      const response = await result.response;
      const content = response.text().trim();
      
      // Try to parse JSON from the response
      let questionData;
      try {
        // Remove any markdown code blocks
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        questionData = JSON.parse(cleanContent);
      } catch (parseError) {
        console.warn('Failed to parse JSON, attempting manual extraction:', parseError);
        throw new Error('Failed to parse Gemini response. Please try again.');
      }

      // Validate the response structure
      if (!questionData.question || !Array.isArray(questionData.options) || 
          questionData.options.length !== 4 || typeof questionData.correct !== 'number' ||
          !questionData.explanation) {
        throw new Error('Invalid question format received from Gemini');
      }

      // Generate a unique ID
      const id = 'gemini_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      const generatedQuestion = {
        id: id,
        question: questionData.question,
        options: questionData.options,
        correct: questionData.correct,
        explanation: questionData.explanation,
        topic: topic,
        level: level,
        source: 'gemini',
        generated_at: new Date().toISOString()
      };

      // Save to cache if available
      if (this.questionCache) {
        this.questionCache.addQuestion(generatedQuestion);
      }

      return generatedQuestion;

    } catch (error) {
      console.error('Error generating question with Gemini:', error);
      
      if (error.message.includes('API key') || error.message.includes('INVALID_API_KEY') || error.status === 400) {
        throw new Error('Invalid Gemini API key. Please check your API key in settings and ensure it has the correct permissions.');
      } else if (error.message.includes('quota') || error.message.includes('QUOTA_EXCEEDED') || error.status === 429) {
        throw new Error('Gemini quota exceeded. Please check your Google AI account.');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else if (error.status === 403) {
        throw new Error('Gemini API access denied. Please verify your API key has the correct permissions.');
      } else {
        throw new Error(`Failed to generate question with Gemini: ${error.message}`);
      }
    }
  }

  async validateAnswer(question, userAnswer, correctAnswer) {
    if (!this.isReady()) {
      // Return basic validation if Gemini is not configured
      return {
        correct: userAnswer === correctAnswer,
        explanation: question.explanation || "Answer explanation not available."
      };
    }

    try {
      const prompt = `Analyze this quiz question and provide feedback:

Question: ${question.question}
Options: ${question.options.map((opt, idx) => `${String.fromCharCode(65 + idx)}) ${opt}`).join('\n')}
User's Answer: ${question.options[userAnswer]}
Correct Answer: ${question.options[correctAnswer]}

Provide a brief, encouraging explanation (2-3 sentences) that:
1. Confirms if the answer is correct or incorrect
2. Explains why the correct answer is right
3. If incorrect, briefly mentions why the user's choice was wrong
4. Provides additional learning context

Keep it concise and educational.`;

      const fullPrompt = `You are a helpful tutor providing feedback on quiz answers. Be encouraging and educational.

${prompt}`;

      const result = await this.model.generateContent(fullPrompt);

      const response = await result.response;

      return {
        correct: userAnswer === correctAnswer,
        explanation: response.text().trim(),
        enhanced: true
      };

    } catch (error) {
      console.error('Error validating answer with Gemini:', error);
      // Fallback to basic validation
      return {
        correct: userAnswer === correctAnswer,
        explanation: question.explanation || "Answer explanation not available.",
        enhanced: false
      };
    }
  }

  async getTopicSuggestions(subject) {
    if (!this.isReady()) {
      return this.getDefaultTopicSuggestions(subject);
    }

    try {
      const prompt = `Suggest 5-7 specific learning topics for: ${subject}

Make them:
- Specific and focused (not too broad)
- Appropriate for quiz questions
- Progressive in difficulty
- Practical and applicable

Format as a simple list, one topic per line.`;

      const result = await this.model.generateContent(prompt);

      const response = await result.response;
      const suggestions = response.text()
        .trim()
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*|-\s*/, '').trim())
        .filter(line => line.length > 0);

      return suggestions;

    } catch (error) {
      console.error('Error getting topic suggestions:', error);
      return this.getDefaultTopicSuggestions(subject);
    }
  }

  getDefaultTopicSuggestions(subject) {
    const suggestions = {
      'programming': ['Variables and Data Types', 'Control Structures', 'Functions and Methods', 'Object-Oriented Programming', 'Error Handling', 'Algorithms and Data Structures'],
      'web development': ['HTML Fundamentals', 'CSS Styling', 'JavaScript Basics', 'DOM Manipulation', 'APIs and AJAX', 'Responsive Design'],
      'data science': ['Data Cleaning', 'Statistical Analysis', 'Machine Learning Basics', 'Data Visualization', 'Pandas and NumPy', 'Model Evaluation'],
      'default': ['Basic Concepts', 'Intermediate Topics', 'Advanced Concepts', 'Best Practices', 'Common Pitfalls', 'Real-world Applications']
    };

    return suggestions[subject.toLowerCase()] || suggestions['default'];
  }
}

module.exports = GeminiManager;
