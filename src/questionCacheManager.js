const fs = require('fs');
const path = require('path');

class QuestionCacheManager {
  constructor() {
    this.cacheFilePath = path.join(process.cwd(), 'ai-questions-cache.json');
    this.cache = this.loadCache();
    
    // Ensure cache file exists and is properly initialized
    this.initializeCache();
  }

  loadCache() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        const data = fs.readFileSync(this.cacheFilePath, 'utf8');
        const cache = JSON.parse(data);
        
        // Validate cache structure
        if (cache && typeof cache === 'object' && Array.isArray(cache.questions)) {
          return cache;
        }
      }
    } catch (error) {
      console.error('Error loading question cache:', error);
    }

    // Return default cache structure
    return {
      metadata: {
        version: "1.0",
        description: "AI Generated Questions Cache - Feel free to manually add questions!",
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalQuestions: 0,
        instructions: {
          "How to add questions manually": [
            "1. Add new question objects to the 'questions' array",
            "2. Follow the exact format of existing questions",
            "3. Set 'source' to 'manual' for manually added questions",
            "4. Use 'correct' as the index (0-3) of the correct answer",
            "5. Save the file and restart the app to load new questions"
          ],
          "Question format": {
            "id": "unique_id_string",
            "question": "Your question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
            "explanation": "Explanation of the correct answer",
            "topic": "topic_name",
            "level": "beginner|intermediate|advanced", 
            "source": "openai|gemini|manual",
            "generated_at": "2024-01-01T00:00:00.000Z"
          }
        }
      },
      questions: []
    };
  }

  initializeCache() {
    // Check if cache file exists, if not create it
    if (!fs.existsSync(this.cacheFilePath)) {
      console.log('Cache file not found, creating new ai-questions-cache.json...');
      this.saveCache();
      console.log('Cache file created successfully at:', this.cacheFilePath);
    } else {
      // File exists, just validate it has the correct structure
      if (!this.cache.questions || !Array.isArray(this.cache.questions)) {
        console.log('Cache file exists but has invalid structure, reinitializing...');
        this.cache = this.getDefaultCacheStructure();
        this.saveCache();
      }
    }
  }

  getDefaultCacheStructure() {
    return {
      metadata: {
        version: "1.0",
        description: "AI Generated Questions Cache - Feel free to manually add questions!",
        created: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalQuestions: 0,
        instructions: {
          "How to add questions manually": [
            "1. Add new question objects to the 'questions' array",
            "2. Follow the exact format of existing questions",
            "3. Set 'source' to 'manual' for manually added questions",
            "4. Use 'correct' as the index (0-3) of the correct answer",
            "5. Save the file and restart the app to load new questions"
          ],
          "Question format": {
            "id": "unique_id_string",
            "question": "Your question text here?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct": 0,
            "explanation": "Explanation of the correct answer",
            "topic": "topic_name",
            "level": "beginner|intermediate|advanced", 
            "source": "openai|gemini|manual",
            "generated_at": "2024-01-01T00:00:00.000Z"
          }
        }
      },
      questions: []
    };
  }

  saveCache() {
    try {
      // Update metadata
      this.cache.metadata.lastUpdated = new Date().toISOString();
      this.cache.metadata.totalQuestions = this.cache.questions.length;

      // Write to file with pretty formatting for human readability
      const jsonData = JSON.stringify(this.cache, null, 2);
      fs.writeFileSync(this.cacheFilePath, jsonData, 'utf8');
    } catch (error) {
      console.error('Error saving question cache:', error);
    }
  }

  addQuestion(question) {
    // Validate question structure
    if (!this.isValidQuestion(question)) {
      console.warn('Invalid question format, skipping cache save:', question);
      return false;
    }

    // Check if question already exists (avoid duplicates)
    const exists = this.cache.questions.some(q => 
      q.question === question.question && 
      q.topic === question.topic && 
      q.level === question.level
    );

    if (exists) {
      return false;
    }

    // Add timestamp if not present
    if (!question.generated_at) {
      question.generated_at = new Date().toISOString();
    }

    // Add question to cache
    this.cache.questions.push(question);
    
    // Save immediately to persist
    this.saveCache();
    return true;
  }

  isValidQuestion(question) {
    return question &&
           typeof question.id === 'string' &&
           typeof question.question === 'string' &&
           Array.isArray(question.options) &&
           question.options.length === 4 &&
           typeof question.correct === 'number' &&
           question.correct >= 0 &&
           question.correct <= 3 &&
           typeof question.explanation === 'string' &&
           typeof question.topic === 'string' &&
           typeof question.level === 'string' &&
           typeof question.source === 'string';
  }

  getRandomCachedQuestion(filters = {}) {
    let availableQuestions = this.cache.questions;

    // Apply filters
    if (filters.topic) {
      availableQuestions = availableQuestions.filter(q => 
        q.topic.toLowerCase().includes(filters.topic.toLowerCase())
      );
    }

    if (filters.level) {
      availableQuestions = availableQuestions.filter(q => 
        q.level === filters.level
      );
    }

    if (filters.source) {
      availableQuestions = availableQuestions.filter(q => 
        q.source === filters.source
      );
    }

    if (availableQuestions.length === 0) {
      return null;
    }

    // Return random question
    const randomIndex = Math.floor(Math.random() * availableQuestions.length);
    const question = availableQuestions[randomIndex];
    
    console.log(`Retrieved cached question from ${question.source}: "${question.question.substring(0, 50)}..."`);
    return question;
  }

  getCachedQuestionsByTopic(topic) {
    return this.cache.questions.filter(q => 
      q.topic.toLowerCase().includes(topic.toLowerCase())
    );
  }

  getCachedQuestionsByLevel(level) {
    return this.cache.questions.filter(q => q.level === level);
  }

  getAvailableTopics() {
    const topics = [...new Set(this.cache.questions.map(q => q.topic))];
    return topics.sort();
  }

  getAvailableLevels() {
    const levels = [...new Set(this.cache.questions.map(q => q.level))];
    return levels.sort();
  }

  getStats() {
    const stats = {
      total: this.cache.questions.length,
      bySource: {},
      byTopic: {},
      byLevel: {}
    };

    this.cache.questions.forEach(q => {
      // Count by source
      stats.bySource[q.source] = (stats.bySource[q.source] || 0) + 1;
      
      // Count by topic
      stats.byTopic[q.topic] = (stats.byTopic[q.topic] || 0) + 1;
      
      // Count by level
      stats.byLevel[q.level] = (stats.byLevel[q.level] || 0) + 1;
    });

    return stats;
  }

  clearCache() {
    this.cache.questions = [];
    this.saveCache();
    console.log('Question cache cleared');
  }

  // Remove duplicate questions (useful for cleanup)
  removeDuplicates() {
    const seen = new Set();
    const originalLength = this.cache.questions.length;
    
    this.cache.questions = this.cache.questions.filter(q => {
      const key = `${q.question}-${q.topic}-${q.level}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });

    const removed = originalLength - this.cache.questions.length;
    if (removed > 0) {
      this.saveCache();
      console.log(`Removed ${removed} duplicate questions from cache`);
    }
    
    return removed;
  }

  // Export cache in a different format (e.g., for backup)
  exportCache(format = 'json') {
    if (format === 'json') {
      return JSON.stringify(this.cache, null, 2);
    }
    // Could add other formats like CSV in the future
    return this.cache;
  }

  // Import questions from external source
  importQuestions(questions) {
    let imported = 0;
    
    if (!Array.isArray(questions)) {
      console.error('Import data must be an array of questions');
      return 0;
    }

    questions.forEach(question => {
      if (this.addQuestion(question)) {
        imported++;
      }
    });

    console.log(`Imported ${imported} questions to cache`);
    return imported;
  }
}

module.exports = QuestionCacheManager;
