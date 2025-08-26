const Store = require('electron-store');

class InterviewManager {
  constructor() {
    this.store = new Store({
      name: 'interview-data',
      defaults: {
        interviewHistory: [],
        interviewStats: {
          totalInterviews: 0,
          averageScore: 0,
          bestScore: 0,
          totalTimeSpent: 0,
          completionRate: 0
        },
        companyPreferences: {},
        rolePreferences: {}
      }
    });
    
    // Interview session state
    this.currentSession = null;
    this.sessionStartTime = null;
    this.sessionQuestions = [];
    this.currentQuestionIndex = 0;
    this.sessionAnswers = [];
    this.sessionTimer = null;
    this.questionTimer = null;
  }

  // Interview Types and Configurations
  getInterviewTypes() {
    return {
      'technical-general': {
        name: 'General Technical Interview',
        duration: 45, // minutes
        description: 'Comprehensive technical assessment covering algorithms, data structures, and problem-solving',
        questionDistribution: {
          'easy': 30,      // 30% easy questions
          'medium': 50,    // 50% medium questions
          'hard': 20       // 20% hard questions
        },
        topics: ['algorithms', 'data-structures', 'problem-solving', 'coding'],
        timePerQuestion: 5 // minutes average
      },
      'frontend-focused': {
        name: 'Frontend Developer Interview',
        duration: 45,
        description: 'Frontend-specific questions covering React, JavaScript, CSS, and web technologies',
        questionDistribution: {
          'easy': 25,
          'medium': 55,
          'hard': 20
        },
        topics: ['javascript', 'react', 'css', 'web-development', 'frontend'],
        timePerQuestion: 4
      },
      'backend-focused': {
        name: 'Backend Developer Interview',
        duration: 60,
        description: 'Backend and system design focused interview',
        questionDistribution: {
          'easy': 20,
          'medium': 50,
          'hard': 30
        },
        topics: ['system-design', 'databases', 'apis', 'backend', 'scalability'],
        timePerQuestion: 6
      },
      'full-stack': {
        name: 'Full-Stack Developer Interview',
        duration: 60,
        description: 'Comprehensive full-stack interview covering both frontend and backend',
        questionDistribution: {
          'easy': 25,
          'medium': 50,
          'hard': 25
        },
        topics: ['javascript', 'react', 'nodejs', 'databases', 'system-design'],
        timePerQuestion: 5
      },
      'data-science': {
        name: 'Data Science Interview',
        duration: 50,
        description: 'Data science and machine learning focused interview',
        questionDistribution: {
          'easy': 30,
          'medium': 45,
          'hard': 25
        },
        topics: ['machine-learning', 'statistics', 'python', 'data-analysis'],
        timePerQuestion: 6
      },
      'quick-practice': {
        name: 'Quick Practice Session',
        duration: 15,
        description: 'Short practice session for quick skill assessment',
        questionDistribution: {
          'easy': 40,
          'medium': 40,
          'hard': 20
        },
        topics: ['general'],
        timePerQuestion: 3
      }
    };
  }

  // Company-specific interview configurations
  getCompanyProfiles() {
    return {
      'google': {
        name: 'Google',
        style: 'Algorithmic problem-solving with focus on optimization',
        questionDistribution: { 'easy': 15, 'medium': 45, 'hard': 40 },
        focusAreas: ['algorithms', 'data-structures', 'system-design'],
        averageQuestions: 4,
        timePerQuestion: 8,
        tips: [
          'Always discuss time and space complexity',
          'Think out loud during problem-solving',
          'Consider edge cases and optimizations',
          'Be prepared for follow-up questions'
        ]
      },
      'amazon': {
        name: 'Amazon',
        style: 'Leadership principles + technical depth',
        questionDistribution: { 'easy': 20, 'medium': 50, 'hard': 30 },
        focusAreas: ['system-design', 'leadership', 'scalability'],
        averageQuestions: 5,
        timePerQuestion: 7,
        tips: [
          'Relate answers to Amazon Leadership Principles',
          'Focus on customer obsession',
          'Discuss scalability and cost optimization',
          'Prepare behavioral examples'
        ]
      },
      'meta': {
        name: 'Meta (Facebook)',
        style: 'Product thinking + technical execution',
        questionDistribution: { 'easy': 25, 'medium': 45, 'hard': 30 },
        focusAreas: ['product-design', 'algorithms', 'system-design'],
        averageQuestions: 4,
        timePerQuestion: 8,
        tips: [
          'Think about user experience and scale',
          'Consider mobile-first approaches',
          'Discuss trade-offs and alternatives',
          'Focus on impact and metrics'
        ]
      },
      'microsoft': {
        name: 'Microsoft',
        style: 'Collaborative problem-solving',
        questionDistribution: { 'easy': 30, 'medium': 45, 'hard': 25 },
        focusAreas: ['collaboration', 'problem-solving', 'system-design'],
        averageQuestions: 4,
        timePerQuestion: 7,
        tips: [
          'Emphasize teamwork and collaboration',
          'Show growth mindset',
          'Discuss inclusive solutions',
          'Be prepared for pair programming'
        ]
      },
      'startup': {
        name: 'Startup/Scale-up',
        style: 'Practical problem-solving and adaptability',
        questionDistribution: { 'easy': 35, 'medium': 45, 'hard': 20 },
        focusAreas: ['practical-coding', 'adaptability', 'full-stack'],
        averageQuestions: 3,
        timePerQuestion: 6,
        tips: [
          'Focus on practical, working solutions',
          'Show ability to wear multiple hats',
          'Discuss MVP approaches',
          'Emphasize learning agility'
        ]
      }
    };
  }

