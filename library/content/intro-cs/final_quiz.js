// ================================================
// Intro to CS — Final Quiz (cumulative, all 8 units)
// ------------------------------------------------
// Pure data, same {question, options, correct} shape every per-topic
// exam question already uses (see any data_m*.js's examQuestions) so
// library.js's existing exam-taking screen can run this unmodified.
//
// Source: two 20-question reference sets pasted by the user this
// session (kept verbatim in BACKLOG.md's Reference section), rewritten
// into full standalone questions — the originals were terse exam-prep
// shorthand ("A=1,B=0,C=1: A + B·C = ? — OR / AND / 0 / 1"), not
// ready-to-render option lists.
//
// One factual correction made against this app's OWN content, not
// invented: reference set 2, question 6 gave "separate data and
// instruction memory" as the defining trait of the Von Neumann
// architecture. That's backwards — it's the shared/single-memory
// "stored-program concept" (see data_m10.js's "cf-von-neumann" chunk,
// written earlier this session: "instructions and the data it operates
// on are both stored together in the SAME memory"). Separate memories
// is the Harvard architecture, the contrast case. Shipping the
// reference's original wording would have taught something this same
// app's own lesson two clicks away directly contradicts, so it's fixed
// here rather than reproduced faithfully.
// ================================================

const FINAL_QUIZ_QUESTIONS = [
  // ---- from reference Set 1 ----
  {
    question: "Which transmission mode doubles the utilization of transmission bandwidth?",
    options: ["Half-duplex", "Full-duplex", "Simplex", "Unicast"],
    correct: 1
  },
  {
    question: "What is the main function of an ISP (Internet Service Provider)?",
    options: ["Connect users to the internet", "Manage internal corporate networks", "Provide hardware support", "Develop application software"],
    correct: 0
  },
  {
    question: "If A = 1, B = 0, C = 1, what does A + (B · C) evaluate to in Boolean algebra?",
    options: ["0", "1", "A", "B"],
    correct: 1
  },
  {
    question: "Mainframe computers are most commonly used for ______.",
    options: ["Scientific research and large-scale data processing", "Gaming", "Personal everyday tasks", "Embedded systems"],
    correct: 0
  },
  {
    question: "What does “data independence” mean in the context of databases?",
    options: ["Data is encrypted for security", "Data is irrelevant to the application", "The ability to modify the database schema without affecting applications that use the data", "Data that is defined separately from programs but still tightly coupled to them"],
    correct: 2
  },
  {
    question: "In blockchain technology, what is a “block”?",
    options: ["A single database record", "A cryptographic key", "An encryption algorithm", "A group of transactions bundled together"],
    correct: 3
  },
  {
    question: "A programming paradigm where programs are structured as classes and objects that communicate with each other is called ______.",
    options: ["Procedural programming", "Imperative programming", "Object-oriented programming", "Functional programming"],
    correct: 2
  },
  {
    question: "Which protocol is used for communication on the World Wide Web?",
    options: ["FTP", "IP", "TCP", "HTTP"],
    correct: 3
  },
  {
    question: "Which level of data abstraction deals with how data is physically stored and retrieved?",
    options: ["External level", "Physical level", "Conceptual level", "Logical level"],
    correct: 1
  },
  {
    question: "What does “debugging” refer to in software development?",
    options: ["Analyzing specifications", "Eliminating errors from a program", "Writing documentation", "Identifying requirements"],
    correct: 1
  },
  {
    question: "Integrated Circuits (ICs) were introduced in which generation of computers?",
    options: ["Second generation", "Fourth generation", "First generation", "Third generation"],
    correct: 3
  },
  {
    question: "What is the function of an actuator in an IoT system?",
    options: ["Sensing environmental data", "Processing collected data", "Initiating physical actions based on received data", "Transmitting data to the cloud"],
    correct: 2
  },
  {
    question: "In database transactions, isolated execution primarily preserves ______.",
    options: ["Dependency", "Consistency", "Atomicity", "Security"],
    correct: 2
  },
  {
    question: "Which OOP concept enables hierarchical relationships between classes?",
    options: ["Objects", "Inheritance", "Attributes", "Polymorphism"],
    correct: 1
  },
  {
    question: "Which control structure is used to make decisions based on conditions?",
    options: ["Iteration", "Abstraction", "Selection", "Sequencing"],
    correct: 2
  },
  {
    question: "What does “elasticity” mean in cloud computing?",
    options: ["Dynamic scaling of resources on demand", "Reduced network latency", "Higher upfront hardware cost", "Better built-in security"],
    correct: 0
  },
  {
    question: "What is the primary advantage of Unicode over ASCII?",
    options: ["Simplicity", "Faster processing speed", "A much larger character set covering global languages", "Lower memory usage"],
    correct: 2
  },
  {
    question: "True or False: Scalability is the OS characteristic of handling more work by adding resources.",
    options: ["False", "True"],
    correct: 1
  },
  {
    question: "Which of these is an iterative control structure?",
    options: ["Decision making", "Loop", "Sequential execution", "Jump statement"],
    correct: 1
  },
  {
    question: "What is the first step in top-down program design?",
    options: ["Building a hierarchy of lower-level modules", "Drawing flow charts", "Identifying the top-level functions of the system", "Randomly assembling components"],
    correct: 2
  },

  // ---- from reference Set 2 ----
  {
    question: "What does the “external schema” describe in a database?",
    options: ["The overall conceptual organization of the data", "How data is physically stored", "How data is viewed by specific user groups", "The logical structure shared by all users"],
    correct: 2
  },
  {
    question: "Which part of an operating system manages hardware requests and allocation?",
    options: ["Security", "Control of system performance", "File management", "Device management"],
    correct: 3
  },
  {
    question: "What is the primary goal of Virtual Reality (VR)?",
    options: ["Replace physical computers", "Create a completely new, simulated reality", "Enhance the physical world with digital overlays", "Improve internet connectivity"],
    correct: 1
  },
  {
    question: "What is the main purpose of a Network Operating System?",
    options: ["Managing shared resources and facilitating communication across a network", "Running a single standalone application", "Rendering 3D graphics", "Compiling source code"],
    correct: 0
  },
  {
    question: "According to the distributive law in Boolean algebra, A·(B+C) equals:",
    options: ["A + B·C", "A·B + A·C", "(A+B)·(A+C)", "A·B·C"],
    correct: 1
  },
  {
    // Corrected — see the file header comment. Reference material had
    // this backwards.
    question: "What primarily characterizes the Von Neumann architecture?",
    options: ["A single, shared memory holding both instructions and data (the stored-program concept)", "Completely separate memories for instructions and data", "The complete absence of a control unit", "Reliance on analog circuits instead of digital ones"],
    correct: 0
  },
  {
    question: "Which software category includes games, web browsers, and productivity tools?",
    options: ["System software", "Application software", "Firmware", "Middleware"],
    correct: 1
  },
  {
    question: "In the context of Big Data's “3 Vs,” what does “Velocity” refer to?",
    options: ["The total volume of data", "The variety of data formats", "The speed at which data is generated and processed", "The accuracy of the data"],
    correct: 2
  },
  {
    question: "A mobile operating system is designed to run primarily on devices such as:",
    options: ["Desktop PCs", "Tablets and smartphones", "Mainframe computers", "Network servers"],
    correct: 1
  },
  {
    question: "What is the smallest unit of data storage in computer memory?",
    options: ["Byte", "Bit", "Nibble", "Word"],
    correct: 1
  },
  {
    question: "Which network topology commonly uses a token-passing method to control access to the network?",
    options: ["Star", "Bus", "Ring", "Mesh"],
    correct: 2
  },
  {
    question: "Which of these is a common application of unsupervised machine learning?",
    options: ["Spam email classification", "Anomaly detection", "Predicting house prices from labeled data", "Handwriting digit recognition with labels"],
    correct: 1
  },
  {
    question: "Which logic gate outputs 0 if at least one of its inputs is 1?",
    options: ["OR", "AND", "NOR", "NAND"],
    correct: 2
  },
  {
    question: "After identifying a logical error in a program, what is the next step?",
    options: ["Rewrite the entire program from scratch", "Fix the error", "Ignore it if the program still runs", "Recompile without making changes"],
    correct: 1
  },
  {
    question: "What is the main purpose of Binary-Coded Decimal (BCD) coding?",
    options: ["Encrypting text data", "Efficient storage and representation of numeric data", "Compressing image files", "Rendering graphics"],
    correct: 1
  },
  {
    question: "Which method is used to convert an octal number to decimal?",
    options: ["Multiply each digit by the corresponding power of 8 and sum", "Multiply each digit by 2", "Divide the number by 10", "Add each digit directly"],
    correct: 0
  },
  {
    question: "What is the process of discovering patterns and knowledge from large datasets called?",
    options: ["Data entry", "Data mining", "Data backup", "Data encryption"],
    correct: 1
  },
  {
    question: "Which type of OS runs on a server and manages data, users, and groups across a network?",
    options: ["Real-time operating system", "Mobile operating system", "Network operating system", "Embedded operating system"],
    correct: 2
  },
  {
    question: "Convert the hexadecimal number 3A.5 to binary.",
    options: ["111010.0101", "110101.0101", "111010.1010", "101011.0101"],
    correct: 0
  },
  {
    question: "True or False: Problem analysis is done after system design.",
    options: ["True", "False"],
    correct: 1
  }
];
