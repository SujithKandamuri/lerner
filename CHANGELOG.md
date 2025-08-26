# Changelog

All notable changes to Random Learner will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-19

### 🚀 Major Release: Interview Preparation & Advanced Analytics

This is a major release that transforms Random Learner from a simple quiz app into a comprehensive interview preparation platform with AI-powered features.

### 📋 **What's New in v2.0.0**
- 🎯 **Mock Interview System** with 6 interview types and company-specific preparation
- 🧠 **AI-Powered Weakness Detection** that identifies knowledge gaps and provides targeted practice
- 🏆 **Comprehensive Skill Assessment** with detailed reports and industry benchmarking
- 🏢 **Company Question Sets** with AI-generated questions for 8 major tech companies
- 📊 **Enhanced Analytics Dashboard** with interview readiness scoring and progress tracking
- 🎮 **Gamification Features** with achievements, streaks, and performance metrics

### 🔧 **Technical Improvements**
- Complete UI/UX overhaul with modern, responsive design
- Advanced AI integration with OpenAI GPT-3.5-turbo and Google Gemini
- Robust error handling and offline capabilities
- Comprehensive data export/import functionality
- Real-time progress tracking and analytics

#### 🎯 **Mock Interview System**
- **Comprehensive Mock Interviews**: Full-featured interview simulation with multiple types:
  - **Technical General**: 45-minute comprehensive technical assessment
  - **Frontend Focused**: React, JavaScript, CSS, and web technologies
  - **Backend Focused**: System design, databases, APIs, and scalability
  - **Full-Stack**: End-to-end development skills assessment
  - **Data Science**: ML algorithms, statistics, and data analysis
  - **Quick Practice**: 15-minute rapid skill assessment
- **Company-Specific Preparation**: Tailored interview styles for:
  - **Google**: Algorithmic problem-solving with optimization focus
  - **Amazon**: Leadership principles + technical depth
  - **Meta**: Product thinking + technical execution
  - **Microsoft**: Collaborative problem-solving approach
  - **Startup**: Practical problem-solving and adaptability
- **Real-Time Interview Features**:
  - **Live Timer**: Session and per-question timing with visual countdown
  - **Progress Tracking**: Phase indicators (Warm-up → Technical → Advanced → Behavioral)
  - **Pause/Resume**: Interview session management with time adjustment
  - **Performance Scoring**: Multi-dimensional scoring (accuracy, timing, completion)
- **Interview Analytics**: Detailed performance reports with improvement recommendations

#### 🧠 **AI-Powered Weakness Detection**
- **Intelligent Analysis**: Advanced pattern recognition to identify knowledge gaps
- **Concept Mapping**: 50+ interconnected programming concepts with dependency tracking
- **Weakness Scoring**: Multi-factor analysis considering accuracy, response time, and confidence
- **Targeted Practice**: 70% of questions now focus on identified weak areas
- **Root Cause Analysis**: "You struggle with recursion because you miss base cases"
- **Spaced Repetition**: Optimal timing for revisiting weak concepts
- **Progress Monitoring**: Visual tracking of improvement in weak areas

#### 🏆 **Comprehensive Skill Assessment**
- **Multi-Dimensional Evaluation**: 4 core categories with weighted scoring:
  - **Technical Skills** (40%): Programming fundamentals, data structures, algorithms, system design
  - **Problem Solving** (25%): Analytical thinking, optimization, debugging
  - **Coding Proficiency** (20%): Code quality, best practices, testing
  - **Communication** (15%): Technical communication, collaboration
- **Experience Level Classification**: Automatic classification with confidence scoring:
  - **Beginner** (< 1 year): Basic programming competency
  - **Entry Level** (0-2 years): $50k-$75k salary range
  - **Mid Level** (2-5 years): $75k-$120k salary range  
  - **Senior Level** (5-8 years): $120k-$180k salary range
  - **Expert Level** (8+ years): $180k-$300k salary range
- **Interview Readiness Assessment**: Company and role-specific readiness scores
- **Certification System**: Bronze 🥉, Silver 🥈, Gold 🥇, Platinum 💎 skill certifications
- **Industry Benchmarking**: Compare skills against industry standards and salary expectations

