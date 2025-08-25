class QuizManager {
  constructor() {
    this.staticQuestions = [
      {
        id: 1,
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"],
        correct: 0,
        explanation: "HTML stands for Hyper Text Markup Language. It's the standard markup language used to create web pages and web applications."
      },
      {
        id: 2,
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["String", "Boolean", "Float", "Undefined"],
        correct: 2,
        explanation: "JavaScript doesn't have a 'Float' data type. It uses 'Number' for both integers and floating-point numbers. The primitive data types in JavaScript are: String, Number, Boolean, Undefined, Null, Symbol, and BigInt."
      },
      {
        id: 3,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
        correct: 1,
        explanation: "Binary search has O(log n) time complexity because it eliminates half of the remaining elements in each step, making it very efficient for sorted arrays."
      },
      {
        id: 4,
        question: "Which CSS property is used to change the text color?",
        options: ["text-color", "font-color", "color", "text-style"],
        correct: 2,
        explanation: "The 'color' property in CSS is used to set the color of text. For example: color: red; or color: #FF0000;"
      },
      {
        id: 5,
        question: "What does API stand for?",
        options: ["Application Programming Interface", "Automated Programming Interface", "Advanced Programming Interface", "Application Process Interface"],
        correct: 0,
        explanation: "API stands for Application Programming Interface. It's a set of protocols and tools that allows different software applications to communicate with each other."
      },
      {
        id: 6,
        question: "Which of these is a NoSQL database?",
        options: ["MySQL", "PostgreSQL", "MongoDB", "SQLite"],
        correct: 2,
        explanation: "MongoDB is a NoSQL (document-oriented) database. MySQL, PostgreSQL, and SQLite are all relational (SQL) databases."
      },
      {
        id: 7,
        question: "What is the main purpose of Git?",
        options: ["Web development", "Version control", "Database management", "Code compilation"],
        correct: 1,
        explanation: "Git is a distributed version control system used to track changes in source code during software development. It helps developers collaborate and maintain a history of their code changes."
      },
      {
        id: 8,
        question: "Which HTTP status code indicates 'Not Found'?",
        options: ["200", "301", "404", "500"],
        correct: 2,
        explanation: "HTTP status code 404 means 'Not Found'. It indicates that the server cannot find the requested resource. Other codes: 200 (OK), 301 (Moved Permanently), 500 (Internal Server Error)."
      },
      {
        id: 9,
        question: "What does CPU stand for?",
        options: ["Central Processing Unit", "Computer Processing Unit", "Central Program Unit", "Computer Program Unit"],
        correct: 0,
        explanation: "CPU stands for Central Processing Unit. It's often called the 'brain' of the computer as it executes instructions and performs calculations."
      },
      {
        id: 10,
        question: "Which programming paradigm does JavaScript primarily support?",
        options: ["Only Object-Oriented", "Only Functional", "Multi-paradigm", "Only Procedural"],
        correct: 2,
        explanation: "JavaScript is a multi-paradigm language that supports object-oriented, functional, and procedural programming styles, making it very flexible for different coding approaches."
      },
      {
        id: 11,
        question: "What is the purpose of the 'alt' attribute in HTML img tags?",
        options: ["To resize the image", "To provide alternative text", "To set image alignment", "To add image borders"],
        correct: 1,
        explanation: "The 'alt' attribute provides alternative text for images, which is displayed when the image cannot be loaded and is crucial for accessibility, helping screen readers describe images to visually impaired users."
      },
      {
        id: 12,
        question: "Which of these is NOT a valid CSS selector?",
        options: [".class", "#id", "element", "@media"],
        correct: 3,
        explanation: "@media is not a selector but a CSS at-rule used for media queries. Valid selectors include class selectors (.class), ID selectors (#id), and element selectors (element)."
      }
    ];

    // Level-based questions by topic
    this.levelBasedQuestions = {
      oops: {
        beginner: [
          {
            id: 201,
            question: "What does OOP stand for?",
            options: ["Object-Oriented Programming", "Only One Program", "Organized Object Process", "Optimal Operation Procedure"],
            correct: 0,
            level: "beginner",
            topic: "oops",
            explanation: "OOP stands for Object-Oriented Programming, a programming paradigm based on the concept of objects containing data and code."
          },
          {
            id: 202,
            question: "Which of the following is NOT a pillar of OOP?",
            options: ["Encapsulation", "Inheritance", "Polymorphism", "Compilation"],
            correct: 3,
            level: "beginner",
            topic: "oops",
            explanation: "The four pillars of OOP are Encapsulation, Inheritance, Polymorphism, and Abstraction. Compilation is not a pillar of OOP."
          }
        ],
        intermediate: [
          {
            id: 203,
            question: "What is method overloading?",
            options: ["Having multiple methods with same name but different parameters", "Overriding a parent class method", "Using too many methods", "Loading methods dynamically"],
            correct: 0,
            level: "intermediate",
            topic: "oops",
            explanation: "Method overloading allows multiple methods with the same name but different parameter lists (different number or types of parameters)."
          },
          {
            id: 204,
            question: "Which relationship is represented by 'IS-A'?",
            options: ["Composition", "Aggregation", "Inheritance", "Association"],
            correct: 2,
            level: "intermediate",
            topic: "oops",
            explanation: "The 'IS-A' relationship represents inheritance, where a subclass is a type of its superclass (e.g., Car IS-A Vehicle)."
          }
        ],
        advanced: [
          {
            id: 205,
            question: "What is the difference between composition and inheritance?",
            options: ["No difference", "Composition is 'HAS-A', Inheritance is 'IS-A'", "Composition is faster", "Inheritance is newer"],
            correct: 1,
            level: "advanced",
            topic: "oops",
            explanation: "Composition represents 'HAS-A' relationship (object contains other objects), while Inheritance represents 'IS-A' relationship (subclass is a type of superclass). Composition provides better flexibility and loose coupling."
          }
        ]
      },
      java: {
        beginner: [
          {
            id: 301,
            question: "Who developed Java?",
            options: ["Microsoft", "Sun Microsystems", "Oracle", "Google"],
            correct: 1,
            level: "beginner",
            topic: "java",
            explanation: "Java was originally developed by Sun Microsystems in 1995 by James Gosling and his team. Oracle acquired Sun Microsystems in 2010."
          },
          {
            id: 302,
            question: "What is JVM?",
            options: ["Java Virtual Machine", "Java Variable Method", "Java Version Manager", "Java Vendor Module"],
            correct: 0,
            level: "beginner",
            topic: "java",
            explanation: "JVM stands for Java Virtual Machine. It's a runtime environment that executes Java bytecode and provides platform independence."
          }
        ],
        intermediate: [
          {
            id: 303,
            question: "What is the difference between '==' and '.equals()' in Java?",
            options: ["No difference", "'==' compares references, '.equals()' compares values", "'.equals()' is faster", "'==' is deprecated"],
            correct: 1,
            level: "intermediate",
            topic: "java",
            explanation: "'==' compares object references (memory addresses), while '.equals()' compares the actual content/values of objects. For strings, use '.equals()' for content comparison."
          },
          {
            id: 304,
            question: "What is a checked exception in Java?",
            options: ["Exception checked at runtime", "Exception that must be caught or declared", "Exception in check() method", "Boolean exception"],
            correct: 1,
            level: "intermediate",
            topic: "java",
            explanation: "Checked exceptions must be either caught using try-catch or declared in the method signature using 'throws'. Examples include IOException, SQLException."
          }
        ],
        advanced: [
          {
            id: 305,
            question: "What is the purpose of the 'volatile' keyword in Java?",
            options: ["Makes variables temporary", "Ensures thread-safe access to variables", "Speeds up variable access", "Makes variables constant"],
            correct: 1,
            level: "advanced",
            topic: "java",
            explanation: "The 'volatile' keyword ensures that changes to a variable are immediately visible to all threads. It prevents caching of the variable and ensures atomic read/write operations."
          }
        ]
      },
      python: {
        beginner: [
          {
            id: 401,
            question: "What is the correct way to create a list in Python?",
            options: ["list = {1, 2, 3}", "list = [1, 2, 3]", "list = (1, 2, 3)", "list = <1, 2, 3>"],
            correct: 1,
            level: "beginner",
            topic: "python",
            explanation: "Lists in Python are created using square brackets []. Curly braces {} create sets, parentheses () create tuples."
          },
          {
            id: 402,
            question: "Which of these is NOT a Python data type?",
            options: ["int", "float", "string", "char"],
            correct: 3,
            level: "beginner",
            topic: "python",
            explanation: "Python doesn't have a separate 'char' data type. Individual characters are just strings of length 1. Python's basic data types include int, float, str, bool, list, tuple, dict, and set."
          }
        ],
        intermediate: [
          {
            id: 403,
            question: "What is a list comprehension in Python?",
            options: ["A way to compress lists", "A concise way to create lists", "A list documentation", "A list comparison method"],
            correct: 1,
            level: "intermediate",
            topic: "python",
            explanation: "List comprehension is a concise way to create lists. For example: [x*2 for x in range(5)] creates [0, 2, 4, 6, 8]. It's more readable and often faster than traditional loops."
          },
          {
            id: 404,
            question: "What does the '*args' parameter do in Python functions?",
            options: ["Multiplies arguments", "Accepts variable number of arguments", "Creates argument arrays", "Passes arguments by reference"],
            correct: 1,
            level: "intermediate",
            topic: "python",
            explanation: "*args allows a function to accept any number of positional arguments. The arguments are accessible as a tuple within the function."
          }
        ],
        advanced: [
          {
            id: 405,
            question: "What is the Global Interpreter Lock (GIL) in Python?",
            options: ["A security feature", "A mechanism that prevents multiple threads from executing Python code simultaneously", "A global variable lock", "A file locking system"],
            correct: 1,
            level: "advanced",
            topic: "python",
            explanation: "The GIL is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously. This can limit performance in CPU-bound multi-threaded programs."
          }
        ]
      },
      ai: {
        beginner: [
          {
            id: 501,
            question: "What does AI stand for?",
            options: ["Automated Intelligence", "Artificial Intelligence", "Advanced Intelligence", "Augmented Intelligence"],
            correct: 1,
            level: "beginner",
            topic: "ai",
            explanation: "AI stands for Artificial Intelligence - the simulation of human intelligence in machines that are programmed to think and learn like humans."
          },
          {
            id: 502,
            question: "Which of these is an example of supervised learning?",
            options: ["Clustering", "Email spam detection", "Anomaly detection", "Dimensionality reduction"],
            correct: 1,
            level: "beginner",
            topic: "ai",
            explanation: "Email spam detection is supervised learning because the model is trained on labeled data (emails marked as spam or not spam) to predict future classifications."
          }
        ],
        intermediate: [
          {
            id: 503,
            question: "What is overfitting in machine learning?",
            options: ["Model performs well on training data but poorly on new data", "Model is too simple", "Model trains too fast", "Model uses too much memory"],
            correct: 0,
            level: "intermediate",
            topic: "ai",
            explanation: "Overfitting occurs when a model learns the training data too specifically, including noise and details that don't generalize to new data, resulting in poor performance on unseen data."
          },
          {
            id: 504,
            question: "What is the purpose of a validation set?",
            options: ["To train the model", "To test final performance", "To tune hyperparameters and prevent overfitting", "To store backup data"],
            correct: 2,
            level: "intermediate",
            topic: "ai",
            explanation: "A validation set is used during training to tune hyperparameters and monitor for overfitting. It helps select the best model configuration before final testing."
          }
        ],
        advanced: [
          {
            id: 505,
            question: "What is the vanishing gradient problem in deep neural networks?",
            options: ["Gradients become too large", "Gradients become very small in early layers during backpropagation", "Gradients disappear from memory", "Gradients change randomly"],
            correct: 1,
            level: "advanced",
            topic: "ai",
            explanation: "The vanishing gradient problem occurs when gradients become exponentially smaller as they propagate back through layers, making it difficult to train deep networks effectively. This is often addressed using techniques like residual connections or better activation functions."
          }
        ]
      },
      databases: {
        beginner: [
          {
            id: 601,
            question: "What does SQL stand for?",
            options: ["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"],
            correct: 0,
            level: "beginner",
            topic: "databases",
            explanation: "SQL stands for Structured Query Language. It's a standard language for managing and manipulating relational databases."
          },
          {
            id: 602,
            question: "What is a primary key?",
            options: ["The first key in a table", "A unique identifier for each record", "The most important column", "A password for the database"],
            correct: 1,
            level: "beginner",
            topic: "databases",
            explanation: "A primary key is a column (or combination of columns) that uniquely identifies each record in a table. It cannot contain NULL values and must be unique."
          }
        ],
        intermediate: [
          {
            id: 603,
            question: "What is database normalization?",
            options: ["Making databases normal", "Organizing data to reduce redundancy", "Backing up databases", "Encrypting database data"],
            correct: 1,
            level: "intermediate",
            topic: "databases",
            explanation: "Database normalization is the process of organizing data in a database to reduce redundancy and improve data integrity by dividing large tables into smaller, related tables."
          },
          {
            id: 604,
            question: "What is the difference between INNER JOIN and LEFT JOIN?",
            options: ["No difference", "INNER JOIN returns matching records, LEFT JOIN returns all left table records", "LEFT JOIN is faster", "INNER JOIN is deprecated"],
            correct: 1,
            level: "intermediate",
            topic: "databases",
            explanation: "INNER JOIN returns only records that have matching values in both tables. LEFT JOIN returns all records from the left table and matching records from the right table (NULL for non-matching)."
          }
        ],
        advanced: [
          {
            id: 605,
            question: "What is ACID in database transactions?",
            options: ["A database acid test", "Atomicity, Consistency, Isolation, Durability", "A type of database", "A query optimization technique"],
            correct: 1,
            level: "advanced",
            topic: "databases",
            explanation: "ACID represents the four key properties of database transactions: Atomicity (all or nothing), Consistency (valid state), Isolation (concurrent transactions don't interfere), and Durability (committed changes persist)."
          }
        ]
      }
    };
    
    this.currentQuestion = null;
  }

  getRandomQuestion(filters = {}) {
    let questionPool = [];
    
    if (filters.source === 'static') {
      questionPool = this.staticQuestions;
    } else if (filters.source === 'level' && filters.topic && filters.level) {
      questionPool = this.levelBasedQuestions[filters.topic]?.[filters.level] || [];
    } else {
      // Combine all questions
      questionPool = [...this.staticQuestions];
      Object.keys(this.levelBasedQuestions).forEach(topic => {
        Object.keys(this.levelBasedQuestions[topic]).forEach(level => {
          questionPool.push(...this.levelBasedQuestions[topic][level]);
        });
      });
    }
    
    if (questionPool.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * questionPool.length);
    this.currentQuestion = questionPool[randomIndex];
    return {
      id: this.currentQuestion.id,
      question: this.currentQuestion.question,
      options: this.currentQuestion.options,
      topic: this.currentQuestion.topic || 'general',
      level: this.currentQuestion.level || 'mixed'
    };
  }

  getQuestionsByTopic(topic, level = null) {
    if (!this.levelBasedQuestions[topic]) {
      return [];
    }
    
    if (level && this.levelBasedQuestions[topic][level]) {
      return this.levelBasedQuestions[topic][level];
    }
    
    // Return all levels for the topic
    let allQuestions = [];
    Object.keys(this.levelBasedQuestions[topic]).forEach(lvl => {
      allQuestions.push(...this.levelBasedQuestions[topic][lvl]);
    });
    return allQuestions;
  }

  getAvailableTopics() {
    return Object.keys(this.levelBasedQuestions);
  }

  getAvailableLevels() {
    return ['beginner', 'intermediate', 'advanced'];
  }

  checkAnswer(questionId, userAnswerIndex) {
    if (!this.currentQuestion || this.currentQuestion.id !== questionId) {
      return { error: "Invalid question" };
    }

    const isCorrect = userAnswerIndex === this.currentQuestion.correct;
    const result = {
      correct: isCorrect,
      correctAnswer: this.currentQuestion.options[this.currentQuestion.correct],
      userAnswer: this.currentQuestion.options[userAnswerIndex],
      explanation: this.currentQuestion.explanation
    };

    return result;
  }

  getAllQuestions() {
    return this.staticQuestions;
  }

  getAllLevelBasedQuestions() {
    return this.levelBasedQuestions;
  }

  addQuestion(questionData) {
    const newId = Math.max(...this.staticQuestions.map(q => q.id)) + 1;
    this.staticQuestions.push({
      id: newId,
      ...questionData
    });
  }
}

module.exports = QuizManager;
