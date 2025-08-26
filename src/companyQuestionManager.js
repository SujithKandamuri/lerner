const Store = require('electron-store');
const fs = require('fs').promises;
const path = require('path');

class CompanyQuestionManager {
  constructor() {
    this.store = new Store({
      name: 'company-questions',
      defaults: {
        companyQuestionSets: {},
        downloadHistory: [],
        lastUpdated: {},
        downloadStats: {
          totalDownloads: 0,
          successfulDownloads: 0,
          failedDownloads: 0
        }
      }
    });

    // Define company profiles with detailed interview characteristics
    this.companyProfiles = this.initializeCompanyProfiles();
  }

  // Initialize detailed company profiles for question generation
  initializeCompanyProfiles() {
    return {
      'google': {
        name: 'Google',
        description: 'Algorithmic problem-solving with focus on optimization and scalability',
        interviewStyle: {
          focus: 'algorithms-and-optimization',
          difficulty: 'high',
          timePerQuestion: 8,
          questionTypes: ['coding', 'system-design', 'behavioral'],
          keyAreas: ['data-structures', 'algorithms', 'system-design', 'optimization']
        },
        questionPrompts: {
          coding: 'Generate a Google-style coding interview question that focuses on algorithmic thinking, optimization, and scalability. The question should be challenging but solvable in 30-45 minutes. Include multiple approaches and discuss time/space complexity.',
          systemDesign: 'Create a Google-style system design question that tests understanding of large-scale distributed systems, scalability, and performance optimization. Focus on real-world scenarios that Google might face.',
          behavioral: 'Generate a Google-style behavioral question that assesses leadership, innovation, and problem-solving in ambiguous situations. Focus on Googleyness and leadership principles.'
        },
        topics: ['algorithms', 'data-structures', 'system-design', 'distributed-systems', 'optimization'],
        levels: ['intermediate', 'advanced'],
        questionCount: 50,
        tips: [
          'Always discuss time and space complexity',
          'Think about edge cases and optimizations',
          'Consider scalability from the start',
          'Be prepared for follow-up questions'
        ]
      },
      'amazon': {
        name: 'Amazon',
        description: 'Leadership principles combined with technical depth and customer obsession',
        interviewStyle: {
          focus: 'leadership-and-scale',
          difficulty: 'medium-high',
          timePerQuestion: 7,
          questionTypes: ['coding', 'system-design', 'behavioral', 'leadership'],
          keyAreas: ['leadership-principles', 'system-design', 'customer-obsession', 'scalability']
        },
        questionPrompts: {
          coding: 'Create an Amazon-style coding question that emphasizes practical problem-solving and scalability. The solution should demonstrate customer obsession and operational excellence.',
          systemDesign: 'Generate an Amazon-style system design question focused on building scalable, cost-effective systems that serve millions of customers. Consider AWS services and distributed architecture.',
          behavioral: 'Create a behavioral question based on Amazon Leadership Principles. Focus on customer obsession, ownership, and delivering results in challenging situations.',
          leadership: 'Generate a leadership scenario question that tests decision-making, team management, and driving results in ambiguous situations.'
        },
        topics: ['system-design', 'leadership-principles', 'scalability', 'aws', 'distributed-systems'],
        levels: ['intermediate', 'advanced'],
        questionCount: 60,
        tips: [
          'Relate answers to Amazon Leadership Principles',
          'Focus on customer obsession in all responses',
          'Discuss scalability and cost optimization',
          'Prepare specific examples with metrics'
        ]
      },
      'meta': {
        name: 'Meta (Facebook)',
        description: 'Product thinking combined with technical execution and user impact',
        interviewStyle: {
          focus: 'product-and-impact',
          difficulty: 'medium-high',
          timePerQuestion: 8,
          questionTypes: ['coding', 'system-design', 'product', 'behavioral'],
          keyAreas: ['product-thinking', 'user-impact', 'system-design', 'mobile-first']
        },
        questionPrompts: {
          coding: 'Generate a Meta-style coding question that emphasizes building features for billions of users. Focus on performance, mobile optimization, and user experience.',
          systemDesign: 'Create a Meta-style system design question about building social media features at scale. Consider real-time updates, news feeds, and global distribution.',
          product: 'Design a product thinking question that tests ability to build features for Meta\'s family of apps. Focus on user engagement, growth, and social connections.',
          behavioral: 'Generate a behavioral question that assesses ability to work in Meta\'s fast-paced, impact-driven culture. Focus on building for the future and moving fast.'
        },
        topics: ['product-design', 'social-systems', 'real-time-systems', 'mobile-development', 'user-experience'],
        levels: ['intermediate', 'advanced'],
        questionCount: 45,
        tips: [
          'Think about user experience and engagement',
          'Consider mobile-first approaches',
          'Discuss metrics and impact measurement',
          'Focus on building for billions of users'
        ]
      },
      'microsoft': {
        name: 'Microsoft',
        description: 'Collaborative problem-solving with focus on inclusive technology',
        interviewStyle: {
          focus: 'collaboration-and-inclusion',
          difficulty: 'medium',
          timePerQuestion: 7,
          questionTypes: ['coding', 'system-design', 'behavioral', 'collaboration'],
          keyAreas: ['collaboration', 'inclusive-design', 'cloud-computing', 'enterprise-solutions']
        },
        questionPrompts: {
          coding: 'Create a Microsoft-style coding question that emphasizes clean, maintainable code and collaborative development. Focus on enterprise-grade solutions.',
          systemDesign: 'Generate a Microsoft-style system design question about building enterprise cloud solutions. Consider Azure services, security, and accessibility.',
          behavioral: 'Design a behavioral question that tests collaborative skills, inclusive thinking, and ability to work with diverse teams.',
          collaboration: 'Create a scenario-based question about working in cross-functional teams and driving consensus in complex technical decisions.'
        },
        topics: ['cloud-computing', 'enterprise-solutions', 'accessibility', 'collaboration', 'azure'],
        levels: ['beginner', 'intermediate', 'advanced'],
        questionCount: 40,
        tips: [
          'Emphasize teamwork and collaboration',
          'Show inclusive and accessible thinking',
          'Discuss enterprise and security considerations',
          'Demonstrate growth mindset'
        ]
      },
      'apple': {
        name: 'Apple',
        description: 'Design excellence and user experience with attention to detail',
        interviewStyle: {
          focus: 'design-and-excellence',
          difficulty: 'high',
          timePerQuestion: 9,
          questionTypes: ['coding', 'system-design', 'design', 'behavioral'],
          keyAreas: ['user-experience', 'performance', 'design-thinking', 'innovation']
        },
        questionPrompts: {
          coding: 'Generate an Apple-style coding question that emphasizes performance, elegance, and user experience. The solution should be efficient and beautifully crafted.',
          systemDesign: 'Create an Apple-style system design question focused on building seamless, integrated experiences across devices. Consider privacy, performance, and design.',
          design: 'Design a question about creating intuitive, accessible user interfaces that work seamlessly across Apple\'s ecosystem.',
          behavioral: 'Generate a behavioral question that assesses attention to detail, innovation, and commitment to excellence in user experience.'
        },
        topics: ['user-experience', 'performance-optimization', 'design-systems', 'mobile-development', 'privacy'],
        levels: ['intermediate', 'advanced'],
        questionCount: 35,
        tips: [
          'Focus on user experience and design thinking',
          'Emphasize performance and efficiency',
          'Consider privacy and security implications',
          'Show attention to detail and craftsmanship'
        ]
      },
      'netflix': {
        name: 'Netflix',
        description: 'Streaming technology and data-driven decision making at scale',
        interviewStyle: {
          focus: 'streaming-and-data',
          difficulty: 'high',
          timePerQuestion: 8,
          questionTypes: ['coding', 'system-design', 'data', 'behavioral'],
          keyAreas: ['streaming-technology', 'data-analysis', 'recommendation-systems', 'global-scale']
        },
        questionPrompts: {
          coding: 'Create a Netflix-style coding question related to streaming technology, content delivery, or recommendation algorithms. Focus on handling massive scale.',
          systemDesign: 'Generate a Netflix-style system design question about building global streaming infrastructure or recommendation systems for millions of users.',
          data: 'Design a data engineering question about processing and analyzing viewing patterns, A/B testing, or content recommendation at Netflix scale.',
          behavioral: 'Create a behavioral question that tests ability to work in Netflix\'s high-performance, data-driven culture with freedom and responsibility.'
        },
        topics: ['streaming-technology', 'recommendation-systems', 'data-engineering', 'content-delivery', 'machine-learning'],
        levels: ['intermediate', 'advanced'],
        questionCount: 30,
        tips: [
          'Think about global scale and performance',
          'Consider data-driven decision making',
          'Focus on personalization and recommendations',
          'Discuss A/B testing and experimentation'
        ]
      },
      'uber': {
        name: 'Uber',
        description: 'Real-time systems and marketplace dynamics at global scale',
        interviewStyle: {
          focus: 'real-time-and-marketplace',
          difficulty: 'high',
          timePerQuestion: 7,
          questionTypes: ['coding', 'system-design', 'marketplace', 'behavioral'],
          keyAreas: ['real-time-systems', 'geolocation', 'marketplace-dynamics', 'optimization']
        },
        questionPrompts: {
          coding: 'Generate an Uber-style coding question involving real-time matching, geolocation algorithms, or marketplace optimization problems.',
          systemDesign: 'Create an Uber-style system design question about building real-time matching systems, dynamic pricing, or global marketplace platforms.',
          marketplace: 'Design a question about marketplace dynamics, supply-demand optimization, or pricing algorithms in two-sided markets.',
          behavioral: 'Generate a behavioral question that tests ability to work in Uber\'s fast-paced, global environment with focus on operational excellence.'
        },
        topics: ['real-time-systems', 'geolocation', 'marketplace-design', 'optimization-algorithms', 'distributed-systems'],
        levels: ['intermediate', 'advanced'],
        questionCount: 35,
        tips: [
          'Focus on real-time and location-based problems',
          'Consider marketplace dynamics and optimization',
          'Think about global scale and localization',
          'Discuss operational efficiency and reliability'
        ]
      },
      'startup': {
        name: 'Startup/Scale-up',
        description: 'Practical problem-solving with resource constraints and rapid growth',
        interviewStyle: {
          focus: 'practical-and-adaptable',
          difficulty: 'medium',
          timePerQuestion: 6,
          questionTypes: ['coding', 'practical', 'growth', 'behavioral'],
          keyAreas: ['mvp-development', 'resource-optimization', 'rapid-scaling', 'adaptability']
        },
        questionPrompts: {
          coding: 'Create a startup-style coding question that emphasizes building practical, working solutions quickly with limited resources. Focus on MVP approaches.',
          practical: 'Generate a practical engineering question about scaling systems rapidly, optimizing for speed of development, or working with technical debt.',
          growth: 'Design a question about building features that drive user growth, engagement, or revenue in resource-constrained environments.',
          behavioral: 'Create a behavioral question that tests adaptability, ownership, and ability to thrive in ambiguous, fast-changing startup environments.'
        },
        topics: ['mvp-development', 'rapid-prototyping', 'growth-hacking', 'resource-optimization', 'full-stack'],
        levels: ['beginner', 'intermediate'],
        questionCount: 25,
        tips: [
          'Focus on practical, working solutions',
          'Show ability to work with constraints',
          'Emphasize speed and iteration',
          'Demonstrate ownership and adaptability'
        ]
      }
    };
  }

