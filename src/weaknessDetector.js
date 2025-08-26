const Store = require('electron-store');

class WeaknessDetector {
  constructor() {
    this.store = new Store({
      name: 'weakness-analysis',
      defaults: {
        conceptMap: {},
        weaknessProfiles: {},
        learningPaths: {},
        masteryLevels: {},
        lastAnalysis: null
      }
    });

    // Define concept relationships and dependencies
    this.conceptGraph = this.initializeConceptGraph();
    this.masteryThresholds = {
      beginner: 0.4,
      intermediate: 0.7,
      advanced: 0.85,
      expert: 0.95
    };
  }

  // Initialize the knowledge concept graph
  initializeConceptGraph() {
    return {
      // Programming Fundamentals
      'variables': {
        category: 'fundamentals',
        prerequisites: [],
        dependents: ['data-types', 'operators', 'control-flow'],
        difficulty: 'beginner',
        weight: 1.0
      },
      'data-types': {
        category: 'fundamentals',
        prerequisites: ['variables'],
        dependents: ['arrays', 'strings', 'objects'],
        difficulty: 'beginner',
        weight: 1.2
      },
      'control-flow': {
        category: 'fundamentals',
        prerequisites: ['variables', 'operators'],
        dependents: ['loops', 'conditionals', 'functions'],
        difficulty: 'beginner',
        weight: 1.3
      },
      'functions': {
        category: 'fundamentals',
        prerequisites: ['control-flow'],
        dependents: ['recursion', 'higher-order-functions', 'closures'],
        difficulty: 'intermediate',
        weight: 1.5
      },

      // Data Structures
      'arrays': {
        category: 'data-structures',
        prerequisites: ['data-types'],
        dependents: ['sorting', 'searching', 'dynamic-arrays'],
        difficulty: 'beginner',
        weight: 1.4
      },
      'linked-lists': {
        category: 'data-structures',
        prerequisites: ['pointers', 'objects'],
        dependents: ['stacks', 'queues', 'trees'],
        difficulty: 'intermediate',
        weight: 1.6
      },
      'stacks': {
        category: 'data-structures',
        prerequisites: ['arrays', 'linked-lists'],
        dependents: ['recursion', 'expression-evaluation'],
        difficulty: 'intermediate',
        weight: 1.5
      },
      'queues': {
        category: 'data-structures',
        prerequisites: ['arrays', 'linked-lists'],
        dependents: ['bfs', 'scheduling'],
        difficulty: 'intermediate',
        weight: 1.5
      },
      'trees': {
        category: 'data-structures',
        prerequisites: ['linked-lists', 'recursion'],
        dependents: ['binary-trees', 'bst', 'heaps'],
        difficulty: 'intermediate',
        weight: 1.7
      },
      'binary-trees': {
        category: 'data-structures',
        prerequisites: ['trees'],
        dependents: ['tree-traversal', 'bst'],
        difficulty: 'intermediate',
        weight: 1.6
      },
      'hash-tables': {
        category: 'data-structures',
        prerequisites: ['arrays', 'functions'],
        dependents: ['sets', 'maps', 'caching'],
        difficulty: 'intermediate',
        weight: 1.8
      },

      // Algorithms
      'sorting': {
        category: 'algorithms',
        prerequisites: ['arrays', 'comparison'],
        dependents: ['merge-sort', 'quick-sort', 'heap-sort'],
        difficulty: 'intermediate',
        weight: 1.6
      },
      'searching': {
        category: 'algorithms',
        prerequisites: ['arrays'],
        dependents: ['binary-search', 'hash-search'],
        difficulty: 'beginner',
        weight: 1.3
      },
      'recursion': {
        category: 'algorithms',
        prerequisites: ['functions', 'base-cases'],
        dependents: ['divide-conquer', 'dynamic-programming', 'backtracking'],
        difficulty: 'intermediate',
        weight: 1.9
      },
      'dynamic-programming': {
        category: 'algorithms',
        prerequisites: ['recursion', 'memoization'],
        dependents: ['optimization', 'longest-subsequence'],
        difficulty: 'advanced',
        weight: 2.2
      },
      'graph-algorithms': {
        category: 'algorithms',
        prerequisites: ['graphs', 'queues', 'stacks'],
        dependents: ['dfs', 'bfs', 'shortest-path'],
        difficulty: 'advanced',
        weight: 2.0
      },

      // Object-Oriented Programming
      'classes': {
        category: 'oop',
        prerequisites: ['objects', 'functions'],
        dependents: ['inheritance', 'encapsulation', 'polymorphism'],
        difficulty: 'intermediate',
        weight: 1.5
      },
      'inheritance': {
        category: 'oop',
        prerequisites: ['classes'],
        dependents: ['polymorphism', 'abstract-classes'],
        difficulty: 'intermediate',
        weight: 1.6
      },
      'polymorphism': {
        category: 'oop',
        prerequisites: ['inheritance'],
        dependents: ['interfaces', 'method-overriding'],
        difficulty: 'advanced',
        weight: 1.8
      },
      'encapsulation': {
        category: 'oop',
        prerequisites: ['classes'],
        dependents: ['access-modifiers', 'getters-setters'],
        difficulty: 'intermediate',
        weight: 1.4
      },

      // Database Concepts
      'sql-basics': {
        category: 'database',
        prerequisites: ['tables', 'queries'],
        dependents: ['joins', 'subqueries', 'indexing'],
        difficulty: 'beginner',
        weight: 1.3
      },
      'joins': {
        category: 'database',
        prerequisites: ['sql-basics', 'relationships'],
        dependents: ['complex-queries', 'optimization'],
        difficulty: 'intermediate',
        weight: 1.7
      },
      'normalization': {
        category: 'database',
        prerequisites: ['tables', 'relationships'],
        dependents: ['database-design', 'performance'],
        difficulty: 'intermediate',
        weight: 1.6
      },
      'indexing': {
        category: 'database',
        prerequisites: ['sql-basics'],
        dependents: ['query-optimization', 'performance'],
        difficulty: 'intermediate',
        weight: 1.5
      },

      // System Design
      'scalability': {
        category: 'system-design',
        prerequisites: ['architecture', 'performance'],
        dependents: ['load-balancing', 'caching', 'microservices'],
        difficulty: 'advanced',
        weight: 2.1
      },
      'caching': {
        category: 'system-design',
        prerequisites: ['performance', 'memory'],
        dependents: ['redis', 'cdn', 'database-caching'],
        difficulty: 'intermediate',
        weight: 1.7
      },
      'load-balancing': {
        category: 'system-design',
        prerequisites: ['scalability', 'networking'],
        dependents: ['high-availability', 'fault-tolerance'],
        difficulty: 'advanced',
        weight: 1.9
      },
      'microservices': {
        category: 'system-design',
        prerequisites: ['apis', 'distributed-systems'],
        dependents: ['service-mesh', 'containerization'],
        difficulty: 'advanced',
        weight: 2.0
      }
    };
  }

