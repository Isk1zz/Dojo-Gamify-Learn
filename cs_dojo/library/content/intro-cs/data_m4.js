// ================================================
// Unit 7 Dojo — Programming Fundamentals
// Structured, OOP, Functional Programming, Problem Analysis & Design,
// Algorithm Design (Sequencing/Selection/Iteration), Debugging Logical Errors
// ================================================

const MODULE_4 = {
  id: "programming-fundamentals",
  unit: 7,
  title: "Programming Fundamentals",
  icon: "💻",
  topics: [
    {
      id: "structured-programming",
      title: "Structured Programming",
      desc: "Sequence, selection, iteration — and why branching lost.",
      icon: "🧱",
      chunks: [
        {
          title: "The Three Control Structures",
          explain: {
            text: `Structured programming builds every program out of three control structures: <strong>sequence</strong> (do one instruction, then the next, in fixed order), <strong>selection</strong> (the program chooses between paths based on a condition), and <strong>iteration</strong> (code repeats — zero times, a fixed number of times, or until a condition is met).<br><br>Nothing else is needed. Any algorithm can be expressed using only these three shapes, which is exactly why they became the foundation of readable code.`,
            analogy: "Sequence is following a recipe step by step. Selection is 'if the oven isn't hot yet, wait' — a fork in the road. Iteration is 'stir until smooth' — repeat until a condition is satisfied."
          },
          example: {
            label: "All Three in One C++ Function",
            steps: [
              `<strong>Sequence:</strong> <code>int total = 0;</code> — runs once, in order.`,
              `<strong>Selection:</strong> <code>if (n % 2 == 0) { total += n; }</code> — a question is asked, a path is chosen.`,
              `<strong>Iteration:</strong> <code>for (int i = 1; i <= n; i++) { total += i; }</code> — repeats until the condition <code>i <= n</code> fails.`
            ]
          },
          quiz: {
            question: "Which control structure repeats a block of code until a condition is met?",
            options: ["Sequence", "Selection", "Iteration", "Branching"],
            correct: 2,
            explanation: "Iteration (looping) repeats code — zero times, a fixed number of times, or until a condition is satisfied."
          }
        },
        {
          title: "Single Entry, Single Exit",
          explain: {
            text: `Structured programming isn't really about banning jumps — it's about controlling where they go. A <strong>selection</strong> structure (like <code>if/else</code>) still redirects the flow of execution, but both branches always reconverge at a known point afterward. This is called <strong>single entry, single exit</strong>: you enter the structure at one place and leave at one place, no matter which path was taken.<br><br><strong>Branching</strong> (an unrestricted <code>goto</code>) breaks this rule — it can jump anywhere in the program with no guaranteed return, which is how "spaghetti code" happens.`,
            analogy: "A selection structure is like a roundabout — however you go around it, you exit onto the same road. A goto is like teleporting into someone else's house mid-sentence and never coming back to finish yours."
          },
          example: {
            label: "Controlled Jump vs. Uncontrolled Jump",
            steps: [
              `<strong>Controlled (selection):</strong> <code>if (x > 0) { positive(); } else { negative(); }</code> — both paths rejoin right after the block.`,
              `<strong>Uncontrolled (goto):</strong> <code>goto skip_validation;</code> — execution can leap to any labeled line, bypassing whatever logic sits between.`
            ]
          },
          quiz: {
            question: "What does 'single entry, single exit' actually describe?",
            options: [
              "A function can only be called once",
              "Every control structure is entered and exited at exactly one predictable point, regardless of the path taken inside it",
              "A loop can only iterate one time",
              "Variables can only be declared once"
            ],
            correct: 1,
            explanation: "Single entry, single exit means control flow always converges back to a known point — that predictability is what makes structured code readable."
          }
        },
        {
          title: "Dijkstra, goto, and What Actually Won",
          explain: {
            text: `In the late 1960s, Edsger Dijkstra proposed eliminating the unrestricted <code>goto</code> statement, arguing it made programs unnecessarily hard to follow. The debate ran for roughly twenty years, and by the end of the 20th century nearly all computer scientists were convinced structured programming was the better approach.<br><br>But "goto lost" oversimplifies what happened. What actually won was <strong>disciplined</strong> jumping. Modern languages kept controlled jump commands — <code>break</code>, <code>continue</code>, and early <code>return</code> — because they exit a structure to a predictable place. Unrestricted goto lost; goto with a leash survived in every mainstream language.`,
            analogy: "It's not that jumping was banned — it's that jumping without a map was banned. break and return are jumps with a destination already agreed on."
          },
          example: {
            label: "A Disciplined Jump in C++",
            steps: [
              `<code>for (int i = 0; i < 100; i++) { if (arr[i] == target) break; }</code>`,
              `<code>break</code> exits the loop immediately — but only to one guaranteed place: the line right after the loop. It never goes anywhere else.`,
              `Compare that to an unrestricted <code>goto</code>, which could jump to any labeled line in the entire function, controlled or not.`
            ]
          },
          quiz: {
            question: "What is the most accurate description of what 'won' the structured programming debate?",
            options: [
              "All forms of jumping were eliminated from programming languages",
              "Disciplined jumps (break, continue, return) survived; only unrestricted, arbitrary jumps (goto) fell out of favor",
              "Dijkstra's proposal was rejected by the programming community",
              "Loops were replaced entirely by recursion"
            ],
            correct: 1,
            explanation: "Modern languages still contain jump commands — break, continue, return — they're just constrained to predictable destinations, unlike an unrestricted goto."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which of the following is NOT one of the three core control structures?",
          options: ["Sequence", "Selection", "Iteration", "Branching"],
          correct: 3
        },
        {
          question: "In structured programming, what happens to the two paths of an if/else statement?",
          options: [
            "They never rejoin — execution ends separately",
            "They always reconverge at a single, predictable point after the structure",
            "Only the 'if' path is guaranteed to execute",
            "They loop back to the start of the program"
          ],
          correct: 1
        },
        {
          question: "Who proposed eliminating the unrestricted goto statement in the late 1960s?",
          options: ["Alan Turing", "Edsger Dijkstra", "Dennis Ritchie", "Ada Lovelace"],
          correct: 1
        },
        {
          question: "Which of these C++ keywords is considered a 'disciplined jump' that survived the structured programming debate?",
          options: ["goto", "break", "asm", "extern"],
          correct: 1
        },
        {
          question: "What is the primary criticism of unrestricted goto statements?",
          options: [
            "They run slower than loops",
            "They allow execution to jump anywhere with no guaranteed return, producing hard-to-follow 'spaghetti code'",
            "They cannot be used inside functions",
            "They only work with integer variables"
          ],
          correct: 1
        }
      ]
    },
    {
      id: "object-oriented-programming",
      title: "Object-Oriented Programming",
      desc: "Bundling data and behavior — and the four pillars.",
      icon: "🧩",
      chunks: [
        {
          title: "Procedural vs. OOP — Where the Data Lives",
          explain: {
            text: `In <strong>procedural</strong> programming, data and behavior are kept separate. Data sits out in the open — a struct's fields, for example — and any function can reach in and change it directly.<br><br>In <strong>object-oriented</strong> programming, data and behavior are bundled together into a class, and the data is typically hidden (made <code>private</code>). The only way to change it from outside is through the object's own public methods. The real test isn't whether code is written using <code>class</code> syntax — it's whether outside code can still reach in and modify the data directly. If it can, it's procedural code wearing a class costume.`,
            analogy: "Procedural is ingredients left out on a shared counter — anyone can grab them. OOP is a sealed lunchbox — you can't reach in, you have to ask the owner to make you a sandwich."
          },
          example: {
            label: "Same Outcome, Different Rules",
            steps: [
              `<strong>Procedural (struct):</strong> <code>struct Order { int total; };</code> then <code>o.total = 50;</code> — reached in directly.`,
              `<strong>OOP (class):</strong> <code>class Order { private: int total; public: void setTotal(int t){ total = t; } };</code> then <code>o.setTotal(50);</code> — <code>o.total = 50;</code> would fail to compile.`
            ]
          },
          quiz: {
            question: "What is the actual test for whether code is genuinely object-oriented rather than procedural code using class syntax?",
            options: [
              "Whether the keyword 'class' appears anywhere in the file",
              "Whether outside code can directly modify the object's data, or must go through a method",
              "Whether the program uses more than one file",
              "Whether the data is stored as an integer or a string"
            ],
            correct: 1,
            explanation: "If outside code can still reach in and change data directly, the object is procedural in disguise — regardless of whether 'class' was used."
          }
        },
        {
          title: "Abstraction & Encapsulation",
          explain: {
            text: `<strong>Abstraction</strong> means showing what something does without showing how it does it. You call <code>car.start()</code> without needing to know how the engine ignites.<br><br><strong>Encapsulation</strong> means hiding an object's internal data behind private access, so it can only be reached through public methods (getters and setters). Note: the data isn't inaccessible — code <em>inside</em> the class can still use it freely. Only <em>external</em> code is blocked without a public method.`,
            analogy: "Abstraction is a steering wheel — you know what turning it does, not how the mechanism works. Encapsulation is a locked hood — you can't reach in and pull a wire from outside."
          },
          example: {
            label: "Encapsulation in C++",
            steps: [
              `<code>class Car { private: int fuel; public: void refuel(int amount){ fuel += amount; } };</code>`,
              `Inside the class, <code>fuel</code> is used freely — for example inside <code>refuel()</code>.`,
              `Outside the class, <code>Car c; c.fuel = 100;</code> fails to compile — external code must call <code>c.refuel(100);</code> instead.`
            ]
          },
          quiz: {
            question: "If a class member is marked 'private', what is actually restricted?",
            options: [
              "The data can never be used by anything, including the class itself",
              "The data can be freely used inside the class, but external code needs a public method to reach it",
              "The data becomes read-only everywhere",
              "The class can no longer be inherited from"
            ],
            correct: 1,
            explanation: "Private only blocks access from outside the class. Methods defined inside the class can read and modify private data directly."
          }
        },
        {
          title: "Inheritance & Polymorphism",
          explain: {
            text: `<strong>Inheritance</strong> lets one class (the child) automatically receive the methods and data of another class (the parent), and then add or override behavior. <strong>Polymorphism</strong> means the same method call produces different behavior depending on which object receives it.<br><br>Together, they let you write code once in a parent class and specialize it in children, while still calling the same method name on any of them and getting the right behavior for that specific object.`,
            analogy: "Inheritance: a SportsCar is a Car — it gets everything Car has for free, then adds a turbo. Polymorphism: you say 'start()' to a car, a boat, or a plane — same word, three different behaviors, and the caller doesn't need to know which one it is."
          },
          example: {
            label: "Inheritance and Polymorphism in C++",
            steps: [
              `<code>class Car { public: void start(){ cout << "vroom"; } };</code>`,
              `<code>class SportsCar : public Car { public: void turbo(){ cout << "boost"; } };</code> — SportsCar inherits <code>start()</code> for free.`,
              `<code>Car c; SportsCar s; c.start(); s.start();</code> — the same call, <code>start()</code>, works on both, potentially with different behavior if SportsCar overrides it. That's polymorphism.`
            ]
          },
          quiz: {
            question: "A SportsCar class inherits from Car and gets the start() method without writing it again. What pillar does this demonstrate?",
            options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
            correct: 2,
            explanation: "Inheritance is the mechanism where a child class automatically receives a parent class's methods and data."
          }
        }
      ],
      examQuestions: [
        {
          question: "What is the core difference between procedural and object-oriented programming?",
          options: [
            "OOP is always faster than procedural code",
            "Procedural code keeps data and behavior separate; OOP bundles them together and typically hides the data",
            "Procedural programming cannot use functions",
            "OOP does not allow the use of loops"
          ],
          correct: 1
        },
        {
          question: "Which of the four pillars refers to hiding an object's internal data behind private access?",
          options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
          correct: 1
        },
        {
          question: "Which of the four pillars allows the same method call to produce different behavior depending on the object receiving it?",
          options: ["Abstraction", "Encapsulation", "Inheritance", "Polymorphism"],
          correct: 3
        },
        {
          question: "In C++, if a class member is public rather than private, what happens?",
          options: [
            "It can no longer be used inside the class",
            "External code can access and modify it directly, bypassing any methods",
            "It automatically becomes a function",
            "The class can no longer be inherited"
          ],
          correct: 1
        },
        {
          question: "A class that reuses another class's methods by extending it demonstrates which pillar?",
          options: ["Encapsulation", "Abstraction", "Inheritance", "Polymorphism"],
          correct: 2
        }
      ]
    },
    {
      id: "functional-programming",
      title: "Functional Programming",
      desc: "Pure functions, forced recursion, and effects at the edges.",
      icon: "🌀",
      chunks: [
        {
          title: "Pure Functions",
          explain: {
            text: `A <strong>pure function</strong> is sealed in both directions: it cannot modify anything outside its own scope, and it cannot be affected by anything outside its own scope. Given the same input, it always produces the same output — no exceptions, no hidden state.<br><br>This is fundamentally different from a method in OOP that might read or change an object's internal fields, or a procedural function that modifies a global variable.`,
            analogy: "A pure function is a vending machine: put in the same amount of money and press the same button, and you always get the exact same snack. It never remembers your last purchase, and it never restocks itself based on something happening across the room."
          },
          example: {
            label: "Pure vs. Impure in C++",
            steps: [
              `<strong>Pure:</strong> <code>int square(int n) { return n * n; }</code> — only uses its input, only returns a value, touches nothing else.`,
              `<strong>Impure:</strong> <code>int counter = 0; int increment() { return ++counter; }</code> — modifies a variable outside its own scope. Calling it twice gives two different results for the same "input" (none).`
            ]
          },
          quiz: {
            question: "What defines a pure function?",
            options: [
              "It must be written in fewer than 10 lines",
              "It cannot modify anything outside its own scope, and produces the same output for the same input every time",
              "It must return a boolean value",
              "It can only be called once per program"
            ],
            correct: 1,
            explanation: "Purity means total isolation: no reaching out to change external state, and no being changed by external state."
          }
        },
        {
          title: "Why Recursion Is Forced, Not Preferred",
          explain: {
            text: `Functional programming has no <code>for</code> or <code>while</code> loops — and this isn't a stylistic choice. A loop requires a counter variable that <strong>mutates</strong> (like <code>i++</code>), and mutation is exactly what pure functions forbid. Ban mutation, and a loop becomes structurally impossible.<br><br>Recursion is the only mechanism left for repeating an action: the function calls itself with a smaller version of the problem, passing a fresh value each time, until it reaches a stopping point. Nothing ever gets reassigned — a new value is simply handed down at each call.`,
            analogy: "A loop is refilling the same cup ten times. Recursion is passing ten different cups down a line of people, one at a time, and each person only ever holds their own cup."
          },
          example: {
            label: "Loop vs. Recursion in C++",
            steps: [
              `<strong>Loop (mutates a counter):</strong> <code>int sum = 0; for (int i = 1; i <= 10; i++) { sum += i; }</code> — <code>sum</code> changes 10 times.`,
              `<strong>Recursion (nothing mutates):</strong> <code>int sum(int n) { return n == 0 ? 0 : n + sum(n - 1); }</code> — each call gets its own fresh <code>n</code>, and nothing is ever reassigned.`
            ]
          },
          quiz: {
            question: "Why does functional programming rely on recursion instead of standard for/while loops?",
            options: [
              "Recursion runs faster than loops in every case",
              "Standard loops require a mutating counter variable, and mutation is forbidden in pure functional code — recursion is the only repetition mechanism left",
              "Loops were never invented for functional languages",
              "Recursion uses less memory than loops"
            ],
            correct: 1,
            explanation: "A for-loop's counter (like i++) mutates with each pass — exactly what purity forbids. Recursion repeats without ever reassigning a variable."
          }
        },
        {
          title: "Effects at the Edges",
          explain: {
            text: `A real question follows from purity: if a function can't touch anything outside itself, how does a program ever print to a screen, save a file, or read user input? Those are all changes to the outside world.<br><br>The answer: <strong>push the effects to the edges</strong>. The core of the program stays pure — all logic, calculations, and decisions. A thin <strong>impure shell</strong> at the boundary handles the actual touching of the world. This is sometimes called "functional core, imperative shell." Purity is a property of the inside of a program, not a requirement for the whole thing.`,
            analogy: "In Unreal Engine Blueprints, pure nodes have no execution wire — they only calculate outputs from inputs. Impure nodes carry the execution pin, and those are the ones that actually change something (spawn, destroy, set a variable). The execution wire is the imperative shell; the pure nodes are the functional core."
          },
          example: {
            label: "Core and Shell",
            steps: [
              `<strong>Pure core:</strong> <code>int calculateTotal(int a, int b) { return a + b; }</code> — just computes.`,
              `<strong>Impure shell:</strong> <code>int total = calculateTotal(5, 10); std::cout << total;</code> — the printing step is the only impure part, and it's isolated to a single line at the boundary.`
            ]
          },
          quiz: {
            question: "How does a functional program interact with the real world (printing, saving files) if pure functions can't cause side effects?",
            options: [
              "It can't — functional programs are incapable of any output",
              "Effects are pushed to a thin impure shell at the boundary, while the core logic stays pure",
              "Every function is automatically made impure",
              "It relies entirely on global variables"
            ],
            correct: 1,
            explanation: "The 'functional core, imperative shell' pattern keeps computation pure while isolating necessary side effects to a small boundary layer."
          }
        }
      ],
      examQuestions: [
        {
          question: "What must be true for a function to be considered 'pure'?",
          options: [
            "It uses recursion",
            "Same input always produces same output, with no effect on or from anything outside its scope",
            "It must return an integer",
            "It must be a member of a class"
          ],
          correct: 1
        },
        {
          question: "Why can't functional programming languages rely on standard for-loops?",
          options: [
            "For-loops are too slow",
            "A for-loop's counter variable mutates on every iteration, which pure functions forbid",
            "For-loops don't exist in any programming language",
            "For-loops can only count downward"
          ],
          correct: 1
        },
        {
          question: "What does 'functional core, imperative shell' describe?",
          options: [
            "A program with no functions at all",
            "Keeping the core logic pure while isolating necessary side effects to a thin boundary layer",
            "A rule that all shells must be written in C",
            "A type of infinite loop"
          ],
          correct: 1
        },
        {
          question: "In the analogy of Unreal Engine Blueprints, what does the execution wire represent?",
          options: [
            "The pure functional core",
            "The imperative shell — the part that actually changes the world",
            "A syntax error",
            "A type of variable"
          ],
          correct: 1
        },
        {
          question: "Which of these is an example of an impure function?",
          options: [
            "int square(int n) { return n * n; }",
            "int addTwo(int a, int b) { return a + b; }",
            "int counter = 0; int increment() { return ++counter; }",
            "bool isEven(int n) { return n % 2 == 0; }"
          ],
          correct: 2
        }
      ]
    },
    {
      id: "problem-analysis-design",
      title: "Problem Analysis & Design",
      desc: "The requirement specification, iteration, and why waterfall struggles.",
      icon: "📐",
      chunks: [
        {
          title: "The Requirement Specification — The Hinge",
          explain: {
            text: `Software engineering's stated objective is to produce a system built in accordance with a <strong>requirement specification</strong> — on time and within budget. That specification is the written answer to "what is this thing supposed to do," produced during analysis, before anything is built.<br><br>Everything downstream is measured against it. Design is the specification translated into structure — not guesswork. Get the specification wrong, and every later phase will execute the wrong thing correctly.`,
            analogy: "The requirement specification is a blueprint for a house. The builders (design and construction) can execute flawlessly, but if the blueprint itself has the plumbing in the wrong room, flawless execution just builds a flawless mistake."
          },
          example: {
            label: "Where the Spec Comes From, and What It Feeds",
            steps: [
              "Analysis gathers what the software must do, and for whom.",
              "The output is a written requirement specification.",
              "Design translates that specification into architecture, modules, and interfaces.",
              "Testing later checks the finished product directly against that same specification."
            ]
          },
          quiz: {
            question: "Why is problem analysis considered critical to the rest of the software development process?",
            options: [
              "It is the only phase that involves writing code",
              "It produces the requirement specification, which every later phase — including design and testing — is measured against",
              "It is the shortest and least important phase",
              "It replaces the need for testing"
            ],
            correct: 1,
            explanation: "The requirement specification produced during analysis is the reference point design translates into structure and testing later validates against."
          }
        },
        {
          title: "Constraints, Traceability, and Efficiency",
          explain: {
            text: `Good analysis gathers more than just features — it gathers <strong>constraints</strong>: target hardware, the operating system, the deploying organization, and critically, the <strong>end-user's skill level</strong>. User qualification is a design input, not an afterthought — software built for experts and software built for beginners are genuinely different products.<br><br><strong>Traceability</strong> means every component in the finished system can be traced back to a specific requirement. Combined with predictable task sizing, this ensures nothing gets built that nobody actually asked for — which is where <strong>efficiency</strong> comes from.`,
            analogy: "Traceability is like a receipt for every brick in a building — you can point to any wall and say exactly which requirement justified it. Nothing gets built 'just in case.'"
          },
          example: {
            label: "Constraints Shaping a Real Decision",
            steps: [
              "A finance app for professional accountants can expose dense tables and keyboard shortcuts.",
              "The same app built for first-time budgeters needs guided steps and plain language instead.",
              "Same feature set, same requirement — different design, because end-user skill level was gathered during analysis."
            ]
          },
          quiz: {
            question: "Why does the end-user's skill level matter during the analysis phase?",
            options: [
              "It doesn't — user skill is only relevant after the software ships",
              "It is a design constraint gathered during analysis; software for experts and for beginners requires genuinely different design decisions",
              "It only affects the marketing of the finished product",
              "It determines which programming language must be used"
            ],
            correct: 1,
            explanation: "User qualification, gathered during analysis, directly shapes design choices — it's a constraint like hardware or OS, not something added later."
          }
        },
        {
          title: "Iteration, Waterfall, and Testing the Right Thing",
          explain: {
            text: `Modern development tends to run <strong>iteratively</strong> rather than in one long linear pass — shipping the highest-priority functions first, because team resources are always limited. If a team runs out of time or budget mid-project, what already exists is the part that mattered most.<br><br>The <strong>waterfall model</strong> (Benington, 1956) executes phases linearly: all analysis, then all design, then all building. Its well-known flaw is inflexibility — it has no cheap way to go back once building has started. That flaw shows up precisely when analysis was incomplete. Iterative development is, in a sense, an admission that analysis is never fully finished in a single pass.<br><br>Finally, integration testing checks the finished product directly against the requirements — asking not just "does it run," but <strong>"did we build the right thing."</strong> That question is only answerable because a specification exists to check against.`,
            analogy: "Waterfall is pouring a house's entire foundation before checking if the blueprint was right. Iteration is building one room, checking it against what the family actually needs, and adjusting before pouring the next foundation."
          },
          example: {
            label: "Why Iteration Survives a Resource Shortage",
            steps: [
              "Highest-priority features are built and shipped first.",
              "If the team runs out of time, money, or people, work stops — but what already exists is the most valuable part.",
              "Under a linear waterfall model, running out of resources mid-project can leave nothing usable at all."
            ]
          },
          quiz: {
            question: "What is the well-known flaw of the waterfall model, and when does it actually surface?",
            options: [
              "It is too expensive to license — it surfaces during budgeting",
              "It is inflexible, with no cheap way to revise earlier work — this surfaces specifically when the initial analysis was incomplete",
              "It cannot be used for large software systems",
              "It requires more programmers than iterative development"
            ],
            correct: 1,
            explanation: "Waterfall's linear structure means going back to fix an early mistake is expensive — a cost that only becomes visible when analysis missed something."
          }
        }
      ],
      examQuestions: [
        {
          question: "What is the primary objective of software engineering, according to the requirement specification concept?",
          options: [
            "To write the maximum amount of code possible",
            "To produce a system built in accordance with a requirement specification, on time and within budget",
            "To avoid all forms of testing",
            "To use the newest programming language available"
          ],
          correct: 1
        },
        {
          question: "What does 'traceability' mean in the context of software design?",
          options: [
            "The ability to track a user's location",
            "Every component in the system can be traced back to a specific requirement it fulfills",
            "The software logs every keystroke",
            "The ability to trace a bug to a specific line number"
          ],
          correct: 1
        },
        {
          question: "Why does iterative development handle limited team resources better than a strict waterfall approach?",
          options: [
            "Iterative development requires no planning at all",
            "Shipping the highest-priority features first means that if resources run out, the most valuable part of the system still exists",
            "Iteration is always faster to code, regardless of priority",
            "Waterfall cannot be used by more than one developer"
          ],
          correct: 1
        },
        {
          question: "What is the primary flaw of the waterfall model?",
          options: [
            "It is too fast for large teams to manage",
            "It is inflexible — there is no cheap way to revise a decision once the linear process has moved on",
            "It cannot be documented",
            "It always produces buggy software"
          ],
          correct: 1
        },
        {
          question: "What question does integration testing against requirements actually answer?",
          options: [
            "Whether the code compiles without errors",
            "Whether the team followed the correct coding style",
            "Whether the product actually solves the need the stakeholders described — not just whether it runs",
            "How fast the software executes"
          ],
          correct: 2
        }
      ]
    },
    {
      id: "algorithm-design-sequencing-selection-iteration",
      title: "Algorithm Design: Sequencing, Selection & Iteration",
      desc: "Turning a real problem — like a monthly budget — into ordered steps, branches, and loops.",
      icon: "🔀",
      chunks: [
        {
          title: "Sequencing an Algorithm",
          explain: {
            text: `Before any code is written, an algorithm is a plain, ordered list of steps — a <strong>sequence</strong> — that solves a specific problem. Flowcharting makes this visible: each box is one instruction, connected by arrows showing the fixed order of execution.<br><br>Sequencing matters because later steps depend on values earlier steps produced. Skipping or reordering a step changes the result, which is exactly why algorithm design starts by writing the steps down in plain language before touching a single line of code.`,
            analogy: "A recipe: crack the eggs before you whisk them. Whisking first, when there's nothing in the bowl, is a sequencing error — the steps aren't interchangeable."
          },
          example: {
            label: "Sequencing a Budget Calculation",
            steps: [
              "Step 1: Prompt the user for monthly income.",
              "Step 2: Prompt the user for total fixed expenses (rent, utilities).",
              "Step 3: Prompt the user for variable expenses (groceries, entertainment).",
              "Step 4: Subtract expenses from income to get the remaining budget.",
              "Step 5: Display the result.",
              `In C++: <code>double income; std::cin >> income;</code> then <code>double fixed; std::cin >> fixed;</code> — reversing steps 1 and 2 would ask for expenses before income exists to subtract from.`
            ]
          },
          quiz: {
            question: "Why does the order of steps matter in a sequential algorithm?",
            options: [
              "It doesn't — any order produces the same result",
              "Later steps often depend on values that earlier steps produced, so reordering can break the logic",
              "Order only matters in object-oriented programming",
              "Order only matters if the program uses loops"
            ],
            correct: 1,
            explanation: "Sequencing is about dependency: a step that uses a value can only run correctly after the step that produces that value."
          }
        },
        {
          title: "Selection: Handling Different Scenarios",
          explain: {
            text: `Real problems rarely have just one path. <strong>Selection</strong> (<code>if</code>, <code>else if</code>, <code>else</code>) lets an algorithm branch based on a condition — evaluating something as true or false and choosing which block of code runs.<br><br>In a budget calculator, selection is what distinguishes "you're within budget" from "you've overspent" — the same calculation feeds two entirely different responses depending on the result.`,
            analogy: "A budget app is like a thermostat: it doesn't just report the temperature, it checks a condition (too hot? too cold?) and picks a different action for each case."
          },
          example: {
            label: "Selection in a Budget Calculator",
            steps: [
              `<code>double remaining = income - (fixed + variable);</code>`,
              `<code>if (remaining < 0) { std::cout << "Over budget by " << -remaining; }</code>`,
              `<code>else if (remaining == 0) { std::cout << "Exactly on budget."; }</code>`,
              `<code>else { std::cout << "Remaining budget: " << remaining; }</code>`,
              "Three possible outcomes from one calculation — selection decides which message the user actually sees."
            ]
          },
          quiz: {
            question: "In an algorithm, what determines which branch of a selection structure executes?",
            options: [
              "The order the branches are written in the source file",
              "Evaluating a condition as true or false",
              "The number of variables declared before it",
              "Whichever branch is listed first is always run"
            ],
            correct: 1,
            explanation: "Selection structures evaluate a condition; the branch whose condition is true (or the else branch, if none match) is the one that executes."
          }
        },
        {
          title: "Iteration: Handling an Unknown Number of Inputs",
          explain: {
            text: `A budget has an unknown number of variable expenses — groceries, entertainment, maybe more. Hardcoding one variable per expense would only work if the user always has exactly that many. <strong>Iteration</strong> solves this: a loop repeats the "ask for one more expense" step until the user signals there are no more, so the algorithm works whether there's one variable expense or twenty.<br><br>This is the same iteration you'd meet in structured programming, but here the emphasis is on <em>why</em> a loop is the correct tool: the number of repetitions isn't known in advance.`,
            analogy: "A loop for variable expenses is like a cashier scanning items until you say 'that's everything' — they don't ask in advance how many items you have."
          },
          example: {
            label: "Iterating Over Variable Expenses in C++",
            steps: [
              `<code>double variableTotal = 0; double expense; char more = 'y';</code>`,
              `<code>while (more == 'y') { std::cin >> expense; variableTotal += expense; std::cout << "Another? (y/n): "; std::cin >> more; }</code>`,
              "The loop condition — keep going while the user answers 'y' — is what lets the algorithm accept any number of variable expenses without the code changing."
            ]
          },
          quiz: {
            question: "Why is iteration the correct tool for collecting a user's variable expenses, rather than a fixed sequence of prompts?",
            options: [
              "Iteration runs faster than sequential code",
              "The number of variable expenses isn't known in advance, so a loop can repeat until the user signals they're done",
              "Sequential code cannot use variables",
              "Iteration is required by the C++ compiler for any user input"
            ],
            correct: 1,
            explanation: "A fixed sequence of prompts only works for a known, fixed number of inputs. A loop lets the algorithm handle however many expenses the user actually has."
          }
        }
      ],
      examQuestions: [
        {
          question: "What is a flowchart used for in algorithm design?",
          options: [
            "To compile the code faster",
            "To visually document the ordered sequence of steps an algorithm follows",
            "To replace the need for writing actual code",
            "To store variable values"
          ],
          correct: 1
        },
        {
          question: "In a budget calculator, which control structure decides whether to display 'over budget' or 'within budget'?",
          options: ["Sequence", "Selection", "Iteration", "Recursion"],
          correct: 1
        },
        {
          question: "Why would a loop (iteration) be necessary in a monthly budget algorithm?",
          options: [
            "To calculate income only",
            "Because the number of variable expenses the user has isn't known in advance",
            "Loops are required by every C++ program",
            "To make the program run in less memory"
          ],
          correct: 1
        },
        {
          question: "What happens if two sequential steps that depend on each other are reordered incorrectly?",
          options: [
            "Nothing — sequence order never affects results",
            "The algorithm may use a value before it has been created or calculated, producing an incorrect result",
            "The program automatically reorders them at runtime",
            "It only affects the program's execution speed"
          ],
          correct: 1
        },
        {
          question: "Which of the following best describes selection in an algorithm?",
          options: [
            "Repeating a block of instructions",
            "Executing instructions in a fixed, unconditional order",
            "Evaluating a condition and choosing which block of code to execute",
            "Calling a function from within another function"
          ],
          correct: 2
        }
      ]
    },
    {
      id: "debugging-logical-errors",
      title: "Debugging: Logical Errors",
      desc: "The bugs that compile, run, and quietly hand you the wrong answer.",
      icon: "🐞",
      chunks: [
        {
          title: "Syntax, Runtime, and Logical Errors",
          explain: {
            text: `<strong>Syntax errors</strong> break the language's grammar — a missing semicolon, an unmatched brace — and the compiler refuses to build the program at all. <strong>Runtime errors</strong> occur while the program is running — dividing by zero, accessing an array out of bounds — and typically crash the program with an error message.<br><br><strong>Logical errors</strong> are the dangerous category: the code is grammatically valid and runs to completion without crashing, but it computes the wrong answer. There is no error message, because as far as the compiler and the operating system are concerned, nothing went wrong.`,
            analogy: "Syntax error: a sentence with the words in impossible order — you can't even read it. Runtime error: a sentence that makes you choke while reading it aloud. Logical error: a sentence that reads perfectly smoothly and is confidently, completely wrong."
          },
          example: {
            label: "One Bug, Three Categories in C++",
            steps: [
              `<strong>Syntax error:</strong> <code>double remaining = income - fixed  // missing semicolon</code>`,
              `<strong>Runtime error:</strong> <code>double avg = total / count;</code> where <code>count</code> is 0 — division by zero.`,
              `<strong>Logical error:</strong> <code>double remaining = income + fixed + variable;</code> — compiles fine, runs fine, and silently adds expenses to income instead of subtracting them.`
            ]
          },
          quiz: {
            question: "What makes a logical error fundamentally different from a syntax or runtime error?",
            options: [
              "Logical errors are easier to find because the compiler flags them",
              "Logical errors produce no error message at all — the program runs and completes, but computes the wrong result",
              "Logical errors only occur in object-oriented code",
              "Logical errors always crash the program immediately"
            ],
            correct: 1,
            explanation: "Syntax and runtime errors announce themselves — a compile failure or a crash. Logical errors produce plausible-looking output that is simply incorrect, with nothing flagging it."
          }
        },
        {
          title: "Why Logical Errors Are Hard to Find",
          explain: {
            text: `A logical error hides precisely because the program appears to work. It compiles. It runs without crashing. It produces a number — and a number that looks like a reasonable budget is easy to mistake for a correct one, especially if you don't have an expected answer to compare against.<br><br>Finding one means shifting from "does it run" to "is this specific value right," which requires manually working out what the correct answer should have been, then comparing it to what the program actually produced.`,
            analogy: "A GPS confidently giving you the wrong directions is more dangerous than one that shows an error screen — you have no reason to doubt it until you're already lost."
          },
          example: {
            label: "A Budget Calculator With a Silent Logical Error",
            steps: [
              `Income: 3000. Fixed expenses: 1200. Variable expenses: 500.`,
              `Correct remaining budget: <code>3000 - 1200 - 500 = 1300</code>`,
              `Buggy code: <code>double remaining = income - fixed + variable;</code> (a <code>+</code> where a <code>-</code> belongs)`,
              `Buggy output: <code>3000 - 1200 + 500 = 2300</code> — a plausible-looking number, silently wrong by 1000.`
            ]
          },
          quiz: {
            question: "Why might a user not notice a logical error like the one in the budget calculator example?",
            options: [
              "The program would refuse to run at all",
              "The incorrect output (2300 instead of 1300) still looks like a reasonable number, with nothing signaling it's wrong",
              "Logical errors always print an explicit warning message",
              "The compiler catches all logical errors before the program runs"
            ],
            correct: 1,
            explanation: "Without knowing the expected answer in advance, a plausible-but-wrong number gives no indication anything is broken."
          }
        },
        {
          title: "Debugging Techniques & Tools",
          explain: {
            text: `Several techniques target logical errors specifically. <strong>Tracing (dry-running)</strong> means manually walking through the code line by line with real values, calculating what each variable should hold, and comparing that to what the program actually produces. <strong>Print statements</strong> (or <code>std::cout</code> in C++) let you inspect a variable's value at a specific point without stopping the program. A <strong>breakpoint/step-through debugger</strong> pauses execution at a chosen line and lets you inspect every variable's current value directly. <strong>Rubber duck debugging</strong> means explaining the code line by line, out loud, to something (or someone) that can't answer back — the act of articulating each step often surfaces the exact line where your explanation stops matching what the code actually does.`,
            analogy: "Tracing is redoing the math by hand. A debugger is a security camera that lets you pause the tape at any frame. Rubber duck debugging is explaining a magic trick to someone slowly enough that you catch your own sleight of hand."
          },
          example: {
            label: "Finding the Budget Bug Step by Step",
            steps: [
              `1) Trace by hand: expected remaining = 1300, but output showed 2300.`,
              `2) Add a print statement right before the calculation: <code>std::cout << "income=" << income << " fixed=" << fixed << " variable=" << variable;</code> — confirms the inputs themselves are correct.`,
              `3) Since inputs are right but output is wrong, the bug must be in the calculation line itself — inspect it directly: <code>double remaining = income - fixed + variable;</code>`,
              `4) Spot the <code>+</code> that should be a <code>-</code>, fix it to <code>income - fixed - variable</code>, and re-run to confirm 1300 now appears.`
            ]
          },
          quiz: {
            question: "What is the purpose of tracing (dry-running) code as a debugging technique?",
            options: [
              "To automatically fix syntax errors",
              "To manually calculate what each variable should hold at each step, then compare it against the program's actual output",
              "To delete lines of code until the bug disappears",
              "To speed up the program's execution"
            ],
            correct: 1,
            explanation: "Tracing surfaces the exact point where the program's actual behavior diverges from the expected behavior, by working through the logic by hand."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which type of error compiles successfully, runs without crashing, but produces an incorrect result?",
          options: ["Syntax error", "Runtime error", "Logical error", "Linker error"],
          correct: 2
        },
        {
          question: "Why are logical errors generally harder to identify than syntax errors?",
          options: [
            "Logical errors are always longer pieces of code",
            "The compiler and program give no indication anything is wrong — the output simply looks plausible but is incorrect",
            "Logical errors only happen in loops",
            "Logical errors are actually easier, not harder, to find"
          ],
          correct: 1
        },
        {
          question: "In the budget calculator example, what was the actual bug?",
          options: [
            "A missing semicolon",
            "Dividing by zero",
            "A '+' operator used where a '-' operator was needed, silently adding an expense instead of subtracting it",
            "The program crashed on startup"
          ],
          correct: 2
        },
        {
          question: "What does a breakpoint/step-through debugger allow a programmer to do?",
          options: [
            "Automatically rewrite buggy code",
            "Pause execution at a specific line and inspect the current value of every variable",
            "Prevent the program from ever crashing",
            "Compile the program faster"
          ],
          correct: 1
        },
        {
          question: "What is the core idea behind 'rubber duck debugging'?",
          options: [
            "Testing code exclusively with rubber duck-shaped test data",
            "Explaining the code's logic out loud, step by step, which often surfaces the point where the explanation stops matching the actual code",
            "Using a physical device to detect syntax errors",
            "A technique that only works for object-oriented programs"
          ],
          correct: 1
        }
      ]
    }
  ]
};