  // Download company-specific questions using AI
  async downloadCompanyQuestions(companyKey, aiManager, progressCallback = null) {
    const company = this.companyProfiles[companyKey];
    if (!company) {
      throw new Error(`Unknown company: ${companyKey}`);
    }

    const downloadId = Date.now().toString();
    const startTime = new Date();
    
    try {
      if (progressCallback) progressCallback({ stage: 'starting', progress: 0, message: `Starting download for ${company.name}...` });

      const questions = [];
      const totalQuestions = company.questionCount;
      const questionsPerType = Math.floor(totalQuestions / company.interviewStyle.questionTypes.length);

      let questionIndex = 0;

      // Generate questions for each type
      for (const questionType of company.interviewStyle.questionTypes) {
        const typeQuestions = questionsPerType;
        
        for (let i = 0; i < typeQuestions; i++) {
          try {
            if (progressCallback) {
              progressCallback({
                stage: 'generating',
                progress: (questionIndex / totalQuestions) * 100,
                message: `Generating ${questionType} question ${i + 1}/${typeQuestions}...`
              });
            }

            const question = await this.generateCompanyQuestion(company, questionType, aiManager);
            if (question) {
              questions.push({
                ...question,
                company: companyKey,
                questionType: questionType,
                downloadId: downloadId,
                generatedAt: new Date()
              });
            }

            questionIndex++;
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

          } catch (error) {
            console.error(`Failed to generate ${questionType} question ${i + 1}:`, error);
            // Continue with next question
          }
        }
      }

      if (questions.length === 0) {
        throw new Error('No questions were successfully generated');
      }

      // Save questions to store
      const existingQuestions = this.store.get(`companyQuestionSets.${companyKey}`, []);
      const updatedQuestions = [...existingQuestions, ...questions];
      
      this.store.set(`companyQuestionSets.${companyKey}`, updatedQuestions);
      this.store.set(`lastUpdated.${companyKey}`, new Date());

      // Update download history
      const downloadRecord = {
        id: downloadId,
        company: companyKey,
        questionsGenerated: questions.length,
        startTime: startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        success: true
      };

      const history = this.store.get('downloadHistory', []);
      history.push(downloadRecord);
      if (history.length > 50) history.splice(0, history.length - 50); // Keep last 50
      this.store.set('downloadHistory', history);

      // Update stats
      const stats = this.store.get('downloadStats');
      stats.totalDownloads++;
      stats.successfulDownloads++;
      this.store.set('downloadStats', stats);

      if (progressCallback) {
        progressCallback({
          stage: 'complete',
          progress: 100,
          message: `Successfully downloaded ${questions.length} questions for ${company.name}!`
        });
      }

      return {
        success: true,
        questionsGenerated: questions.length,
        downloadId: downloadId,
        company: company.name,
        duration: Date.now() - startTime.getTime()
      };

    } catch (error) {
      // Update failed download stats
      const stats = this.store.get('downloadStats');
      stats.totalDownloads++;
      stats.failedDownloads++;
      this.store.set('downloadStats', stats);

      // Record failed download
      const downloadRecord = {
        id: downloadId,
        company: companyKey,
        questionsGenerated: 0,
        startTime: startTime,
        endTime: new Date(),
        duration: Date.now() - startTime.getTime(),
        success: false,
        error: error.message
      };

      const history = this.store.get('downloadHistory', []);
      history.push(downloadRecord);
      this.store.set('downloadHistory', history);

      if (progressCallback) {
        progressCallback({
          stage: 'error',
          progress: 0,
          message: `Failed to download questions: ${error.message}`
        });
      }

      throw error;
    }
  }