  // Analyze user's learning data to detect weaknesses
  analyzeWeaknesses(analyticsData) {
    const analysis = {
      timestamp: new Date(),
      overallWeaknesses: [],
      categoryWeaknesses: {},
      conceptWeaknesses: {},
      recommendedActions: [],
      learningPath: [],
      masteryLevels: {},
      confidenceScores: {}
    };

    // Analyze by topic/concept
    if (analyticsData.totalStats.topicStats) {
      analysis.conceptWeaknesses = this.analyzeConceptPerformance(analyticsData.totalStats.topicStats);
    }

    // Analyze by category
    analysis.categoryWeaknesses = this.analyzeCategoryPerformance(analyticsData);

    // Calculate mastery levels
    analysis.masteryLevels = this.calculateMasteryLevels(analysis.conceptWeaknesses);

    // Generate confidence scores
    analysis.confidenceScores = this.calculateConfidenceScores(analyticsData);

    // Identify overall weaknesses
    analysis.overallWeaknesses = this.identifyOverallWeaknesses(analysis);

    // Generate recommended actions
    analysis.recommendedActions = this.generateRecommendedActions(analysis);

    // Create personalized learning path
    analysis.learningPath = this.createLearningPath(analysis);

    // Store analysis
    this.store.set('lastAnalysis', analysis);
    this.updateWeaknessProfiles(analysis);

    return analysis;
  }

