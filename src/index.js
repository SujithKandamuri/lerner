const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const QuizManager = require('./quizManager');
const OpenAIManager = require('./openAIManager');
const GeminiManager = require('./geminiManager');
const SettingsManager = require('./settingsManager');
const QuestionCacheManager = require('./questionCacheManager');
const AnalyticsManager = require('./analyticsManager');
const InterviewManager = require('./interviewManager');
const WeaknessDetector = require('./weaknessDetector');
const SkillAssessment = require('./skillAssessment');
const CompanyQuestionManager = require('./companyQuestionManager');

class RandomLearner {
  constructor() {
    this.questionCache = new QuestionCacheManager();
    this.quizManager = new QuizManager();
    this.openAIManager = new OpenAIManager(this.questionCache);
    this.geminiManager = new GeminiManager(this.questionCache);
    this.settingsManager = new SettingsManager();
    this.analyticsManager = new AnalyticsManager();
    this.interviewManager = new InterviewManager();
    this.weaknessDetector = new WeaknessDetector();
    this.skillAssessment = new SkillAssessment();
    this.companyQuestionManager = new CompanyQuestionManager();
    this.tray = null;
    this.questionWindow = null;
    this.settingsWindow = null;
    this.analyticsWindow = null;
    this.interviewWindow = null;
    this.skillAssessmentWindow = null;
    this.companyQuestionsWindow = null;
    this.questionTimer = null;
    this.isQuestionActive = false;
    this.isPaused = false;
    this.pausedAt = null;
    this.nextQuestionTime = null;
    this.questionStartTime = null; // Track response time
    
    // Will be loaded from settings
    this.settings = null;
  }

  initialize() {
    app.whenReady().then(() => {
      this.loadSettings();
      this.setupTray();
      this.setDockIcon(); // Set dock icon on macOS
      this.setupIPC();
      console.log('Random Learner started! Questions will popup randomly...');
      this.scheduleNextQuestion();
      
      app.on('activate', () => {
        // On macOS, keep the app running even when all windows are closed
      });
    });

    app.on('window-all-closed', () => {
      // Don't quit the app when all windows are closed - keep running in system tray
    });

    app.on('before-quit', () => {
      // Clean up tray when quitting
      if (this.tray) {
        this.tray.destroy();
      }
    });
  }

  loadSettings() {
    this.settings = this.settingsManager.getAllSettings();
    
    // Configure AI providers based on settings
    if (this.settings.openaiApiKey) {
      this.openAIManager.configure(this.settings.openaiApiKey);
      if (this.settings.customPrompt) {
        this.openAIManager.setCustomPrompt(this.settings.customPrompt);
      }
    }
    
    if (this.settings.geminiApiKey) {
      this.geminiManager.configure(this.settings.geminiApiKey);
      if (this.settings.customPrompt) {
        this.geminiManager.setCustomPrompt(this.settings.customPrompt);
      }
    }
    
    // Auto-enable AI if keys are present but AI usage is not configured
    const currentAI = this.getCurrentAIManager();
    if (currentAI.isReady() && !this.settings.questionSettings.useAI && !this.settings.questionSettings.useOpenAI) {
      console.log('Auto-enabling AI since API key is configured');
      this.settingsManager.setUseAI(true);
      this.settings = this.settingsManager.getAllSettings(); // Reload settings
    }
  }
  
  // Get the current AI manager based on settings
  getCurrentAIManager() {
    const provider = this.settings.aiProvider || 'openai';
    if (provider === 'gemini') {
      return this.geminiManager;
    } else {
      return this.openAIManager;
    }
  }

  getAppIcon() {
    try {
      const iconPath = path.join(__dirname, 'icons', 'app-icon.png');
      const icon = nativeImage.createFromPath(iconPath);
      if (icon.isEmpty()) {
        console.warn('App icon is empty, file might not exist or be corrupted');
        return undefined;
      }
      return icon;
    } catch (error) {
      console.warn('Failed to load app icon image:', error);
      return undefined;
    }
  }

