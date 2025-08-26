const Store = require('electron-store');

class SkillAssessment {
  constructor() {
    this.store = new Store({
      name: 'skill-assessment',
      defaults: {
        assessments: [],
        skillProfiles: {},
        benchmarks: {},
        certifications: [],
        lastAssessment: null
      }
    });

    // Define skill categories and their weights
    this.skillCategories = this.initializeSkillCategories();
    this.industryBenchmarks = this.initializeIndustryBenchmarks();
    this.certificationLevels = this.initializeCertificationLevels();
  }

  // Initialize skill categories with weights and subcategories
  initializeSkillCategories() {
    return {
      'technical-skills': {
        name: 'Technical Skills',
        weight: 0.4,
        subcategories: {
          'programming-fundamentals': {
            name: 'Programming Fundamentals',
            weight: 0.25,
            skills: ['variables', 'data-types', 'control-flow', 'functions', 'error-handling']
          },
          'data-structures': {
            name: 'Data Structures',
            weight: 0.25,
            skills: ['arrays', 'linked-lists', 'stacks', 'queues', 'trees', 'graphs', 'hash-tables']
          },
          'algorithms': {
            name: 'Algorithms',
            weight: 0.25,
            skills: ['sorting', 'searching', 'recursion', 'dynamic-programming', 'greedy', 'graph-algorithms']
          },
          'system-design': {
            name: 'System Design',
            weight: 0.25,
            skills: ['scalability', 'load-balancing', 'caching', 'databases', 'microservices', 'apis']
          }
        }
      },
      'problem-solving': {
        name: 'Problem Solving',
        weight: 0.25,
        subcategories: {
          'analytical-thinking': {
            name: 'Analytical Thinking',
            weight: 0.4,
            skills: ['problem-decomposition', 'pattern-recognition', 'logical-reasoning']
          },
          'optimization': {
            name: 'Optimization',
            weight: 0.3,
            skills: ['time-complexity', 'space-complexity', 'performance-tuning']
          },
          'debugging': {
            name: 'Debugging',
            weight: 0.3,
            skills: ['error-identification', 'root-cause-analysis', 'testing-strategies']
          }
        }
      },
      'coding-proficiency': {
        name: 'Coding Proficiency',
        weight: 0.2,
        subcategories: {
          'code-quality': {
            name: 'Code Quality',
            weight: 0.4,
            skills: ['clean-code', 'readability', 'maintainability', 'documentation']
          },
          'best-practices': {
            name: 'Best Practices',
            weight: 0.3,
            skills: ['design-patterns', 'solid-principles', 'code-review', 'version-control']
          },
          'testing': {
            name: 'Testing',
            weight: 0.3,
            skills: ['unit-testing', 'integration-testing', 'test-driven-development']
          }
        }
      },
      'communication': {
        name: 'Communication',
        weight: 0.15,
        subcategories: {
          'technical-communication': {
            name: 'Technical Communication',
            weight: 0.6,
            skills: ['explaining-solutions', 'code-walkthrough', 'technical-writing']
          },
          'collaboration': {
            name: 'Collaboration',
            weight: 0.4,
            skills: ['teamwork', 'code-review-participation', 'knowledge-sharing']
          }
        }
      }
    };
  }

  // Initialize industry benchmarks for different experience levels
  initializeIndustryBenchmarks() {
    return {
      'entry-level': {
        name: 'Entry Level (0-2 years)',
        requirements: {
          'technical-skills': 60,
          'problem-solving': 55,
          'coding-proficiency': 50,
          'communication': 45
        },
        salaryRange: { min: 50000, max: 75000 },
        commonRoles: ['Junior Developer', 'Software Engineer I', 'Associate Developer']
      },
      'mid-level': {
        name: 'Mid Level (2-5 years)',
        requirements: {
          'technical-skills': 75,
          'problem-solving': 70,
          'coding-proficiency': 70,
          'communication': 65
        },
        salaryRange: { min: 75000, max: 120000 },
        commonRoles: ['Software Engineer II', 'Full Stack Developer', 'Backend Developer']
      },
      'senior-level': {
        name: 'Senior Level (5-8 years)',
        requirements: {
          'technical-skills': 85,
          'problem-solving': 80,
          'coding-proficiency': 80,
          'communication': 75
        },
        salaryRange: { min: 120000, max: 180000 },
        commonRoles: ['Senior Software Engineer', 'Tech Lead', 'Principal Engineer']
      },
      'expert-level': {
        name: 'Expert Level (8+ years)',
        requirements: {
          'technical-skills': 90,
          'problem-solving': 85,
          'coding-proficiency': 85,
          'communication': 80
        },
        salaryRange: { min: 180000, max: 300000 },
        commonRoles: ['Staff Engineer', 'Principal Engineer', 'Engineering Manager']
      }
    };
  }

