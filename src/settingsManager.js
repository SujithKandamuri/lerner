const Store = require('electron-store');

class SettingsManager {
  constructor() {
    this.store = new Store({
      name: 'random-learner-settings',
      defaults: {
        openaiApiKey: '',
        geminiApiKey: '',
        customPrompt: '',
        aiProvider: 'openai', // 'openai' or 'gemini'
        questionSettings: {
          preferredTopics: ['oops', 'java', 'python', 'ai', 'databases'],
          preferredLevels: ['beginner', 'intermediate', 'advanced'],
          useAI: false,
          mixStaticAndAI: true
        },
        timingSettings: {
          minInterval: 2 * 60 * 1000, // 2 minutes
          maxInterval: 10 * 60 * 1000 // 10 minutes
        },
        uiSettings: {
          alwaysOnTop: true,
          autoClose: true,
          autoCloseDelay: 5000
        }
      }
    });
  }

  // AI Provider Settings
  setAIProvider(provider) {
    this.store.set('aiProvider', provider);
  }

  getAIProvider() {
    return this.store.get('aiProvider');
  }

  // OpenAI Settings
  setOpenAIApiKey(apiKey) {
    this.store.set('openaiApiKey', apiKey);
  }

  getOpenAIApiKey() {
    return this.store.get('openaiApiKey');
  }

  // Gemini Settings
  setGeminiApiKey(apiKey) {
    this.store.set('geminiApiKey', apiKey);
  }

  getGeminiApiKey() {
    return this.store.get('geminiApiKey');
  }

  setCustomPrompt(prompt) {
    this.store.set('customPrompt', prompt);
  }

  getCustomPrompt() {
    return this.store.get('customPrompt');
  }

  clearCustomPrompt() {
    this.store.set('customPrompt', '');
  }

  // Question Settings
  setQuestionSettings(settings) {
    this.store.set('questionSettings', { ...this.getQuestionSettings(), ...settings });
  }

  getQuestionSettings() {
    return this.store.get('questionSettings');
  }

  setPreferredTopics(topics) {
    const settings = this.getQuestionSettings();
    settings.preferredTopics = topics;
    this.store.set('questionSettings', settings);
  }

  getPreferredTopics() {
    return this.getQuestionSettings().preferredTopics;
  }

  setPreferredLevels(levels) {
    const settings = this.getQuestionSettings();
    settings.preferredLevels = levels;
    this.store.set('questionSettings', settings);
  }

  getPreferredLevels() {
    return this.getQuestionSettings().preferredLevels;
  }

  setUseAI(useAI) {
    const settings = this.getQuestionSettings();
    settings.useAI = useAI;
    this.store.set('questionSettings', settings);
  }

  getUseAI() {
    return this.getQuestionSettings().useAI;
  }

  // Legacy method for backward compatibility
  setUseOpenAI(useOpenAI) {
    this.setUseAI(useOpenAI);
  }

  getUseOpenAI() {
    return this.getUseAI();
  }

  // Timing Settings
  setTimingSettings(settings) {
    this.store.set('timingSettings', { ...this.getTimingSettings(), ...settings });
  }

  getTimingSettings() {
    return this.store.get('timingSettings');
  }

  setQuestionInterval(minInterval, maxInterval) {
    this.store.set('timingSettings', {
      minInterval: minInterval * 60 * 1000, // Convert minutes to milliseconds
      maxInterval: maxInterval * 60 * 1000
    });
  }

  getQuestionInterval() {
    const settings = this.getTimingSettings();
    return {
      minInterval: settings.minInterval / (60 * 1000), // Convert back to minutes
      maxInterval: settings.maxInterval / (60 * 1000)
    };
  }

  // UI Settings
  setUISettings(settings) {
    this.store.set('uiSettings', { ...this.getUISettings(), ...settings });
  }

  getUISettings() {
    return this.store.get('uiSettings');
  }

  // Get all settings
  getAllSettings() {
    return {
      openaiApiKey: this.getOpenAIApiKey(),
      geminiApiKey: this.getGeminiApiKey(),
      aiProvider: this.getAIProvider(),
      customPrompt: this.getCustomPrompt(),
      questionSettings: this.getQuestionSettings(),
      timingSettings: this.getTimingSettings(),
      uiSettings: this.getUISettings()
    };
  }

  // Export settings
  exportSettings() {
    const settings = this.getAllSettings();
    // Don't export the API keys for security
    delete settings.openaiApiKey;
    delete settings.geminiApiKey;
    return JSON.stringify(settings, null, 2);
  }

  // Import settings (excluding API key)
  importSettings(settingsJSON) {
    try {
      const settings = JSON.parse(settingsJSON);
      
      if (settings.customPrompt !== undefined) {
        this.setCustomPrompt(settings.customPrompt);
      }
      
      if (settings.questionSettings) {
        this.setQuestionSettings(settings.questionSettings);
      }
      
      if (settings.timingSettings) {
        this.setTimingSettings(settings.timingSettings);
      }
      
      if (settings.uiSettings) {
        this.setUISettings(settings.uiSettings);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Reset to defaults
  resetToDefaults() {
    this.store.clear();
    return { success: true };
  }

  // Check if OpenAI is properly configured
  isOpenAIConfigured() {
    const apiKey = this.getOpenAIApiKey();
    return apiKey && apiKey.trim().length > 0;
  }

  // Check if Gemini is properly configured
  isGeminiConfigured() {
    const apiKey = this.getGeminiApiKey();
    return apiKey && apiKey.trim().length > 0;
  }

  // Check if the current AI provider is configured
  isCurrentAIProviderConfigured() {
    const provider = this.getAIProvider();
    if (provider === 'gemini') {
      return this.isGeminiConfigured();
    } else {
      return this.isOpenAIConfigured();
    }
  }

  // Get the current API key for the active provider
  getCurrentAIApiKey() {
    const provider = this.getAIProvider();
    if (provider === 'gemini') {
      return this.getGeminiApiKey();
    } else {
      return this.getOpenAIApiKey();
    }
  }
}

module.exports = SettingsManager;