#### 📊 **Enhanced Learning Analytics**
- **Interview Readiness Dashboard**: Real-time assessment of interview preparedness
- **Skill Category Breakdown**: Detailed performance analysis across all skill areas
- **Weakness Analysis Integration**: Live tracking of improvement areas and targeted questions
- **Progress Predictions**: "At current pace, interview-ready in 6 weeks"
- **Success Rate Estimation**: Data-driven interview success probability
- **Personalized Recommendations**: AI-generated study plans and focus areas

#### 🏢 **AI-Powered Company Question Sets**
- **Company-Specific Question Generation**: AI generates tailored questions for 8 major companies:
  - **Google**: Algorithmic optimization and scalability focus
  - **Amazon**: Leadership principles + technical depth
  - **Meta**: Product thinking + technical execution  
  - **Microsoft**: Collaborative problem-solving approach
  - **Apple**: Design excellence and user experience
  - **Netflix**: Streaming technology and data-driven decisions
  - **Uber**: Real-time systems and marketplace dynamics
  - **Startup**: Practical problem-solving with resource constraints
- **One-Click Download**: Download 25-60 questions per company with single button click
- **Question Type Variety**: Coding, System Design, Behavioral, and company-specific categories
- **Real-Time Progress**: Live download progress with detailed status updates
- **Smart Integration**: 
  - **Mock Interviews**: Automatically uses company questions during company-specific interviews
  - **Regular Practice**: 20% chance to show company questions during normal learning
  - **Targeted Practice**: Company questions integrated with weakness detection
- **Complete Management**: Export, import, delete, and organize company question sets
- **Offline Storage**: All downloaded questions stored locally for offline practice
- **Download Analytics**: Track download history, success rates, and question statistics

### Enhanced Features
- **Next Question Button**: Continue learning without closing the window - perfect for study sessions
- **Enhanced Auto-Close Dialog**: Choose to load next question, extend window, or close after answering
- **Improved Keyboard Shortcuts**: 
  - Press 'N' to load next question (when available)
  - Enhanced Enter key behavior for seamless navigation
- **Continuous Learning Mode**: Keep the learning momentum going with instant question transitions
- **Better User Experience**: Extended auto-close timer (15 seconds) with more intuitive options
- **Question Source Tags**: Visual indicators showing question source (🤖 OpenAI, ✨ Gemini, 📚 Static, ⚠️ AI Fallback)
- **Topic Icons**: Beautiful programming language and topic icons in question window:
  - **Languages**: Python, Java, JavaScript, C++, C#, PHP, Ruby, Go, Rust, Swift, Kotlin
  - **Categories**: Database, Web Development, Mobile, Algorithms, Security, DevOps, AI/ML
  - **Smart Detection**: Automatically detects topic from question content
- **Comprehensive AI Explanations**: Single API call now generates detailed explanations for ALL answer options
- **Smart Fallback System**: AI → AI Cache → Static questions with proper fallback hierarchy
- **Google Gemini Setup Guide**: Complete documentation for getting free Gemini API key (`GEMINI_API_SETUP.md`)
- **🎯 Learning Analytics Dashboard**: Comprehensive progress tracking and insights system:
  - **Progress Tracking**: Questions answered, accuracy rates, response times, streaks
  - **Visual Analytics**: Interactive charts showing weekly progress and topic performance
  - **Topic Analysis**: Detailed breakdown of performance by programming language/topic
  - **Achievement System**: Unlock achievements for milestones and consistent performance
  - **AI-Powered Insights**: On-demand personalized learning recommendations and analysis
  - **Data Export**: Export analytics data for external analysis or backup

### Changed
- **Question Window Flow**: After answering, users can immediately continue with next question
- **Button Layout**: Dynamic button visibility based on current state (Submit → Next Question → Close)
- **Auto-Close Behavior**: More user-friendly with focus on continuous learning rather than just closing
- **AI Question Fallback Logic**: Improved hierarchy - AI → AI Cache → Static (with proper fallback to static when AI completely fails)
- **Answer Validation**: Now uses pre-generated explanations instead of additional API calls for better performance
- **Question Generation**: Single API call now includes question, options, and detailed explanations for all choices