  // Initialize certification levels
  initializeCertificationLevels() {
    return {
      'bronze': {
        name: 'Bronze Certification',
        requirements: { overall: 60, categories: { 'technical-skills': 55 } },
        badge: '🥉',
        description: 'Demonstrates basic programming competency'
      },
      'silver': {
        name: 'Silver Certification',
        requirements: { overall: 75, categories: { 'technical-skills': 70, 'problem-solving': 65 } },
        badge: '🥈',
        description: 'Shows solid intermediate programming skills'
      },
      'gold': {
        name: 'Gold Certification',
        requirements: { overall: 85, categories: { 'technical-skills': 80, 'problem-solving': 75, 'coding-proficiency': 75 } },
        badge: '🥇',
        description: 'Indicates advanced programming expertise'
      },
      'platinum': {
        name: 'Platinum Certification',
        requirements: { overall: 90, categories: { 'technical-skills': 85, 'problem-solving': 80, 'coding-proficiency': 80, 'communication': 75 } },
        badge: '💎',
        description: 'Represents expert-level programming mastery'
      }
    };
  }

  // Conduct comprehensive skill assessment
  async assessSkills(analyticsData, weaknessAnalysis = null, interviewData = null) {
    const assessment = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'comprehensive',
      categoryScores: {},
      subcategoryScores: {},
      skillScores: {},
      overallScore: 0,
      experienceLevel: null,
      interviewReadiness: {},
      strengths: [],
      weaknesses: [],
      recommendations: [],
      certifications: [],
      benchmarkComparison: {},
      confidenceLevel: 'medium',
      dataQuality: this.assessDataQuality(analyticsData)
    };

    // Calculate skill scores based on analytics data
    assessment.skillScores = this.calculateSkillScores(analyticsData, weaknessAnalysis);
    
    // Calculate subcategory scores
    assessment.subcategoryScores = this.calculateSubcategoryScores(assessment.skillScores);
    
    // Calculate category scores
    assessment.categoryScores = this.calculateCategoryScores(assessment.subcategoryScores);
    
    // Calculate overall score
    assessment.overallScore = this.calculateOverallScore(assessment.categoryScores);
    
    // Determine experience level
    assessment.experienceLevel = this.determineExperienceLevel(assessment.categoryScores);
    
    // Assess interview readiness
    assessment.interviewReadiness = this.assessInterviewReadiness(assessment, interviewData);
    
    // Identify strengths and weaknesses
    assessment.strengths = this.identifyStrengths(assessment);
    assessment.weaknesses = this.identifyWeaknesses(assessment);
    
    // Generate recommendations
    assessment.recommendations = this.generateRecommendations(assessment);
    
    // Check for certifications
    assessment.certifications = this.checkCertifications(assessment);
    
    // Compare with industry benchmarks
    assessment.benchmarkComparison = this.compareToBenchmarks(assessment);
    
    // Determine confidence level
    assessment.confidenceLevel = this.determineConfidenceLevel(assessment);

    // Store assessment
    this.storeAssessment(assessment);
    