  getTrayIcon() {
    try {
      let icon;
      
      // Use red version of app logo (try larger sizes first)
      const finalRedPath20 = path.join(__dirname, 'icons', 'tray-final-20.png');
      icon = nativeImage.createFromPath(finalRedPath20);
      
      if (!icon.isEmpty()) {
        console.log('Using final red app logo icon 20x20 for tray');
        return icon;
      }
      
      // Fallback to 18x18
      const finalRedPath18 = path.join(__dirname, 'icons', 'tray-final-18.png');
      icon = nativeImage.createFromPath(finalRedPath18);
      
      if (!icon.isEmpty()) {
        console.log('Using final red app logo icon 18x18 for tray');
        return icon;
      }
      
      // Fallback to 16x16
      const finalRedPath16 = path.join(__dirname, 'icons', 'tray-final-16.png');
      icon = nativeImage.createFromPath(finalRedPath16);
      
      if (!icon.isEmpty()) {
        console.log('Using final red app logo icon 16x16 for tray');
        return icon;
      }
      
      // Final fallback to bright red circle
      const redCirclePath = path.join(__dirname, 'icons', 'tray-red-circle-16.png');
      icon = nativeImage.createFromPath(redCirclePath);
      
      if (!icon.isEmpty()) {
        console.log('Using red circle fallback icon for tray');
        return icon;
      }
      
      if (icon.isEmpty()) {
        console.warn('Tray icon is empty, falling back to programmatic icon');
        return this.createFallbackTrayIcon();
      }
      
      return icon;
    } catch (error) {
      console.warn('Failed to load tray icon image, falling back to programmatic icon:', error);
      return this.createFallbackTrayIcon();
    }
  }