  // Analyze performance by individual concepts
  analyzeConceptPerformance(topicStats) {
    const conceptWeaknesses = {};

    Object.entries(topicStats).forEach(([topic, stats]) => {
      const accuracy = stats.correct / Math.max(stats.total, 1);
      const avgResponseTime = stats.totalTime / Math.max(stats.total, 1);
      
      // Normalize topic names to concept names
      const conceptName = this.normalizeTopicToConcept(topic);
      
      conceptWeaknesses[conceptName] = {
        accuracy: accuracy,
        totalQuestions: stats.total,
        correctAnswers: stats.correct,
        avgResponseTime: avgResponseTime,
        weaknessScore: this.calculateWeaknessScore(accuracy, avgResponseTime, stats.total),
        isWeak: accuracy < 0.6 || (stats.total >= 5 && accuracy < 0.7),
        category: this.getConceptCategory(conceptName),
        difficulty: this.getConceptDifficulty(conceptName),
        weight: this.getConceptWeight(conceptName)
      };
    });

    return conceptWeaknesses;
  }

  // Analyze performance by category
  analyzeCategoryPerformance(analyticsData) {
    const categories = {};
    const topicStats = analyticsData.totalStats.topicStats || {};

    // Group topics by category
    Object.entries(topicStats).forEach(([topic, stats]) => {
      const conceptName = this.normalizeTopicToConcept(topic);
      const category = this.getConceptCategory(conceptName);
      
      if (!categories[category]) {
        categories[category] = {
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          concepts: []
        };
      }
      
      categories[category].totalQuestions += stats.total;
      categories[category].correctAnswers += stats.correct;
      categories[category].totalTime += stats.totalTime || 0;
      categories[category].concepts.push(conceptName);
    });

    // Calculate category performance
    const categoryWeaknesses = {};
    Object.entries(categories).forEach(([category, stats]) => {
      const accuracy = stats.correctAnswers / Math.max(stats.totalQuestions, 1);
      const avgResponseTime = stats.totalTime / Math.max(stats.totalQuestions, 1);
      
      categoryWeaknesses[category] = {
        accuracy: accuracy,
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers,
        avgResponseTime: avgResponseTime,
        conceptCount: stats.concepts.length,
        isWeak: accuracy < 0.65,
        weaknessScore: this.calculateWeaknessScore(accuracy, avgResponseTime, stats.totalQuestions),
        concepts: stats.concepts
      };
    });

    return categoryWeaknesses;
  }

  // Calculate mastery levels for concepts
  calculateMasteryLevels(conceptWeaknesses) {
    const masteryLevels = {};

    Object.entries(conceptWeaknesses).forEach(([concept, data]) => {
      let masteryLevel = 'novice';
      
      if (data.accuracy >= this.masteryThresholds.expert) {
        masteryLevel = 'expert';
      } else if (data.accuracy >= this.masteryThresholds.advanced) {
        masteryLevel = 'advanced';
      } else if (data.accuracy >= this.masteryThresholds.intermediate) {
        masteryLevel = 'intermediate';
      } else if (data.accuracy >= this.masteryThresholds.beginner) {
        masteryLevel = 'beginner';
      }

      masteryLevels[concept] = {
        level: masteryLevel,
        score: data.accuracy,
        confidence: this.calculateConceptConfidence(data),
        questionsNeeded: this.calculateQuestionsNeededForNextLevel(data)
      };
    });

    return masteryLevels;
  }

  // Calculate confidence scores
  calculateConfidenceScores(analyticsData) {
    const confidence = {
      overall: 0,
      byCategory: {},
      byDifficulty: {},
      trend: 'stable'
    };

    // Overall confidence based on recent performance
    const recentAccuracy = analyticsData.weeklyStats?.accuracy || 0;
    const overallAccuracy = analyticsData.totalStats?.overallAccuracy || 0;
    
    confidence.overall = Math.min(100, (overallAccuracy + recentAccuracy) / 2);

    // Trend analysis
    if (recentAccuracy > overallAccuracy + 5) {
      confidence.trend = 'improving';
    } else if (recentAccuracy < overallAccuracy - 5) {
      confidence.trend = 'declining';
    }

    // Confidence by difficulty level
    const levelStats = analyticsData.totalStats.levelStats || {};
    Object.entries(levelStats).forEach(([level, stats]) => {
      const accuracy = stats.correct / Math.max(stats.total, 1);
      confidence.byDifficulty[level] = Math.round(accuracy * 100);
    });

    return confidence;
  }