    return assessment;
  }

  // Calculate individual skill scores
  calculateSkillScores(analyticsData, weaknessAnalysis) {
    const skillScores = {};
    const topicStats = analyticsData.totalStats?.topicStats || {};
    const levelStats = analyticsData.totalStats?.levelStats || {};
    
    // Map topics to skills and calculate scores
    Object.entries(topicStats).forEach(([topic, stats]) => {
      const skills = this.mapTopicToSkills(topic);
      const accuracy = stats.correct / Math.max(stats.total, 1);
      const responseTime = stats.totalTime / Math.max(stats.total, 1);
      const confidence = this.calculateSkillConfidence(stats.total, accuracy);
      
      skills.forEach(skill => {
        if (!skillScores[skill]) {
          skillScores[skill] = {
            accuracy: 0,
            confidence: 'low',
            responseTime: 0,
            questionsAnswered: 0,
            score: 0,
            sources: []
          };
        }
        
        // Weighted average based on question count
        const existingWeight = skillScores[skill].questionsAnswered;
        const newWeight = stats.total;
        const totalWeight = existingWeight + newWeight;
        
        skillScores[skill].accuracy = (skillScores[skill].accuracy * existingWeight + accuracy * newWeight) / totalWeight;
        skillScores[skill].responseTime = (skillScores[skill].responseTime * existingWeight + responseTime * newWeight) / totalWeight;
        skillScores[skill].questionsAnswered = totalWeight;
        skillScores[skill].sources.push(topic);
        skillScores[skill].confidence = this.calculateSkillConfidence(totalWeight, skillScores[skill].accuracy);
        
        // Calculate final score (0-100) based on accuracy, speed, and confidence
        skillScores[skill].score = this.calculateFinalSkillScore(
          skillScores[skill].accuracy,
          skillScores[skill].responseTime,
          skillScores[skill].confidence,
          totalWeight
        );
      });
    });

    // Apply weakness analysis adjustments
    if (weaknessAnalysis) {
      this.adjustScoresForWeaknesses(skillScores, weaknessAnalysis);
    }

    return skillScores;
  }

  // Calculate subcategory scores
  calculateSubcategoryScores(skillScores) {
    const subcategoryScores = {};
    
    Object.entries(this.skillCategories).forEach(([categoryKey, category]) => {
      Object.entries(category.subcategories).forEach(([subcategoryKey, subcategory]) => {
        let totalScore = 0;
        let totalWeight = 0;
        let skillCount = 0;
        
        subcategory.skills.forEach(skill => {
          if (skillScores[skill]) {
            totalScore += skillScores[skill].score;
            totalWeight += skillScores[skill].questionsAnswered;
            skillCount++;
          }
        });
        
        subcategoryScores[subcategoryKey] = {
          score: skillCount > 0 ? totalScore / skillCount : 0,
          skillCount: skillCount,
          totalQuestions: totalWeight,
          confidence: this.calculateSubcategoryConfidence(subcategory.skills, skillScores)
        };
      });
    });
    
    return subcategoryScores;
  }

  // Calculate category scores
  calculateCategoryScores(subcategoryScores) {
    const categoryScores = {};
    
    Object.entries(this.skillCategories).forEach(([categoryKey, category]) => {
      let weightedScore = 0;
      let totalWeight = 0;
      let subcategoryCount = 0;
      
      Object.entries(category.subcategories).forEach(([subcategoryKey, subcategory]) => {
        if (subcategoryScores[subcategoryKey]) {
          const score = subcategoryScores[subcategoryKey].score;
          const weight = subcategory.weight;
          
          weightedScore += score * weight;
          totalWeight += weight;
          subcategoryCount++;
        }
      });
      
      categoryScores[categoryKey] = {
        score: totalWeight > 0 ? weightedScore / totalWeight : 0,
        subcategoryCount: subcategoryCount,
        confidence: this.calculateCategoryConfidence(category.subcategories, subcategoryScores)
      };
    });
    
    return categoryScores;
  }

  // Calculate overall score
  calculateOverallScore(categoryScores) {
    let weightedScore = 0;
    let totalWeight = 0;
    
    Object.entries(this.skillCategories).forEach(([categoryKey, category]) => {
      if (categoryScores[categoryKey]) {
        const score = categoryScores[categoryKey].score;
        const weight = category.weight;
        
        weightedScore += score * weight;
        totalWeight += weight;
      }
    });
    
    return totalWeight > 0 ? Math.round(weightedScore / totalWeight) : 0;
  }

  // Determine experience level based on scores
  determineExperienceLevel(categoryScores) {
    const scores = {
      'technical-skills': categoryScores['technical-skills']?.score || 0,
      'problem-solving': categoryScores['problem-solving']?.score || 0,
      'coding-proficiency': categoryScores['coding-proficiency']?.score || 0,
      'communication': categoryScores['communication']?.score || 0
    };

    // Check against benchmarks from highest to lowest
    const levels = ['expert-level', 'senior-level', 'mid-level', 'entry-level'];
    
    for (const level of levels) {
      const requirements = this.industryBenchmarks[level].requirements;
      let meetsRequirements = true;
      
      for (const [category, requiredScore] of Object.entries(requirements)) {
        if (scores[category] < requiredScore) {
          meetsRequirements = false;
          break;
        }
      }
      
      if (meetsRequirements) {
        return {
          level: level,
          name: this.industryBenchmarks[level].name,
          confidence: this.calculateLevelConfidence(scores, requirements)
        };
      }
    }
    
    return {
      level: 'beginner',
      name: 'Beginner (< 1 year)',
      confidence: 'low'
    };
  }

  // Assess interview readiness
  assessInterviewReadiness(assessment, interviewData) {
    const readiness = {
      overall: 0,
      byCompany: {},
      byRole: {},
      recommendations: [],
      estimatedSuccessRate: 0
    };

    // Base readiness on overall score and category balance
    const overallScore = assessment.overallScore;
    const categoryScores = assessment.categoryScores;
    
    // Calculate base readiness
    readiness.overall = Math.min(100, overallScore + this.calculateReadinessBonus(categoryScores));
    
    // Assess readiness for different company types
    readiness.byCompany = {
      'startup': this.assessStartupReadiness(assessment),
      'big-tech': this.assessBigTechReadiness(assessment),
      'enterprise': this.assessEnterpriseReadiness(assessment),
      'consulting': this.assessConsultingReadiness(assessment)
    };

    // Assess readiness for different roles
    readiness.byRole = {
      'frontend': this.assessFrontendReadiness(assessment),
      'backend': this.assessBackendReadiness(assessment),
      'fullstack': this.assessFullStackReadiness(assessment),
      'data-science': this.assessDataScienceReadiness(assessment)
    };

    // Calculate estimated success rate
    readiness.estimatedSuccessRate = this.calculateSuccessRate(assessment, interviewData);

    // Generate interview-specific recommendations
    readiness.recommendations = this.generateInterviewRecommendations(assessment);

    return readiness;
  }

  // Identify strengths
  identifyStrengths(assessment) {
    const strengths = [];
    const categoryScores = assessment.categoryScores;
    const subcategoryScores = assessment.subcategoryScores;
    const skillScores = assessment.skillScores;

    // Category-level strengths (score >= 80)
    Object.entries(categoryScores).forEach(([category, data]) => {
      if (data.score >= 80) {
        strengths.push({
          type: 'category',
          name: category,
          score: data.score,
          level: 'high',
          description: `Strong performance in ${this.skillCategories[category].name}`
        });
      }
    });

    // Subcategory-level strengths (score >= 85)
    Object.entries(subcategoryScores).forEach(([subcategory, data]) => {
      if (data.score >= 85) {
        const categoryInfo = this.findCategoryForSubcategory(subcategory);
        if (categoryInfo) {
          strengths.push({
            type: 'subcategory',
            name: subcategory,
            score: data.score,
            level: 'high',
            description: `Excellent ${categoryInfo.subcategory.name} skills`
          });
        }
      }
    });

    // Individual skill strengths (score >= 90)
    Object.entries(skillScores).forEach(([skill, data]) => {
      if (data.score >= 90 && data.confidence !== 'low') {
        strengths.push({
          type: 'skill',
          name: skill,
          score: data.score,
          level: 'expert',
          description: `Mastery of ${skill.replace('-', ' ')}`
        });
      }
    });

    return strengths.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  // Identify weaknesses
  identifyWeaknesses(assessment) {
    const weaknesses = [];
    const categoryScores = assessment.categoryScores;
    const subcategoryScores = assessment.subcategoryScores;
    const skillScores = assessment.skillScores;

    // Category-level weaknesses (score < 60)
    Object.entries(categoryScores).forEach(([category, data]) => {
      if (data.score < 60) {
        weaknesses.push({
          type: 'category',
          name: category,
          score: data.score,
          severity: data.score < 40 ? 'critical' : 'high',
          description: `Needs improvement in ${this.skillCategories[category].name}`,
          impact: 'high'
        });
      }
    });

    // Subcategory-level weaknesses (score < 65)
    Object.entries(subcategoryScores).forEach(([subcategory, data]) => {
      if (data.score < 65) {
        const categoryInfo = this.findCategoryForSubcategory(subcategory);
        if (categoryInfo) {
          weaknesses.push({
            type: 'subcategory',
            name: subcategory,
            score: data.score,
            severity: data.score < 45 ? 'critical' : 'medium',
            description: `Weak ${categoryInfo.subcategory.name} skills`,
            impact: 'medium'
          });
        }
      }
    });

    // Individual skill weaknesses (score < 70)
    Object.entries(skillScores).forEach(([skill, data]) => {
      if (data.score < 70 && data.questionsAnswered >= 3) {
        weaknesses.push({
          type: 'skill',
          name: skill,
          score: data.score,
          severity: data.score < 50 ? 'critical' : 'low',
          description: `Needs practice with ${skill.replace('-', ' ')}`,
          impact: 'low'
        });
      }
    });

    return weaknesses.sort((a, b) => a.score - b.score).slice(0, 15);
  }

  // Generate recommendations
  generateRecommendations(assessment) {
    const recommendations = [];
    
    // Recommendations based on weaknesses
    assessment.weaknesses.forEach(weakness => {
      if (weakness.severity === 'critical' || weakness.severity === 'high') {
        recommendations.push({
          type: 'improvement',
          priority: weakness.severity === 'critical' ? 'high' : 'medium',
          category: weakness.type,
          title: `Improve ${weakness.name.replace('-', ' ')}`,
          description: weakness.description,
          estimatedTime: this.estimateImprovementTime(weakness),
          actions: this.generateImprovementActions(weakness)
        });
      }
    });

    // Recommendations based on experience level
    const experienceLevel = assessment.experienceLevel;
    if (experienceLevel && experienceLevel.level !== 'expert-level') {
      const nextLevel = this.getNextExperienceLevel(experienceLevel.level);
      if (nextLevel) {
        recommendations.push({
          type: 'progression',
          priority: 'medium',
          category: 'career',
          title: `Progress to ${nextLevel.name}`,
          description: `Focus on key areas to reach ${nextLevel.name}`,
          estimatedTime: '3-6 months',
          actions: this.generateProgressionActions(assessment, nextLevel)
        });
      }
    }

    // Recommendations based on interview readiness
    if (assessment.interviewReadiness.overall < 75) {
      recommendations.push({
        type: 'interview-prep',
        priority: 'high',
        category: 'interview',
        title: 'Improve Interview Readiness',
        description: 'Focus on areas that will boost your interview performance',
        estimatedTime: '2-4 weeks',
        actions: assessment.interviewReadiness.recommendations
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Check for certifications
  checkCertifications(assessment) {
    const certifications = [];
    const overallScore = assessment.overallScore;
    const categoryScores = assessment.categoryScores;

    Object.entries(this.certificationLevels).forEach(([level, cert]) => {
      let qualifies = overallScore >= cert.requirements.overall;
      
      // Check category requirements
      if (qualifies && cert.requirements.categories) {
        Object.entries(cert.requirements.categories).forEach(([category, requiredScore]) => {
          if (!categoryScores[category] || categoryScores[category].score < requiredScore) {
            qualifies = false;
          }
        });
      }

      if (qualifies) {
        certifications.push({
          level: level,
          name: cert.name,
          badge: cert.badge,
          description: cert.description,
          earnedDate: new Date(),
          score: overallScore
        });
      }
    });

    return certifications;
  }

  // Compare with industry benchmarks
  compareToBenchmarks(assessment) {
    const comparison = {};
    const categoryScores = assessment.categoryScores;

    Object.entries(this.industryBenchmarks).forEach(([level, benchmark]) => {
      const gaps = {};
      let overallGap = 0;
      let categoriesMet = 0;

      Object.entries(benchmark.requirements).forEach(([category, required]) => {
        const current = categoryScores[category]?.score || 0;
        const gap = required - current;
        gaps[category] = {
          current: current,
          required: required,
          gap: gap,
          meets: gap <= 0
        };
        
        if (gap <= 0) categoriesMet++;
        overallGap += Math.max(0, gap);
      });

      comparison[level] = {
        name: benchmark.name,
        salaryRange: benchmark.salaryRange,
        commonRoles: benchmark.commonRoles,
        gaps: gaps,
        overallGap: overallGap,
        categoriesMet: categoriesMet,
        totalCategories: Object.keys(benchmark.requirements).length,
        readiness: categoriesMet / Object.keys(benchmark.requirements).length
      };
    });

    return comparison;
  }

  // Helper methods
  mapTopicToSkills(topic) {
    const topicSkillMap = {
      'java': ['programming-fundamentals', 'oop', 'classes', 'inheritance'],
      'python': ['programming-fundamentals', 'data-types', 'functions'],
      'javascript': ['programming-fundamentals', 'functions', 'closures'],
      'oop': ['classes', 'inheritance', 'polymorphism', 'encapsulation'],
      'database': ['sql-basics', 'joins', 'normalization', 'indexing'],
      'algorithms': ['sorting', 'searching', 'recursion', 'dynamic-programming'],
      'ai': ['machine-learning', 'data-analysis', 'statistics'],
      'system-design': ['scalability', 'load-balancing', 'caching', 'microservices']
    };

    return topicSkillMap[topic.toLowerCase()] || [topic.toLowerCase().replace(/\s+/g, '-')];
  }

  calculateSkillConfidence(questionCount, accuracy) {
    if (questionCount < 3) return 'low';
    if (questionCount < 8) return 'medium';
    if (accuracy >= 0.8) return 'high';
    return 'medium';
  }

  calculateFinalSkillScore(accuracy, responseTime, confidence, questionCount) {
    let baseScore = accuracy * 100;
    
    // Time bonus/penalty (assuming 30 seconds is optimal)
    const timeScore = Math.max(0, 100 - (responseTime / 1000 - 30) * 2);
    
    // Confidence adjustment
    const confidenceMultiplier = {
      'low': 0.8,
      'medium': 1.0,
      'high': 1.1
    };
    
    // Question count bonus (more questions = more reliable)
    const countBonus = Math.min(10, questionCount * 0.5);
    
    return Math.min(100, Math.round(
      (baseScore * 0.7 + timeScore * 0.3) * confidenceMultiplier[confidence] + countBonus
    ));
  }

  adjustScoresForWeaknesses(skillScores, weaknessAnalysis) {
    if (!weaknessAnalysis.conceptWeaknesses) return;

    Object.entries(weaknessAnalysis.conceptWeaknesses).forEach(([concept, data]) => {
      if (skillScores[concept] && data.isWeak) {
        // Apply penalty for confirmed weaknesses
        skillScores[concept].score *= 0.9;
        skillScores[concept].confidence = 'low';
      }
    });
  }

  calculateSubcategoryConfidence(skills, skillScores) {
    const confidences = skills.map(skill => skillScores[skill]?.confidence || 'low');
    const highCount = confidences.filter(c => c === 'high').length;
    const mediumCount = confidences.filter(c => c === 'medium').length;
    
    if (highCount >= skills.length * 0.6) return 'high';
    if (highCount + mediumCount >= skills.length * 0.7) return 'medium';
    return 'low';
  }

  calculateCategoryConfidence(subcategories, subcategoryScores) {
    const confidences = Object.keys(subcategories).map(sub => 
      subcategoryScores[sub]?.confidence || 'low'
    );
    
    const highCount = confidences.filter(c => c === 'high').length;
    const mediumCount = confidences.filter(c => c === 'medium').length;
    
    if (highCount >= confidences.length * 0.5) return 'high';
    if (highCount + mediumCount >= confidences.length * 0.6) return 'medium';
    return 'low';
  }

  calculateLevelConfidence(scores, requirements) {
    let totalGap = 0;
    let categoriesCount = 0;
    
    Object.entries(requirements).forEach(([category, required]) => {
      const current = scores[category] || 0;
      const gap = Math.max(0, required - current);
      totalGap += gap;
      categoriesCount++;
    });
    
    const avgGap = totalGap / categoriesCount;
    if (avgGap <= 5) return 'high';
    if (avgGap <= 15) return 'medium';
    return 'low';
  }

  assessDataQuality(analyticsData) {
    const totalQuestions = analyticsData.totalStats?.questionsAnswered || 0;
    const topicCount = Object.keys(analyticsData.totalStats?.topicStats || {}).length;
    
    if (totalQuestions >= 50 && topicCount >= 5) return 'high';
    if (totalQuestions >= 20 && topicCount >= 3) return 'medium';
    return 'low';
  }

  determineConfidenceLevel(assessment) {
    const dataQuality = assessment.dataQuality;
    const categoryConfidences = Object.values(assessment.categoryScores).map(c => c.confidence);
    
    const highConfidenceCount = categoryConfidences.filter(c => c === 'high').length;
    
    if (dataQuality === 'high' && highConfidenceCount >= 3) return 'high';
    if (dataQuality === 'medium' && highConfidenceCount >= 2) return 'medium';
    return 'low';
  }

  // Store assessment
  storeAssessment(assessment) {
    const assessments = this.store.get('assessments', []);
    assessments.push(assessment);
    
    // Keep only last 10 assessments
    if (assessments.length > 10) {
      assessments.splice(0, assessments.length - 10);
    }
    
    this.store.set('assessments', assessments);
    this.store.set('lastAssessment', assessment);
  }

  // Get latest assessment
  getLatestAssessment() {
    return this.store.get('lastAssessment');
  }

  // Get assessment history
  getAssessmentHistory() {
    return this.store.get('assessments', []);
  }

  // Clear all assessment data
  clearAssessmentData() {
    this.store.clear();
  }

  // Additional helper methods for specific assessments
  assessStartupReadiness(assessment) {
    // Startups value adaptability and practical skills
    const practicalScore = (assessment.categoryScores['coding-proficiency']?.score || 0) * 0.4 +
                          (assessment.categoryScores['problem-solving']?.score || 0) * 0.4 +
                          (assessment.categoryScores['communication']?.score || 0) * 0.2;
    return Math.round(practicalScore);
  }

  assessBigTechReadiness(assessment) {
    // Big tech focuses heavily on algorithms and system design
    const techScore = (assessment.categoryScores['technical-skills']?.score || 0) * 0.5 +
                     (assessment.categoryScores['problem-solving']?.score || 0) * 0.3 +
                     (assessment.categoryScores['coding-proficiency']?.score || 0) * 0.2;
    return Math.round(techScore);
  }

  assessEnterpriseReadiness(assessment) {
    // Enterprise values stability and communication
    const enterpriseScore = (assessment.categoryScores['technical-skills']?.score || 0) * 0.3 +
                           (assessment.categoryScores['coding-proficiency']?.score || 0) * 0.3 +
                           (assessment.categoryScores['communication']?.score || 0) * 0.4;
    return Math.round(enterpriseScore);
  }

  assessConsultingReadiness(assessment) {
    // Consulting requires strong communication and problem-solving
    const consultingScore = (assessment.categoryScores['problem-solving']?.score || 0) * 0.4 +
                           (assessment.categoryScores['communication']?.score || 0) * 0.4 +
                           (assessment.categoryScores['technical-skills']?.score || 0) * 0.2;
    return Math.round(consultingScore);
  }

  // Role-specific readiness assessments
  assessFrontendReadiness(assessment) {
    // Frontend focuses on UI/UX and user experience
    return Math.round(assessment.overallScore * 0.9); // Simplified for now
  }

  assessBackendReadiness(assessment) {
    // Backend focuses on system design and data management
    const backendScore = (assessment.categoryScores['technical-skills']?.score || 0) * 0.6 +
                        (assessment.categoryScores['problem-solving']?.score || 0) * 0.4;
    return Math.round(backendScore);
  }

  assessFullStackReadiness(assessment) {
    // Full-stack requires balanced skills across all areas
    return Math.round(assessment.overallScore);
  }

  assessDataScienceReadiness(assessment) {
    // Data science requires strong analytical and mathematical skills
    const dataScore = (assessment.categoryScores['problem-solving']?.score || 0) * 0.5 +
                     (assessment.categoryScores['technical-skills']?.score || 0) * 0.5;
    return Math.round(dataScore);
  }

  calculateSuccessRate(assessment, interviewData) {
    // Base success rate on overall score and interview readiness
    const baseRate = Math.min(95, assessment.overallScore * 0.8 + 20);
    
    // Adjust based on interview history if available
    if (interviewData && interviewData.length > 0) {
      const recentSuccess = interviewData.slice(-5).filter(i => i.score >= 70).length;
      const adjustment = (recentSuccess / Math.min(5, interviewData.length)) * 10;
      return Math.round(baseRate + adjustment);
    }
    
    return Math.round(baseRate);
  }

  generateInterviewRecommendations(assessment) {
    const recommendations = [];
    
    // Based on weakest categories
    const sortedCategories = Object.entries(assessment.categoryScores)
      .sort((a, b) => a[1].score - b[1].score);
    
    sortedCategories.slice(0, 2).forEach(([category, data]) => {
      if (data.score < 75) {
        recommendations.push(`Focus on ${this.skillCategories[category].name} - current score: ${data.score}%`);
      }
    });
    
    return recommendations;
  }

  findCategoryForSubcategory(subcategoryKey) {
    for (const [categoryKey, category] of Object.entries(this.skillCategories)) {
      if (category.subcategories[subcategoryKey]) {
        return {
          category: category,
          subcategory: category.subcategories[subcategoryKey]
        };
      }
    }
    return null;
  }

  getNextExperienceLevel(currentLevel) {
    const levels = ['entry-level', 'mid-level', 'senior-level', 'expert-level'];
    const currentIndex = levels.indexOf(currentLevel);
    
    if (currentIndex >= 0 && currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1];
      return this.industryBenchmarks[nextLevel];
    }
    
    return null;
  }

  estimateImprovementTime(weakness) {
    const timeMap = {
      'critical': '4-8 weeks',
      'high': '2-4 weeks',
      'medium': '1-3 weeks',
      'low': '1-2 weeks'
    };
    
    return timeMap[weakness.severity] || '2-4 weeks';
  }

  generateImprovementActions(weakness) {
    const actionMap = {
      'technical-skills': [
        'Practice coding problems daily',
        'Study data structures and algorithms',
        'Build projects to apply concepts'
      ],
      'problem-solving': [
        'Solve algorithmic challenges',
        'Practice breaking down complex problems',
        'Learn problem-solving patterns'
      ],
      'coding-proficiency': [
        'Focus on code quality and best practices',
        'Practice code reviews',
        'Learn design patterns'
      ],
      'communication': [
        'Practice explaining technical concepts',
        'Join coding communities',
        'Present your projects'
      ]
    };
    
    return actionMap[weakness.name] || [`Practice ${weakness.name.replace('-', ' ')}`];
  }

  generateProgressionActions(assessment, nextLevel) {
    const actions = [];
    const currentScores = assessment.categoryScores;
    
    Object.entries(nextLevel.requirements).forEach(([category, required]) => {
      const current = currentScores[category]?.score || 0;
      if (current < required) {
        const gap = required - current;
        actions.push(`Improve ${this.skillCategories[category].name} by ${gap} points`);
      }
    });
    
    return actions;
  }

  calculateReadinessBonus(categoryScores) {
    // Bonus for balanced skills (no category significantly lower than others)
    const scores = Object.values(categoryScores).map(c => c.score);
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - avg, 2), 0) / scores.length;
    
    // Lower variance = more balanced = higher bonus
    return Math.max(0, 10 - variance / 10);
  }
}

module.exports = SkillAssessment;
