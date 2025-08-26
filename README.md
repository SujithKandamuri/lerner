# Random Learner 🧠 v2.0.0

[![npm version](https://badge.fury.io/js/%40codejoy%2Frandom-learner.svg)](https://badge.fury.io/js/%40codejoy%2Frandom-learner)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)

**The Ultimate Interview Preparation & Learning Companion** 🚀

A comprehensive desktop application that transforms your interview preparation with AI-powered mock interviews, skill assessments, company-specific question sets, and intelligent learning analytics. Perfect for developers preparing for technical interviews at top tech companies!

## 🎯 **What's New in v2.0.0**

### 🏢 **Company-Specific Interview Prep**
- **8 Major Tech Companies**: Google, Amazon, Meta, Microsoft, Apple, Netflix, Uber, Startups
- **AI-Generated Questions**: Authentic company-style questions tailored to each company's interview process
- **One-Click Download**: Get 25-60 questions per company with real-time progress tracking

### 🎯 **Mock Interview System**
- **6 Interview Types**: Technical General, Frontend, Backend, Full-Stack, Data Science, Quick Practice
- **Real-Time Scoring**: Live performance tracking with detailed feedback
- **Company-Specific Modes**: Practice with actual company interview styles and difficulty levels

### 🧠 **AI-Powered Weakness Detection**
- **Smart Analysis**: AI identifies your knowledge gaps and weak areas
- **Targeted Practice**: Automatically serves questions focused on your weaknesses
- **Progress Tracking**: Monitor improvement in specific skill areas over time

### 🏆 **Comprehensive Skill Assessment**
- **Multi-Dimensional Evaluation**: Technical, Problem-Solving, Speed, Communication skills
- **Experience Level Classification**: Junior, Mid-Level, Senior, Expert with salary benchmarks
- **Interview Readiness Score**: Data-driven assessment of your interview preparedness
- **Industry Benchmarking**: Compare your skills against industry standards

### 📊 **Advanced Learning Analytics**
- **Interactive Dashboard**: Beautiful charts and graphs showing your learning progress
- **Performance Metrics**: Success rates, response times, topic mastery, and streaks
- **AI Insights**: Personalized recommendations and study plans
- **Export Capabilities**: Download your progress data and analytics

## 📦 Installation

### Option 1: Install via npm (Recommended)

```bash
npm install -g @codejoy/random-learner
```

Then run:
```bash
random-learner
```

### Option 2: Clone and Run Locally

```bash
git clone https://github.com/codejoy-org/random-learner.git
cd random-learner
npm install
npm start
```

## 🚀 Quick Start

1. **Install the app**: `npm install -g @codejoy/random-learner`
2. **Run it**: `random-learner`
3. **Configure**: Right-click the tray icon → Settings
4. **Add AI**: Enter your OpenAI or Gemini API key (optional)
5. **Learn**: Questions will start appearing automatically!

## ✨ Features

### 🎯 **Core Learning Features**
- **Random Question Popups**: Questions appear randomly every 2-10 minutes
- **Multiple Choice Questions**: Easy-to-answer format with clickable options
- **Instant Feedback**: Get immediate results with explanations
- **Level-Based Learning**: Beginner, Intermediate, and Advanced questions
- **Topic-Focused Questions**: OOP, Java, Python, AI, and Databases

### 🤖 **AI-Powered Features**
- **OpenAI Integration**: Generate unlimited questions using GPT
- **Custom Prompts**: Customize how AI generates questions
- **Enhanced Feedback**: AI-powered explanations for wrong answers
- **Dynamic Topics**: Ask AI about any programming topic
- **Smart Validation**: AI validates and explains your answers

### ⚙️ **Customization & Settings**
- **Comprehensive Settings Page**: Configure every aspect of your learning
- **Topic Preferences**: Choose which topics to focus on
- **Difficulty Selection**: Select your preferred learning levels
- **Timing Controls**: Customize popup intervals (2-120 minutes)
- **UI Preferences**: Always on top, auto-close settings

### 🎨 **User Experience**
- **Beautiful Modern UI**: Gradient-based design with smooth animations
- **Keyboard Shortcuts**: Quick navigation (1-4 for options, Enter, Esc)
- **Menu Bar Integration**: Easy access to settings and manual questions
- **Question Metadata**: See topic, level, and source (static vs AI)
- **Enhanced Feedback**: Visual indicators for AI-generated content

## Installation

1. **Clone or download this project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the application**:
   ```bash
   npm start
   ```

3. **For development** (with auto-restart):
   ```bash
   npm run dev
   ```

## 🎮 How to Use

### **Basic Usage**
- The app runs in the background after starting
- Random questions popup every 2-10 minutes (configurable)
- Click options or use keyboard shortcuts (1-4)
- Press Enter to submit, Esc to skip
- Windows auto-close after showing results

### **Accessing Settings**
- **Menu**: Random Learner → Settings
- **Keyboard**: Cmd/Ctrl + Comma (,)
- Configure OpenAI, topics, difficulty, timing, and UI preferences

### **OpenAI Setup** (Optional but Recommended)
1. Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open Settings (Cmd/Ctrl + ,)
3. Enter your API key in the OpenAI section
4. Enable "Use OpenAI for question generation"
5. Optionally customize the generation prompt

### **Manual Questions**
- **Menu**: Random Learner → Show Question Now
- **Keyboard**: Cmd/Ctrl + Q

## 📚 Built-in Question Bank

### **Topics Covered**
- **Object-Oriented Programming (OOP)**: Classes, inheritance, polymorphism, encapsulation
- **Java**: JVM, syntax, exceptions, keywords, best practices  
- **Python**: Data types, list comprehensions, functions, GIL, libraries
- **Artificial Intelligence**: Machine learning, neural networks, algorithms
- **Databases**: SQL, normalization, joins, ACID properties, NoSQL
- **General Programming**: Web development, algorithms, version control

### **Difficulty Levels**
- **Beginner**: Basic concepts and terminology
- **Intermediate**: Practical applications and deeper understanding
- **Advanced**: Complex scenarios and expert-level knowledge

**Total Questions**: 60+ static questions across all topics and levels

## Keyboard Shortcuts

- **1, 2, 3, 4**: Select answer options A, B, C, D
- **Enter**: Submit selected answer
- **Escape**: Skip question and close window

## 🛠 Advanced Configuration

### **Settings Management**
- **Export/Import**: Backup and share your settings (excluding API keys)
- **Reset to Defaults**: Restore original configuration
- **Live Updates**: Changes apply immediately without restart

### **OpenAI Prompt Customization**
The default prompt can be customized in Settings. Use these placeholders:
- `{topic}`: Will be replaced with the selected topic
- `{level}`: Will be replaced with the difficulty level

**Default Prompt Structure**:
- Requests specific question format (4 options, 1 correct)
- Asks for concise explanations (2-3 sentences)
- Focuses on practical, applicable knowledge
- Ensures appropriate difficulty level

### **Adding Static Questions**
Add questions to `src/quizManager.js` in the `levelBasedQuestions` object:

```javascript
{
  id: 606,
  question: "Your question here?",
  options: ["Option A", "Option B", "Option C", "Option D"],
  correct: 0, // Index of correct answer (0-3)
  level: "intermediate", // beginner/intermediate/advanced
  topic: "databases", // oops/java/python/ai/databases
  explanation: "Explanation of the correct answer"
}
```

## 🔧 Technology Stack

- **Electron**: Cross-platform desktop applications
- **Node.js**: Backend runtime and logic
- **OpenAI API**: AI-powered question generation and feedback
- **electron-store**: Persistent settings storage
- **HTML/CSS/JavaScript**: Modern frontend interface
- **IPC (Inter-Process Communication)**: Secure process communication

## Project Structure

```
lerner/
├── package.json           # Project configuration and dependencies
├── README.md             # This documentation
└── src/
    ├── index.js          # Main Electron app with menu and IPC
    ├── quizManager.js    # Static question bank and quiz logic
    ├── openAIManager.js  # OpenAI integration and prompt management
    ├── settingsManager.js # Settings persistence and management
    ├── question.html     # Question popup UI
    └── settings.html     # Settings page UI
```

## 🤝 Contributing

Feel free to contribute by:
- **Adding Questions**: Expand the static question bank
- **New Topics**: Add support for more programming topics
- **UI/UX Improvements**: Enhance the visual design and user experience
- **Advanced Features**: Progress tracking, statistics, spaced repetition
- **Bug Fixes**: Report and fix issues
- **OpenAI Prompts**: Share effective prompt templates

## 🎯 Future Enhancements

- **Spaced Repetition**: Questions repeat based on your performance
- **Progress Tracking**: Statistics and learning analytics
- **Custom Topics**: User-defined subject areas
- **Team Mode**: Share questions and compete with colleagues
- **Mobile App**: Companion mobile application
- **Plugin System**: Extensible architecture for custom features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Publishing & Development

### Development Setup

```bash
git clone https://github.com/codejoy-org/random-learner.git
cd random-learner
npm install
npm run dev  # Runs with nodemon for auto-restart
```

### Publishing to npm

```bash
# Build and test
npm run build
npm test

# Publish (requires @codejoy npm organization access)
npm publish
```

## 🙏 Acknowledgments

- Built with Electron for cross-platform desktop support
- Uses OpenAI GPT and Google Gemini for intelligent question generation
- Inspired by the need for continuous learning in our busy lives

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/codejoy-org/random-learner/issues)
- **Email**: support@codejoy.dev
- **NPM Package**: [@codejoy/random-learner](https://www.npmjs.com/package/@codejoy/random-learner)

---

**Happy Learning! 🚀**