  // Identify overall weaknesses
  identifyOverallWeaknesses(analysis) {
    const weaknesses = [];

    // Find concepts with low performance
    Object.entries(analysis.conceptWeaknesses).forEach(([concept, data]) => {
      if (data.isWeak) {
        weaknesses.push({
          type: 'concept',
          name: concept,
          severity: this.calculateSeverity(data.weaknessScore),
          description: `Low accuracy in ${concept} (${Math.round(data.accuracy * 100)}%)`,
          impact: this.calculateImpact(concept, analysis),
          priority: this.calculatePriority(concept, data)
        });
      }
    });

    // Find categories with low performance
    Object.entries(analysis.categoryWeaknesses).forEach(([category, data]) => {
      if (data.isWeak) {
        weaknesses.push({
          type: 'category',
          name: category,
          severity: this.calculateSeverity(data.weaknessScore),
          description: `Struggling with ${category} concepts (${Math.round(data.accuracy * 100)}% accuracy)`,
          impact: 'high',
          priority: this.calculateCategoryPriority(category, data)
        });
      }
    });

    // Sort by priority
    return weaknesses.sort((a, b) => b.priority - a.priority);
  }

  // Generate recommended actions
  generateRecommendedActions(analysis) {
    const actions = [];

    // Actions for concept weaknesses
    analysis.overallWeaknesses.forEach(weakness => {
      if (weakness.type === 'concept') {
        actions.push({
          type: 'practice',
          concept: weakness.name,
          action: `Focus on ${weakness.name} with targeted practice`,
          estimatedTime: '15-30 minutes daily',
          difficulty: this.getConceptDifficulty(weakness.name),
          priority: weakness.priority,
          resources: this.getConceptResources(weakness.name)
        });

        // Add prerequisite review if needed
        const prerequisites = this.getConceptPrerequisites(weakness.name);
        prerequisites.forEach(prereq => {
          if (analysis.conceptWeaknesses[prereq]?.isWeak) {
            actions.push({
              type: 'review',
              concept: prereq,
              action: `Review ${prereq} fundamentals before advancing to ${weakness.name}`,
              estimatedTime: '10-20 minutes',
              difficulty: this.getConceptDifficulty(prereq),
              priority: weakness.priority + 1,
              reason: `Prerequisite for ${weakness.name}`
            });
          }
        });
      }
    });

    // Actions for category weaknesses
    Object.entries(analysis.categoryWeaknesses).forEach(([category, data]) => {
      if (data.isWeak) {
        actions.push({
          type: 'category-focus',
          category: category,
          action: `Intensive ${category} practice session`,
          estimatedTime: '45-60 minutes',
          difficulty: 'mixed',
          priority: this.calculateCategoryPriority(category, data),
          concepts: data.concepts.slice(0, 3) // Top 3 concepts to focus on
        });
      }
    });

    // Sort by priority and remove duplicates
    return this.deduplicateActions(actions.sort((a, b) => b.priority - a.priority));
  }

  // Create personalized learning path
  createLearningPath(analysis) {
    const path = [];
    const processedConcepts = new Set();

    // Start with highest priority weaknesses
    analysis.overallWeaknesses.forEach(weakness => {
      if (weakness.type === 'concept' && !processedConcepts.has(weakness.name)) {
        const pathItem = this.createLearningPathItem(weakness.name, analysis);
        if (pathItem) {
          path.push(pathItem);
          processedConcepts.add(weakness.name);
        }
      }
    });

    // Add progression items for concepts close to next mastery level
    Object.entries(analysis.masteryLevels).forEach(([concept, mastery]) => {
      if (!processedConcepts.has(concept) && mastery.questionsNeeded <= 10) {
        const pathItem = this.createProgressionPathItem(concept, mastery, analysis);
        if (pathItem) {
          path.push(pathItem);
          processedConcepts.add(concept);
        }
      }
    });

    return path.slice(0, 10); // Limit to top 10 items
  }

