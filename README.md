# Random Learner 🧠

A powerful desktop application that helps busy learners by showing random popup questions at intervals. Perfect for those who don't have time to sit down for dedicated study sessions but want to learn on-the-go!

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

## License

MIT License - feel free to use and modify as needed!

---

**Happy Learning! 🚀**