  createFallbackTrayIcon() {
    // Fallback to programmatic icon (16x16 to match system icons)
    const size = 16;
    const buffer = Buffer.alloc(size * size * 4); // RGBA format
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 102;     // Red
      buffer[i + 1] = 126; // Green
      buffer[i + 2] = 234; // Blue
      buffer[i + 3] = 255; // Alpha (fully opaque)
    }
    return nativeImage.createFromBuffer(buffer, { width: size, height: size });
  }

  setDockIcon() {
    // Set dock icon on macOS
    if (process.platform === 'darwin' && app.dock) {
      const appIcon = this.getAppIcon();
      if (appIcon && !appIcon.isEmpty()) {
        try {
          app.dock.setIcon(appIcon);
        } catch (error) {
          console.warn('Failed to set dock icon:', error);
        }
      } else {
        console.warn('Could not set dock icon - app icon not available');
      }
    }
  }

  setupTray() {
    // Destroy existing tray if it exists (to clear cache)
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
    
    // Use helper method to get tray icon
    const trayIcon = this.getTrayIcon();
    this.tray = new Tray(trayIcon);
    
    console.log('System tray icon created successfully');
    
    // Set initial menu using updateTrayMenu
    this.updateTrayMenu();
    
    this.tray.setToolTip('Random Learner - Learning made easy!');
    
    // No special click handler - context menu shows on right-click automatically
    
    // Update tray menu periodically (more frequently for better sync)
    setInterval(() => {
      this.updateTrayMenu();
    }, 5000); // Update every 5 seconds
  }

  updateTrayMenu() {
    if (!this.tray) return;
    
    // Ensure settings are loaded
    if (!this.settings) {
      this.loadSettings();
    }
    

    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '🧠 Random Learner',
        enabled: false
      },
      { type: 'separator' },
      {
        label: '⚙️ Settings',
        click: () => this.showSettingsWindow()
      },
      {
        label: '📊 Learning Analytics',
        click: () => this.showAnalyticsWindow()
      },
      {
        label: '🎯 Mock Interview',
        click: () => this.showInterviewWindow()
      },
      {
        label: '🏆 Skill Assessment',
        click: () => this.showSkillAssessmentWindow()
      },
      {
        label: '🏢 Company Questions',
        click: () => this.showCompanyQuestionsWindow()
      },
      {
        label: '❓ Show Question Now',
        click: () => this.showQuestionWindow()
      },
      { type: 'separator' },
      {
        label: this.isPaused ? '▶️ Resume Questions' : '⏸️ Pause Questions',
        click: () => this.isPaused ? this.resumeQuestions() : this.pauseQuestions()
      },
      { type: 'separator' },
      {
        label: `📊 Status: ${this.isPaused ? 'Paused' : this.isQuestionActive ? 'Question Active' : 'Waiting'}`,
        enabled: false
      },
      {
        label: `🔗 AI Provider: ${this.settings?.aiProvider?.toUpperCase() || 'OpenAI'} - ${this.getCurrentAIManager().isReady() ? 'Connected' : 'Not Connected'}`,
        enabled: false
      },
      {
        label: `💾 Cached Questions: ${this.questionCache?.getStats()?.total || 0}`,
        enabled: false
      },
      { type: 'separator' },
      {
        label: '🚪 Quit',
        click: () => app.quit()
      }
    ]);
    
    this.tray.setContextMenu(contextMenu);
  }

  setupIPC() {
    // Clear any existing handlers to prevent duplicates
    ipcMain.removeAllListeners();
    
    // Question-related IPC handlers
    ipcMain.handle('get-question', async () => {
      return await this.getNextQuestion();
    });

    ipcMain.handle('submit-answer', async (event, questionId, userAnswer) => {
      return await this.handleAnswerSubmission(questionId, userAnswer);
    });

    ipcMain.handle('close-question', () => {
      this.closeQuestionWindow();
    });

    ipcMain.handle('next-question', async () => {
      return await this.getNextQuestion();
    });

    // Pause/Resume IPC handlers
    ipcMain.handle('pause-questions', () => {
      this.pauseQuestions();
      return { success: true, paused: this.isPaused };
    });

    ipcMain.handle('resume-questions', () => {
      this.resumeQuestions();
      return { success: true, paused: this.isPaused };
    });

    ipcMain.handle('get-pause-status', () => {
      return { paused: this.isPaused };
    });

    // Settings-related IPC handlers
    ipcMain.handle('get-settings', () => {
      return this.settingsManager.getAllSettings();
    });

    ipcMain.handle('save-settings', (event, settings) => {
      this.saveSettings(settings);
    });

    ipcMain.handle('test-ai-connection', async (event, { provider, apiKey }) => {
      return await this.testAIConnection(provider, apiKey);
    });

    ipcMain.handle('generate-test-question', async () => {
      return await this.generateTestQuestion();
    });

    ipcMain.handle('get-default-prompt', () => {
      return this.getCurrentAIManager().getDefaultPrompt();
    });

    ipcMain.handle('export-settings', () => {
      return this.settingsManager.exportSettings();
    });

    ipcMain.handle('import-settings', (event, settingsJSON) => {
      const result = this.settingsManager.importSettings(settingsJSON);
      if (result.success) {
        this.loadSettings();
      }
      return result;
    });

    ipcMain.handle('reset-settings', () => {
      const result = this.settingsManager.resetToDefaults();
      if (result.success) {
        this.loadSettings();
      }
      return result;
    });

    // Cache management IPC handlers
    ipcMain.handle('get-cache-stats', () => {
      return this.questionCache.getStats();
    });

    ipcMain.handle('clear-question-cache', () => {
      this.questionCache.clearCache();
      return { success: true };
    });

    ipcMain.handle('export-cache', () => {
      return this.questionCache.exportCache();
    });

    ipcMain.handle('reload-cache', () => {
      this.questionCache = new QuestionCacheManager(); // Reload from file
      // Re-configure AI managers with the new cache instance
      this.openAIManager.questionCache = this.questionCache;
      this.geminiManager.questionCache = this.questionCache;
      return { success: true };
    });

    // Analytics IPC handlers
    ipcMain.handle('get-analytics', () => {
      return this.analyticsManager.getAnalytics();
    });

    ipcMain.handle('get-ai-insights', async () => {
      return await this.generateAIInsights();
    });

    ipcMain.handle('clear-analytics', () => {
      this.analyticsManager.clearAnalytics();
      return { success: true };
    });

    ipcMain.handle('export-analytics', () => {
      return this.analyticsManager.exportAnalytics();
    });

    // Interview-related IPC handlers
    ipcMain.handle('get-interview-types', () => {
      return this.interviewManager.getInterviewTypes();
    });



    ipcMain.handle('start-interview', async (event, config) => {
      return await this.interviewManager.startInterview(config.type, config.company);
    });

    ipcMain.handle('get-current-interview-question', async () => {
      const currentQuestion = this.interviewManager.getCurrentQuestion();
      if (!currentQuestion) return null;

      // Try to get company-specific question first if interview has company context
      try {
        const interviewSession = this.interviewManager.currentSession;
        if (interviewSession && interviewSession.company) {
          const companyQuestion = this.companyQuestionManager.getRandomCompanyQuestion(
            interviewSession.company, 
            currentQuestion.questionType || null
          );
          
          if (companyQuestion) {
            console.log(`Using company-specific question for ${interviewSession.company}`);
            return {
              ...companyQuestion,
              ...currentQuestion,
              timeAllotted: currentQuestion.timeAllotted,
              source: 'company-specific'
            };
          }
        }

        // Fallback to regular question generation
        const question = await this.getNextQuestion();
        return {
          ...question,
          ...currentQuestion,
          timeAllotted: currentQuestion.timeAllotted
        };
      } catch (error) {
        console.error('Failed to generate interview question:', error);
        // Return placeholder question
        return {
          ...currentQuestion,
          question: 'What is the time complexity of searching in a balanced binary search tree?',
          options: [
            'O(1) - Constant time',
            'O(log n) - Logarithmic time',
            'O(n) - Linear time',
            'O(n²) - Quadratic time'
          ],
          correct: 1,
          explanation: 'Binary search trees allow for logarithmic search time when balanced.'
        };
      }
    });

    ipcMain.handle('submit-interview-answer', async (event, answerData) => {
      return this.interviewManager.submitAnswer(answerData.answer, answerData.responseTime);
    });

    ipcMain.handle('complete-interview', async () => {
      return this.interviewManager.completeInterview();
    });

    ipcMain.handle('pause-interview', () => {
      this.interviewManager.pauseInterview();
      return { success: true };
    });

    ipcMain.handle('resume-interview', () => {
      this.interviewManager.resumeInterview();
      return { success: true };
    });

    ipcMain.handle('get-interview-progress', () => {
      return this.interviewManager.getSessionProgress();
    });

    ipcMain.handle('get-interview-stats', () => {
      return this.interviewManager.getInterviewStats();
    });

    ipcMain.handle('get-interview-history', (event, limit) => {
      return this.interviewManager.getInterviewHistory(limit);
    });

    ipcMain.handle('close-interview-window', () => {
      if (this.interviewWindow && !this.interviewWindow.isDestroyed()) {
        this.interviewWindow.close();
      }
      return { success: true };
    });

    ipcMain.handle('show-analytics', () => {
      this.showAnalyticsWindow();
      return { success: true };
    });

    // Weakness Detection IPC handlers
    ipcMain.handle('analyze-weaknesses', async () => {
      const analyticsData = this.analyticsManager.getAnalytics();
      return this.weaknessDetector.analyzeWeaknesses(analyticsData);
    });

    ipcMain.handle('get-weakness-summary', () => {
      return this.weaknessDetector.getWeaknessSummary();
    });

    ipcMain.handle('get-targeted-topics', (event, limit) => {
      return this.weaknessDetector.getTargetedQuestionTopics(limit);
    });

    ipcMain.handle('clear-weakness-data', () => {
      this.weaknessDetector.clearWeaknessData();
      return { success: true };
    });

    // Skill Assessment IPC handlers
    ipcMain.handle('conduct-skill-assessment', async () => {
      const analyticsData = this.analyticsManager.getAnalytics();
      const weaknessAnalysis = this.weaknessDetector.analyzeWeaknesses(analyticsData);
      const interviewHistory = this.interviewManager.getInterviewHistory();
      
      return await this.skillAssessment.assessSkills(analyticsData, weaknessAnalysis, interviewHistory);
    });

    ipcMain.handle('get-latest-assessment', () => {
      return this.skillAssessment.getLatestAssessment();
    });

    ipcMain.handle('get-assessment-history', () => {
      return this.skillAssessment.getAssessmentHistory();
    });

    ipcMain.handle('clear-assessment-data', () => {
      this.skillAssessment.clearAssessmentData();
      return { success: true };
    });

    ipcMain.handle('get-skill-categories', () => {
      return this.skillAssessment.skillCategories;
    });

    ipcMain.handle('get-industry-benchmarks', () => {
      return this.skillAssessment.industryBenchmarks;
    });

    ipcMain.handle('get-certification-levels', () => {
      return this.skillAssessment.certificationLevels;
    });

    ipcMain.handle('show-skill-assessment-window', () => {
      this.showSkillAssessmentWindow();
      return { success: true };
    });

    // Company Question Management IPC handlers
    ipcMain.handle('get-company-question-summary', () => {
      return this.companyQuestionManager.getCompanyQuestionSummary();
    });

    ipcMain.handle('get-company-download-stats', () => {
      return this.companyQuestionManager.getDownloadStats();
    });

    ipcMain.handle('download-company-questions', async (event, companyKey) => {
      const currentAI = this.getCurrentAIManager();
      
      if (!currentAI.isReady()) {
        throw new Error('AI not configured. Please set up your API key in settings.');
      }

      // Progress callback to update UI
      const progressCallback = (progress) => {
        if (this.companyQuestionsWindow && !this.companyQuestionsWindow.isDestroyed()) {
          this.companyQuestionsWindow.webContents.send('download-progress', companyKey, progress);
        }
      };

      return await this.companyQuestionManager.downloadCompanyQuestions(companyKey, currentAI, progressCallback);
    });

    ipcMain.handle('get-company-questions', (event, companyKey, questionType, limit) => {
      return this.companyQuestionManager.getCompanyQuestions(companyKey, questionType, limit);
    });

    ipcMain.handle('get-random-company-question', (event, companyKey, questionType) => {
      return this.companyQuestionManager.getRandomCompanyQuestion(companyKey, questionType);
    });

    ipcMain.handle('export-company-questions', (event, companyKey) => {
      return this.companyQuestionManager.exportCompanyQuestions(companyKey);
    });

    ipcMain.handle('delete-company-questions', (event, companyKey) => {
      return this.companyQuestionManager.deleteCompanyQuestions(companyKey);
    });

    ipcMain.handle('clear-all-company-questions', () => {
      return this.companyQuestionManager.clearAllCompanyQuestions();
    });

    ipcMain.handle('import-company-questions', (event, companyKey, questionsData) => {
      return this.companyQuestionManager.importCompanyQuestions(companyKey, questionsData);
    });

    ipcMain.handle('get-company-profiles', () => {
      return this.companyQuestionManager.getCompanyProfiles();
    });

    ipcMain.handle('get-company-profile', (event, companyKey) => {
      return this.companyQuestionManager.getCompanyProfile(companyKey);
    });
  }

  scheduleNextQuestion() {
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
    }

    if (!this.settings) {
      this.loadSettings();
    }

    // Don't schedule if paused
    if (this.isPaused) {
      console.log('Question scheduling is paused');
      return;
    }

    const minInterval = this.settings.timingSettings.minInterval;
    const maxInterval = this.settings.timingSettings.maxInterval;
    const randomDelay = Math.random() * (maxInterval - minInterval) + minInterval;
    
    this.nextQuestionTime = Date.now() + randomDelay;
    console.log(`Next question in ${Math.round(randomDelay / 1000)} seconds`);

    this.questionTimer = setTimeout(() => {
      if (!this.isQuestionActive && !this.isPaused) {
        this.showQuestionWindow();
      }
    }, randomDelay);
  }

  pauseQuestions() {
    this.isPaused = true;
    this.pausedAt = Date.now();
    
    if (this.questionTimer) {
      clearTimeout(this.questionTimer);
      this.questionTimer = null;
    }
    
    console.log('Question scheduling paused');
    this.updateTrayMenu();
    this.notifyPauseStateChange();
  }

  resumeQuestions() {
    if (!this.isPaused) {
      return; // Already running
    }
    
    this.isPaused = false;
    console.log('Question scheduling resumed');
    
    // Calculate remaining time from when we paused
    let remainingTime = 0;
    if (this.nextQuestionTime && this.pausedAt) {
      remainingTime = Math.max(0, this.nextQuestionTime - this.pausedAt);
    }
    
    // If there was remaining time, use it, otherwise schedule normally
    if (remainingTime > 0) {
      console.log(`Resuming with ${Math.round(remainingTime / 1000)} seconds remaining`);
      this.questionTimer = setTimeout(() => {
        if (!this.isQuestionActive && !this.isPaused) {
          this.showQuestionWindow();
        }
      }, remainingTime);
    } else {
      this.scheduleNextQuestion();
    }
    
    this.updateTrayMenu();
    this.notifyPauseStateChange();
  }

  notifyPauseStateChange() {
    // Notify settings window if it's open
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.webContents.send('pause-state-changed', {
        paused: this.isPaused
      });
    }
  }

  showQuestionWindow() {
    if (this.questionWindow && !this.questionWindow.isDestroyed()) {
      this.questionWindow.focus();
      return;
    }

    if (!this.settings) {
      this.loadSettings();
    }

    this.isQuestionActive = true;
    this.questionStartTime = Date.now(); // Track when question is shown
    
    this.questionWindow = new BrowserWindow({
      width: 600,
      height: 500,
      minWidth: 400,
      minHeight: 350,
      resizable: true,
      alwaysOnTop: this.settings.uiSettings.alwaysOnTop,
      frame: true,
      title: 'Random Learning Question',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.questionWindow.loadFile(path.join(__dirname, 'question.html'));
    
    this.questionWindow.on('closed', () => {
      this.isQuestionActive = false;
      this.questionStartTime = null;
      this.scheduleNextQuestion();
    });

    // Center the window on screen
    this.questionWindow.center();
    this.questionWindow.focus();
  }

  showAnalyticsWindow() {
    if (this.analyticsWindow && !this.analyticsWindow.isDestroyed()) {
      this.analyticsWindow.focus();
      return;
    }

    this.analyticsWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      resizable: true,
      title: 'Learning Analytics Dashboard',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.analyticsWindow.loadFile(path.join(__dirname, 'analytics.html'));
    
    this.analyticsWindow.on('closed', () => {
      this.analyticsWindow = null;
    });

    this.analyticsWindow.center();
    this.analyticsWindow.focus();
  }

  showInterviewWindow() {
    if (this.interviewWindow && !this.interviewWindow.isDestroyed()) {
      this.interviewWindow.focus();
      return;
    }

    this.interviewWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      resizable: true,
      title: 'Mock Interview - Random Learner',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.interviewWindow.loadFile(path.join(__dirname, 'interview.html'));
    
    this.interviewWindow.on('closed', () => {
      this.interviewWindow = null;
      // Reset interview session when window is closed
      this.interviewManager.resetSession();
    });

    this.interviewWindow.center();
    this.interviewWindow.focus();
  }

  showSkillAssessmentWindow() {
    if (this.skillAssessmentWindow && !this.skillAssessmentWindow.isDestroyed()) {
      this.skillAssessmentWindow.focus();
      return;
    }

    this.skillAssessmentWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      resizable: true,
      title: 'Skill Assessment - Random Learner',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.skillAssessmentWindow.loadFile(path.join(__dirname, 'skill-assessment.html'));
    
    this.skillAssessmentWindow.on('closed', () => {
      this.skillAssessmentWindow = null;
    });

    this.skillAssessmentWindow.center();
    this.skillAssessmentWindow.focus();
  }

  showCompanyQuestionsWindow() {
    if (this.companyQuestionsWindow && !this.companyQuestionsWindow.isDestroyed()) {
      this.companyQuestionsWindow.focus();
      return;
    }

    this.companyQuestionsWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 900,
      minHeight: 600,
      resizable: true,
      title: 'Company Question Sets - Random Learner',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.companyQuestionsWindow.loadFile(path.join(__dirname, 'company-questions.html'));
    
    this.companyQuestionsWindow.on('closed', () => {
      this.companyQuestionsWindow = null;
    });

    this.companyQuestionsWindow.center();
    this.companyQuestionsWindow.focus();
  }

  showSettingsWindow() {
    if (this.settingsWindow && !this.settingsWindow.isDestroyed()) {
      this.settingsWindow.focus();
      return;
    }

    this.settingsWindow = new BrowserWindow({
      width: 900,
      height: 700,
      resizable: true,
      title: 'Random Learner Settings',
      icon: this.getAppIcon(),
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    this.settingsWindow.loadFile(path.join(__dirname, 'settings.html'));
    
    this.settingsWindow.on('closed', () => {
      this.settingsWindow = null;
      // Reload settings when settings window is closed
      this.loadSettings();
    });

    this.settingsWindow.center();
    this.settingsWindow.focus();
  }

  closeQuestionWindow() {
    if (this.questionWindow && !this.questionWindow.isDestroyed()) {
      this.questionWindow.close();
    }
  }

  async getNextQuestion() {
    try {
      if (!this.settings) {
        this.loadSettings();
      }

      const questionSettings = this.settings.questionSettings;
      
      // Check if AI questioning is enabled and AI is ready
      const currentAI = this.getCurrentAIManager();
      const aiEnabled = (questionSettings.useAI || questionSettings.useOpenAI) && currentAI.isReady();

      // Get targeted topics based on weakness analysis
      const targetedTopics = this.weaknessDetector.getTargetedQuestionTopics(3);
      let selectedTopic = null;
      let selectedLevel = null;

      // 70% chance to use weakness-targeted questions if available
      if (targetedTopics.length > 0 && Math.random() < 0.7) {
        const targetTopic = targetedTopics[0]; // Use highest priority weakness
        selectedTopic = targetTopic.topic;
        selectedLevel = targetTopic.difficulty;
        console.log(`Targeting weakness: ${selectedTopic} (${selectedLevel})`);
      }

      // 20% chance to use company-specific questions if available (when not in interview mode)
      if (!selectedTopic && Math.random() < 0.2) {
        const availableCompanies = Object.keys(this.companyQuestionManager.getCompanyQuestionSummary())
          .filter(company => this.companyQuestionManager.getCompanyQuestions(company).length > 0);
        
        if (availableCompanies.length > 0) {
          const randomCompany = availableCompanies[Math.floor(Math.random() * availableCompanies.length)];
          const companyQuestion = this.companyQuestionManager.getRandomCompanyQuestion(randomCompany);
          
          if (companyQuestion) {
            console.log(`Using company-specific question from ${randomCompany}`);
            // Set the company question as current question in quiz manager
            this.quizManager.currentQuestion = companyQuestion;
            return companyQuestion;
          }
        }
      }

      if (aiEnabled) {
        // When AI is enabled, ALWAYS try to use AI questions (fresh or cached)
        console.log('AI questioning enabled - prioritizing AI questions');
        const aiQuestion = await this.generateAIQuestion(selectedTopic, selectedLevel);
        // Set the AI question as current question in quiz manager for answer checking
        this.quizManager.currentQuestion = aiQuestion;
        return aiQuestion;
      } else {
        // Only use static questions when AI is not enabled or not ready
        console.log('AI questioning disabled - using static questions');
        return this.getStaticQuestion(selectedTopic, selectedLevel);
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      
      // If AI is enabled but failed completely (no cache either), inform user
      const questionSettings = this.settings.questionSettings;
      const currentAI = this.getCurrentAIManager();
      const aiEnabled = (questionSettings.useAI || questionSettings.useOpenAI) && currentAI.isReady();
      
      if (aiEnabled) {
        console.warn('AI questioning enabled but both fresh AI and cached AI questions failed - falling back to static questions');
        // Final fallback to static questions when AI is enabled but completely unavailable
        const staticQuestion = this.getStaticQuestion();
        // Mark it as a fallback static question
        staticQuestion.source = 'static-fallback';
        staticQuestion.aiEnabled = true; // Indicate AI was enabled but unavailable
        return staticQuestion;
      } else {
        // Fallback to static questions when AI is not enabled
        return this.getStaticQuestion();
      }
    }
  }

  getStaticQuestion(targetTopic = null, targetLevel = null) {
    const questionSettings = this.settings.questionSettings;
    
    // Get a random topic and level from preferences
    const topics = questionSettings.preferredTopics;
    const levels = questionSettings.preferredLevels;
    
    if (topics.length === 0 || levels.length === 0) {
      // Use all questions if no preferences set
      return this.quizManager.getRandomQuestion();
    }

    // Use targeted topic/level if provided and valid, otherwise random
    const selectedTopic = targetTopic && topics.includes(targetTopic)
      ? targetTopic
      : topics[Math.floor(Math.random() * topics.length)];
    
    const selectedLevel = targetLevel && levels.includes(targetLevel)
      ? targetLevel
      : levels[Math.floor(Math.random() * levels.length)];
    
    return this.quizManager.getRandomQuestion({
      source: 'level',
      topic: selectedTopic,
      level: selectedLevel
    });
  }

  async generateAIQuestion(targetTopic = null, targetLevel = null) {
    const questionSettings = this.settings.questionSettings;
    const topics = questionSettings.preferredTopics;
    const levels = questionSettings.preferredLevels;
    
    if (topics.length === 0 || levels.length === 0) {
      throw new Error('No preferred topics or levels configured');
    }

    // Use targeted topic/level if provided, otherwise random
    const selectedTopic = targetTopic && topics.includes(targetTopic) 
      ? targetTopic 
      : topics[Math.floor(Math.random() * topics.length)];
    
    const selectedLevel = targetLevel && levels.includes(targetLevel)
      ? targetLevel
      : levels[Math.floor(Math.random() * levels.length)];
    
    // First, try to get a fresh AI question
    try {
      const currentAI = this.getCurrentAIManager();
      console.log(`Generating fresh AI question for topic: ${selectedTopic}, level: ${selectedLevel}`);
      return await currentAI.generateQuestion(selectedTopic, selectedLevel);
    } catch (error) {
      console.error('Fresh AI question generation failed, trying cache fallback:', error);
      
      // Try to get a cached question with the same topic/level
      let cachedQuestion = this.questionCache.getRandomCachedQuestion({
        topic: selectedTopic,
        level: selectedLevel
      });
      
      if (cachedQuestion) {
        console.log(`Using cached AI question: topic=${selectedTopic}, level=${selectedLevel}`);
        return cachedQuestion;
      }
      
      // If no exact match, try any cached question from the same topic
      cachedQuestion = this.questionCache.getRandomCachedQuestion({
        topic: selectedTopic
      });
      
      if (cachedQuestion) {
        console.log(`Using cached AI question from same topic: ${selectedTopic}`);
        return cachedQuestion;
      }
      
      // If still no match, try any cached question from the same level
      cachedQuestion = this.questionCache.getRandomCachedQuestion({
        level: selectedLevel
      });
      
      if (cachedQuestion) {
        console.log(`Using cached AI question from same level: ${selectedLevel}`);
        return cachedQuestion;
      }
      
      // Last resort: try any cached AI question
      cachedQuestion = this.questionCache.getRandomCachedQuestion();
      
      if (cachedQuestion) {
        console.log('Using any available cached AI question as last resort');
        return cachedQuestion;
      }
      
      // If absolutely no cached questions available, throw error
      console.error('No cached AI questions available and fresh generation failed');
      throw new Error('No AI questions available (neither fresh nor cached)');
    }
  }

  async handleAnswerSubmission(questionId, userAnswer) {
    try {
      // Calculate response time
      const responseTime = this.questionStartTime ? Date.now() - this.questionStartTime : 0;
      
      // First check with quiz manager (for both static and AI questions)
      const basicResult = this.quizManager.checkAnswer(questionId, userAnswer);
      
      if (basicResult.error) {
        return basicResult;
      }

      // Record analytics
      const currentQuestion = this.quizManager.currentQuestion;
      if (currentQuestion) {
        this.analyticsManager.recordQuestionAttempt(
          currentQuestion,
          userAnswer,
          basicResult.correct,
          responseTime
        );
      }

      // If AI is available and configured, get enhanced feedback
      const currentAI = this.getCurrentAIManager();
      if (currentAI.isReady() && (this.settings.questionSettings.useAI || this.settings.questionSettings.useOpenAI)) {
        try {
          const enhancedResult = await currentAI.validateAnswer(
            this.quizManager.currentQuestion,
            userAnswer,
            this.quizManager.currentQuestion.correct
          );
          
          if (enhancedResult.enhanced) {
            return {
              ...basicResult,
              explanation: enhancedResult.explanation,
              enhanced: true
            };
          }
        } catch (error) {
          console.error('Failed to get enhanced feedback:', error);
          // Fall back to basic result
        }
      }

      return basicResult;
    } catch (error) {
      console.error('Error handling answer submission:', error);
      return { error: 'Failed to process answer' };
    }
  }

  saveSettings(settings) {
    try {
      // Save individual settings
      this.settingsManager.setAIProvider(settings.aiProvider);
      this.settingsManager.setOpenAIApiKey(settings.openaiApiKey);
      this.settingsManager.setGeminiApiKey(settings.geminiApiKey);
      this.settingsManager.setCustomPrompt(settings.customPrompt);
      this.settingsManager.setQuestionSettings(settings.questionSettings);
      this.settingsManager.setTimingSettings(settings.timingSettings);
      this.settingsManager.setUISettings(settings.uiSettings);
      
      // Reload settings to configure AI providers
      this.loadSettings();
      
      // Reschedule next question with new timing
      this.scheduleNextQuestion();
      
      return { success: true };
    } catch (error) {
      console.error('Failed to save settings:', error);
      return { success: false, error: error.message };
    }
  }

  async testAIConnection(provider, apiKey) {
    try {
      let tempManager;
      if (provider === 'gemini') {
        tempManager = new GeminiManager(this.questionCache);
      } else {
        tempManager = new OpenAIManager(this.questionCache);
      }
      
      const result = tempManager.configure(apiKey);
      
      if (!result.success) {
        return result;
      }

      // Try to generate a simple test question
      const question = await tempManager.generateQuestion('programming', 'beginner');
      return { success: true, question };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateTestQuestion() {
    try {
      const currentAI = this.getCurrentAIManager();
      if (!currentAI.isReady()) {
        const provider = this.settings.aiProvider || 'openai';
        return { success: false, error: `${provider.toUpperCase()} not configured` };
      }

      const question = await currentAI.generateQuestion('programming', 'intermediate');
      return { success: true, question };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async generateAIInsights() {
    try {
      const currentAI = this.getCurrentAIManager();
      if (!currentAI.isReady()) {
        return { 
          success: false, 
          error: 'AI not configured. Please set up your AI provider to get personalized insights.' 
        };
      }

      const insightsData = this.analyticsManager.getInsightsData();
      
      if (insightsData.totalQuestions === 0) {
        return {
          success: true,
          insights: "Welcome to Random Learner! 🎉\n\nStart answering questions to get personalized AI insights about your learning progress. I'll analyze your performance, identify your strengths and areas for improvement, and provide tailored recommendations to enhance your learning journey.\n\nClick 'Show Question Now' to begin!"
        };
      }

      const prompt = `Analyze this learning data and provide comprehensive, encouraging insights and recommendations:

Learning Statistics:
- Total Questions: ${insightsData.totalQuestions}
- Overall Accuracy: ${insightsData.overallAccuracy}%
- Current Streak: ${insightsData.currentStreak}
- Longest Streak: ${insightsData.longestStreak}
- Average Response Time: ${insightsData.averageResponseTime}ms
- Achievements Earned: ${insightsData.achievements}

Weekly Performance:
- Questions This Week: ${insightsData.weeklyPerformance.totalQuestions}
- Weekly Accuracy: ${insightsData.weeklyPerformance.accuracy}%

Recent Trend: ${insightsData.recentTrend.trend} (${insightsData.recentTrend.accuracy}% accuracy)

Strong Topics: ${insightsData.strongTopics.join(', ') || 'None yet'}
Weak Topics: ${insightsData.weakTopics.join(', ') || 'None'}

Level Performance:
${Object.entries(insightsData.levelStats).map(([level, stats]) => 
  `- ${level}: ${stats.accuracy}% (${stats.correct}/${stats.total})`
).join('\n')}

Please provide:
1. Celebration of achievements and progress
2. Analysis of strengths and areas for improvement
3. Specific recommendations for topics to focus on
4. Motivational insights about learning patterns
5. Actionable next steps for continued growth

Keep it encouraging, specific, and actionable. Use emojis and make it engaging!`;

      let insights;
      if (this.settings.aiProvider === 'gemini') {
        const result = await this.geminiManager.model.generateContent(prompt);
        const response = await result.response;
        insights = response.text().trim();
      } else {
        const response = await this.openAIManager.openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an encouraging learning coach who provides personalized insights and recommendations based on learning analytics. Be specific, actionable, and motivating.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7
        });
        insights = response.choices[0].message.content.trim();
      }

      return { success: true, insights };
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return { 
        success: false, 
        error: 'Failed to generate insights. Please try again later.' 
      };
    }
  }
}

// Create and initialize the app
const learner = new RandomLearner();
learner.initialize();