  // Generate a single company-specific question
  async generateCompanyQuestion(company, questionType, aiManager) {
    const prompt = company.questionPrompts[questionType];
    if (!prompt) {
      throw new Error(`No prompt defined for question type: ${questionType}`);
    }

    // Select random topic and level for this question
    const topic = company.topics[Math.floor(Math.random() * company.topics.length)];
    const level = company.levels[Math.floor(Math.random() * company.levels.length)];

    // Enhanced prompt with company-specific context
    const enhancedPrompt = `
${prompt}

Company Context: ${company.description}
Interview Style: ${company.interviewStyle.focus}
Topic Focus: ${topic}
Difficulty Level: ${level}
Question Type: ${questionType}

Please generate a multiple-choice question with:
1. A realistic ${company.name}-style interview question
2. Four answer options (A, B, C, D)
3. The correct answer
4. Detailed explanation for the correct answer
5. Brief explanations for why each incorrect option is wrong
6. Company-specific tips or insights

Format the response as JSON with the following structure:
{
  "question": "The interview question text",
  "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
  "correct": 1,
  "explanation": "Detailed explanation of the correct answer",
  "explanations": {
    "0": "Why option A is incorrect",
    "1": "Why option B is correct",
    "2": "Why option C is incorrect", 
    "3": "Why option D is incorrect"
  },
  "companyTips": ["Tip 1", "Tip 2"],
  "topic": "${topic}",
  "level": "${level}",
  "questionType": "${questionType}",
  "estimatedTime": 5
}`;

    try {
      const response = await aiManager.generateQuestion(topic, level, enhancedPrompt);
      
      // Validate and enhance the response
      if (response && response.question && response.options && response.correct !== undefined) {
        return {
          ...response,
          source: 'ai-company-specific',
          company: company.name,
          companyKey: company.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          questionType: questionType,
          aiProvider: aiManager.constructor.name.toLowerCase().replace('manager', ''),
          generatedAt: new Date(),
          estimatedTime: response.estimatedTime || company.interviewStyle.timePerQuestion
        };
      } else {
        throw new Error('Invalid question format received from AI');
      }

    } catch (error) {
      console.error(`Failed to generate ${questionType} question for ${company.name}:`, error);
      throw error;
    }
  }

