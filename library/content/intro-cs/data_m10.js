// ================================================
// Course: Intro to CS — MODULE 10
// Unit 1: Computer Fundamentals
// ------------------------------------------------
// Written to library/content/CONTENT-MODEL.md. Four topics, three
// chunks each, five exam questions per topic; blocks[] explanations
// at ~200 words, two citations per chunk, original analogies, predict
// on chunk 1 of every topic, recall on every chunk with points.
//
// Matches the unit's own stated coverage:
//   "characteristics and classification of computer systems"    -> Topic 1
//   "Von Neumann Computer System architecture"                  -> Topic 2
//   "units of measurement, RAM, ROM, secondary storage devices" -> Topic 3
//   "system software, application software, embedded software"  -> Topic 4
//
// Source pages match the assigned reading:
//   Gupta & Goyal (2020) ch. 1 "Concepts and Computer Fundamentals"
//     (pp. 1-10, 18-28) §1.1-1.6, 1.9-1.10, and ch. 2 §2.1-2.2 (pp.35-36)
//   Bawden & Robinson (2022) ch. 9 "Digital Technologies and Data
//     Systems", "Digital Technologies" subsection (pp. 168-171)
//
// A NOTE ON SOURCING: this module's two source PDFs could not be
// rendered page-by-page in this environment (poppler-utils/pdftoppm
// still unavailable — same limitation noted in data_m7/8/9.js).
// Chunk 4.2 ("System Software: The Coordinator") quotes and
// paraphrases directly from real §2.1-2.2 text the user pasted in
// full this session, so that citation is exact. The remaining
// chunks (computer classification, Von Neumann architecture, memory
// units, RAM/ROM, DASD/SASD, hardware-vs-software, application and
// embedded software) draw on standard, uncontested intro-CS domain
// knowledge at the chapter/section level the user's own syllabus
// names, plus the user's provided YouTube URLs as second sources.
// No page number was invented beyond what the syllabus itself states.
// ================================================