  // Start a new mock interview session
  async startInterview(interviewType, companyProfile = null, customConfig = {}) {
    const interviewConfig = this.getInterviewTypes()[interviewType];
    const companyConfig = companyProfile ? this.getCompanyProfiles()[companyProfile] : null;
    
    if (!interviewConfig) {
      throw new Error(`Unknown interview type: ${interviewType}`);
    }

    // Merge configurations
    const config = {
      ...interviewConfig,
      ...customConfig,
      company: companyConfig
    };

    this.currentSession = {
      id: Date.now().toString(),
      type: interviewType,
      company: companyProfile,
      config: config,
      startTime: new Date(),
      duration: config.duration * 60 * 1000, // Convert to milliseconds
      status: 'active',
      phase: 'warmup', // warmup, technical, advanced, behavioral, complete
      score: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      timeSpent: 0
    };

    this.sessionStartTime = Date.now();
    this.sessionQuestions = [];
    this.currentQuestionIndex = 0;
    this.sessionAnswers = [];

    // Generate questions for the session
    await this.generateSessionQuestions();

    return this.currentSession;
  }

  // Generate questions based on interview configuration
  async generateSessionQuestions() {
    if (!this.currentSession) return;

    const config = this.currentSession.config;
    const totalQuestions = Math.floor(config.duration / config.timePerQuestion);
    
    // Calculate questions per difficulty
    const easyCount = Math.floor(totalQuestions * config.questionDistribution.easy / 100);
    const mediumCount = Math.floor(totalQuestions * config.questionDistribution.medium / 100);
    const hardCount = totalQuestions - easyCount - mediumCount;

    // For now, we'll use placeholder questions
    // In a real implementation, this would integrate with the existing QuizManager and AI systems
    this.sessionQuestions = [
      // Easy questions
      ...Array(easyCount).fill().map((_, i) => ({
        id: `easy_${i}`,
        difficulty: 'easy',
        timeAllotted: config.timePerQuestion * 60 * 1000,
        phase: i < 2 ? 'warmup' : 'technical'
      })),
      // Medium questions
      ...Array(mediumCount).fill().map((_, i) => ({
        id: `medium_${i}`,
        difficulty: 'medium',
        timeAllotted: config.timePerQuestion * 60 * 1000,
        phase: 'technical'
      })),
      // Hard questions
      ...Array(hardCount).fill().map((_, i) => ({
        id: `hard_${i}`,
        difficulty: 'hard',
        timeAllotted: config.timePerQuestion * 60 * 1000,
        phase: 'advanced'
      }))
    ];

    // Shuffle questions to avoid predictable patterns
    this.sessionQuestions = this.shuffleArray(this.sessionQuestions);
  }

  // Get current question in the interview
  getCurrentQuestion() {
    if (!this.currentSession || this.currentQuestionIndex >= this.sessionQuestions.length) {
      return null;
    }
    return this.sessionQuestions[this.currentQuestionIndex];
  }

  // Submit answer for current question
  submitAnswer(answer, responseTime) {
    if (!this.currentSession) return null;

    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return null;

    const answerData = {
      questionId: currentQuestion.id,
      question: currentQuestion,
      userAnswer: answer,
      responseTime: responseTime,
      timestamp: new Date(),
      isCorrect: this.validateAnswer(currentQuestion, answer)
    };

    this.sessionAnswers.push(answerData);
    this.currentSession.questionsAnswered++;
    
    if (answerData.isCorrect) {
      this.currentSession.correctAnswers++;
    }

    // Update session phase based on progress
    this.updateSessionPhase();

    // Move to next question
    this.currentQuestionIndex++;

    return answerData;
  }

  // Validate answer (placeholder - would integrate with existing validation)
  validateAnswer(question, answer) {
    // This is a placeholder - in real implementation, this would use
    // the existing answer validation logic from the main app
    return Math.random() > 0.3; // Simulate 70% accuracy for demo
  }

