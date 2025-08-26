const Store = require('electron-store');

class AnalyticsManager {
  constructor() {
    this.store = new Store({
      name: 'learning-analytics',
      defaults: {
        sessions: [],
        dailyStats: {},
        totalStats: {
          questionsAnswered: 0,
          correctAnswers: 0,
          incorrectAnswers: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastAnswerDate: null,
          topicStats: {},
          levelStats: {},
          sourceStats: {},
          averageResponseTime: 0
        },
        achievements: [],
        weeklyGoals: {
          questionsTarget: 50,
          accuracyTarget: 80
        }
      }
    });
  }

  // Record a question attempt
  recordQuestionAttempt(questionData, userAnswer, isCorrect, responseTime) {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    const attempt = {
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now.toISOString(),
      date: today,
      question: {
        id: questionData.id,
        topic: questionData.topic || 'general',
        level: questionData.level || 'intermediate',
        source: questionData.source || 'static'
      },
      userAnswer,
      correctAnswer: questionData.correct,
      isCorrect,
      responseTime: responseTime || 0,
      explanation: questionData.explanation
    };

    // Add to sessions
    const sessions = this.store.get('sessions', []);
    sessions.push(attempt);
    
    // Keep only last 1000 attempts to prevent storage bloat
    if (sessions.length > 1000) {
      sessions.splice(0, sessions.length - 1000);
    }
    
    this.store.set('sessions', sessions);

    // Update daily stats
    this.updateDailyStats(today, isCorrect);
    
    // Update total stats
    this.updateTotalStats(attempt);
    
    // Check for achievements
    this.checkAchievements();
    
    return attempt;
  }

  updateDailyStats(date, isCorrect) {
    const dailyStats = this.store.get('dailyStats', {});
    
    if (!dailyStats[date]) {
      dailyStats[date] = {
        questionsAnswered: 0,
        correctAnswers: 0,
        incorrectAnswers: 0,
        accuracy: 0,
        topics: {},
        levels: {},
        sources: {}
      };
    }
    
    const dayStats = dailyStats[date];
    dayStats.questionsAnswered++;
    
    if (isCorrect) {
      dayStats.correctAnswers++;
    } else {
      dayStats.incorrectAnswers++;
    }
    
    dayStats.accuracy = Math.round((dayStats.correctAnswers / dayStats.questionsAnswered) * 100);
    
    this.store.set('dailyStats', dailyStats);
  }

  updateTotalStats(attempt) {
    const totalStats = this.store.get('totalStats');
    
    totalStats.questionsAnswered++;
    
    if (attempt.isCorrect) {
      totalStats.correctAnswers++;
      // Update streak
      const lastDate = totalStats.lastAnswerDate;
      const today = attempt.date;
      
      if (lastDate === today || this.isConsecutiveDay(lastDate, today)) {
        totalStats.currentStreak++;
      } else {
        totalStats.currentStreak = 1;
      }
      
      if (totalStats.currentStreak > totalStats.longestStreak) {
        totalStats.longestStreak = totalStats.currentStreak;
      }
    } else {
      totalStats.incorrectAnswers++;
      // Break streak on incorrect answer
      totalStats.currentStreak = 0;
    }
    
    totalStats.lastAnswerDate = attempt.date;
    
    // Update topic stats
    const topic = attempt.question.topic;
    if (!totalStats.topicStats[topic]) {
      totalStats.topicStats[topic] = { correct: 0, total: 0, accuracy: 0 };
    }
    totalStats.topicStats[topic].total++;
    if (attempt.isCorrect) {
      totalStats.topicStats[topic].correct++;
    }
    totalStats.topicStats[topic].accuracy = Math.round(
      (totalStats.topicStats[topic].correct / totalStats.topicStats[topic].total) * 100
    );
    
    // Update level stats
    const level = attempt.question.level;
    if (!totalStats.levelStats[level]) {
      totalStats.levelStats[level] = { correct: 0, total: 0, accuracy: 0 };
    }
    totalStats.levelStats[level].total++;
    if (attempt.isCorrect) {
      totalStats.levelStats[level].correct++;
    }
    totalStats.levelStats[level].accuracy = Math.round(
      (totalStats.levelStats[level].correct / totalStats.levelStats[level].total) * 100
    );
    
    // Update source stats
    const source = attempt.question.source;
    if (!totalStats.sourceStats[source]) {
      totalStats.sourceStats[source] = { correct: 0, total: 0, accuracy: 0 };
    }
    totalStats.sourceStats[source].total++;
    if (attempt.isCorrect) {
      totalStats.sourceStats[source].correct++;
    }
    totalStats.sourceStats[source].accuracy = Math.round(
      (totalStats.sourceStats[source].correct / totalStats.sourceStats[source].total) * 100
    );
    
    // Update average response time
    if (attempt.responseTime > 0) {
      const sessions = this.store.get('sessions', []);
      const validTimes = sessions.filter(s => s.responseTime > 0).map(s => s.responseTime);
      if (validTimes.length > 0) {
        totalStats.averageResponseTime = Math.round(
          validTimes.reduce((sum, time) => sum + time, 0) / validTimes.length
        );
      }
    }
    
    this.store.set('totalStats', totalStats);
  }

  isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return false;
    
    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  }

  checkAchievements() {
    const totalStats = this.store.get('totalStats');
    const achievements = this.store.get('achievements', []);
    
    const newAchievements = [];
    
    // Define achievements
    const achievementDefinitions = [
      { id: 'first_question', name: 'Getting Started', description: 'Answered your first question', condition: () => totalStats.questionsAnswered >= 1 },
      { id: 'streak_5', name: 'On Fire!', description: '5 correct answers in a row', condition: () => totalStats.currentStreak >= 5 },
      { id: 'streak_10', name: 'Unstoppable!', description: '10 correct answers in a row', condition: () => totalStats.currentStreak >= 10 },
      { id: 'streak_25', name: 'Legend!', description: '25 correct answers in a row', condition: () => totalStats.currentStreak >= 25 },
      { id: 'hundred_questions', name: 'Century Club', description: 'Answered 100 questions', condition: () => totalStats.questionsAnswered >= 100 },
      { id: 'accuracy_90', name: 'Perfectionist', description: '90%+ accuracy with 50+ questions', condition: () => totalStats.questionsAnswered >= 50 && (totalStats.correctAnswers / totalStats.questionsAnswered) >= 0.9 },
      { id: 'topic_master', name: 'Topic Master', description: '100% accuracy in any topic (10+ questions)', condition: () => {
        return Object.values(totalStats.topicStats).some(stat => stat.total >= 10 && stat.accuracy === 100);
      }}
    ];
    
    achievementDefinitions.forEach(achievement => {
      const alreadyEarned = achievements.find(a => a.id === achievement.id);
      if (!alreadyEarned && achievement.condition()) {
        const newAchievement = {
          ...achievement,
          earnedAt: new Date().toISOString(),
          isNew: true
        };
        achievements.push(newAchievement);
        newAchievements.push(newAchievement);
      }
    });
    
    if (newAchievements.length > 0) {
      this.store.set('achievements', achievements);
    }
    
    return newAchievements;
  }

  // Get analytics data for dashboard
  getAnalytics() {
    const totalStats = this.store.get('totalStats');
    const dailyStats = this.store.get('dailyStats', {});
    const sessions = this.store.get('sessions', []);
    const achievements = this.store.get('achievements', []);
    
    // Calculate weekly stats
    const weeklyStats = this.getWeeklyStats(dailyStats);
    
    // Get recent performance trend
    const recentTrend = this.getRecentTrend(sessions);
    
    // Get topic performance
    const topicPerformance = this.getTopicPerformance(totalStats.topicStats);
    
    // Calculate overall accuracy
    const overallAccuracy = totalStats.questionsAnswered > 0 
      ? Math.round((totalStats.correctAnswers / totalStats.questionsAnswered) * 100)
      : 0;
    
    return {
      totalStats: {
        ...totalStats,
        overallAccuracy
      },
      weeklyStats,
      recentTrend,
      topicPerformance,
      achievements,
      dailyStats,
      sessions: sessions.slice(-50) // Last 50 sessions for detailed view
    };
  }

  getWeeklyStats(dailyStats) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    let weeklyQuestions = 0;
    let weeklyCorrect = 0;
    const dailyData = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const dayStats = dailyStats[dateStr] || { questionsAnswered: 0, correctAnswers: 0, accuracy: 0 };
      
      weeklyQuestions += dayStats.questionsAnswered;
      weeklyCorrect += dayStats.correctAnswers;
      
      dailyData.push({
        date: dateStr,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        questions: dayStats.questionsAnswered,
        correct: dayStats.correctAnswers,
        accuracy: dayStats.accuracy
      });
    }
    
    return {
      totalQuestions: weeklyQuestions,
      totalCorrect: weeklyCorrect,
      accuracy: weeklyQuestions > 0 ? Math.round((weeklyCorrect / weeklyQuestions) * 100) : 0,
      dailyData
    };
  }

  getRecentTrend(sessions) {
    const recent = sessions.slice(-20); // Last 20 questions
    if (recent.length === 0) return { trend: 'neutral', accuracy: 0 };
    
    const accuracy = Math.round((recent.filter(s => s.isCorrect).length / recent.length) * 100);
    
    // Calculate trend based on first half vs second half
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAccuracy = firstHalf.length > 0 ? (firstHalf.filter(s => s.isCorrect).length / firstHalf.length) * 100 : 0;
    const secondAccuracy = secondHalf.length > 0 ? (secondHalf.filter(s => s.isCorrect).length / secondHalf.length) * 100 : 0;
    
    let trend = 'neutral';
    if (secondAccuracy > firstAccuracy + 10) trend = 'improving';
    else if (secondAccuracy < firstAccuracy - 10) trend = 'declining';
    
    return { trend, accuracy };
  }

  getTopicPerformance(topicStats) {
    return Object.entries(topicStats)
      .map(([topic, stats]) => ({
        topic,
        ...stats,
        strength: stats.accuracy >= 80 ? 'strong' : stats.accuracy >= 60 ? 'moderate' : 'weak'
      }))
      .sort((a, b) => b.total - a.total); // Sort by most practiced
  }

  // Generate AI insights prompt data
  getInsightsData() {
    const analytics = this.getAnalytics();
    
    return {
      totalQuestions: analytics.totalStats.questionsAnswered,
      overallAccuracy: analytics.totalStats.overallAccuracy,
      currentStreak: analytics.totalStats.currentStreak,
      longestStreak: analytics.totalStats.longestStreak,
      weeklyPerformance: analytics.weeklyStats,
      recentTrend: analytics.recentTrend,
      topicPerformance: analytics.topicPerformance,
      achievements: analytics.achievements.length,
      averageResponseTime: analytics.totalStats.averageResponseTime,
      strongTopics: analytics.topicPerformance.filter(t => t.strength === 'strong').map(t => t.topic),
      weakTopics: analytics.topicPerformance.filter(t => t.strength === 'weak').map(t => t.topic),
      levelStats: analytics.totalStats.levelStats
    };
  }

  // Clear all analytics data (for testing or reset)
  clearAnalytics() {
    this.store.clear();
  }

  // Export analytics data
  exportAnalytics() {
    return {
      exportDate: new Date().toISOString(),
      data: this.store.store
    };
  }

  // Import analytics data
  importAnalytics(data) {
    try {
      if (data && data.data) {
        this.store.store = data.data;
        return { success: true };
      }
      return { success: false, error: 'Invalid data format' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = AnalyticsManager;