  // Helper methods
  normalizeTopicToConcept(topic) {
    const topicMap = {
      'java': 'oop',
      'python': 'programming-fundamentals',
      'javascript': 'programming-fundamentals',
      'oop': 'classes',
      'database': 'sql-basics',
      'algorithms': 'sorting',
      'ai': 'machine-learning',
      'web-development': 'frontend',
      'system-design': 'scalability'
    };
    
    return topicMap[topic.toLowerCase()] || topic.toLowerCase().replace(/\s+/g, '-');
  }

  getConceptCategory(concept) {
    return this.conceptGraph[concept]?.category || 'general';
  }

  getConceptDifficulty(concept) {
    return this.conceptGraph[concept]?.difficulty || 'intermediate';
  }

  getConceptWeight(concept) {
    return this.conceptGraph[concept]?.weight || 1.0;
  }

  getConceptPrerequisites(concept) {
    return this.conceptGraph[concept]?.prerequisites || [];
  }

  calculateWeaknessScore(accuracy, responseTime, totalQuestions) {
    // Higher score = more weakness
    const accuracyScore = (1 - accuracy) * 100;
    const timeScore = Math.min(responseTime / 30000, 1) * 20; // Normalize to 30 seconds
    const confidenceScore = Math.max(0, (10 - totalQuestions)) * 5; // Less confidence with fewer questions
    
    return accuracyScore + timeScore + confidenceScore;
  }

  calculateSeverity(weaknessScore) {
    if (weaknessScore >= 80) return 'critical';
    if (weaknessScore >= 60) return 'high';
    if (weaknessScore >= 40) return 'medium';
    return 'low';
  }

  calculateImpact(concept, analysis) {
    const dependents = this.conceptGraph[concept]?.dependents || [];
    const weight = this.getConceptWeight(concept);
    
    // High impact if many concepts depend on this one
    if (dependents.length >= 3 && weight >= 1.5) return 'high';
    if (dependents.length >= 2 || weight >= 1.3) return 'medium';
    return 'low';
  }

  calculatePriority(concept, data) {
    const weight = this.getConceptWeight(concept);
    const severityMultiplier = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };
    
