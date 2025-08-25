const OpenAI = require('openai');

class OpenAIManager {
  constructor(questionCache = null) {
    this.questionCache = questionCache;
    this.openai = null;
    this.apiKey = null;
    this.isConfigured = false;
    
    // Default prompt for generating questions
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
      this.openai = new OpenAI({
        apiKey: apiKey
      });
      this.isConfigured = true;
      return { success: true };
    } catch (error) {
      console.error('Failed to configure OpenAI:', error);
      this.isConfigured = false;
      return { success: false, error: error.message };
    }
  }

  isReady() {
    return this.isConfigured && this.apiKey;
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
      throw new Error('OpenAI not configured. Please set your API key in settings.');
    }

    try {
      const prompt = this.getCurrentPrompt()
        .replace('{topic}', topic + (customTopicDetails ? ` (${customTopicDetails})` : ''))
        .replace('{level}', level);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educator who creates high-quality multiple-choice questions for learning. Always respond with valid JSON in the exact format requested.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      });

      const content = response.choices[0].message.content.trim();
      
      // Try to parse JSON from the response
      let questionData;
      try {
        // Remove any markdown code blocks
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        questionData = JSON.parse(cleanContent);
      } catch (parseError) {
        // If JSON parsing fails, try to extract question data manually
        console.warn('Failed to parse JSON, attempting manual extraction:', parseError);
        throw new Error('Failed to parse OpenAI response. Please try again.');
      }

      // Validate the response structure
      if (!questionData.question || !Array.isArray(questionData.options) || 
          questionData.options.length !== 4 || typeof questionData.correct !== 'number' ||
          !questionData.explanation) {
        throw new Error('Invalid question format received from OpenAI');
      }

      // Generate a unique ID
      const id = 'ai_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      const generatedQuestion = {
        id: id,
        question: questionData.question,
        options: questionData.options,
        correct: questionData.correct,
        explanation: questionData.explanation,
        topic: topic,
        level: level,
        source: 'openai',
        generated_at: new Date().toISOString()
      };

      // Save to cache if available
      if (this.questionCache) {
        this.questionCache.addQuestion(generatedQuestion);
      }

      return generatedQuestion;

    } catch (error) {
      console.error('Error generating question with OpenAI:', error);
      
      if (error.message.includes('API key')) {
        throw new Error('Invalid API key. Please check your OpenAI API key in settings.');
      } else if (error.message.includes('quota')) {
        throw new Error('OpenAI quota exceeded. Please check your OpenAI account.');
      } else if (error.message.includes('network') || error.message.includes('timeout')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(`Failed to generate question: ${error.message}`);
      }
    }
  }

  async validateAnswer(question, userAnswer, correctAnswer) {
    if (!this.isReady()) {
      // Return basic validation if OpenAI is not configured
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

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful tutor providing feedback on quiz answers. Be encouraging and educational.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      });

      return {
        correct: userAnswer === correctAnswer,
        explanation: response.choices[0].message.content.trim(),
        enhanced: true
      };

    } catch (error) {
      console.error('Error validating answer with OpenAI:', error);
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

      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 200,
        temperature: 0.5
      });

      const suggestions = response.choices[0].message.content
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

module.exports = OpenAIManager;