### Enhanced
- **Learning Session Support**: Designed for extended study sessions with minimal interruption
- **Keyboard Navigation**: More intuitive shortcuts for power users
- **Visual Feedback**: Better button states and transitions for clearer user guidance
- **AI Question Fallback System**: Improved multi-tier fallback system for cached AI questions:
  - 🥇 **First**: Try fresh AI generation
  - 🥈 **Second**: Use cached questions with same topic/level
  - 🥉 **Third**: Use cached questions from same topic
  - 🏅 **Fourth**: Use cached questions from same level  
  - 🎯 **Fifth**: Use any available cached AI questions
  - 📚 **Final**: Fall back to static questions if AI completely unavailable
- **API Efficiency**: Reduced API calls by 50% - single call generates question + all explanations
- **Better Answer Feedback**: Detailed explanations for both correct and incorrect choices, showing why each option is right/wrong and where it's used
- **Visual Question Identification**: Instant recognition of programming languages and topics through color-coded icons with authentic brand colors
- **Smart Analytics Tracking**: Automatic recording of all learning activities with detailed performance metrics
- **Streak Management**: Intelligent streak tracking that motivates consistent learning habits

## [1.0.2] - 2024-01-15

### Added
- AI-powered question generation using OpenAI and Google Gemini
- Intelligent question caching system for offline usage
- Enhanced feedback with AI-powered explanations
- Support for multiple AI providers (OpenAI, Gemini)
- Custom prompt configuration for personalized learning
- Question cache management with export/import functionality
- Auto-extension dialog for keeping question windows open
- Keyboard shortcuts for quick navigation (1-4 for options, Enter to submit, Escape to close)

### Enhanced
- Improved tray icon with multiple fallback options
- Better system tray integration with status indicators
- Enhanced settings window with AI provider configuration
- Responsive question window design for different screen sizes
- Auto-close confirmation with countdown timer

### Fixed
- Tray icon display issues across different operating systems
- Question window positioning and focus handling
- Settings persistence and reload functionality

## [1.0.1] - 2024-01-10

### Added
- System tray integration for background operation
- Pause/Resume functionality for question scheduling
- Settings window for configuration management
- Question timing customization (min/max intervals)
- Topic and difficulty level preferences
- Always-on-top window option

### Enhanced
- Improved question display with better formatting
- Enhanced UI with gradient backgrounds and animations
- Better error handling and fallback mechanisms

### Fixed
- Window management issues on macOS
- Question scheduling reliability
- Settings validation and error handling

## [1.0.0] - 2024-01-05

### Added
- Initial release of Random Learner
- Random popup quiz questions for programming concepts
- Multiple choice questions covering:
  - Java programming
  - Python programming
  - Object-Oriented Programming (OOP)
  - Database concepts
  - General programming principles
- Configurable question intervals
- Cross-platform support (Windows, macOS, Linux)
- Electron-based desktop application
- Beautiful, modern UI with animations
- Question feedback with explanations

### Features
- **Smart Scheduling**: Random intervals between questions to avoid predictability
- **Topic Coverage**: Comprehensive programming topics for well-rounded learning
- **Difficulty Levels**: Questions ranging from beginner to advanced
- **Instant Feedback**: Immediate explanations for both correct and incorrect answers
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Lightweight**: Minimal system resource usage
- **Background Operation**: Runs quietly in the system tray

---

## [1.0.2] - 2024-11-15

### Added
- Basic AI question generation with OpenAI and Google Gemini support
- Static question bank with programming topics
- System tray integration
- Basic settings management
- Question caching system

### Features
- Random popup questions at configurable intervals
- Multiple choice questions with explanations
- Basic analytics tracking
- Settings window for configuration
- Support for multiple AI providers

## [1.0.1] - 2024-11-01

### Added
- Initial release with basic functionality
- Static question bank
- System tray integration
- Basic popup questions

## [1.0.0] - 2024-10-15

### Added
- Initial version with core functionality
- Basic question display system
- System tray integration

---

## Release Notes Format

Each release includes:
- **Added**: New features and capabilities
- **Changed**: Modifications to existing functionality
- **Enhanced**: Improvements to existing features
- **Fixed**: Bug fixes and issue resolutions
- **Deprecated**: Features that will be removed in future versions
- **Removed**: Features that have been removed
- **Security**: Security-related improvements

## Upcoming Features

Stay tuned for future releases that may include:
- More programming languages and topics
- Custom question creation
- Learning progress tracking
- Spaced repetition algorithms
- Integration with popular learning platforms
- Mobile companion app
- Team/classroom features
- Advanced analytics and insights