  // Get company questions
  getCompanyQuestions(companyKey, questionType = null, limit = null) {
    const questions = this.store.get(`companyQuestionSets.${companyKey}`, []);
    
    let filteredQuestions = questions;
    
    if (questionType) {
      filteredQuestions = questions.filter(q => q.questionType === questionType);
    }
    
    if (limit) {
      filteredQuestions = filteredQuestions.slice(0, limit);
    }
    
    return filteredQuestions;
  }

  // Get random company question
  getRandomCompanyQuestion(companyKey, questionType = null) {
    const questions = this.getCompanyQuestions(companyKey, questionType);
    
    if (questions.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  }

  // Get company profiles
  getCompanyProfiles() {
    return this.companyProfiles;
  }

  // Get company profile
  getCompanyProfile(companyKey) {
    return this.companyProfiles[companyKey];
  }

  // Get download statistics
  getDownloadStats() {
    const stats = this.store.get('downloadStats');
    const companyCounts = {};
    
    Object.keys(this.companyProfiles).forEach(companyKey => {
      const questions = this.getCompanyQuestions(companyKey);
      companyCounts[companyKey] = {
        questionCount: questions.length,
        lastUpdated: this.store.get(`lastUpdated.${companyKey}`),
        company: this.companyProfiles[companyKey]
      };
    });
    
    return {
      ...stats,
      companyCounts: companyCounts,
      downloadHistory: this.store.get('downloadHistory', []).slice(-10) // Last 10 downloads
    };
  }

  // Delete company questions
  deleteCompanyQuestions(companyKey) {
    this.store.delete(`companyQuestionSets.${companyKey}`);
    this.store.delete(`lastUpdated.${companyKey}`);
    return true;
  }

  // Export company questions
  exportCompanyQuestions(companyKey) {
    const questions = this.getCompanyQuestions(companyKey);
    const company = this.getCompanyProfile(companyKey);
    
    return {
      company: company,
      questions: questions,
      exportedAt: new Date(),
      totalQuestions: questions.length
    };
  }

  // Import company questions
  importCompanyQuestions(companyKey, questionsData) {
    if (!questionsData || !Array.isArray(questionsData.questions)) {
      throw new Error('Invalid questions data format');
    }
    
    const existingQuestions = this.getCompanyQuestions(companyKey);
    const newQuestions = questionsData.questions.map(q => ({
      ...q,
      importedAt: new Date()
    }));
    
    const updatedQuestions = [...existingQuestions, ...newQuestions];
    this.store.set(`companyQuestionSets.${companyKey}`, updatedQuestions);
    this.store.set(`lastUpdated.${companyKey}`, new Date());
    
    return {
      success: true,
      questionsImported: newQuestions.length,
      totalQuestions: updatedQuestions.length
    };
  }

  // Clear all company questions
  clearAllCompanyQuestions() {
    Object.keys(this.companyProfiles).forEach(companyKey => {
      this.deleteCompanyQuestions(companyKey);
    });
    
    this.store.set('downloadHistory', []);
    this.store.set('downloadStats', {
      totalDownloads: 0,
      successfulDownloads: 0,
      failedDownloads: 0
    });
    
    return true;
  }

  // Get company question summary
  getCompanyQuestionSummary() {
    const summary = {};
    
    Object.entries(this.companyProfiles).forEach(([companyKey, company]) => {
      const questions = this.getCompanyQuestions(companyKey);
      const questionTypes = {};
      
      questions.forEach(q => {
        questionTypes[q.questionType] = (questionTypes[q.questionType] || 0) + 1;
      });
      
      summary[companyKey] = {
        name: company.name,
        description: company.description,
        totalQuestions: questions.length,
        questionTypes: questionTypes,
        lastUpdated: this.store.get(`lastUpdated.${companyKey}`),
        isAvailable: questions.length > 0
      };
    });
    
    return summary;
  }
}

module.exports = CompanyQuestionManager;