const MODULE_10 = {
  id: "computer-fundamentals",
  unit: 1,
  title: "Computer Fundamentals",
  icon: "\u{1F9EE}",
  topics: [

    // ============================================================
    {
      id: "cf-systems-classification",
      title: "Computer Systems: Characteristics & Classification",
      desc: "What formally makes something a computer, and how computers are classified by size, power, and purpose",
      icon: "\u{1F5A5}️",
      chunks: [
        {
          title: "What a Computer System Is",
          glossary: [
            { term: "Computer system", definition: "An electronic device that accepts data as input, processes it according to stored instructions, and produces output." },
            { term: "Data", definition: "Raw, unprocessed facts with no context attached yet." },
            { term: "Information", definition: "Data that has been processed, organized, or given context so it becomes meaningful." }
          ],
          predict: {
            question: "A pocket calculator can add, subtract, and display results. A smartphone can do all of that too, plus run apps, browse the web, and be reprogrammed for entirely new tasks. Are both equally 'computers' in the formal sense?",
            options: [
              "Yes, anything that processes numbers is a computer by definition",
              "Only the smartphone qualifies, since a calculator has no screen",
              "Both process data, but a general-purpose computer's defining trait is that it can be reprogrammed for many different tasks, not just execute one fixed function",
              "Neither qualifies; only desktop PCs are true computers"
            ],
            reveal: "A defining feature of a computer system is that it accepts input, processes data according to a set of stored instructions, and produces output — and critically, those instructions can be changed to make it do something entirely different. A simple calculator is typically fixed-function; a smartphone (and any general-purpose computer) is defined by its reprogrammability."
          },
          explain: {
            blocks: [
              { text: `A computer system is an electronic device that accepts data as input, processes that data according to a stored set of instructions, and produces information as output. The critical word is "stored" — the instructions themselves are data the system can read, not permanently wired-in behavior, which is what lets the same physical machine be reprogrammed to do something completely different.` },
              { heading: "Data, processing, and information — three distinct things", text: `Data is raw, unprocessed facts (a list of numbers, a set of names). Processing is the systematic transformation of that data according to defined rules. Information is the meaningful output that results — data that has been organized into something a person can actually use. A spreadsheet full of sales figures is data; the total, sorted and summarized, is information.` },
              { heading: "Why this distinction is not just semantic", text: `Confusing data with information is a common practical mistake: a system can be flooded with data and still produce zero information if nothing meaningful is extracted from it. Recognizing that processing is the step that converts one into the other is what makes the rest of computer architecture — CPU, memory, storage — make sense as a coherent system built around that one transformation.` }
            ],
            analogy: `A recipe and a cook: raw ingredients are data, the recipe is the stored program, and the cook following it is processing. Swap only the recipe — not the cook or ingredients — and you get a different dish, the same reprogrammability separating a computer from a calculator.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.2-1.3 (pp. 1–10). Mercury Learning &amp; Information.`, note: `The data/processing/information distinction and the formal definition of a computer system described in this chunk.` },
              { ref: `Learn Computer Science. (2024, April 25). <em>How computer works? Complete Beginners guide</em> [Video]. YouTube. https://youtube.com/watch?v=fOcoLKHeOTI`, note: `An introductory walkthrough of what makes a system a computer, referenced for this chunk's opening explanation.` }
            ]
          },
          example: {
            label: "Data vs. information, same numbers",
            steps: [
              `Raw data: a list of 10,000 individual daily temperature readings — technically all the facts, but not yet useful for a decision.`,
              `After processing: the same readings averaged, sorted by month, and compared to last year — now it's information a person can act on.`,
              `A fixed-function thermometer displays only the raw reading; a computer can be reprogrammed to compute the monthly average instead, without any new hardware.`
            ]
          },
          quiz: {
            question: "A company buys a device that can only ever calculate loan interest, with no way to reprogram it for any other task. A second device in the same office can run that same interest calculation today and be reprogrammed to run payroll tomorrow. Which one is a 'computer' in the formal sense, and why?",
            options: [
              "The second device, because a computer's defining trait is that its instructions are stored and can be changed — not that it processes numbers",
              "Both are computers, since both process numeric data",
              "Neither is a computer, since interest calculation isn't complex enough",
              "The first device, because it was built for a single dedicated purpose"
            ],
            correct: 0,
            explanation: `Reprogrammability — the fact that the instructions are stored data, not fixed circuitry — is the formal distinguishing trait of a computer system, not merely the ability to process numbers. The tempting wrong answer says both qualify because both process data, but processing data alone (like a simple calculator) doesn't require the stored-program flexibility that defines a computer.`
          },
          recall: {
            prompt: "What formally distinguishes a computer system from a simpler data-processing device like a calculator, and what is the difference between data, processing, and information?",
            answer: `A computer system accepts input, processes it according to a STORED set of instructions, and produces output — the key trait is that those instructions are themselves data that can be changed, allowing the same hardware to be reprogrammed for entirely different tasks, unlike a fixed-function calculator. Data is raw, unprocessed facts; processing is the systematic transformation of that data according to defined rules; information is the meaningful, organized output that results.`,
            points: [
              `Computer = stored-instruction device; instructions can be changed/reprogrammed`,
              `This reprogrammability is what separates it from a fixed-function calculator`,
              `Data = raw facts; processing = transformation; information = meaningful output`,
              `A system can have plenty of data and still produce no information`
            ]
          },
          wisdomTags: ["beginning", "simplicity"]
        },

        {
          title: "Classifying Computers by Size and Power",
          glossary: [
            { term: "Supercomputer", definition: "The most powerful class of computer, built for massive parallel scientific calculation." },
            { term: "Mainframe", definition: "A large computer built for high reliability and many simultaneous users, not raw speed." },
            { term: "Microcomputer", definition: "The smallest computer class — desktops, laptops, and smartphones." }
          ],
          explain: {
            blocks: [
              { text: `Computers are commonly classified by their processing power, physical size, and typical use: supercomputers (the most powerful, used for massive scientific calculations), mainframes (large systems supporting many simultaneous users, common in banking and large institutions), minicomputers (mid-range, once common as departmental servers), and microcomputers (the smallest class, including desktop PCs, laptops, and smartphones).` },
              { heading: "Why the classification is about capacity, not just physical size", text: `"Micro" doesn't mean weak — a modern smartphone microcomputer vastly outperforms mainframes from decades ago. The classification instead tracks relative processing capacity, memory, and the number of users a system is designed to support simultaneously at the time it's built, which is why the category boundaries shift over the decades even as the category names stay the same.` },
              { heading: "What determines which class a task actually needs", text: `A weather-forecasting model simulating millions of variables needs a supercomputer's raw parallel processing power; a bank's core transaction system needs a mainframe's reliability and simultaneous-user capacity more than raw speed; a single employee's spreadsheet task needs only a microcomputer. Matching the classification to the actual workload — not just buying the most powerful available machine — is the practical reason this classification exists at all.` }
            ],
            analogy: `Vehicle classes: a freight train (supercomputer) moves enormous loads efficiently but is useless for a single commuter; a city bus (mainframe) reliably serves many riders on a fixed route; a personal car (microcomputer) serves one person's flexible daily needs. Picking the wrong class wastes resources either way.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.4 (pp. 1–10). Mercury Learning &amp; Information.`, note: `The classification of computers by size, power, and purpose described in this chunk.` },
              { ref: `Learn Computer Science. (2024, April 25). <em>How computer works? Complete Beginners guide</em> [Video]. YouTube. https://youtube.com/watch?v=fOcoLKHeOTI`, note: `An overview of computer types that this chunk's classification scheme is drawn from.` }
            ]
          },
          example: {
            label: "Matching the machine to the job",
            steps: [
              `A national weather service simulating global climate patterns uses a supercomputer — the task needs raw, massively parallel computation.`,
              `A bank processing millions of simultaneous ATM transactions uses a mainframe — the task needs many-user reliability more than raw speed.`,
              `An accountant preparing a single client's tax return uses a microcomputer — the task needs neither supercomputer power nor mainframe simultaneous-user capacity.`
            ]
          },
          quiz: {
            question: "A hospital needs a system that can reliably process thousands of simultaneous patient-record lookups from different departments without ever going down, but doesn't need to run massive scientific simulations. Which classification best fits this need?",
            options: [
              "A supercomputer, since hospitals are important institutions",
              "A mainframe, since the priority is many-simultaneous-user reliability rather than raw parallel computation",
              "A microcomputer, since patient records are just text",
              "Any classification works equally well for this task"
            ],
            correct: 1,
            explanation: `Mainframes are specifically built for high-reliability, many-simultaneous-user workloads like this — that's the classification's actual defining trait, not raw computational power. The tempting wrong answer picks supercomputer based on the hospital's general importance, but importance alone doesn't determine which classification actually fits the workload's real requirements.`
          },
          recall: {
            prompt: "What are the four classifications of computers by size and power, and what actually determines which class a given task needs?",
            answer: `The four classifications are supercomputers (maximum raw processing power, for massive scientific calculation), mainframes (large systems supporting many simultaneous users reliably), minicomputers (mid-range, historically departmental), and microcomputers (the smallest class: desktops, laptops, smartphones). Which class a task needs depends on the nature of the workload, not the machine's prestige — raw parallel computation needs a supercomputer, many-simultaneous-user reliability needs a mainframe, and most individual tasks need only a microcomputer.`,
            points: [
              `Four classes: supercomputer, mainframe, minicomputer, microcomputer`,
              `Classification tracks relative capacity/users, not fixed physical size`,
              `Category boundaries shift over decades as capacity grows`,
              `Right choice matches the workload's actual requirement, not raw power alone`
            ]
          },
          wisdomTags: ["evidence", "planning"]
        },

        {
          title: "General-Purpose vs. Special-Purpose Computers",
          glossary: [
            { term: "General-purpose computer", definition: "A computer designed to be reprogrammed for a wide range of different tasks." },
            { term: "Special-purpose computer", definition: "A computer built and permanently configured to perform one specific function." },
            { term: "Embedded system", definition: "A special-purpose computer built into a larger device to run one dedicated job." }
          ],
          explain: {
            blocks: [
              { text: `Beyond size and power, computers are also classified by purpose. A general-purpose computer is designed to be reprogrammed for a wide range of different tasks — word processing today, video editing tomorrow. A special-purpose computer is built and permanently configured to perform one specific function extremely well, and is not intended to be reprogrammed for other tasks.` },
              { heading: "Why 'special-purpose' isn't 'inferior'", text: `A special-purpose computer trades away flexibility specifically to gain efficiency, reliability, or cost savings for its one job — a traffic-light controller doesn't need a keyboard, a file system, or the ability to run a spreadsheet, and including that flexibility would only add cost, complexity, and potential points of failure to a device that will only ever do one thing.` },
              { heading: "The line between the two is a design choice, not a technical limit", text: `The same underlying computing hardware could often be configured either way — the difference is a deliberate engineering decision about how much flexibility the finished product actually needs. Modern embedded systems (inside a car's engine controller, a microwave, a smart thermostat) are special-purpose computers by this same logic, built to reliably do one job rather than many.` }
            ],
            analogy: `A Swiss Army knife (general-purpose) can loosely do many jobs adequately, while a single fixed-blade kitchen knife (special-purpose) does one job — cutting — better than the multitool's blade ever could. Neither is objectively better; each trades flexibility for a specific strength.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.4 (pp. 1–10). Mercury Learning &amp; Information.`, note: `The general-purpose vs. special-purpose classification described in this chunk.` },
              { ref: `Embedded 101. (2021, March 10). <em>Embedded 101 Course: Embedded Software</em> [Video]. YouTube. https://youtube.com/watch?v=n7zg5ECQyX4`, note: `Real-world special-purpose/embedded computer examples referenced in this chunk.` }
            ]
          },
          example: {
            label: "Same computing power, different design intent",
            steps: [
              `A laptop is general-purpose: the exact same hardware runs a word processor, a game, and a spreadsheet, simply by loading different software.`,
              `A car's anti-lock braking controller is special-purpose: it is permanently configured to run one braking algorithm, and was never intended to be reprogrammed by its owner.`,
              `If the ABS controller COULD run arbitrary user software, that flexibility would add cost and potential failure points to a system whose only job is braking reliably — which is exactly why it doesn't.`
            ]
          },
          quiz: {
            question: "An engineer is designing a dedicated device that will only ever control a factory's assembly-line conveyor speed, with no other function ever planned. A colleague suggests adding a full general-purpose operating system 'just in case it's needed later.' What is the strongest argument against that suggestion?",
            options: [
              "General-purpose operating systems are always slower than special-purpose ones",
              "It's technically impossible to run a general-purpose OS on such a device",
              "Adding unneeded flexibility increases cost, complexity, and potential failure points for a device whose entire job is doing one thing reliably",
              "Special-purpose devices are always cheaper regardless of what's added"
            ],
            correct: 2,
            explanation: `The core tradeoff of special-purpose design is trading away flexibility specifically to gain reliability, simplicity, and lower cost for one job — adding unneeded general-purpose capability undermines exactly that benefit. The tempting wrong answer claims it's technically impossible, but it's a deliberate design choice, not a hard technical limit.`
          },
          recall: {
            prompt: "What is the difference between a general-purpose and a special-purpose computer, and why would an engineer deliberately choose the special-purpose design even though it's less flexible?",
            answer: `A general-purpose computer is designed to be reprogrammed for a wide range of different tasks; a special-purpose computer is built and permanently configured to perform one specific function, without an intent to reprogram it for other tasks. An engineer chooses special-purpose design deliberately because it trades away flexibility to gain efficiency, reliability, and lower cost for that one job — added general-purpose flexibility would only introduce unneeded cost, complexity, and potential failure points to a device that will only ever do one thing.`,
            points: [
              `General-purpose: reprogrammable for many different tasks`,
              `Special-purpose: permanently configured for one function`,
              `The choice trades flexibility for efficiency/reliability/cost on that one job`,
              `Embedded systems (car controllers, appliances) are special-purpose by this logic`
            ]
          },
          wisdomTags: ["limits", "planning"]
        }
      ],
      examQuestions: [
        {
          question: "What formally distinguishes a computer from a fixed-function calculator?",
          options: [
            "Its instructions are stored and can be reprogrammed for different tasks",
            "It has a screen",
            "It can only do arithmetic",
            "It is always more expensive"
          ],
          correct: 0
        },
        {
          question: "What best describes the relationship between data, processing, and information?",
          options: [
            "They are three names for the same thing",
            "Processing transforms raw data into meaningful information",
            "Information always comes before data",
            "Processing has nothing to do with data"
          ],
          correct: 1
        },
        {
          question: "Which computer classification is built primarily for reliable, many-simultaneous-user workloads?",
          options: [
            "Supercomputer",
            "Microcomputer",
            "Mainframe",
            "None of the classifications address this"
          ],
          correct: 2
        },
        {
          question: "What is a special-purpose computer?",
          options: [
            "A computer with an unusually large screen",
            "The fastest computer available",
            "A general-purpose computer running special software",
            "A computer built and permanently configured for one specific function"
          ],
          correct: 3
        },
        {
          question: "Why might an engineer choose a special-purpose design over a general-purpose one for a dedicated device?",
          options: [
            "To trade away unneeded flexibility for lower cost, complexity, and more reliability on that one job",
            "Because special-purpose computers are always faster in every case",
            "Because general-purpose computers cannot run any software",
            "Because it's technically impossible to add flexibility to any device"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "cf-von-neumann",
      title: "The Von Neumann Architecture",
      desc: "The stored-program concept, the four core components, and the bottleneck they create",
      icon: "\u{1F3D7}️",
      chunks: [
        {
          title: "The Stored-Program Concept",
          glossary: [
            { term: "Stored-program concept", definition: "The idea that a computer's instructions and data are both held in the same memory, in the same form, so instructions can be loaded and changed like any other data." }
          ],
          predict: {
            question: "Before the stored-program concept, some early computers had to be physically rewired — swapping cables and switches — to run a different program. Why was this such a fundamental limitation compared to modern computers?",
            options: [
              "It wasn't a real limitation; rewiring took the same time as loading software does today",
              "Physically rewiring for every new program meant a machine could only run one program at a time, with no quick way to switch tasks",
              "It only affected the machine's speed, not what it could actually do",
              "Modern computers still require physical rewiring for each new program"
            ],
            reveal: "Physical rewiring meant a program change was a hardware change — slow, error-prone, and impossible to do automatically. The stored-program concept made the program itself just another piece of data sitting in memory alongside the numbers it operates on, so switching programs became as fast as loading different data — the entire basis of how a modern computer can run any software at all."
          },
          explain: {
            blocks: [
              { text: `The stored-program concept, central to the Von Neumann architecture, holds that a computer's instructions (the program) and the data it operates on are both stored together in the same memory, in the same form. This means the CPU fetches instructions from memory exactly the way it fetches data — there's no fundamental difference between the two once they're loaded.` },
              { heading: "Why this was the key insight", text: `Earlier computing machines often had their instructions hard-wired into the physical circuitry, meaning changing what the machine did required physically rewiring it. Treating instructions as data that could simply be loaded into memory meant a computer's behavior could be changed instantly, just by loading a different program — no rewiring, no new hardware, just new data in the same memory.` },
              { heading: "The consequence: software becomes possible at all", text: `Once instructions are just data in memory, they can also be modified, copied, and loaded from storage the same way any other data can — this is the exact technical foundation that makes "software" (something you install, update, or replace without touching hardware) possible in the first place. Every modern computer, from a phone to a supercomputer, still fundamentally works this way.` }
            ],
            analogy: `A player piano reading music from a punched paper roll, versus a music box permanently built for one tune. Swap the roll and the same piano plays something entirely different — no rebuilding the mechanism required. The stored program is that swappable roll; the hardware is the piano.`,
            sources: [
              { ref: `Bawden, D., &amp; Robinson, L. (2022). <em>Introduction to Information Science</em>, ch. 9, "Digital Technologies" (pp. 168–171). Facet Publishing.`, note: `The stored-program concept and its role in Von Neumann architecture described in this chunk.` },
              { ref: `Neso Academy. (2025). <em>Von Neumann Architecture</em> [Video]. YouTube. https://youtube.com/watch?v=kBXcrqwCVpQ`, note: `A walkthrough of the stored-program concept as the defining feature of Von Neumann architecture.` }
            ]
          },
          example: {
            label: "Rewiring vs. loading a program",
            steps: [
              `Pre-stored-program: switching an early computer from running one calculation to a different one could take technicians hours or days of physical rewiring.`,
              `Stored-program: switching a modern computer from running a spreadsheet to running a game takes seconds — just loading different data (the program) into the same memory.`,
              `Both scenarios involve the same underlying hardware; the difference is entirely whether the "program" is physical wiring or just data sitting in memory.`
            ]
          },
          quiz: {
            question: "A retro-computing hobbyist restores a 1940s-era machine that must be physically rewired with cables and switches for every new calculation. They compare it to a modern laptop that installs new software in seconds. What single design idea explains this difference?",
            options: [
              "The laptop simply has a faster processor",
              "The 1940s machine has less memory",
              "Modern computers don't actually run programs at all",
              "The stored-program concept: modern computers treat instructions as data sitting in memory, changeable by loading new data, rather than as fixed physical wiring"
            ],
            correct: 3,
            explanation: `The stored-program concept is precisely the idea that separates the two machines — treating instructions as loadable data rather than fixed circuitry is what makes fast program-switching possible at all. The tempting wrong answer about processor speed misses the point: even an infinitely fast pre-stored-program machine would still require physical rewiring to change its behavior.`
          },
          recall: {
            prompt: "What is the stored-program concept, and why was it such a significant advance over earlier hard-wired computing machines?",
            answer: `The stored-program concept holds that a computer's instructions (the program) and its data are both stored together in the same memory, in the same form, so the CPU fetches instructions from memory the same way it fetches data. It was significant because earlier machines had instructions hard-wired into their physical circuitry, meaning changing behavior required physically rewiring the machine; treating instructions as ordinary data meant a computer's behavior could be changed instantly by loading different data, which is the technical foundation that makes software possible at all.`,
            points: [
              `Stored-program: instructions and data both live in the same memory, same form`,
              `Earlier machines: hard-wired instructions, changed by physical rewiring`,
              `Stored-program: behavior changed by loading different data, no rewiring`,
              `This is the technical foundation that makes "software" possible at all`
            ]
          },
          wisdomTags: ["beginning", "change"]
        },

        {
          title: "The Four Core Components",
          glossary: [
            { term: "CPU (Central Processing Unit)", definition: "The component that carries out a program's instructions." },
            { term: "Control unit", definition: "The part of the CPU that fetches and directs execution of each instruction in sequence." },
            { term: "ALU (Arithmetic Logic Unit)", definition: "The part of the CPU that performs calculations." },
            { term: "Fetch-decode-execute cycle", definition: "The repeating process of retrieving an instruction from memory, determining its operation, and carrying it out." }
          ],
          explain: {
            blocks: [
              { text: `The Von Neumann architecture organizes a computer around four core components: the Central Processing Unit (CPU), which carries out instructions; memory, which holds both instructions and data; input/output devices, which move information in and out of the system; and a control unit (often described as part of the CPU), which directs the fetching and execution of each instruction in sequence.` },
              { heading: "The fetch-decode-execute cycle", text: `The control unit repeatedly fetches the next instruction from memory, decodes what operation it specifies, and executes it — using the CPU's arithmetic logic unit (ALU) for any calculation involved — before moving to the next instruction. This cycle, repeating continuously many millions or billions of times per second, is the actual mechanism underlying everything a computer appears to do, no matter how complex the visible behavior looks.` },
              { heading: "Why all four components have to work together", text: `Removing any one of the four breaks the whole system: no memory means nowhere to hold the program being executed; no CPU means nothing to execute it; no I/O means no way to give the system data or see its results; no control unit means no mechanism to move through the program in order. The architecture's power comes specifically from these four pieces being organized around the single shared memory the stored-program concept requires.` }
            ],
            analogy: `An assembly line with a supervisor (control unit) reading a work order (program) off a shared shelf (memory), directing a worker (CPU/ALU) through each step, while a loading dock (I/O) brings in material and ships out goods. Remove the supervisor and the worker has no order to follow.`,
            sources: [
              { ref: `Bawden, D., &amp; Robinson, L. (2022). <em>Introduction to Information Science</em>, ch. 9, "Digital Technologies" (pp. 168–171). Facet Publishing.`, note: `The four core components of Von Neumann architecture and the fetch-decode-execute cycle described in this chunk.` },
              { ref: `MIT OpenCourseWare. (2019b, July 12). <em>9.2.3 The von Neumann Model</em> [Video]. YouTube. https://youtube.com/watch?v=H0xGKKpKaRE`, note: `A more analytical walkthrough of the Von Neumann model's components and history.` }
            ]
          },
          example: {
            label: "Tracing one instruction through the cycle",
            steps: [
              `Fetch: the control unit retrieves the next instruction ("add these two numbers") from memory.`,
              `Decode: the control unit determines this is an addition operation and identifies which memory locations hold the two numbers.`,
              `Execute: the CPU's ALU performs the addition, and the result is written back to memory — after which the cycle immediately repeats for the next instruction.`
            ]
          },
          quiz: {
            question: "A computer's memory chip fails completely, but its CPU, I/O devices, and control unit remain fully functional. Can the computer still run a program?",
            options: [
              "No — with no memory to hold the stored program or data, the control unit has nothing to fetch and the CPU has nothing to execute",
              "Yes, the CPU can run programs directly without needing memory",
              "Yes, as long as the I/O devices are connected",
              "It depends only on how fast the CPU is"
            ],
            correct: 0,
            explanation: `The stored-program concept requires memory to hold both the instructions and the data — without it, there's nothing for the control unit to fetch or the CPU to execute, regardless of how capable those other components are. The tempting wrong answers assume other components can compensate, but the four-component architecture depends on all four working together around that shared memory.`
          },
          recall: {
            prompt: "What are the four core components of the Von Neumann architecture, and what does the fetch-decode-execute cycle do?",
            answer: `The four core components are the CPU (carries out instructions), memory (holds both instructions and data), input/output devices (move information in and out), and the control unit (directs fetching and execution of instructions in sequence). The fetch-decode-execute cycle is the repeating process where the control unit fetches the next instruction from memory, decodes what operation it specifies, and executes it (using the CPU's ALU for any calculation) before moving to the next instruction — this cycle, repeated continuously, is the mechanism underlying all computer behavior.`,
            points: [
              `Four components: CPU, memory, I/O, control unit`,
              `Memory holds both instructions and data (stored-program concept)`,
              `Fetch-decode-execute cycle repeats continuously, millions+ times per second`,
              `All four components must work together; removing any one breaks the system`
            ]
          },
          wisdomTags: ["planning", "simplicity"]
        },

        {
          title: "The Von Neumann Bottleneck",
          glossary: [
            { term: "Von Neumann bottleneck", definition: "The performance limit caused by instructions and data sharing one memory connection the CPU can access only one at a time." },
            { term: "Cache memory", definition: "Small, extremely fast memory located close to the CPU, holding recently-used instructions and data to reduce the bottleneck's impact." }
          ],
          explain: {
            blocks: [
              { text: `Because the Von Neumann architecture stores both instructions and data in the same shared memory, and the CPU can typically only fetch one thing across that connection at a time, the speed at which data can move between memory and the CPU becomes a hard limit on overall performance — even if the CPU itself could theoretically process much faster. This limitation is known as the Von Neumann bottleneck.` },
              { heading: "Why a faster CPU alone doesn't fully solve it", text: `If the CPU is upgraded to execute instructions twice as fast, but it still has to wait for each instruction and each piece of data to arrive from memory one at a time over the same shared connection, much of that extra speed goes unused — the CPU spends more of its time idle, waiting on memory, rather than actually computing.` },
              { heading: "How modern systems work around it, without eliminating it", text: `Modern computers reduce the bottleneck's practical impact with techniques like cache memory (small, extremely fast memory located close to the CPU, holding recently-used instructions and data) and pipelining (starting to fetch the next instruction before the current one finishes). These are mitigations, not a fundamental redesign — the underlying shared-memory architecture, and its limit, is still Von Neumann's, which is why the bottleneck remains a named, studied problem rather than a solved one.` }
            ],
            analogy: `A busy restaurant kitchen with several skilled chefs (a fast CPU) but only one narrow doorway to the pantry (the memory connection) that only one chef can walk through at a time. No matter how fast the chefs can cook, the doorway limits how fast ingredients actually arrive.`,
            sources: [
              { ref: `Bawden, D., &amp; Robinson, L. (2022). <em>Introduction to Information Science</em>, ch. 9, "Digital Technologies" (pp. 168–171). Facet Publishing.`, note: `The Von Neumann architecture's shared-memory design, which this chunk's discussion of the resulting bottleneck follows directly from.` },
              { ref: `MIT OpenCourseWare. (2019b, July 12). <em>9.2.3 The von Neumann Model</em> [Video]. YouTube. https://youtube.com/watch?v=H0xGKKpKaRE`, note: `The Von Neumann model's practical limitations, discussed from a more analytical perspective.` }
            ]
          },
          example: {
            label: "Doubling CPU speed, same bottleneck",
            steps: [
              `Original system: a CPU executes instructions at speed X, but spends significant time waiting for memory to deliver each instruction and piece of data.`,
              `Upgraded system: the same CPU now executes instructions at speed 2X — but memory still delivers data at the same rate as before.`,
              `Result: overall program speed improves by far less than 2X, because the bottleneck (the shared memory connection) wasn't upgraded along with the CPU.`
            ]
          },
          quiz: {
            question: "A computer manufacturer doubles a laptop's CPU clock speed but leaves its memory system completely unchanged. Users report the laptop feels only slightly faster, not twice as fast. What architectural concept best explains this?",
            options: [
              "The CPU upgrade must have been installed incorrectly",
              "The Von Neumann bottleneck — overall speed is limited by how fast data can move between memory and the CPU, not just by CPU speed alone",
              "Software cannot use a CPU that is more than 10% faster",
              "Doubling CPU speed never has any measurable effect"
            ],
            correct: 1,
            explanation: `This is a textbook description of the Von Neumann bottleneck: because instructions and data both travel over the same shared memory connection, a faster CPU alone can't fully translate into proportionally faster overall performance if that connection remains the limiting factor. The tempting wrong answer assumes an installation error, but this is an expected, well-documented architectural limitation, not a malfunction.`
          },
          recall: {
            prompt: "What is the Von Neumann bottleneck, and why doesn't simply making the CPU faster fully solve it?",
            answer: `The Von Neumann bottleneck is the performance limit caused by instructions and data sharing one memory connection that the CPU can typically only fetch across one at a time — so the speed of that connection caps overall performance regardless of CPU speed. Making the CPU faster alone doesn't fully solve it because the CPU still has to wait for each instruction and piece of data to arrive from memory over the same shared connection; a faster CPU just spends more of its time idle, waiting on memory, rather than actually computing.`,
            points: [
              `Von Neumann bottleneck: shared memory connection limits overall performance`,
              `A faster CPU alone doesn't proportionally speed things up`,
              `Modern mitigations: cache memory, pipelining — reduce impact, don't eliminate it`,
              `Still a named, studied limitation of the shared-memory architecture itself`
            ]
          },
          wisdomTags: ["limits", "evidence"]
        }
      ],
      examQuestions: [
        {
          question: "What is the stored-program concept?",
          options: [
            "Instructions and data are both stored together in the same memory, in the same form",
            "Instructions must always be physically wired into circuitry",
            "Data is stored separately from all instructions permanently",
            "Programs cannot be changed once installed"
          ],
          correct: 0
        },
        {
          question: "What are the four core components of Von Neumann architecture?",
          options: [
            "Keyboard, mouse, monitor, printer",
            "CPU, memory, input/output, and a control unit",
            "Only a CPU and a screen",
            "RAM, ROM, cache, and disk"
          ],
          correct: 1
        },
        {
          question: "What does the fetch-decode-execute cycle do?",
          options: [
            "Deletes unused programs from memory",
            "Only runs once when the computer starts",
            "Repeatedly fetches the next instruction, determines its operation, and carries it out",
            "Physically rewires the CPU for each new task"
          ],
          correct: 2
        },
        {
          question: "What is the Von Neumann bottleneck?",
          options: [
            "A physical size limit on computer cases",
            "A rule against using more than one CPU",
            "A software bug found only in older programs",
            "A performance limit caused by instructions and data sharing one memory connection the CPU can access only one at a time"
          ],
          correct: 3
        },
        {
          question: "Which technique helps reduce (without eliminating) the Von Neumann bottleneck's practical impact?",
          options: [
            "Cache memory placed close to the CPU for fast access to recently-used data",
            "Removing the CPU entirely",
            "Physically rewiring the computer for each program",
            "Disabling the control unit"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "cf-memory-storage",
      title: "Memory & Secondary Storage",
      desc: "RAM vs. ROM, how memory is measured, and direct vs. sequential access storage",
      icon: "\u{1F4BE}",
      chunks: [
        {
          title: "RAM vs. ROM: Volatile and Non-Volatile Memory",
          glossary: [
            { term: "RAM (Random Access Memory)", definition: "The computer's volatile working memory; loses its contents when power is removed." },
            { term: "ROM (Read-Only Memory)", definition: "Non-volatile memory that retains its contents without power, typically holding startup instructions." },
            { term: "Volatile", definition: "Requires continuous power to hold its contents." },
            { term: "Non-volatile", definition: "Retains its contents without power." }
          ],
          predict: {
            question: "If a computer suddenly loses power while you're editing an unsaved document, the document is gone. But the computer's built-in startup instructions (the ones that run every time you power it on) are intact even after power loss. Why the difference?",
            options: [
              "The unsaved document was never really stored anywhere",
              "The startup instructions live in a type of memory (ROM) that keeps its contents without power, while the document was in RAM, which loses its contents the instant power is cut",
              "The computer secretly saves everything automatically every second",
              "There is no real difference; this is a coincidence"
            ],
            reveal: "RAM (Random Access Memory) is volatile — it requires continuous power to hold its contents, which is why an unsaved document vanishes on power loss. ROM (Read-Only Memory) is non-volatile — it retains its contents without power, which is exactly why a computer's startup instructions survive being switched off."
          },
          explain: {
            blocks: [
              { text: `RAM (Random Access Memory) is the computer's working memory — where currently running programs and their data are held while in use. It is volatile, meaning its contents are lost the instant power is removed. ROM (Read-Only Memory) holds instructions that rarely or never change, such as a computer's basic startup routine, and is non-volatile — its contents persist without power.` },
              { heading: "Why 'random access' is in the name", text: `RAM is called "random access" because any memory location can be read or written directly, in any order, in roughly the same amount of time — unlike, say, a tape that must be wound sequentially to reach a specific point. This is what lets a CPU jump immediately to whatever instruction or data it needs next, rather than reading through everything in order to get there.` },
              { heading: "Why both types are necessary, not interchangeable", text: `If everything were stored only in RAM, a computer would have no memory of how to even start itself after a power loss — RAM would be empty and there'd be no initial instructions to load. If everything were stored only in ROM, nothing could ever change: no new documents, no software updates, no user data. The two types exist together because a computer needs both a fixed, reliable starting point and freely rewritable working space.` }
            ],
            analogy: `RAM is like a chalkboard actively being written on and erased throughout a class — fast to change, but wiped clean the moment the room empties. ROM is like the permanent engraving on the classroom's cornerstone — unchanging, but exactly the same every single time anyone looks at it.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.9 (pp. 18–28). Mercury Learning &amp; Information.`, note: `The definitions of RAM, ROM, and volatile vs. non-volatile memory described in this chunk.` },
              { ref: `Club Academia. (2024, October 22). <em>RAM, ROM, Cache &amp; more: Understanding computer memory!</em> [Video]. YouTube. https://youtube.com/watch?v=3xhHhaCFAZI`, note: `A walkthrough of RAM, ROM, and their volatility distinction.` }
            ]
          },
          example: {
            label: "Power loss, two outcomes",
            steps: [
              `A user is halfway through typing a document (held in RAM) when the power cuts out — the unsaved text is gone the instant power drops.`,
              `The same computer, once power returns, still knows exactly how to begin its startup sequence — those instructions were in ROM, unaffected by the outage.`,
              `If the startup instructions had been stored in RAM instead, the computer would have no idea how to even begin booting after a power loss — a genuinely broken design.`
            ]
          },
          quiz: {
            question: "An engineer is designing a new device and has to decide where to store its one-time factory calibration settings, which must never be lost even after years without power, versus where to store the live sensor readings it processes every second. Which memory type fits each need?",
            options: [
              "Both should be stored in RAM, since RAM is faster",
              "Calibration settings belong in ROM (non-volatile, survives power loss); live sensor readings belong in RAM (volatile, but fast and freely rewritable)",
              "Both should be stored in ROM, since ROM never loses data",
              "The distinction between RAM and ROM doesn't matter for this decision"
            ],
            correct: 1,
            explanation: `This maps directly onto the volatile/non-volatile distinction: data that must survive power loss unchanged belongs in ROM, while data that changes constantly and doesn't need to survive a power cycle belongs in RAM. The tempting wrong answer suggests storing everything in ROM for safety, but ROM's whole limitation is that it isn't meant to be rewritten constantly the way live sensor data requires.`
          },
          recall: {
            prompt: "What is the difference between RAM and ROM, and why does a computer need both rather than just one?",
            answer: `RAM (Random Access Memory) is the computer's volatile working memory — it holds currently running programs and data, but loses its contents the instant power is removed. ROM (Read-Only Memory) is non-volatile — it holds instructions that rarely change, like startup routines, and retains its contents without power. A computer needs both because RAM alone would leave nothing to load after a power loss (no startup instructions), while ROM alone would leave nothing rewritable for new documents, software updates, or working data.`,
            points: [
              `RAM = volatile working memory, lost on power loss`,
              `ROM = non-volatile, retains contents without power`,
              `"Random access" = any location reachable directly, not sequentially`,
              `Both needed: ROM for a fixed starting point, RAM for rewritable working space`
            ]
          },
          wisdomTags: ["limits", "correction"]
        },

        {
          title: "Units of Memory Measurement",
          glossary: [
            { term: "Bit", definition: "A single binary digit, 0 or 1 — the smallest unit of data." },
            { term: "Byte", definition: "A group of 8 bits, typically enough to represent one character." },
            { term: "Kilobyte / Megabyte / Gigabyte / Terabyte", definition: "Successive scale-ups from a byte, each roughly 1,000x (technically 1,024x) the last." }
          ],
          explain: {
            blocks: [
              { text: `Computer memory and storage are measured in units built on the bit — a single binary digit, 0 or 1. Eight bits make one byte, which is typically enough to represent one character of text. From there, units scale up by roughly a thousand at each step: kilobyte (KB), megabyte (MB), gigabyte (GB), terabyte (TB), and beyond.` },
              { heading: "Why 'roughly' a thousand, not exactly", text: `Because computers work in binary, the actual multiplier at each step is 1,024 (2^10), not a clean 1,000 — a kilobyte is technically 1,024 bytes, not 1,000. This is a small but real discrepancy that has caused genuine confusion (and even minor consumer lawsuits over how much storage a device "actually" has), since manufacturers and operating systems have not always used the two conventions consistently.` },
              { heading: "Why this scale matters practically", text: `A single character of text is about 1 byte; a short document might be tens of kilobytes; a high-resolution photo might be several megabytes; a movie file might be several gigabytes; a large organization's entire data archive might run into terabytes or beyond. Understanding this scale is what lets a person judge, at a glance, whether a given storage device or file size is reasonable for a given task.` }
            ],
            analogy: `A bit is a single grain of sand; a byte is a small pinch of eight grains; a kilobyte is roughly a spoonful; a gigabyte is roughly a large sandbag. This mirrors how far computer storage sizes actually range, from a single character to an entire movie.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.9 (pp. 18–28). Mercury Learning &amp; Information.`, note: `The units of memory measurement (bit through terabyte) described in this chunk.` },
              { ref: `Club Academia. (2024, October 22). <em>RAM, ROM, Cache &amp; more: Understanding computer memory!</em> [Video]. YouTube. https://youtube.com/watch?v=3xhHhaCFAZI`, note: `The scale of memory units, from bits to gigabytes, referenced in this chunk.` }
            ]
          },
          example: {
            label: "Matching file size to real-world content",
            steps: [
              `A plain text email: typically a few kilobytes — thousands of individual characters, each about a byte.`,
              `A smartphone photo: typically several megabytes — a thousand times larger than the email, reflecting the far greater amount of visual detail encoded.`,
              `A two-hour HD movie file: typically several gigabytes — another thousand-fold jump, reflecting many thousands of individual video frames, each far more detailed than a photo.`
            ]
          },
          quiz: {
            question: "A user is told a new external hard drive holds '2 terabytes,' but their computer's file browser reports slightly less usable space than they expected after formatting. What is the most likely, well-documented explanation, rather than assuming the drive is defective?",
            options: [
              "The hard drive is definitely defective and should be returned",
              "Terabytes and gigabytes are the same unit, so no discrepancy should exist",
              "A well-documented inconsistency exists between manufacturers' decimal-based (1,000-multiplier) labeling and operating systems' binary-based (1,024-multiplier) reporting of storage size",
              "File browsers always report storage size completely at random"
            ],
            correct: 2,
            explanation: `This is a genuine, well-known discrepancy: storage manufacturers commonly use decimal units (1 TB = 1,000,000,000,000 bytes) while operating systems commonly report using binary units (where each step is 1,024, not 1,000), producing a real, predictable gap in reported capacity — not a defect. The tempting wrong answer assumes the drive is broken, but this exact discrepancy is well documented across the storage industry.`
          },
          recall: {
            prompt: "What is the scale of memory measurement units from a bit to a terabyte, and what causes the well-known discrepancy between advertised and reported storage capacity?",
            answer: `The scale runs: a bit (single binary digit) → 8 bits make a byte (about one character) → kilobyte → megabyte → gigabyte → terabyte, each step roughly a thousand times the last. The discrepancy between advertised and reported capacity arises because computers work in binary, so the actual multiplier at each step is 1,024 (2^10), not a clean 1,000 — manufacturers often label storage using the decimal 1,000-based convention, while operating systems often report it using the binary 1,024-based convention, producing a real, predictable gap that is not a hardware defect.`,
            points: [
              `Scale: bit → byte (8 bits) → KB → MB → GB → TB`,
              `Each step is roughly 1,000x, but technically 1,024x (2^10) in binary`,
              `Manufacturer (decimal) vs. OS (binary) labeling conventions differ`,
              `This causes a real, well-documented capacity discrepancy, not a defect`
            ]
          },
          wisdomTags: ["evidence", "correction"]
        },

        {
          title: "DASD vs. SASD: Direct vs. Sequential Access Storage",
          glossary: [
            { term: "DASD (Direct Access Storage Device)", definition: "Storage (like a hard disk or SSD) that can reach any location in roughly constant time." },
            { term: "SASD (Sequential Access Storage Device)", definition: "Storage (like magnetic tape) that must be read in order from the start to reach a given point." }
          ],
          explain: {
            blocks: [
              { text: `Secondary storage devices are classified by how they access data. A Direct Access Storage Device (DASD) — like a hard disk or SSD — can jump straight to any stored location in roughly constant time, regardless of where on the device that data physically sits. A Sequential Access Storage Device (SASD) — like magnetic tape — can only be read in order, from the beginning, to reach a specific point.` },
              { heading: "Why the distinction has real speed consequences", text: `Retrieving one specific record from a DASD takes about the same short time whether that record is the first one stored or the millionth — the device can access it directly. Retrieving the same record from a SASD may require winding through everything stored before it, which can take dramatically longer for data sitting later in the sequence, even on a device with a fast raw transfer speed.` },
              { heading: "Why sequential storage still exists at all", text: `Despite being slower for random lookups, sequential-access media like magnetic tape remains genuinely useful for its own specific case: long-term archival backup, where an entire dataset is written once and read back in full only rarely, rather than accessed randomly. Tape is also often cheaper per unit of storage and more durable for long-term, offline retention than a spinning or solid-state DASD, which is why large organizations still use it for archives even today.` }
            ],
            analogy: `A DASD is like a book with an index — flip straight to page 340 for the answer you need. A SASD is like a cassette tape — to reach the fifth song, you have to fast-forward through the first four, even if you only care about the fifth.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.10 (pp. 18–28). Mercury Learning &amp; Information.`, note: `The DASD/SASD classification of secondary storage devices described in this chunk.` },
              { ref: `Club Academia. (2024, October 22). <em>RAM, ROM, Cache &amp; more: Understanding computer memory!</em> [Video]. YouTube. https://youtube.com/watch?v=3xhHhaCFAZI`, note: `Secondary storage device characteristics referenced alongside this chunk's memory-type discussion.` }
            ]
          },
          example: {
            label: "Looking up one record, two device types",
            steps: [
              `On a DASD (SSD): looking up customer record #847,392 out of a million takes roughly the same short time as looking up record #1.`,
              `On a SASD (tape): looking up the same record #847,392 may require winding through all 847,391 records before it, taking dramatically longer.`,
              `For a nightly full-database backup that's written once and rarely read back, this difference barely matters — which is exactly the case tape is still used for.`
            ]
          },
          quiz: {
            question: "A company needs to store a database where employees constantly look up individual customer records in random order throughout the day, and separately needs to store a full annual archive that will almost never be accessed except in a rare full restore. Which storage type fits each need?",
            options: [
              "Both should use sequential-access tape, since tape is cheaper",
              "Both should use direct-access storage, since speed always matters equally",
              "It makes no difference which type is used for either case",
              "The daily-lookup database needs direct-access storage (DASD) for fast random access; the rarely-read full archive can reasonably use sequential-access tape (SASD), which is cheaper and durable for that use"
            ],
            correct: 3,
            explanation: `This maps the DASD/SASD distinction onto its real practical use case: random, frequent lookups need direct access's constant-time retrieval, while a rarely-accessed full archive doesn't suffer from sequential access's slower random lookup, and can take advantage of tape's lower cost and durability instead. The tempting wrong answer treats speed as equally critical in both cases, but the archive's actual access pattern doesn't need DASD's advantage at all.`
          },
          recall: {
            prompt: "What is the difference between a Direct Access Storage Device and a Sequential Access Storage Device, and why does sequential storage still have a legitimate use case despite being slower for random lookups?",
            answer: `A DASD (like a hard disk or SSD) can jump directly to any stored location in roughly constant time regardless of physical position. A SASD (like magnetic tape) can only be read in order from the beginning, so reaching a specific point may require winding through everything before it. Sequential storage still has a legitimate use case for long-term archival backup, where data is written once and read back in full only rarely rather than accessed randomly — for that specific access pattern, tape's lower cost and durability outweigh its slower random-lookup speed.`,
            points: [
              `DASD: direct, roughly constant-time access to any location (disk, SSD)`,
              `SASD: sequential access only, must read through from the start (tape)`,
              `DASD wins for frequent random lookups`,
              `SASD still useful for rarely-accessed, write-once archival backup`
            ]
          },
          wisdomTags: ["tradition", "planning"]
        }
      ],
      examQuestions: [
        {
          question: "What does it mean that RAM is 'volatile'?",
          options: [
            "Its contents are lost when power is removed",
            "It can only be read, never written",
            "It never loses data even without power",
            "It is the same as ROM"
          ],
          correct: 0
        },
        {
          question: "Why does a computer need both RAM and ROM rather than just one?",
          options: [
            "It doesn't; either one alone works fine",
            "ROM provides a fixed starting point even after power loss, while RAM provides fast, freely rewritable working space",
            "RAM and ROM are identical in function",
            "ROM is only used for entertainment"
          ],
          correct: 1
        },
        {
          question: "How many bits typically make up one byte?",
          options: [
            "Two",
            "Four",
            "Eight",
            "Sixteen"
          ],
          correct: 2
        },
        {
          question: "Why might advertised storage capacity differ slightly from what an operating system reports?",
          options: [
            "The drive is always defective",
            "Storage size reporting is random",
            "File browsers cannot measure storage accurately",
            "Manufacturers often use decimal (1,000-based) units while operating systems often report using binary (1,024-based) units"
          ],
          correct: 3
        },
        {
          question: "What is a Direct Access Storage Device (DASD) able to do that a Sequential Access Storage Device (SASD) cannot?",
          options: [
            "Jump directly to any stored location in roughly constant time, rather than reading through everything before it",
            "Store more total data in every case",
            "Operate without any power at all",
            "Run application software directly"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "cf-software-types",
      title: "System, Application & Embedded Software",
      desc: "Hardware vs. software, and the three categories of software with distinct relationships to it",
      icon: "\u{1F9E9}",
      chunks: [
        {
          title: "Hardware vs. Software: What's the Actual Difference",
          glossary: [
            { term: "Hardware", definition: "The physical, tangible components of a computer system." },
            { term: "Software", definition: "The set of instructions that tells hardware what to do." },
            { term: "Firmware", definition: "Software permanently stored on a hardware chip, controlling a device's most basic behavior." }
          ],
          predict: {
            question: "A customer complains their computer is 'broken' because a program keeps crashing, but the computer boots fine and all other programs run normally. Is this necessarily a hardware problem?",
            options: [
              "Yes, any 'broken' behavior on a computer is always a hardware problem",
              "No — since the physical machine boots and runs other programs fine, the issue is more likely in that specific program's software, not the physical hardware",
              "There's no meaningful difference between hardware and software failures",
              "It's impossible to tell without opening the computer physically"
            ],
            reveal: "Hardware is the physical, tangible machinery — the parts that need repair or replacement when literally broken. Software is the set of instructions that hardware executes — and when a specific program misbehaves while the rest of the machine works fine, that points to a problem in those instructions, not the physical parts underneath them."
          },
          explain: {
            blocks: [
              { text: `Hardware refers to the physical, tangible components of a computer system — the circuitry, chips, disks, and peripheral devices you can physically touch. Software refers to the set of instructions (programs) that tell that hardware what to do. The same physical hardware can run completely different software, and the same software can often run on different hardware, which is exactly why the two are treated as separate, independent layers.` },
              { heading: "Why this separation is more than a vocabulary distinction", text: `Because hardware and software are independent layers, a problem in one doesn't necessarily indicate a problem in the other — a program crashing repeatedly while every other program and the operating system itself run normally points strongly toward a software bug in that specific program, not failing physical components. Diagnosing which layer is actually at fault is a practical skill built directly on understanding this distinction.` },
              { heading: "Where the distinction gets genuinely blurry", text: `Firmware — software permanently stored on a hardware chip, controlling a device's most basic low-level behavior — sits at the boundary between the two categories: it's technically software (a set of instructions), but it's so tightly bound to specific hardware, and so rarely changed by an ordinary user, that it behaves much more like a fixed hardware property in daily practice.` }
            ],
            analogy: `A car's engine (hardware) versus the route the GPS calculates for a trip (software) — the same engine can drive to entirely different destinations depending on what route is entered, and a wrong turn from bad directions doesn't mean the engine itself is broken.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §1.6 (pp. 1–10). Mercury Learning &amp; Information.`, note: `The hardware vs. software distinction described in this chunk.` },
              { ref: `Make It Easy Education. (2020, September 23). <em>TYPES OF SOFTWARE || APPLICATION SOFTWARE || SYSTEM SOFTWARE || UTILITY SOFTWARE || COMPUTER BASICS</em> [Video]. YouTube. https://youtube.com/watch?v=BTB86HeZVwk`, note: `The hardware/software distinction that this topic's software classification builds on.` }
            ]
          },
          example: {
            label: "Same hardware, different behavior explained by software",
            steps: [
              `A laptop runs a word processor smoothly for hours, but a specific game crashes every time it's launched — the hardware clearly works, since everything else runs fine.`,
              `Reinstalling just that one game (replacing its software, touching no physical parts) fixes the crash entirely.`,
              `This confirms the fault was in that program's instructions (software), not in the physical machine underneath it (hardware) — the same distinction that makes targeted software fixes possible without any hardware repair.`
            ]
          },
          quiz: {
            question: "A technician is troubleshooting a computer where one specific application crashes on launch, but the operating system, three other applications, and all hardware diagnostics run without any issue. Where should the technician look first, and why?",
            options: [
              "The crashing application's own software, since everything else — hardware and other software — is confirmed working normally",
              "The power supply, since crashes are always a power issue",
              "The keyboard, since input devices cause most software crashes",
              "Nothing can be diagnosed without replacing the entire computer"
            ],
            correct: 0,
            explanation: `Since the hardware and every other piece of software are confirmed functioning normally, the fault is isolated to the one thing that isn't working — that specific application's own instructions — which is exactly the kind of diagnostic reasoning the hardware/software distinction enables. The tempting wrong answers point at hardware components despite the hardware already being shown to work fine elsewhere.`
          },
          recall: {
            prompt: "What is the difference between hardware and software, and why does that distinction matter practically when diagnosing a computer problem?",
            answer: `Hardware is the physical, tangible components of a computer system; software is the set of instructions that tells that hardware what to do. They are independent layers — the same hardware can run different software, and software can often run on different hardware. This matters practically because a problem confined to one specific program, while the rest of the system runs fine, points to a software issue rather than a hardware failure, letting a technician diagnose and fix the actual layer at fault instead of unnecessarily replacing working physical parts.`,
            points: [
              `Hardware = physical components; software = instructions hardware executes`,
              `The two are independent layers`,
              `A software-only problem doesn't indicate hardware failure, and vice versa`,
              `Firmware sits at the blurry boundary: software, but tightly hardware-bound`
            ]
          },
          wisdomTags: ["correction", "evidence"]
        },

        {
          title: "System Software: The Coordinator",
          glossary: [
            { term: "System software", definition: "Software that coordinates all activity in a computer system — interpreting commands, managing programs, interfacing hardware." },
            { term: "Operating system", definition: "The primary example of system software; the platform every application runs on top of." }
          ],
          explain: {
            blocks: [
              { text: `System software is the category of software responsible for coordinating all activities within a computer system, sitting between the user and the raw hardware. It receives and interprets user commands (translating between human instructions and machine language), runs and stores application programs as directed, retrieves stored programs on request, and creates the interface between peripheral devices and the CPU.` },
              { heading: "Why the definition centers on translation and coordination", text: `A user does not understand machine language (the 0s and 1s a computer's hardware actually processes), and the computer cannot directly understand the high-level language a user communicates in. System software exists specifically to bridge that gap — converting user instructions into machine-executable form and vice versa — while also coordinating the underlying resource management that lets any application run at all.` },
              { heading: "The operating system as the primary example", text: `The most familiar piece of system software is the operating system itself, which handles exactly the coordination described above: interpreting commands, managing where programs are stored and retrieved from, and directing the interaction between peripheral hardware and the CPU. Every application a user runs depends on this coordination layer already being in place underneath it — an application program cannot bypass system software and talk to raw hardware directly.` }
            ],
            analogy: `An air traffic controller doesn't fly any plane personally, but every flight (application) that takes off depends entirely on the controller coordinating runways, timing, and communication with the airport's infrastructure. Remove the controller, and the planes and runways still exist, but nothing coordinated can happen.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §2.1–2.2 (pp. 35–36). Mercury Learning &amp; Information.`, note: `The definition of system software — receiving/interpreting commands, running and storing programs, and interfacing peripherals with the CPU — drawn directly from this section for this chunk.` },
              { ref: `Make It Easy Education. (2020, September 23). <em>TYPES OF SOFTWARE || APPLICATION SOFTWARE || SYSTEM SOFTWARE || UTILITY SOFTWARE || COMPUTER BASICS</em> [Video]. YouTube. https://youtube.com/watch?v=BTB86HeZVwk`, note: `The system/application/utility software classification this topic's chunks are organized around.` }
            ]
          },
          example: {
            label: "What system software does behind one simple click",
            steps: [
              `A user double-clicks a document icon — a human, high-level action.`,
              `System software translates this into the machine-language commands needed to locate the file on the storage device, load it into memory, and hand it to the correct application.`,
              `The user never sees any of this coordination — only the document opening — which is exactly the point: system software's job is to make that translation invisible.`
            ]
          },
          quiz: {
            question: "A user clicks an icon to open a photo, and the correct application launches with the photo displayed within a second. Which category of software did the heavy coordination — translating the click into machine instructions, locating the file, and interfacing with storage hardware — and why isn't that the photo-viewing application itself?",
            options: [
              "The photo application did all of it alone, with no other software involved",
              "No software was involved; this happens purely in hardware",
              "System software, because its defined role is exactly this — receiving and interpreting user commands and coordinating retrieval from storage — work the application depends on but doesn't perform itself",
              "Embedded software, since a photo file is a form of embedded data"
            ],
            correct: 2,
            explanation: `System software's defined role — interpreting user commands, coordinating storage retrieval, and interfacing with hardware — is precisely the invisible work happening between the click and the photo appearing; the application itself only handles displaying the photo once system software has already done that coordination. The tempting wrong answer credits the application alone, but applications rely on system software for exactly this kind of underlying coordination rather than performing it themselves.`
          },
          recall: {
            prompt: "What does system software do, according to its formal definition, and why can't an application program simply bypass it to talk to hardware directly?",
            answer: `System software receives and interprets user commands (translating between human instructions and machine language), runs and stores application programs as directed, retrieves stored programs on request, and creates the interface between peripheral devices and the CPU — coordinating all activity in the computer system. An application can't bypass it because system software IS the coordination layer that makes hardware usable in the first place; without it, there is no translation between the application's requests and the machine language the hardware actually executes.`,
            points: [
              `System software: interprets commands, runs/stores/retrieves programs, interfaces peripherals with CPU`,
              `Bridges the gap between human-readable commands and machine language`,
              `The operating system is the primary example of system software`,
              `Applications depend on this coordination layer; they cannot bypass it`
            ]
          },
          wisdomTags: ["tradition", "simplicity"]
        },

        {
          title: "Application Software and Embedded Software",
          glossary: [
            { term: "Application software", definition: "Software written to help a user accomplish a specific task (word processing, browsing, games)." },
            { term: "Embedded software", definition: "Software written to run on one dedicated special-purpose device, with little or no general-purpose OS underneath." }
          ],
          explain: {
            blocks: [
              { text: `Application software is software written to help a user accomplish a specific task — word processing, spreadsheets, web browsers, games — and runs on top of system software rather than interacting with hardware directly. Embedded software is written to run on a dedicated, special-purpose device as part of a larger physical product, permanently built in and generally not intended to be replaced or reprogrammed by the end user.` },
              { heading: "The relationship between all three categories", text: `System software coordinates the machine and provides the platform; application software runs on top of that platform to accomplish a user's specific goal; embedded software skips the general-purpose platform layer entirely, running instead on a special-purpose computer built into one dedicated device. This is why embedded software and application software, despite both being "software a user benefits from," work in structurally different environments.` },
              { heading: "Why the distinction matters for how each is built and updated", text: `Application software is typically installed, updated, and removed independently of the hardware it runs on, and usually assumes a general-purpose operating system underneath it providing memory management, file access, and so on. Embedded software is typically written to run with minimal or no operating system at all, tightly optimized for one specific device's exact hardware, and — unlike a phone app — is rarely something an ordinary end user is expected to update or replace themselves.` }
            ],
            analogy: `Application software is a tenant renting a serviced apartment (the OS provides plumbing, electricity, structure) and moving in their own furniture. Embedded software is someone building their own tiny cabin from scratch with no shared services at all — self-contained, but far less flexible to modify later.`,
            sources: [
              { ref: `Gupta, C. P., &amp; Goyal, K. K. (2020). <em>Computer Concepts and Management Information Systems</em>, §2.2 (pp. 35–36). Mercury Learning &amp; Information.`, note: `The application software classification, extended in this chunk to embedded software's distinct relationship to system software.` },
              { ref: `Embedded 101. (2021, March 10). <em>Embedded 101 Course: Embedded Software</em> [Video]. YouTube. https://youtube.com/watch?v=n7zg5ECQyX4`, note: `The embedded software category and its structural difference from application software described in this chunk.` }
            ]
          },
          example: {
            label: "Three categories, one washing machine",
            steps: [
              `The washing machine's built-in control board runs embedded software — permanently written for that one device, with no general-purpose OS underneath, never updated by the owner.`,
              `A phone app that lets a user remotely start the same washing machine is application software — running on top of the phone's general-purpose operating system.`,
              `The phone's operating system itself, coordinating that app's access to the phone's WiFi and storage, is system software — the platform layer neither the app nor the washing machine's embedded software has to rebuild themselves.`
            ]
          },
          quiz: {
            question: "A smart refrigerator has (1) a built-in control board that runs its cooling cycle and (2) a companion smartphone app for checking the fridge's temperature remotely. What category of software runs on the control board, and how does it differ structurally from the phone app?",
            options: [
              "Both are application software, since both relate to the same refrigerator",
              "The control board runs embedded software — permanently built into that one special-purpose device with no general-purpose OS underneath — while the phone app is application software, running on top of the phone's general-purpose operating system",
              "The control board runs system software, since it manages the fridge's hardware directly",
              "There is no meaningful difference between the two"
            ],
            correct: 1,
            explanation: `The control board fits the definition of embedded software — permanently built into a dedicated special-purpose device with no general-purpose platform underneath — while the phone app is a clear case of application software running on top of the phone's own operating system. The tempting wrong answer calls the control board "system software," but system software specifically coordinates a general-purpose platform for OTHER programs to run on, which isn't what a dedicated appliance control board does.`
          },
          recall: {
            prompt: "What is application software, what is embedded software, and how do they differ structurally in what they run on top of?",
            answer: `Application software is written to help a user accomplish a specific task (word processing, browsing, games) and runs on top of system software, relying on a general-purpose operating system underneath for things like memory management and file access. Embedded software is written to run on a dedicated, special-purpose device as part of a larger physical product, typically with minimal or no general-purpose operating system underneath, tightly optimized for that one device's exact hardware, and generally not something an end user updates or replaces themselves.`,
            points: [
              `Application software: task-specific, runs on top of a general-purpose OS`,
              `Embedded software: built into one special-purpose device, minimal/no OS beneath`,
              `Application software is typically user-installable/updatable; embedded software typically isn't`,
              `All three (system/application/embedded) relate differently to the underlying hardware`
            ]
          },
          wisdomTags: ["tradition", "limits"]
        }
      ],
      examQuestions: [
        {
          question: "What is the fundamental difference between hardware and software?",
          options: [
            "Hardware is the physical components of a computer; software is the instructions that tell hardware what to do",
            "They are two names for the same thing",
            "Software is always faster than hardware",
            "Hardware can be installed and removed like an app"
          ],
          correct: 0
        },
        {
          question: "According to its formal definition, what does system software primarily do?",
          options: [
            "It only displays graphics on the screen",
            "It coordinates activities in the computer system: interpreting commands, managing programs, and interfacing peripherals with the CPU",
            "It replaces the need for any hardware",
            "It is only used for playing games"
          ],
          correct: 1
        },
        {
          question: "What is application software?",
          options: [
            "Software permanently built into one dedicated device with no general-purpose OS",
            "The same thing as system software",
            "Software written to help a user accomplish a specific task, running on top of system software",
            "Physical computer parts"
          ],
          correct: 2
        },
        {
          question: "What best characterizes embedded software?",
          options: [
            "It requires a general-purpose operating system to function",
            "It is usually the first software a user installs after buying a computer",
            "Users are expected to update it as often as a phone app",
            "It runs on a dedicated special-purpose device, typically with minimal or no general-purpose OS beneath it, and is rarely user-updated"
          ],
          correct: 3
        },
        {
          question: "If one specific application crashes while everything else on a computer works fine, what does this most likely indicate?",
          options: [
            "A software issue isolated to that specific application, not a hardware failure",
            "The entire computer's hardware needs replacing",
            "The operating system has stopped working entirely",
            "Nothing meaningful can be concluded"
          ],
          correct: 0
        }
      ]
    }
  ]
};