    const severity = this.calculateSeverity(data.weaknessScore);
    return weight * severityMultiplier[severity] * (1 - data.accuracy);
  }

  calculateCategoryPriority(category, data) {
    const categoryWeights = {
      'fundamentals': 3.0,
      'data-structures': 2.5,
      'algorithms': 2.5,
      'oop': 2.0,
      'database': 1.8,
      'system-design': 1.5
    };
    
    const weight = categoryWeights[category] || 1.0;
    return weight * (1 - data.accuracy) * data.conceptCount;
  }

  calculateConceptConfidence(data) {
    if (data.totalQuestions < 3) return 'low';
    if (data.totalQuestions < 8) return 'medium';
    return 'high';
  }

  calculateQuestionsNeededForNextLevel(data) {
    const currentLevel = data.accuracy;
    let nextThreshold = 0;
    
    if (currentLevel < this.masteryThresholds.beginner) {
      nextThreshold = this.masteryThresholds.beginner;
    } else if (currentLevel < this.masteryThresholds.intermediate) {
      nextThreshold = this.masteryThresholds.intermediate;
    } else if (currentLevel < this.masteryThresholds.advanced) {
      nextThreshold = this.masteryThresholds.advanced;
    } else if (currentLevel < this.masteryThresholds.expert) {
      nextThreshold = this.masteryThresholds.expert;
    } else {
      return 0; // Already at expert level
    }
    
    // Estimate questions needed based on current performance
    const improvement = nextThreshold - currentLevel;
    return Math.ceil(improvement * 20); // Rough estimate
  }

  getConceptResources(concept) {
    const resourceMap = {
      'arrays': ['Array manipulation exercises', 'Sorting algorithms practice'],
      'recursion': ['Base case identification', 'Recursive thinking patterns'],
      'binary-trees': ['Tree traversal methods', 'Binary tree properties'],
      'dynamic-programming': ['Memoization techniques', 'Bottom-up approaches'],
      'sql-basics': ['SELECT statement practice', 'WHERE clause exercises'],
      'joins': ['INNER JOIN examples', 'LEFT/RIGHT JOIN differences']
    };
    
    return resourceMap[concept] || [`${concept} fundamentals`, `${concept} practice problems`];
  }

  createLearningPathItem(concept, analysis) {
    const data = analysis.conceptWeaknesses[concept];
    if (!data) return null;
    
    return {
      concept: concept,
      type: 'weakness-focus',
      title: `Master ${concept}`,
      description: `Improve your ${concept} skills from ${Math.round(data.accuracy * 100)}% to 80%+`,
      estimatedTime: '2-3 weeks',
      difficulty: this.getConceptDifficulty(concept),
      priority: this.calculatePriority(concept, data),
      prerequisites: this.getConceptPrerequisites(concept),
      milestones: [
        `Understand ${concept} fundamentals`,
        `Practice basic ${concept} problems`,
        `Apply ${concept} in complex scenarios`,
        `Achieve 80%+ accuracy`
      ]
    };
  }

  createProgressionPathItem(concept, mastery, analysis) {
    return {
      concept: concept,
      type: 'mastery-progression',
      title: `Advance in ${concept}`,
      description: `Progress from ${mastery.level} to next level`,
      estimatedTime: '1-2 weeks',
      difficulty: this.getConceptDifficulty(concept),
      priority: 5, // Medium priority for progression
      questionsNeeded: mastery.questionsNeeded,
      currentLevel: mastery.level,
      milestones: [
        `Complete ${mastery.questionsNeeded} practice questions`,
        `Maintain 85%+ accuracy`,
        `Advance to next mastery level`
      ]
    };
  }

  deduplicateActions(actions) {
    const seen = new Set();
    return actions.filter(action => {
      const key = `${action.type}-${action.concept || action.category}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  updateWeaknessProfiles(analysis) {
    const profiles = this.store.get('weaknessProfiles', {});
    const today = new Date().toISOString().split('T')[0];
    
    profiles[today] = {
      timestamp: analysis.timestamp,
      weaknessCount: analysis.overallWeaknesses.length,
      topWeaknesses: analysis.overallWeaknesses.slice(0, 5),
      masteryDistribution: this.getMasteryDistribution(analysis.masteryLevels),
      overallConfidence: analysis.confidenceScores.overall
    };
    
    // Keep only last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    Object.keys(profiles).forEach(date => {
      if (new Date(date) < thirtyDaysAgo) {
        delete profiles[date];
      }
    });
    
    this.store.set('weaknessProfiles', profiles);
  }

  getMasteryDistribution(masteryLevels) {
    const distribution = { novice: 0, beginner: 0, intermediate: 0, advanced: 0, expert: 0 };
    
    Object.values(masteryLevels).forEach(mastery => {
      distribution[mastery.level]++;
    });
    
    return distribution;
  }

  // Get targeted questions based on weaknesses
  getTargetedQuestionTopics(limit = 5) {
    const lastAnalysis = this.store.get('lastAnalysis');
    if (!lastAnalysis) return [];
    
    return lastAnalysis.overallWeaknesses
      .slice(0, limit)
      .map(weakness => ({
        topic: weakness.name,
        priority: weakness.priority,
        difficulty: this.getConceptDifficulty(weakness.name),
        reason: weakness.description
      }));
  }

  // Get weakness summary for UI display
  getWeaknessSummary() {
    const lastAnalysis = this.store.get('lastAnalysis');
    if (!lastAnalysis) return null;
    
    return {
      totalWeaknesses: lastAnalysis.overallWeaknesses.length,
      criticalWeaknesses: lastAnalysis.overallWeaknesses.filter(w => w.severity === 'critical').length,
      topWeaknesses: lastAnalysis.overallWeaknesses.slice(0, 3),
      recommendedActions: lastAnalysis.recommendedActions.slice(0, 3),
      overallConfidence: lastAnalysis.confidenceScores.overall,
      lastUpdated: lastAnalysis.timestamp
    };
  }

  // Clear all weakness data
  clearWeaknessData() {
    this.store.clear();
  }
}

module.exports = WeaknessDetector;
