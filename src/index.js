const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const QuizManager = require('./quizManager');
const OpenAIManager = require('./openAIManager');
const GeminiManager = require('./geminiManager');
const SettingsManager = require('./settingsManager');
const QuestionCacheManager = require('./questionCacheManager');

class RandomLearner {
  constructor() {
    this.questionCache = new QuestionCacheManager();
    this.quizManager = new QuizManager();
    this.openAIManager = new OpenAIManager(this.questionCache);
    this.geminiManager = new GeminiManager(this.questionCache);
    this.settingsManager = new SettingsManager();
    this.tray = null;
    this.questionWindow = null;
    this.settingsWindow = null;
    this.questionTimer = null;
    this.isQuestionActive = false;
    this.isPaused = false;
    this.pausedAt = null;
    this.nextQuestionTime = null;
    
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
      this.scheduleNextQuestion();
    });

    // Center the window on screen
    this.questionWindow.center();
    this.questionWindow.focus();
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
      
      // Decide whether to use AI or static questions
      const currentAI = this.getCurrentAIManager();
      const useAI = (questionSettings.useAI || questionSettings.useOpenAI) && 
                    currentAI.isReady() && 
                    Math.random() < 0.5; // 50% chance to use AI when available

      if (useAI) {
        const aiQuestion = await this.generateAIQuestion();
        // Set the AI question as current question in quiz manager for answer checking
        this.quizManager.currentQuestion = aiQuestion;
        return aiQuestion;
      } else {
        return this.getStaticQuestion();
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      // Fallback to static questions
      return this.getStaticQuestion();
    }
  }

  getStaticQuestion() {
    const questionSettings = this.settings.questionSettings;
    
    // Get a random topic and level from preferences
    const topics = questionSettings.preferredTopics;
    const levels = questionSettings.preferredLevels;
    
    if (topics.length === 0 || levels.length === 0) {
      // Use all questions if no preferences set
      return this.quizManager.getRandomQuestion();
    }

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    return this.quizManager.getRandomQuestion({
      source: 'level',
      topic: randomTopic,
      level: randomLevel
    });
  }

  async generateAIQuestion() {
    const questionSettings = this.settings.questionSettings;
    const topics = questionSettings.preferredTopics;
    const levels = questionSettings.preferredLevels;
    
    if (topics.length === 0 || levels.length === 0) {
      throw new Error('No preferred topics or levels configured');
    }

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomLevel = levels[Math.floor(Math.random() * levels.length)];
    
    try {
      const currentAI = this.getCurrentAIManager();
      return await currentAI.generateQuestion(randomTopic, randomLevel);
    } catch (error) {
      console.error('AI question generation failed, trying cache fallback:', error);
      
      // Try to get a cached question as fallback
      const cachedQuestion = this.questionCache.getRandomCachedQuestion({
        topic: randomTopic,
        level: randomLevel
      });
      
      if (cachedQuestion) {
        console.log('Using cached AI question as fallback');
        return cachedQuestion;
      }
      
      // If no cached question available, rethrow the error to fallback to static questions
      throw error;
    }
  }

  async handleAnswerSubmission(questionId, userAnswer) {
    try {
      // First check with quiz manager (for both static and AI questions)
      const basicResult = this.quizManager.checkAnswer(questionId, userAnswer);
      
      if (basicResult.error) {
        return basicResult;
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
}

// Create and initialize the app
const learner = new RandomLearner();
learner.initialize();
