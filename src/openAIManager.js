const OpenAI = require('openai');

class OpenAIManager {
  constructor(questionCache = null) {
    this.questionCache = questionCache;
    this.openai = null;
    this.apiKey = null;
    this.isConfigured = false;
    
    // Default prompt for generating questions
    this.defaultPrompt = `Generate a comprehensive multiple-choice question about the given topic and difficulty level. 

Requirements:
- Create 1 question with exactly 4 options (A, B, C, D)
- Make the question appropriate for the specified difficulty level
- Ensure only one correct answer
- Provide detailed explanations for ALL options (correct and incorrect)
- Focus on practical, applicable knowledge
- Make explanations educational and helpful for learning

Topic: {topic}
Difficulty Level: {level}

Response format (JSON):
{
  "question": "Your question here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "explanation": "Clear explanation of why the correct answer is right and its practical applications.",
  "explanations": {
    "0": "Detailed explanation for option A - why it's correct/incorrect and where it's used",
    "1": "Detailed explanation for option B - why it's correct/incorrect and where it's used", 
    "2": "Detailed explanation for option C - why it's correct/incorrect and where it's used",
    "3": "Detailed explanation for option D - why it's correct/incorrect and where it's used"
  }
}

IMPORTANT: 
- The "explanation" field should explain the correct answer and its practical applications
- The "explanations" object must contain detailed explanations for ALL 4 options
- For incorrect options, explain WHY they are wrong and where they might be confused with the correct answer
- For the correct option, explain WHY it's right and provide real-world usage examples
- Make sure the question tests understanding, not just memorization.`;

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

      // Validate the basic response structure
      if (!questionData.question || !Array.isArray(questionData.options) || 
          questionData.options.length !== 4 || typeof questionData.correct !== 'number' ||
          !questionData.explanation) {
        throw new Error('Invalid question format received from OpenAI');
      }

      // Handle missing explanations object (backward compatibility)
      if (!questionData.explanations) {
        console.warn('OpenAI response missing detailed explanations, creating fallback explanations');
        questionData.explanations = {};
        
        // Create basic explanations based on the main explanation
        for (let i = 0; i < 4; i++) {
          if (i === questionData.correct) {
            questionData.explanations[i.toString()] = questionData.explanation;
          } else {
            questionData.explanations[i.toString()] = `This option is incorrect. ${questionData.explanation}`;
          }
        }
      } else {
        // Validate that explanations exist for all options
        for (let i = 0; i < 4; i++) {
          if (!questionData.explanations[i.toString()]) {
            console.warn(`Missing explanation for option ${i}, using fallback`);
            if (i === questionData.correct) {
              questionData.explanations[i.toString()] = questionData.explanation;
            } else {
              questionData.explanations[i.toString()] = `This option is incorrect. The correct answer is option ${String.fromCharCode(65 + questionData.correct)}.`;
            }
          }
        }
      }

      // Generate a unique ID
      const id = 'ai_' + Date.now() + '_' + Math.floor(Math.random() * 1000);

      const generatedQuestion = {
        id: id,
        question: questionData.question,
        options: questionData.options,
        correct: questionData.correct,
        explanation: questionData.explanation,
        explanations: questionData.explanations, // Detailed explanations for all options
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
    const isCorrect = userAnswer === correctAnswer;
    
    // Use pre-generated explanations if available (no additional API call needed)
    if (question.explanations && question.explanations[userAnswer.toString()]) {
      let explanation = '';
      
      if (isCorrect) {
        explanation = `🎉 Correct! ${question.explanations[userAnswer.toString()]}`;
      } else {
        const userExplanation = question.explanations[userAnswer.toString()];
        const correctExplanation = question.explanations[correctAnswer.toString()];
        explanation = `❌ Incorrect. Your choice: ${userExplanation}\n\n✅ Correct answer: ${correctExplanation}`;
      }
      
      return {
        correct: isCorrect,
        explanation: explanation,
        enhanced: true,
        userChoiceExplanation: question.explanations[userAnswer.toString()],
        correctChoiceExplanation: question.explanations[correctAnswer.toString()]
      };
    }
    
    // Fallback to basic explanation if detailed explanations not available
    return {
      correct: isCorrect,
      explanation: question.explanation || "Answer explanation not available.",
      enhanced: false
    };
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