  // Update session phase based on progress
  updateSessionPhase() {
    const progress = this.currentQuestionIndex / this.sessionQuestions.length;
    
    if (progress < 0.2) {
      this.currentSession.phase = 'warmup';
    } else if (progress < 0.7) {
      this.currentSession.phase = 'technical';
    } else if (progress < 0.9) {
      this.currentSession.phase = 'advanced';
    } else {
      this.currentSession.phase = 'behavioral';
    }
  }

  // Complete the interview session
  completeInterview() {
    if (!this.currentSession) return null;

    const endTime = Date.now();
    const totalTime = endTime - this.sessionStartTime;
    
    // Calculate final score
    const accuracyScore = (this.currentSession.correctAnswers / Math.max(this.currentSession.questionsAnswered, 1)) * 100;
    const timeScore = this.calculateTimeScore(totalTime);
    const completionScore = (this.currentQuestionIndex / this.sessionQuestions.length) * 100;
    
    const finalScore = Math.round((accuracyScore * 0.5) + (timeScore * 0.3) + (completionScore * 0.2));

    this.currentSession.status = 'completed';
    this.currentSession.endTime = new Date();
    this.currentSession.totalTime = totalTime;
    this.currentSession.score = finalScore;
    this.currentSession.accuracyScore = Math.round(accuracyScore);
    this.currentSession.timeScore = Math.round(timeScore);
    this.currentSession.completionScore = Math.round(completionScore);

    // Save to history
    this.saveInterviewToHistory(this.currentSession);

    // Update stats
    this.updateInterviewStats();

    const completedSession = { ...this.currentSession };
    this.resetSession();

    return completedSession;
  }

  // Calculate time-based score
  calculateTimeScore(actualTime) {
    const expectedTime = this.currentSession.duration;
    const ratio = actualTime / expectedTime;
    
    if (ratio <= 0.8) return 100; // Finished early
    if (ratio <= 1.0) return 90;  // Finished on time
    if (ratio <= 1.2) return 70;  // Slightly over time
    return 50; // Significantly over time
  }

  // Save interview to history
  saveInterviewToHistory(session) {
    const history = this.store.get('interviewHistory', []);
    history.push({
      ...session,
      answers: this.sessionAnswers
    });
    
    // Keep only last 50 interviews
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }
    
    this.store.set('interviewHistory', history);
  }

  // Update interview statistics
  updateInterviewStats() {
    const stats = this.store.get('interviewStats');
    const history = this.store.get('interviewHistory', []);
    
    stats.totalInterviews = history.length;
    stats.averageScore = history.reduce((sum, interview) => sum + interview.score, 0) / history.length;
    stats.bestScore = Math.max(...history.map(interview => interview.score));
    stats.totalTimeSpent = history.reduce((sum, interview) => sum + interview.totalTime, 0);
    stats.completionRate = (history.filter(interview => interview.status === 'completed').length / history.length) * 100;
    
    this.store.set('interviewStats', stats);
  }

  // Get interview statistics
  getInterviewStats() {
    return this.store.get('interviewStats');
  }

  // Get interview history
  getInterviewHistory(limit = 10) {
    const history = this.store.get('interviewHistory', []);
    return history.slice(-limit).reverse(); // Most recent first
  }

  // Reset current session
  resetSession() {
    this.currentSession = null;
    this.sessionStartTime = null;
    this.sessionQuestions = [];
    this.currentQuestionIndex = 0;
    this.sessionAnswers = [];
    
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = null;
    }
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get session progress
  getSessionProgress() {
    if (!this.currentSession) return null;

    const elapsed = Date.now() - this.sessionStartTime;
    const remaining = Math.max(0, this.currentSession.duration - elapsed);
    
    return {
      currentQuestion: this.currentQuestionIndex + 1,
      totalQuestions: this.sessionQuestions.length,
      timeElapsed: elapsed,
      timeRemaining: remaining,
      phase: this.currentSession.phase,
      score: this.currentSession.score,
      accuracy: this.currentSession.questionsAnswered > 0 
        ? (this.currentSession.correctAnswers / this.currentSession.questionsAnswered) * 100 
        : 0
    };
  }

  // Pause/Resume interview
  pauseInterview() {
    if (this.currentSession && this.currentSession.status === 'active') {
      this.currentSession.status = 'paused';
      this.currentSession.pausedAt = Date.now();
    }
  }

  resumeInterview() {
    if (this.currentSession && this.currentSession.status === 'paused') {
      const pauseDuration = Date.now() - this.currentSession.pausedAt;
      this.sessionStartTime += pauseDuration; // Adjust start time to account for pause
      this.currentSession.status = 'active';
      delete this.currentSession.pausedAt;
    }
  }
}

module.exports = InterviewManager;
