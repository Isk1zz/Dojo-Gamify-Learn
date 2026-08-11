// ================================================
// Course: Intro to CS — MODULE 6
// Unit 5: Databases
// ------------------------------------------------
// Written to library/content/CONTENT-MODEL.md. Six topics, three
// chunks each, five exam questions per topic; blocks[] explanations
// at ~200 words, two citations per chunk, original analogies.
//
// `recall` is on EVERY chunk, not just the last. That is a change from
// the model's first draft and it is deliberate: recall cards are what
// the spaced-review queue will serve instead of replaying the whole
// topic, so one card per topic would not be a deck. Writing them now
// costs a paragraph each; retrofitting 26 topics later would not.
//
// Taxonomy follows Vidhya et al. (2016) because that is the assigned
// text and the exam follows it — notably the PASSIVE/ACTIVE split in
// §1.1.3, which most other sources do not use.
//
// NOT COVERED: §2.4 object-oriented model (source text not available)
// and §1.6 system structure (outside the assigned pages 22-30).
// ================================================

const MODULE_6 = {
  id: "databases",
  unit: 5,
  title: "Databases",
  icon: "\u{1F5C4}\uFE0F",
  topics: [

    // ============================================================
    {
      id: "db-what-is-a-dbms",
      title: "What a Database System Is",
      desc: "Data, information, database, DBMS — four words used as if they meant the same thing",
      icon: "\u{1F4E6}",
      chunks: [
        {
          title: "Data and Information",
          predict: {
            question: "A spreadsheet holds the number 37 in a cell, with no column header and no label. Is that data or information?",
            options: [
              "Information — it is a fact, and facts inform",
              "Data — it is recorded but carries no context yet",
              "Neither — a single value is too small to be either",
              "Both — the terms mean the same thing in practice"
            ],
            reveal: "Guessing before reading is the point here. The two words get used interchangeably in ordinary speech, and the whole first section of the chapter turns on keeping them apart."
          },
          explain: {
            blocks: [
              { text: `<strong>Data</strong> is recorded fact. <strong>Information</strong> is what data becomes once it has been processed, organised, or placed in a context that makes it mean something.<br><br>The number 37 sitting alone in a file is data. The same 37 under a column called <em>Age</em>, in a row identified as a particular customer, is information — it now answers a question someone could actually ask.` },
              { heading: "Why the textbook opens here", text: `The distinction looks like word-play until you try to build the system. A storage layer only ever handles data: bytes, rows, values. Everything that turns those bytes into something a person can act on — the column names, the relationships between tables, the constraints saying what a value is allowed to be — is the context the system adds on top.<br><br>The chapter defines data as facts <em>with implicit meaning</em>. Implicit is the operative word: the meaning is there, but not stated by the data itself. Something has to state it.` },
              { heading: "Where you meet this again", text: `Every later idea in the unit is really about managing context rather than managing values. A schema is stored context. Data abstraction is context shown at different levels of detail. Integrity constraints are context expressed as rules. Keep the pair separate now and those all read as variations on one theme instead of four unrelated topics.` }
            ],
            analogy: `A boarding pass number means nothing shouted across a room. Printed under "Seat", on a card that names your flight, it tells you where to sit. Nothing about the number changed — the surrounding structure did. The mapping breaks in one place: a boarding pass carries its context permanently, while raw data in a file does not.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.1. Alpha Science International.`, note: `The data / information / database / DBMS definitions used throughout this topic.` },
              { ref: `Silberschatz, A., Korth, H. F., & Sudarshan, S. <em>Database System Concepts</em>, ch. 1. McGraw-Hill.`, note: `The standard reference the assigned chapter's structure follows; useful if a definition here feels too compressed.` }
            ]
          },
          example: {
            label: "Data or information? Three cases",
            steps: [
              `A log file line reading <code>1739284　401　/api/login</code> — DATA. Three values, no stated meaning. You can guess, but the file does not say.`,
              `The same line rendered as "3 failed logins from this account in the last hour" — INFORMATION. Processing (grouping, counting, time-windowing) supplied the context.`,
              `A column header <code>last_login_at</code> stored in the schema — NEITHER, and this is the interesting case. It is not a fact about the world, it is the context that lets facts become information. That is what a database stores beyond the values.`
            ]
          },
          quiz: {
            question: "A hospital exports a file of 40,000 rows, each holding a patient ID and a number. The receiving clinic cannot use it. What is missing, in the chapter's terms?",
            options: [
              "The context that would make the data information",
              "More data — 40,000 rows is too small a sample",
              "Information, which must be sent separately from data",
              "Nothing; the file is unusable because it is too large"
            ],
            correct: 0,
            explanation: `The values arrived intact; what did not arrive is what the numbers mean — units, the measurement, when it was taken. The tempting wrong answer is the third, because it sounds like the definitions: but information is not a separate payload you ship alongside data. It is what data becomes once context is supplied.`
          },
          recall: {
            prompt: "Explain the difference between data and information, and give one example where the same value is data in one setting and information in another.",
            answer: `Data is recorded fact with implicit meaning; information is data that has been processed, organised, or placed in a context that makes the meaning explicit. Example: the value 98.6 in an unlabelled file is data. Under a column named "temperature_f", attached to a patient record and a timestamp, it is information — it now answers a question. The value never changed; the surrounding structure did.`,
            points: [
              `Data = recorded fact, meaning implicit`,
              `Information = data processed / organised / given context`,
              `An example where one value is both, depending on context`,
              `The point that the value itself does not change`
            ]
          },
          wisdomTags: ["beginning", "simplicity"]
        },

        {
          title: "Database, DBMS, Database System",
          explain: {
            blocks: [
              { text: `Three terms, routinely used as if they were one, and the chapter separates them deliberately.<br><br>A <strong>database</strong> is the collection of data itself. A <strong>DBMS</strong> is the software: a body of interrelated data together with the programs that access it. A <strong>database system</strong> is both of them together — the computerised record-keeping system as a whole.` },
              { heading: "What the DBMS is actually for", text: `The chapter states the primary goal plainly: to make storing and retrieving information both <em>convenient</em> and <em>efficient</em>. Two goals, and they pull against each other. Convenient means a person can ask for what they want without knowing how it is stored. Efficient means the machine can find it without reading everything.<br><br>Nearly every design decision later in the unit is an attempt to have both at once.` },
              { heading: "The translation job", text: `Structurally, a DBMS is a translator. It converts between the <em>logical</em> representation — tables, records, relationships, the shape a person thinks in — and the <em>physical</em> representation, which is blocks on a disk. It performs that translation using a stored description of the database, generated by a designer from a conceptual view called the <strong>conceptual schema</strong>, and written down using a Data Definition Language or a design interface.<br><br>That translation layer is the reason the rest of the unit exists.` }
            ],
            analogy: `A library catalogue is not the books, and the librarian is not the catalogue. You ask for a title; the librarian turns that into a shelf and a position. Swap the shelving system overnight and your request still works. Where the analogy breaks: a librarian can improvise, and a DBMS can only do what its schema describes.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.1 and §1.1.1 (pp. 22-30). Alpha Science International.`, note: `The three definitions and the conceptual-schema-to-physical translation described here.` },
              { ref: `IBM. <em>What is a relational database?</em> https://www.ibm.com/topics/relational-databases`, note: `Supports the logical-versus-physical framing in plainer language than the textbook uses.` }
            ]
          },
          example: {
            label: "Which layer broke?",
            steps: [
              `A query returns the wrong customer because two people share a name — the DATABASE is at fault. The data does not distinguish them; no software can fix that.`,
              `A query returns the right customer but takes ninety seconds — the DBMS is at fault. The data is fine; the retrieval is not efficient.`,
              `Nobody can run the query at all because there is no way to express "customers in this postcode" — the DATABASE SYSTEM is at fault. The pieces exist but the system as a whole is not convenient.`
            ]
          },
          quiz: {
            question: "A team migrates from one storage engine to another. Every table, column and row is preserved exactly; queries return identical results but run faster. In the chapter's terms, what changed?",
            options: [
              "The database changed; the DBMS did not",
              "Both the database and the DBMS changed",
              "The DBMS changed; the database did not",
              "Neither changed, because the results are identical"
            ],
            correct: 2,
            explanation: `The collection of data is untouched, so the database is the same; the software that stores and retrieves it was replaced, so the DBMS changed. The tempting wrong answer is the last one — identical results feel like nothing changed, but the chapter's second goal is efficiency, and that is precisely what moved.`
          },
          recall: {
            prompt: "Distinguish a database, a DBMS, and a database system. What does the chapter give as the DBMS's primary goal?",
            answer: `A database is the collection of data. A DBMS is the software — interrelated data plus the programs that access it. A database system is the two together, the whole computerised record-keeping system. The primary goal of a DBMS is to provide a way to store and retrieve information that is both convenient and efficient: convenient meaning a user need not know how data is physically stored, efficient meaning the system can find it without scanning everything.`,
            points: [
              `Database = the data collection`,
              `DBMS = the software layer`,
              `Database system = both together`,
              `Primary goal = convenient AND efficient storage and retrieval`
            ]
          },
          wisdomTags: ["simplicity", "planning"]
        },

        {
          title: "Passive and Active Systems",
          explain: {
            blocks: [
              { text: `The chapter's broad classification of database management systems is not the one most sources reach for. It splits them into <strong>passive</strong> and <strong>active</strong>, and the dividing line is <em>who initiates</em>.` },
              { heading: "Passive: program-driven", text: `A passive DBMS waits. Applications send it requests, it performs the operation, and it returns whatever answer exists. The user queries the current state of the database and gets back what is currently there. Traditional database systems are passive in exactly this sense — nothing happens until something asks.<br><br>The consequence worth remembering: the scope of a query in a passive system is limited to <em>past and present</em> data. It can only answer about what has already been recorded.` },
              { heading: "Active: data-driven or event-driven", text: `An active DBMS is told what information a user needs, and then takes responsibility for delivering it. If the information is not available yet, the system monitors for its arrival and pushes it to the relevant users when it appears.<br><br>That extends the scope of a query to include <em>future</em> data — the one line most worth memorising here, because it is the cleanest statement of the difference. A passive system answers "what is true?"; an active system also answers "tell me when this becomes true."` }
            ],
            analogy: `Passive is checking the departures board every few minutes. Active is a gate-change alert that finds you in the food court. The information is identical; what differs is who is responsible for noticing. The analogy stops short in one respect — the alert only fires for events someone registered interest in beforehand.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.1.3 Classification of Database Management System. Alpha Science International.`, note: `The passive/active classification and the past-present-versus-future query scope, both as stated here.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.1.2 Applications of Database. Alpha Science International.`, note: `The application areas — banking, airlines, universities, retail, manufacturing, human resources — that make the distinction concrete.` }
            ]
          },
          example: {
            label: "Passive, active, or neither?",
            steps: [
              `"How many seats are left on flight 402?" — PASSIVE. Present state, answered from what is recorded now.`,
              `"Notify me if a seat opens on flight 402" — ACTIVE. The query's scope reaches into data that does not exist yet.`,
              `A nightly report emailed at 6am — NEITHER, and this is the trap. It looks active because nobody asked at the moment it arrived, but it is a passive query on a timer. The system is not monitoring for the arrival of information; it is re-asking on a schedule.`
            ]
          },
          quiz: {
            question: "A warehouse system is configured so that when stock of any item falls below its reorder point, purchasing is notified without anyone running a report. Which classification does this fit, and why?",
            options: [
              "Passive, because the data was already in the database",
              "Active, because the query's scope includes data not yet recorded",
              "Passive, because a threshold check is just a stored query",
              "Active, because notifications are always an active feature"
            ],
            correct: 1,
            explanation: `The interest is registered in advance and the system monitors for a condition that has not happened yet — future data, which is the chapter's dividing line. The third option is the plausible trap: a threshold check really is expressed as a query, but a passive system would only evaluate it when asked, and nobody asked.`
          },
          recall: {
            prompt: "What separates a passive DBMS from an active one? State the difference in terms of query scope.",
            answer: `A passive DBMS is program-driven: applications send requests, it performs them and returns whatever is currently available, so the scope of a query is limited to past and present data. An active DBMS is data-driven or event-driven: the user specifies what information they need, and if it is not available the system actively monitors for its arrival and provides it to the relevant users. That extends query scope to include future data. Traditional database systems are passive.`,
            points: [
              `Passive = program-driven, waits to be asked`,
              `Active = data/event-driven, monitors and delivers`,
              `Passive scope = past and present data`,
              `Active scope additionally includes future data`
            ]
          },
          wisdomTags: ["change", "evidence"]
        }
      ],
      examQuestions: [
        {
          question: "The chapter defines data as known facts that can be recorded and that have implicit meaning. What is the significance of 'implicit'?",
          options: [
            "The meaning exists but the data does not state it, so something else must supply the context",
            "The meaning is hidden by encryption and must be decoded before use",
            "The data has no meaning at all until it is processed into information",
            "The meaning is optional and can be discarded to save storage"
          ],
          correct: 0
        },
        {
          question: "Which statement correctly orders the three terms from narrowest to broadest?",
          options: [
            "DBMS, database, database system",
            "Database, DBMS, database system",
            "Database system, database, DBMS",
            "Database, database system, DBMS"
          ],
          correct: 1
        },
        {
          question: "A DBMS translates between the logical and physical representations of data. What generates the description it uses to do this?",
          options: [
            "The operating system's file manager, at mount time",
            "The application programs, each declaring its own layout",
            "A database designer, working from the conceptual schema",
            "The DBMS itself, by inspecting the stored data"
          ],
          correct: 2
        },
        {
          question: "In an active DBMS, a user registers interest in information that has not yet been recorded. What does the system do?",
          options: [
            "Rejects the request, since a query can only address stored data",
            "Monitors for the information's arrival and provides it when it appears",
            "Returns an empty result and requires the user to poll again",
            "Converts the request into a scheduled report run nightly"
          ],
          correct: 1
        },
        {
          question: "Which pair of goals does the chapter give as the primary purpose of a DBMS?",
          options: [
            "Security and redundancy",
            "Portability and standardisation",
            "Convenience and efficiency",
            "Concurrency and atomicity"
          ],
          correct: 2
        }
      ]
    },

    // ============================================================
    {
      id: "db-file-processing",
      title: "Before Databases: File Processing",
      desc: "The system databases replaced, and the seven specific ways it failed",
      icon: "\u{1F4C1}",
      chunks: [
        {
          title: "How File Processing Worked",
          predict: {
            question: "In a file processing system, each application program manages its own files. What do you expect the first problem to be?",
            options: [
              "Programs run too slowly because files are read sequentially",
              "The same fact ends up stored in several places at once",
              "Files become too large for the operating system to open",
              "Programmers cannot agree on which language to use"
            ],
            reveal: "You are meant to guess. The chapter lists seven drawbacks and this is the first one — but noticing why it follows from 'each program owns its files' matters more than getting it right."
          },
          explain: {
            blocks: [
              { text: `Before database systems, organisations kept permanent records in ordinary files, and wrote application programs to read and write them. The chapter calls this a <strong>file processing system</strong>: a collection of files, plus the programs that access or modify them.` },
              { heading: "How it grew", text: `It grew by accretion. When the organisation needed to store new information, or needed a new way to get at information it already had, a programmer added another file and another program. Nothing coordinated this. Each program defined and managed its own data.<br><br>The system was supported by a conventional operating system, which is worth noticing: the OS knew about files, not about what was in them. Every question about meaning, consistency or access belonged to the application code.` },
              { heading: "Why it is still worth studying", text: `Not for historical interest. The chapter uses file processing as the control case — the seven drawbacks it lists are precisely the things a DBMS was built to fix, and the advantages in §1.3 map onto them almost one to one.<br><br>It is also not extinct. Any system where several programs each keep their own copy of the same records has reinvented file processing, whatever it is written in.` }
            ],
            analogy: `Picture a company where every department keeps its own address book, each in its own format, each maintained by whoever set it up. Nothing is wrong with any single book. The failure is structural and only appears when someone moves house. Where it breaks down: address books do not silently overwrite one another, and concurrent file access can.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.2 File Processing System. Alpha Science International.`, note: `The definition of a file processing system and the way new files and programs were added on demand.` },
              { ref: `Silberschatz, A., Korth, H. F., & Sudarshan, S. <em>Database System Concepts</em>, ch. 1. McGraw-Hill.`, note: `The same file-system-versus-DBMS comparison, with the banking example the assigned chapter borrows its framing from.` }
            ]
          },
          example: {
            label: "Is this file processing?",
            steps: [
              `Three departments, three spreadsheets, each holding customer addresses in its own layout — YES. Textbook case, whatever the tooling.`,
              `One shared database, three applications reading it through different views — NO. One stored copy, one definition; the views are context, not duplicates.`,
              `Three microservices, each with its own database, each storing the customer's email — YES, structurally, and this is the case people miss. Modern architecture, same drawback: the same fact recorded in three places with nothing enforcing agreement.`
            ]
          },
          quiz: {
            question: "Why does the chapter emphasise that in a file processing system each program 'defines and manages its own data'?",
            options: [
              "Because it explains why such systems cannot use modern languages",
              "Because it is the root cause from which most of the seven drawbacks follow",
              "Because it makes the programs faster than database queries",
              "Because it means the operating system cannot open the files"
            ],
            correct: 1,
            explanation: `Redundancy, isolation, inconsistent formats and scattered integrity rules all trace back to data definitions living inside individual programs rather than in one shared place. The first option is tempting because the chapter does mention programs written in several languages — but that is a symptom of uncoordinated growth, not the cause.`
          },
          recall: {
            prompt: "Describe a file processing system and explain the structural feature that causes most of its problems.",
            answer: `A file processing system is a collection of files together with the application programs that access or modify them, supported by a conventional operating system. New files and programs were added by programmers whenever new information had to be stored or a new way to access existing information was needed. The structural cause of its problems is that each program defines and manages its own data: there is no single shared definition, so the same fact can be recorded in several files in several formats with nothing enforcing agreement between them.`,
            points: [
              `Files + programs that access them`,
              `Grew by adding a file and a program per need`,
              `Each program defines and manages its own data`,
              `No shared definition, so nothing enforces agreement`
            ]
          },
          wisdomTags: ["tradition", "limits"]
        },

        {
          title: "Redundancy, Inconsistency, Isolation",
          explain: {
            blocks: [
              { text: `The first three of the chapter's seven drawbacks are really one problem seen from three angles: the same fact lives in more than one place, and nothing keeps the copies in step.` },
              { heading: "Redundancy and inconsistency", text: `Because files and programs were written by different people over years, formats differ and the same piece of information gets duplicated. A customer's address might sit in a personal-details file and again in a savings-account file.<br><br><strong>Data inconsistency</strong> is what happens next: the copies stop agreeing. Update the address in one file and not the other and the organisation now holds two answers to one question, with no way to tell which is current. Redundancy also wastes storage and raises access cost — but inconsistency is the expensive one.` },
              { heading: "Difficulty accessing data, and isolation", text: `File processing environments do not let you retrieve data conveniently. The chapter's example: a bank officer wanting the names of customers in one area has two options — extract it by hand, or ask for a program to be written. Both are unsatisfactory, and the second is the reason the first happens.<br><br><strong>Data isolation</strong> is the structural version: data scattered across files in different formats makes writing any new program hard, because the first job is always reconciling layouts.` }
            ],
            analogy: `Two clocks in one house, set by hand a month apart. Each is perfectly readable; the trouble is you now have two answers to one question and no way to tell which is right. And unlike clocks, nobody notices data drifting — there is no ticking to compare.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.2.1 Drawbacks of Conventional File Processing System, items (i)-(iii). Alpha Science International.`, note: `Redundancy and inconsistency, difficulty in accessing data, and data isolation as enumerated in the chapter.` },
              { ref: `IBM. <em>What is a database schema?</em> https://www.ibm.com/topics/database-schema`, note: `Why a single shared definition is what removes format divergence between programs.` }
            ]
          },
          example: {
            label: "Redundancy, inconsistency, or isolation?",
            steps: [
              `An address stored in two files — REDUNDANCY. Duplication alone. Nothing has gone wrong yet.`,
              `Those two files now disagree after one was updated — INCONSISTENCY. This is the cost redundancy was always going to charge.`,
              `A new report is hard to write because the two files use different date formats — ISOLATION. Note the difference: nothing is duplicated or contradictory here, it is simply scattered and incompatible.`
            ]
          },
          quiz: {
            question: "A bank stores a customer's phone number in both the personal-details file and the loan-applications file. Both currently hold the same value. Which drawback is present?",
            options: [
              "Data inconsistency, because two files hold the same fact",
              "Data isolation, because the files are separate",
              "Data redundancy, which has not yet caused inconsistency",
              "None, because the values agree"
            ],
            correct: 2,
            explanation: `Redundancy is the duplication itself and it is present the moment the second copy exists. Inconsistency is what redundancy makes possible, and it has not happened yet — which is why the last option is tempting. Agreement today is not a property the system guarantees; it is a coincidence waiting to end.`
          },
          recall: {
            prompt: "Explain the relationship between data redundancy and data inconsistency. Why is redundancy a problem even before the copies disagree?",
            answer: `Redundancy is the duplication of the same piece of information across several files, arising because files and programs were created independently over time. Inconsistency is the state that follows when one copy is updated and the others are not, so the copies no longer agree and there is no way to tell which is current. Redundancy is a problem before that happens because it wastes storage space and raises access cost, and because it makes inconsistency inevitable rather than merely possible — nothing in the system is enforcing agreement.`,
            points: [
              `Redundancy = the same fact stored in several files`,
              `Inconsistency = copies disagreeing after a partial update`,
              `Redundancy causes it; agreement is not enforced`,
              `Costs even when consistent: storage and access cost`
            ]
          },
          wisdomTags: ["correction", "self-deception"]
        },

        {
          title: "Concurrency, Security, Integrity, Atomicity",
          explain: {
            blocks: [
              { text: `The remaining four drawbacks are each a guarantee the system cannot make, and each one is later answered by a named DBMS subsystem.` },
              { heading: "Concurrency and security", text: `<strong>Concurrent access anomalies</strong>: to improve throughput, many systems let several users update data at once. Interleaved updates can leave the data wrong. The chapter's example is an account holding 500 from which two withdrawals of 50 and 100 are made simultaneously — the result can end up 400 instead of 350, because each read the same starting balance.<br><br><strong>Security problems</strong>: not every user should see everything. Payroll staff need employee records, not customer accounts. When programs are bolted on in an ad-hoc way, there is no one place to enforce that.` },
              { heading: "Integrity and atomicity", text: `<strong>Integrity problems</strong>: stored values must satisfy consistency constraints — a balance never below a set minimum, say. In file processing these are enforced by code added to each program, so adding a new constraint means editing every program that could violate it. Constraints spanning several files are worse still.<br><br><strong>Atomicity problems</strong>: a transfer of 50 from A to B must happen entirely or not at all. If the system fails midway, the money can leave A without reaching B. Guaranteeing all-or-nothing is very hard when the operation is just a sequence of file writes.` }
            ],
            analogy: `Two people editing the same paper document at one desk, each with their own pen, neither looking up. Both changes are reasonable; the page ends up wrong. The fix is not better handwriting, it is a rule about who holds the page. Where it breaks: the people would eventually notice, and the machine will not.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.2.1, items (iv)-(vii). Alpha Science International.`, note: `Concurrent access anomalies, security, integrity and atomicity problems, including the withdrawal and funds-transfer examples.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.3 Advantages of Database. Alpha Science International.`, note: `The corresponding DBMS answers — concurrency control, data security, integrity constraints and atomic transactions.` }
            ]
          },
          example: {
            label: "Which guarantee failed?",
            steps: [
              `A transfer debits one account and the machine dies before the credit — ATOMICITY. Half of an operation that had to be all or nothing.`,
              `Two simultaneous withdrawals both read the old balance and one overwrites the other — CONCURRENCY. Both writes completed; the interleaving was wrong.`,
              `A new rule says balances cannot go below 100, and enforcing it means editing nine programs — INTEGRITY. Nothing has broken yet; the problem is that the constraint has no single home.`
            ]
          },
          quiz: {
            question: "An order system writes to an inventory file and a sales file. A crash leaves stock decremented but no sale recorded. Which drawback is this, and which is it NOT?",
            options: [
              "Atomicity, not concurrency — the operation was partly completed",
              "Concurrency, not atomicity — two files were written at once",
              "Integrity, not atomicity — a constraint was violated",
              "Security, not integrity — the crash bypassed access control"
            ],
            correct: 0,
            explanation: `A sequence that must happen entirely or not at all completed halfway, which is exactly the atomicity problem. The concurrency answer is the tempting one because two files were involved — but concurrency is about interleaved access by multiple users, and here there was only one operation.`
          },
          recall: {
            prompt: "Name the four remaining drawbacks of file processing after redundancy, difficulty of access and isolation, and give one sentence on each.",
            answer: `Concurrent access anomalies: allowing several users to update simultaneously can leave data inconsistent, as when two withdrawals both read the same starting balance. Security problems: not every user should reach all the data, and when programs are added ad-hoc there is no single place to enforce that. Integrity problems: consistency constraints are enforced by code inside each application program, so adding or changing a constraint means changing many programs, and constraints spanning several files are harder still. Atomicity problems: an operation such as a funds transfer must happen entirely or not at all, and that is difficult to guarantee when it is a sequence of separate file writes.`,
            points: [
              `Concurrent access anomalies — interleaved updates`,
              `Security — no single enforcement point`,
              `Integrity — constraints scattered across programs`,
              `Atomicity — all-or-nothing not guaranteed`
            ]
          },
          wisdomTags: ["limits", "uncertainty"]
        }
      ],
      examQuestions: [
        {
          question: "Which of these is the chapter's definition of a file processing system?",
          options: [
            "A DBMS that stores its tables as flat files on disk",
            "A collection of files together with the programs that access or modify them",
            "An operating system component that manages disk allocation",
            "A database in which every table is stored in a separate file"
          ],
          correct: 1
        },
        {
          question: "Two withdrawals are made at the same time from an account holding 500 — one of 50 and one of 100 — and the balance afterwards reads 400. Which drawback does this illustrate?",
          options: [
            "An atomicity problem, since one withdrawal did not complete",
            "A data isolation problem, since the file was in the wrong format",
            "A concurrent access anomaly, since interleaved updates conflicted",
            "An integrity problem, since the balance constraint was violated"
          ],
          correct: 2
        },
        {
          question: "Why does the chapter describe enforcing integrity constraints as particularly difficult in a file processing system?",
          options: [
            "Constraints live in application code, so adding one means changing many programs",
            "Constraints cannot be expressed at all without a query language",
            "The operating system overwrites constraints when files are reorganised",
            "Constraints require more storage than the data they protect"
          ],
          correct: 0
        },
        {
          question: "A bank officer needs the names of all customers living in one area, and the only options are manual extraction or commissioning a new program. Which drawback is this?",
          options: [
            "Data redundancy",
            "Atomicity problems",
            "Security problems",
            "Difficulty in accessing data"
          ],
          correct: 3
        },
        {
          question: "In the chapter's terms, what distinguishes data isolation from data redundancy?",
          options: [
            "Isolation concerns scattered data in incompatible formats; redundancy concerns duplicated data",
            "Isolation concerns duplicated data; redundancy concerns scattered data",
            "They are two names for the same drawback",
            "Isolation applies only to distributed systems; redundancy only to local ones"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "db-dbms-tradeoffs",
      title: "What a DBMS Buys and What It Costs",
      desc: "The advantages map onto the file-processing drawbacks almost one to one — and then there is the bill",
      icon: "\u2696\uFE0F",
      chunks: [
        {
          title: "Redundancy, Consistency, Integration",
          predict: {
            question: "The chapter says a DBMS controls data redundancy. Does it eliminate it?",
            options: [
              "Yes — a single stored copy is the whole point of a database",
              "No — some duplication is needed to relate tables to each other",
              "Yes, but only in relational systems; earlier models could not",
              "No, because disk mirroring always duplicates every value"
            ],
            reveal: "Worth attempting before reading. The chapter is unusually careful on this one and the careless answer is the one most people give."
          },
          explain: {
            blocks: [
              { text: `In a file processing system each program owned its files, so the same data was recorded in many places. In a DBMS all the organisation's data is integrated into a single database and recorded in one place.<br><br>But the chapter is careful here, and the care is worth copying: redundancy is <strong>controlled or reduced, not removed completely</strong>. Some duplication is necessary in order to relate tables to one another.` },
              { heading: "Consistency follows from control", text: `Data consistency is presented as a consequence, not a separate feature. If an item appears once, an update to it happens once, and the new value is immediately available to everyone. There is no second copy to fall behind.<br><br>That is the whole argument in one line: consistency is not enforced by discipline, it is obtained by removing the opportunity for divergence.` },
              { heading: "Integration", text: `Data integration is the structural side. Data is stored in tables, a single database holds many tables, and relationships can be created between them — which is what makes retrieval and update straightforward rather than a reconciliation exercise.<br><br>Notice how directly these answer §1.2.1: controlling redundancy answers drawback (i), consistency answers the second half of it, integration answers isolation. The advantages list is a rebuttal, item by item.` }
            ],
            analogy: `A shared calendar beats six private ones — but the shared calendar still repeats a room number in every booking, and that repetition is what lets you find every meeting in that room. Duplication that carries a relationship earns its place. The analogy holds only for reference data; duplicating the underlying facts is still the old problem.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.3 Advantages of Database, items (i)-(iv). Alpha Science International.`, note: `Controlling data redundancy, data consistency, data sharing and data integration, including the point that redundancy is reduced but not eliminated.` },
              { ref: `IBM. <em>What is a relational database?</em> https://www.ibm.com/topics/relational-databases`, note: `Supports the claim that relationships between tables are what make integrated retrieval practical.` }
            ]
          },
          example: {
            label: "Justified duplication, or the old problem?",
            steps: [
              `A customer ID repeated in every order row — JUSTIFIED. It carries the relationship; without it the order belongs to nobody.`,
              `A customer's phone number copied into every order row — THE OLD PROBLEM. It carries no relationship, and changing the number now means finding every order.`,
              `A product's price copied into an order line at purchase time — JUSTIFIED, and this is the case that looks wrong. It is not a duplicate of the current price; it is a record of a different fact, the price on that day.`
            ]
          },
          quiz: {
            question: "A team removes every duplicated value from their schema, including foreign keys, storing each fact in exactly one place. What have they misunderstood?",
            options: [
              "Nothing — single storage of every value is the chapter's stated goal",
              "That consistency requires duplication in order to be checkable",
              "That redundancy only matters in file processing systems",
              "That some duplication is required to relate tables to each other"
            ],
            correct: 3,
            explanation: `The chapter states plainly that redundancy is controlled, not removed completely, because relating tables needs shared values. The first option is the trap and it is a fair one — the text does emphasise recording data in one place, and it takes reading the qualifier to see the limit.`
          },
          recall: {
            prompt: "How does a DBMS control data redundancy, and why does the chapter stop short of saying it eliminates it?",
            answer: `In file processing each application program had its own files, so the same data was duplicated in many places. In a DBMS all the data is integrated into a single database and recorded in one place, so multiple copies are reduced to a single copy, saving storage and simplifying retrieval. The chapter stops short of elimination because some duplication is necessary in order to relate tables to each other — shared values are what express relationships. Consistency then follows: if an item appears once, an update happens once and is immediately visible to all users.`,
            points: [
              `Data integrated into one database, recorded in one place`,
              `Reduced or controlled, NOT completely removed`,
              `Because relating tables requires shared values`,
              `Consistency follows: one copy, one update`
            ]
          },
          wisdomTags: ["simplicity", "correction"]
        },

        {
          title: "Sharing, Security, and Surviving Failure",
          explain: {
            blocks: [
              { text: `The second group of advantages answers the guarantees file processing could not make. Each has a named home inside the DBMS rather than being scattered through application code.` },
              { heading: "Sharing and security, which are the same mechanism", text: `Data can be shared by authorised users — many at once, remotely, and across different application programs. Security is the same mechanism seen from the other side: only authorised people get in, and some are restricted to the part of the database that concerns them.<br><br>The database administrator manages this, creating accounts and granting rights; some users may retrieve only, others retrieve and update. One enforcement point, which is exactly what file processing lacked.` },
              { heading: "Atomicity, concurrency, recovery", text: `A transaction is described as an <strong>atomic unit of work</strong>: a sale updates stock, credits the company account and increases a commission, and either all of it happens or the partial work is rolled back.<br><br>Concurrency control subsystems stop two simultaneous updates from overwriting each other. Backup and recovery subsystems restore the database to its prior consistent state after a failure mid-update — automatically, rather than depending on someone having taken a manual copy recently.<br><br>Integrity constraints round it out: rules applied to a value within a record, or to relationships between records, so that only correct data gets in.` }
            ],
            analogy: `A bank vault has one door, one key list, and a log. The strength is not the thickness of the walls but the fact that there is exactly one way in, so the rules only have to be written once. Where the picture fails: a vault protects against entry, while a DBMS mostly protects against half-finished work.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.3, items (v)-(xiii). Alpha Science International.`, note: `Integrity constraints, data security, data atomicity, concurrency control and backup/recovery as listed advantages.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.2.1, items (iv)-(vii). Alpha Science International.`, note: `The matching file-processing drawbacks these advantages are written against.` }
            ]
          },
          example: {
            label: "Which subsystem should catch it?",
            steps: [
              `A sale records the payment but never decrements stock after a power cut — ATOMICITY, handled by the transaction manager rolling the partial work back.`,
              `A payroll clerk opens a customer's account balance — SECURITY, handled by the rights the administrator granted, not by transactions.`,
              `Two clerks book the last seat within the same second and both succeed — CONCURRENCY. Both transactions were individually atomic and both users were authorised, which is why the first two subsystems would not have caught it.`
            ]
          },
          quiz: {
            question: "The chapter calls a transaction an 'atomic unit of work'. A retail sale updates stock, credits an account and increases a commission. The commission step fails. What should happen?",
            options: [
              "All three steps are rolled back, leaving the database as it was",
              "The first two stand and the commission is retried separately later",
              "The sale is recorded and the commission is logged as an exception",
              "The stock update stands because inventory is the authoritative record"
            ],
            correct: 0,
            explanation: `Atomic means the tasks must all complete or be rolled back; partial completion is precisely what the guarantee excludes. The second option is the realistic-sounding trap — retrying later is a common engineering pattern, but it is a decision made outside the transaction, and inside it the rule is all or nothing.`
          },
          recall: {
            prompt: "Explain why data sharing and data security are described as two sides of one mechanism, and name what the DBA controls.",
            answer: `Both rest on the same thing: a single point at which access rights are defined. Sharing means authorised users — many at once, including remote users, and different application programs — can reach the same data. Security means only authorised people can, and that some are restricted to only the part of the database relevant to them. The database administrator manages the data and grants the rights, creating accounts protected by usernames and passwords, and deciding who may retrieve only versus who may retrieve and update. In file processing there was no single place to enforce any of this.`,
            points: [
              `Same mechanism: one point where rights are defined`,
              `Sharing = many authorised users, remote, across programs`,
              `Security = restriction, possibly to part of the database`,
              `The DBA creates accounts and grants retrieve/update rights`
            ]
          },
          wisdomTags: ["planning", "limits"]
        },

        {
          title: "The Bill",
          explain: {
            blocks: [
              { text: `The chapter calls the disadvantages minor, and then lists five things that have sunk real projects. They are worth taking at face value, because every one of them is a cost paid up front against benefits that arrive later.` },
              { heading: "What it costs to start", text: `<strong>Hardware and software.</strong> A DBMS wants a fast processor and a large memory, so the hardware used for a file-based system generally has to be upgraded, and the software itself is expensive.<br><br><strong>Data conversion.</strong> When a file-based system is replaced, the data in those files has to be converted into database files — difficult and time-consuming, and it has to be right the first time.<br><br><strong>Staff.</strong> Two separate costs. Training, at every level: programming, application development, administration. And hiring — a database administrator or designer, a system designer, application programmers.` },
              { heading: "What it costs to run", text: `<strong>Database failures.</strong> This is the one that follows directly from the central advantage. Because all the data is integrated into a single database, a power failure or a corrupted storage medium can take the whole organisation down at once rather than one department.<br><br>Integration is the source of nearly every advantage in §1.3 and it is also the source of this risk. Concentrating data concentrates the consequences of losing it. That is the honest reading of the section, and it is why backup and recovery is listed as an advantage rather than an optional extra.` }
            ],
            analogy: `Moving six filing cabinets into one strongroom is better in every way until the strongroom floods. The strongroom is still right — but the reason it is right, everything in one place, is exactly the reason the flood is worse. Insurance is not a criticism of the strongroom; it is part of its price.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.4 Disadvantages of Database. Alpha Science International.`, note: `The five disadvantages: hardware and software cost, data conversion cost, staff training, appointing technical staff, and database failures.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.3, item (xiii). Alpha Science International.`, note: `Backup and recovery, the advantage that exists because of the failure risk described here.` }
            ]
          },
          example: {
            label: "Three organisations, three verdicts",
            steps: [
              `A hospital network with twelve departments duplicating patient records — MIGRATE. The costs are real but redundancy and integrity are already causing harm.`,
              `A two-person business with one product list in one spreadsheet — DO NOT. There is no redundancy to control and the training and staffing costs buy nothing.`,
              `A ten-year-old logistics firm whose data is consistent but scattered across incompatible formats — MIGRATE, and note why: consistency is not the deciding factor. Isolation and difficulty of access are, and they get worse as the firm grows.`
            ]
          },
          quiz: {
            question: "Which disadvantage in §1.4 is a direct consequence of the integration that produces most of §1.3's advantages?",
            options: [
              "The cost of hardware and software",
              "The cost of staff training",
              "The cost of data conversion",
              "Database failures affecting the whole organisation"
            ],
            correct: 3,
            explanation: `Integrating all data into one database is what removes redundancy — and it is also what means one corrupted medium can stop everything, rather than one department. Data conversion is the tempting answer because it too arises from adopting a database, but it is a one-off migration cost, not a structural consequence of integration.`
          },
          recall: {
            prompt: "List the disadvantages of adopting a DBMS, and identify which one is structural rather than a one-off cost.",
            answer: `Cost of hardware and software: a DBMS needs a fast processor and large memory, so hardware usually has to be upgraded and the software itself is costly. Cost of data conversion: existing file data must be converted into database files, which is difficult and time-consuming. Cost of staff training: required at all levels including programming, application development and administration. Appointing technical staff: a DBA or database designer, system designer and application programmers must be hired. Database failures: the structural one — because all data is integrated into a single database, corruption or power failure can lose valuable data or stop the whole system, where a file-based system would have lost only part.`,
            points: [
              `Hardware and software cost`,
              `Data conversion cost`,
              `Staff training and appointing technical staff`,
              `Database failures — the structural one, caused by integration`
            ]
          },
          wisdomTags: ["uncertainty", "planning"]
        }
      ],
      examQuestions: [
        {
          question: "According to the chapter, what happens to data redundancy in a DBMS?",
          options: [
            "It is eliminated entirely, since each fact is stored exactly once",
            "It is controlled or reduced, but not removed completely",
            "It is increased deliberately to improve read performance",
            "It is unchanged; a DBMS addresses consistency instead"
          ],
          correct: 1
        },
        {
          question: "Why does the chapter present data consistency as following from controlled redundancy rather than as an independent feature?",
          options: [
            "Because consistency checks are run as a nightly batch process",
            "Because consistency is enforced by application programs, not the DBMS",
            "Because if an item appears once, an update happens once and reaches everyone",
            "Because consistency only matters in systems with multiple users"
          ],
          correct: 2
        },
        {
          question: "A point-of-sale transaction updates stock, credits the company account and increases a salesperson's commission. What does calling this an 'atomic unit of work' require?",
          options: [
            "That the tasks all complete, or the partially completed work is rolled back",
            "That each task is committed separately so a failure loses only one",
            "That the tasks run in a fixed order with the most important first",
            "That no other user may read the database while it runs"
          ],
          correct: 0
        },
        {
          question: "Which disadvantage arises specifically because all of an organisation's data has been integrated into a single database?",
          options: [
            "Staff must be trained at every level",
            "Existing file data must be converted",
            "A DBA and application programmers must be appointed",
            "A single failure or corruption can stop the whole system"
          ],
          correct: 3
        },
        {
          question: "The chapter lists 'development of application', 'creating forms' and 'report writers' among the advantages of a DBMS. What do these three have in common?",
          options: [
            "They reduce the cost and time of building applications on top of the data",
            "They are security features restricting what each user may see",
            "They are required by Codd's rules for a relational system",
            "They apply only to active database management systems"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "db-views-of-data",
      title: "Views of Data",
      desc: "Abstraction levels, data independence, and the difference between an instance and a schema",
      icon: "\u{1F453}",
      chunks: [
        {
          title: "Three Levels of Abstraction",
          predict: {
            question: "A database hides how data is physically stored. Who is that mainly for?",
            options: [
              "The disk controller, which needs a stable interface",
              "The database administrator, who must audit storage",
              "The users and application programs, who should not need to know",
              "Nobody — it is a side effect of using files"
            ],
            reveal: "Attempt it first. The answer is close to obvious, but the reason the chapter gives is more specific than 'convenience', and that reason is what the next two chunks build on."
          },
          explain: {
            blocks: [
              { text: `A major purpose of a database system is to give users an <em>abstract view</em> of the data — to hide details of how it is stored and maintained.<br><br>The reason is practical. Designers use complex data structures so that data can be stored and retrieved efficiently, but not every user is computer-trained, and none of them should have to be. The complexity is hidden behind levels.` },
              { heading: "The three levels", text: `<strong>Physical level</strong> — the lowest. Describes how the data is actually stored, in detail, including the complex low-level data structures.<br><br><strong>Logical level</strong> — the next level up. Describes <em>what</em> data is stored and what relationships exist among that data. Not how, what.<br><br><strong>View level</strong> — the highest. Describes only part of the entire database: the slice one kind of user needs.` },
              { heading: "Why three and not two", text: `Two levels would give you "how it is stored" and "what is stored", which already hides the disk. The third exists for a different reason: different users need different parts, and showing a payroll clerk the whole logical schema is both confusing and a security problem.<br><br>So the bottom boundary is about efficiency and the top boundary is about audience. Keeping those two purposes separate is what makes the next chunk — data independence — make sense.` }
            ],
            analogy: `A building has structural drawings, a floor plan, and the sign by the lift saying which departments are on this floor. All three describe one building at different resolutions, and most people only ever need the third. It breaks down in that a floor plan is not automatically regenerated when the structure changes, and a logical schema is meant to be.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.5 Views of Data and §1.5.1 Data Abstraction. Alpha Science International.`, note: `The three levels of abstraction — physical, logical and view — as defined and ordered here.` },
              { ref: `IBM. <em>What is a database schema?</em> https://www.ibm.com/topics/database-schema`, note: `Supports the description of a logical schema as what is stored and how it relates, rather than how it is laid out on disk.` }
            ]
          },
          example: {
            label: "Which level is this statement about?",
            steps: [
              `"Customer records are held in a B-tree indexed on account number" — PHYSICAL. It describes how, in terms of a data structure.`,
              `"A customer has many accounts, and each account has one branch" — LOGICAL. What is stored, and the relationships between them.`,
              `"The teller screen shows name, balance and last five transactions" — VIEW. Note it names no structure and no relationships; it describes a slice for one audience.`
            ]
          },
          quiz: {
            question: "A statement reads: 'Every order references exactly one customer.' Which level of abstraction does it describe, and how can you tell?",
            options: [
              "Physical, because references are implemented as pointers on disk",
              "View, because it describes what one kind of user sees",
              "Logical, because it states what is stored and how it relates",
              "None — it is an integrity constraint, not a level of abstraction"
            ],
            correct: 2,
            explanation: `It names data and a relationship without saying how either is stored, which is the logical level exactly. The last option is the interesting trap: it IS also an integrity constraint, but constraints are expressed at the logical level, so being one does not put it outside the three levels.`
          },
          recall: {
            prompt: "Name the three levels of data abstraction, in order, and say what each describes.",
            answer: `Physical level — the lowest. It describes how the data is actually stored, including complex low-level data structures, in detail. Logical level — the next level up. It describes what data is stored in the database and what relationships exist among that data. View level — the highest. It describes only part of the entire database, the portion a particular group of users needs. The purpose of the whole arrangement is to give users an abstract view: designers use complex structures for efficient storage and retrieval, but users are not required to know those details.`,
            points: [
              `Physical — how data is actually stored`,
              `Logical — what data is stored and its relationships`,
              `View — only part of the database, per user group`,
              `Purpose: hide complexity from users who need not know it`
            ]
          },
          wisdomTags: ["simplicity", "beginning"]
        },

        {
          title: "Data Independence",
          explain: {
            blocks: [
              { text: `Data independence is the ability to modify a scheme definition at one level without affecting the scheme definition at the next higher level. There are two kinds, and one is decidedly harder than the other.` },
              { heading: "Physical and logical", text: `<strong>Physical data independence</strong> is the ability to change the physical scheme without application programs having to be rewritten. Changes at the physical level are occasionally necessary in order to improve performance — adding an index, changing a storage layout.<br><br><strong>Logical data independence</strong> is the ability to change the conceptual scheme without application programs having to be rewritten. Changes at the conceptual level are needed whenever the logical structure of the database is altered.` },
              { heading: "Why logical is harder", text: `The chapter states it directly: logical data independence is more difficult to achieve than physical, <em>because application programs are heavily dependent on the logical structure of the data they access</em>.<br><br>The reasoning is worth holding on to. A program never mentions a B-tree, so replacing one costs it nothing. But a program is written entirely in terms of tables, columns and relationships — the logical structure is its vocabulary. Change that vocabulary and the program stops making sense.<br><br>This is a common exam question and it is easy to state backwards, because "physical sounds lower and therefore harder" is a tempting shortcut.` }
            ],
            analogy: `Rewiring a house behind the plaster changes nothing for the people living there. Moving the kitchen into the front room changes everything, even though it is less work. Distance from the user, not depth in the stack, decides how much a change costs. Where it stops: a house has no equivalent of a program that breaks silently.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.5.2 Data Independence. Alpha Science International.`, note: `The definition of data independence and the statement that logical independence is harder to achieve than physical.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.3, item (xiv) Data Independence. Alpha Science International.`, note: `The same idea listed among the advantages of a DBMS: database and application programs are separated, with the DBMS between them.` }
            ]
          },
          example: {
            label: "Which independence is being tested?",
            steps: [
              `An index is added to speed up a slow report, and no application changes — PHYSICAL. The storage changed; what is stored did not.`,
              `A column is split into two and every query still runs — LOGICAL, and this is the hard one. What is stored changed, and the programs survived it.`,
              `A server is moved to faster disks — NEITHER. No scheme definition changed at either level, so no independence was exercised at all.`
            ]
          },
          quiz: {
            question: "Two changes are proposed: (a) replacing the storage structure of a table, (b) merging two tables into one. Both must leave applications untouched. Which is harder, and why?",
            options: [
              "(a), because physical changes reach every layer above them",
              "(b), because programs are heavily dependent on logical structure",
              "(a), because physical independence was defined first historically",
              "Equally hard, since both require rewriting the conceptual scheme"
            ],
            correct: 1,
            explanation: `Logical independence is the harder one precisely because applications are written in terms of the logical structure. The first option is the natural-sounding trap — lower in the stack feels like it should be more disruptive, but a program that never names a storage structure cannot be broken by changing one.`
          },
          recall: {
            prompt: "Define data independence, distinguish its two kinds, and say which is harder to achieve and why.",
            answer: `Data independence is the ability to modify a scheme definition at one level without affecting the scheme definition at the next higher level. Physical data independence is the ability to modify the physical scheme without causing application programs to be rewritten; physical modifications are occasionally needed to improve performance. Logical data independence is the ability to modify the conceptual scheme without causing application programs to be rewritten; conceptual modifications are needed whenever the logical structure of the database is altered. Logical is more difficult to achieve, because application programs are heavily dependent on the logical structure of the data they access.`,
            points: [
              `Change one level without affecting the next higher one`,
              `Physical = change physical scheme, no program rewrite`,
              `Logical = change conceptual scheme, no program rewrite`,
              `Logical is harder — programs depend on logical structure`
            ]
          },
          wisdomTags: ["change", "limits"]
        },

        {
          title: "Instances and Schemas",
          explain: {
            blocks: [
              { text: `Databases change over time as information is inserted and deleted. That gives two things worth naming separately, and confusing them is a classic error.<br><br>The collection of information stored in the database <em>at a particular moment</em> is an <strong>instance</strong>. The overall design of the database is the <strong>schema</strong>.` },
              { heading: "One schema, many instances", text: `The schema changes rarely — it is the design. The instance changes constantly — it is the contents. Every insert produces a new instance, and none of them touch the schema.<br><br>This is the same distinction as a variable's type versus its value at a point in a program, and if that comparison helps, use it; the structure of the idea is identical.` },
              { heading: "Types of schema", text: `Schemas exist at the same levels as abstraction, which is not a coincidence — they are the written form of those levels.<br><br><strong>Physical schema</strong> — the database design at the physical level.<br><strong>Logical schema</strong> — the design at the logical level.<br><strong>Subschema</strong> — a database may have several subschemas at the view level, each describing a different view of the database.<br><br>Read alongside the previous chunk, data independence is now expressible in one sentence: it is the ability to change one of these schemas without forcing a change in the one above it.` }
            ],
            analogy: `A recipe is the schema; the cake on the table is the instance. Bake it twice and you have two instances of one recipe, and the second cake does not amend the recipe. The comparison misleads slightly in that a cake is finished, while a database instance changes with every insert.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §1.5.3 Instances and Schemas. Alpha Science International.`, note: `The instance/schema distinction and the three schema types — physical, logical and subschema.` },
              { ref: `IBM. <em>What is a database schema?</em> https://www.ibm.com/topics/database-schema`, note: `Independent confirmation of the schema-as-design definition, in an openly readable source.` }
            ]
          },
          example: {
            label: "Instance or schema?",
            steps: [
              `Adding a column to the customer table — SCHEMA. The design changed.`,
              `Adding ten thousand customer rows — INSTANCE. The design is untouched; only the contents at this moment differ.`,
              `Adding a constraint that email addresses must be unique — SCHEMA, and this is the one people get wrong. Nothing about the current rows is being changed, but the design now says something new about what rows are permitted.`
            ]
          },
          quiz: {
            question: "A database has had three million rows inserted and two hundred deleted since Monday. No table, column or constraint has been altered. What has changed?",
            options: [
              "The instance has changed; the schema has not",
              "The schema has changed, since its contents define it",
              "Both, because inserting rows extends the logical schema",
              "Neither, since only the physical level was touched"
            ],
            correct: 0,
            explanation: `The instance is the collection of information at a particular moment, so it changes with every insert and delete; the schema is the overall design and was not touched. The last option is the plausible distractor — it is true that storage changed, but the physical level has its own schema, and that was not altered either.`
          },
          recall: {
            prompt: "Distinguish an instance from a schema, and name the three types of schema.",
            answer: `A database changes over time as information is inserted and deleted. The collection of information stored in the database at a particular moment is called an instance of the database. The overall design of the database is called the schema. One schema corresponds to many instances over time — the design changes rarely, the contents change constantly. The three types of schema are the physical schema, describing the design at the physical level; the logical schema, describing the design at the logical level; and subschemas, of which a database may have several at the view level, each describing a different view of the database.`,
            points: [
              `Instance = the information stored at a particular moment`,
              `Schema = the overall design of the database`,
              `One schema, many instances over time`,
              `Physical schema, logical schema, subschema (view level)`
            ]
          },
          wisdomTags: ["simplicity", "self-knowledge"]
        }
      ],
      examQuestions: [
        {
          question: "Which level of data abstraction describes what data is stored and what relationships exist among that data?",
          options: [
            "The view level",
            "The logical level",
            "The physical level",
            "The conceptual instance"
          ],
          correct: 1
        },
        {
          question: "Why does the chapter say logical data independence is more difficult to achieve than physical data independence?",
          options: [
            "Because the logical level sits closer to the storage medium",
            "Because physical changes are made more frequently in practice",
            "Because application programs depend heavily on logical structure",
            "Because the logical schema cannot be modified once created"
          ],
          correct: 2
        },
        {
          question: "Ten thousand records are inserted into a database over a week, with no design change. In the chapter's terms, what has changed?",
          options: [
            "The instance only",
            "The logical schema only",
            "Both the instance and the schema",
            "The subschema only"
          ],
          correct: 0
        },
        {
          question: "A database may have several of which type of schema, at the view level?",
          options: [
            "Physical schemas",
            "Logical schemas",
            "Conceptual schemas",
            "Subschemas"
          ],
          correct: 3
        },
        {
          question: "What is physical data independence?",
          options: [
            "The ability to modify the physical scheme without rewriting application programs",
            "The ability to store a database across several physical machines",
            "The ability to modify the conceptual scheme without rewriting application programs",
            "The guarantee that physical storage is never modified after creation"
          ],
          correct: 0
        }
      ]
    },

    // ============================================================
    {
      id: "db-early-data-models",
      title: "Trees and Graphs: Early Data Models",
      desc: "What a data model is, and the two that came before the relational one",
      icon: "\u{1F333}",
      chunks: [
        {
          title: "What a Data Model Is",
          predict: {
            question: "Before reading: what do you think a 'data model' specifies?",
            options: [
              "The programming language a database is written in",
              "The underlying structure of the database and how data relates",
              "The physical disk layout chosen by the storage manager",
              "The set of queries an application is permitted to run"
            ],
            reveal: "Guess and move on. The term is used loosely in industry, and the chapter's definition is broader than most people expect — it covers four things, not one."
          },
          explain: {
            blocks: [
              { text: `The underlying structure of a database is called its <strong>data model</strong>. The chapter defines it as a collection of conceptual tools for describing four things: data, data relationships, data semantics, and consistency constraints.` },
              { heading: "Four things, not one", text: `That list is worth reading slowly, because each item rules something out.<br><br><em>Data</em> — what the units of storage are. <em>Data relationships</em> — how those units connect. <em>Data semantics</em> — what they mean, which is the context from the very first chunk of this module reappearing as a formal requirement. <em>Consistency constraints</em> — what combinations are permitted.<br><br>A notation that describes only the first two is not a data model in this sense. It is a diagramming convention.` },
              { heading: "The six the chapter names", text: `Hierarchical, network, object-oriented, object-relational, relational, and entity-relationship.<br><br>The first two are the historical ones and they are covered next. The relational model gets a topic of its own because it displaced both. Reading them in that order is deliberate: the relational model's design decisions only look inevitable once you have seen what it was reacting against.` }
            ],
            analogy: `A data model is closer to a grammar than to a vocabulary. It does not tell you what to say, it tells you what counts as a sentence — which structures are expressible and which are simply not sayable. And as with grammar, what a model cannot express shapes the thinking of everyone using it.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.1 Data Models (pp. 36-42). Alpha Science International.`, note: `The four-part definition of a data model and the six models the chapter enumerates.` },
              { ref: `Codd, E. F. (1970). A relational model of data for large shared data banks. <em>Communications of the ACM</em>, 13(6), 377-387.`, note: `The paper that introduced the relational model, cited here because the chapter's list is ordered around it.` }
            ]
          },
          example: {
            label: "Is this a data model?",
            steps: [
              `A notation with entities, relationships, attributes and cardinality rules — YES. All four parts are covered.`,
              `A box-and-arrow sketch on a whiteboard with no rules about what is legal — NO. Structure and relationships only; no semantics, no constraints.`,
              `A file format specification listing byte offsets and field lengths — NO, and this is the near-miss. It describes data precisely and even constrains it, but it says nothing about relationships between records.`
            ]
          },
          quiz: {
            question: "A team documents their storage as a list of tables and columns with types, and nothing else. Against the chapter's four-part definition, what is missing?",
            options: [
              "Nothing — types are constraints, so all four parts are present",
              "Data relationships and data semantics",
              "Only consistency constraints, since types cover semantics",
              "Only data relationships, since types cover semantics and constraints"
            ],
            correct: 1,
            explanation: `Types constrain individual values, so consistency constraints are partly covered — but nothing states how tables connect or what the data means. The last option is the closest wrong answer, and it fails because a type says what a value may be, not what it signifies.`
          },
          recall: {
            prompt: "Define a data model as the chapter does, and name the six models it lists.",
            answer: `A data model is the underlying structure of the database: a collection of conceptual tools for describing data, data relationships, data semantics, and consistency constraints. The six models named are the hierarchical model, the network model, the object-oriented model, the object-relational model, the relational model, and the entity-relationship model.`,
            points: [
              `Underlying structure of the database`,
              `Conceptual tools for describing four things`,
              `Data, relationships, semantics, consistency constraints`,
              `Six models: hierarchical, network, object-oriented, object-relational, relational, entity-relationship`
            ]
          },
          wisdomTags: ["beginning", "tradition"]
        },

        {
          title: "The Hierarchical Model",
          explain: {
            blocks: [
              { text: `The hierarchical data model organises data in a <strong>tree</strong>. Each entity has exactly one parent but may have several children, and the single entity at the top is called the <strong>root</strong>.<br><br>The rule that defines everything else: one parent can have many children, but a child is allowed only one parent. Linkages run vertically only — never horizontally or diagonally — so two entities at the same level have no relationship unless they share a parent.` },
              { heading: "What it was good at", text: `Speed of access to large datasets, and real efficiency when the database holds many transactions over relationships that do not change. Data at the top of the hierarchy is very fast to reach. Addition and deletion of new information is straightforward.<br><br>It was also the first database model to offer data security enforced by the DBMS itself rather than left to application code — a genuine milestone. And it maps naturally onto things that really are hierarchies: assembly plants, company org charts, anything that is honestly one-to-many.` },
              { heading: "What it could not do", text: `It models one-to-many only. <strong>Many-to-many relationships are not supported</strong>, which is the limitation that ended it, because so much real data is many-to-many.<br><br>The rest follows: data must be stored repetitively across entities, there is a lack of structural independence, implementation is complex, and searching means running the model top to bottom until the answer appears — so queries against lower entities are slow. Its affinity for linear storage such as tape is now worth nothing.` }
            ],
            analogy: `A family tree drawn strictly downward answers "who are this person's children?" instantly and cannot express "these two people co-wrote a book". The structure is not merely inconvenient for that question — it has no place to put the answer. Where the analogy breaks: a real family tree tolerates two parents, and this model does not.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.2 Hierarchical Model. Alpha Science International.`, note: `The tree structure and single-parent rule, and both the advantage and disadvantage lists summarised here.` },
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.3 Network Model. Alpha Science International.`, note: `The contrast used at the end of this chunk: the network model is defined by removing the single-parent restriction.` }
            ]
          },
          example: {
            label: "Does it fit a tree?",
            steps: [
              `Department → Courses → Students enrolled — NO, and this is the standard trap. It looks like a tree until you notice a student takes several courses, which needs two parents.`,
              `Company → Divisions → Teams → Employees — YES, if each employee sits in exactly one team. Honest one-to-many all the way down.`,
              `Invoice → Line items — YES. A line item belongs to exactly one invoice and cannot be shared, which is what the model requires.`
            ]
          },
          quiz: {
            question: "A university tries to model 'a student may enrol in many courses, and a course has many students' in a hierarchical database. What happens?",
            options: [
              "It works, because the root can be either students or courses",
              "It works only if enrolment records are stored at the root",
              "It cannot be represented directly, since only one-to-many is supported",
              "It works, but queries against it run slowly"
            ],
            correct: 2,
            explanation: `Many-to-many is the one thing the hierarchical model does not support, because a child may have only one parent. The last option is the tempting near-miss — slow queries against lower entities are a real drawback of the model, but here the relationship cannot be expressed at all, which is a different order of problem.`
          },
          recall: {
            prompt: "Describe the structure of the hierarchical model and state the limitation that mattered most.",
            answer: `The hierarchical model organises data in a tree structure. Each entity has only one parent but can have several children, and the single entity at the top is the root. Linkages are possible vertically only, not horizontally or diagonally, so entities at the same level have no relationship unless they share a parent. Its strengths were fast access to large datasets, efficiency where relationships are fixed, DBMS-enforced data security — the first model to offer it — and a natural fit for genuine hierarchies. The limitation that mattered most is that it can model only one-to-many relationships; many-to-many is not supported, since a child may have only one parent.`,
            points: [
              `Tree structure; one parent, many children; a root`,
              `Vertical linkages only`,
              `Strengths: speed, fixed-relationship efficiency, DBMS-enforced security`,
              `Cannot model many-to-many relationships`
            ]
          },
          wisdomTags: ["tradition", "limits"]
        },

        {
          title: "The Network Model",
          explain: {
            blocks: [
              { text: `The network data model — also called the <strong>CODASYL data model</strong>, or sometimes the <strong>DBTG data model</strong> — is built on directed graph theory. It replaces the hierarchical tree with a graph, which allows more general connections between nodes.` },
              { heading: "The one difference that matters", text: `The main difference from the hierarchical model is its ability to handle <strong>many-to-many</strong> relationships. Put in the model's own terms: a record is allowed to have more than one parent.<br><br>That single relaxation is the whole design. Drop the one-parent rule and a tree becomes a graph, and the relationship the hierarchical model could not express becomes expressible.` },
              { heading: "What it gained", text: `The chapter credits it with conceptual simplicity, the capability to handle more relationship types, and data independence.<br><br>Take the third one seriously — data independence appears here as an advantage of a specific model, and it is the same property from §1.5.2. This is the point in the history where separating a program from the structure it reads starts being treated as a design goal in its own right rather than a happy accident.<br><br>It was still navigational: you followed links between records rather than describing what you wanted. That is precisely the habit the relational model was written to break, which is where the next topic starts.` }
            ],
            analogy: `A road map instead of a river system. Rivers only ever join going downstream; roads connect anything to anything, and the price is that you now need directions rather than just following the current. That price — having to know the route — is what the relational model set out to remove.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.3 Network Model. Alpha Science International.`, note: `The CODASYL/DBTG naming, the directed-graph basis, many-to-many support, and the three advantages listed.` },
              { ref: `CODASYL Data Base Task Group. (1971). <em>April 1971 Report</em>. Association for Computing Machinery.`, note: `The committee report the model is named after, cited for the CODASYL/DBTG attribution rather than for any claim above.` }
            ]
          },
          example: {
            label: "Tree, graph, or neither?",
            steps: [
              `Students and courses, each student in many courses — GRAPH. Needs the network model; the hierarchical one cannot hold it.`,
              `Invoice and its line items — TREE. Expressible in either model, so the hierarchical model's speed advantage still applies.`,
              `Employees, each with exactly one manager, up to a single chief executive — TREE, and it is worth noticing why: it is a many-to-many-looking situation (a manager has many reports) that is genuinely one-to-many when read in the other direction.`
            ]
          },
          quiz: {
            question: "A designer says: 'We switched from hierarchical to network so that a record could belong to more than one parent.' What capability did that unlock?",
            options: [
              "Faster access to records at the top of the structure",
              "Representation of many-to-many relationships",
              "Elimination of the need for consistency constraints",
              "Non-procedural querying in a language like SQL"
            ],
            correct: 1,
            explanation: `Allowing multiple parents is exactly what makes many-to-many expressible, and it is the model's headline difference. The last option is the trap worth understanding: the network model is still navigational, and non-procedural querying arrives with the relational model, not this one.`
          },
          recall: {
            prompt: "What is the network model also called, what is it based on, and what is its main difference from the hierarchical model?",
            answer: `The network data model is also known as the CODASYL data model, or sometimes the DBTG data model. It is based on directed graph theory: it replaces the hierarchical tree with a graph, allowing more general connections among the nodes. Its main difference from the hierarchical model is the ability to handle many-to-many relationships — in other words, it allows a record to have more than one parent. Its listed advantages are conceptual simplicity, the capability to handle more relationship types, and data independence.`,
            points: [
              `Also called CODASYL or DBTG data model`,
              `Based on directed graph theory; graph replaces tree`,
              `Handles many-to-many; a record may have several parents`,
              `Advantages: conceptual simplicity, more relationship types, data independence`
            ]
          },
          wisdomTags: ["change", "tradition"]
        }
      ],
      examQuestions: [
        {
          question: "The chapter defines a data model as a collection of conceptual tools for describing which four things?",
          options: [
            "Tables, rows, columns and indexes",
            "Data, data relationships, data semantics and consistency constraints",
            "Storage, retrieval, updating and deletion",
            "Physical, logical, view and conceptual levels"
          ],
          correct: 1
        },
        {
          question: "In the hierarchical model, what rule governs parents and children?",
          options: [
            "One parent may have many children, and a child may have only one parent",
            "One parent may have one child, and a child may have many parents",
            "Any node may have any number of parents and children",
            "Only the root may have children; all other nodes are leaves"
          ],
          correct: 0
        },
        {
          question: "Which of these is listed as an advantage of the hierarchical model?",
          options: [
            "Support for many-to-many relationships",
            "Non-procedural query languages such as SQL",
            "It was the first model to offer DBMS-enforced data security",
            "Complete structural independence from application programs"
          ],
          correct: 2
        },
        {
          question: "The network model is based on which mathematical foundation, and what does it replace?",
          options: [
            "Set theory; it replaces records with relations",
            "Directed graph theory; it replaces the hierarchical tree with a graph",
            "Predicate logic; it replaces navigation with declarative queries",
            "Tree traversal; it replaces the graph with an indexed tree"
          ],
          correct: 1
        },
        {
          question: "By what other names does the chapter say the network model is known?",
          options: [
            "The ANSI/SPARC model or the three-schema model",
            "The Codd model or the tabular model",
            "The CODASYL data model or the DBTG data model",
            "The navigational model or the pointer model"
          ],
          correct: 2
        }
      ]
    },

    // ============================================================
    {
      id: "db-relational-model",
      title: "The Relational Model",
      desc: "Codd's tables, his twelve rules, and the three components every relational system rests on",
      icon: "\u{1F4CA}",
      chunks: [
        {
          title: "Codd's Move: Tables Instead of Links",
          predict: {
            question: "The relational model removed parent-child links between records. How were relationships then expressed?",
            options: [
              "Through pointers stored in a separate index file",
              "Through values shared between independent tables",
              "Relationships were dropped; each table stands alone",
              "Through the order in which rows are physically stored"
            ],
            reveal: "Attempt it. This is the single idea the whole model turns on, and getting it wrong first makes the right answer stick better than reading it cold."
          },
          explain: {
            blocks: [
              { text: `The relational model was introduced by <strong>Dr E. F. Codd in 1970</strong>. It represents data as two-dimensional tables, and the organisation of data into those tables is the logical view of the database. Oracle, Microsoft SQL Server and Sybase are built on it.` },
              { heading: "What Codd removed", text: `The move was subtractive. The relational model <em>eliminated all parent-child relationships</em> and represented everything as simple row-and-column tables of values.<br><br>A relation is similar to a table of rows and columns. Each table is an independent entity: there is no physical relationship between tables. Relationships are carried by the values themselves, not by stored links — which is what makes each table stand alone.` },
              { heading: "What that bought", text: `Two things follow directly. First, the model rests on <strong>set theory</strong> rather than on navigation, so operations combine whole tables instead of walking one record at a time.<br><br>Second, the user interface becomes <strong>non-procedural</strong>: you specify <em>what</em> needs to be done, not <em>how</em> it should be done. Most systems built on the model support a query language such as ANSI SQL or QBE, and these are simple enough constructs to allow ad-hoc manipulation of a table — asking a question nobody anticipated, without commissioning a program. That was the file-processing complaint from §1.2.1, finally answered.` }
            ],
            analogy: `Navigational models are turn-by-turn directions; relational is naming the destination. Directions are useless if a road closes, and they encode the route rather than the goal. The gap in the comparison: a driver can improvise around a closure, and a navigational program cannot — it simply fails.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.6 and §2.6.1 Characteristics of Relational Model. Alpha Science International.`, note: `Codd's 1970 introduction, the elimination of parent-child relationships, set-theoretic basis and non-procedural interface.` },
              { ref: `Codd, E. F. (1970). A relational model of data for large shared data banks. <em>Communications of the ACM</em>, 13(6), 377-387.`, note: `The original paper, cited for the model's introduction and date.` }
            ]
          },
          example: {
            label: "How is the relationship carried?",
            steps: [
              `A hierarchical database linking an order to a customer by a stored pointer — BY THE STRUCTURE. Break the pointer and the relationship is gone.`,
              `A relational database where the order row holds the customer's ID — BY A VALUE. Nothing physical joins the tables; the match is computed when asked.`,
              `A relational database where orders happen to be stored next to their customer on disk — BY NEITHER, and this is the point. Physical adjacency is invisible to the model; it may speed a query up, but it expresses nothing.`
            ]
          },
          quiz: {
            question: "In a relational database, two tables have no stored link of any kind between them. How can a query still return customers together with their orders?",
            options: [
              "It cannot; a foreign key constraint creates a physical link first",
              "The DBMS maintains hidden pointers created when the tables are joined",
              "Matching values in both tables are combined when the query runs",
              "The tables must be merged into one before such a query is possible"
            ],
            correct: 2,
            explanation: `Relationships in the relational model live in values, and the combination is computed at query time — each table is an independent entity with no physical relationship to any other. The first option is the strong trap: a foreign key does declare a relationship, but it declares a constraint on values, not a stored link between tables.`
          },
          recall: {
            prompt: "Who introduced the relational model and when, and what did it eliminate? How are relationships expressed instead?",
            answer: `The relational model was introduced by Dr E. F. Codd in 1970. It represents data in the form of two-dimensional tables, and that organisation is the logical view of the database. It eliminated all parent-child relationships, representing all data as simple row-and-column tables of values. A relation is similar to a table of rows and columns, and each table is an independent entity with no physical relationship between tables — so relationships are expressed by values shared between tables rather than by stored links. The model is based on set theory, and its user interface is non-procedural: you specify what needs to be done, not how.`,
            points: [
              `Codd, 1970; two-dimensional tables as the logical view`,
              `Eliminated parent-child relationships`,
              `Tables are independent; no physical relationship between them`,
              `Based on set theory; non-procedural interface (SQL, QBE)`
            ]
          },
          wisdomTags: ["change", "simplicity"]
        },

        {
          title: "Codd's Twelve Rules",
          explain: {
            blocks: [
              { text: `Codd set out rules defining an ideal relational database, used as a guideline for designing relational systems. There are thirteen counting Rule 0, and the chapter is explicit that <em>no commercial system completely conforms to all of them</em> — they interpret the relational approach rather than certify it.` },
              { heading: "The shape of the list", text: `They cluster. <strong>Rule 0</strong> requires the system to qualify as relational both as a database and as a management system. <strong>Rules 1-2</strong> demand that all information appear in exactly one way, as values in a table, and that any datum be reachable from table name, primary key and column name. <strong>Rule 3</strong> requires systematic treatment of nulls, independent of data type.<br><br><strong>Rules 4-7</strong> cover the online catalogue, a comprehensive data sublanguage, view updating, and set-at-a-time insert, update and delete. <strong>Rules 8-11</strong> are four independences: physical, logical, integrity and distribution. <strong>Rule 12</strong> forbids subverting the high-level integrity rules through a low-level language.` },
              { heading: "The one that is argued about", text: `Rule 3 is the most controversial, and the reason is worth knowing. Codd's rules and SQL use <em>ternary</em> logic: null represents missing data, and comparing anything to null yields an unknown truth state.<br><br>The objection is that not everything missing is genuinely unknown — some values are simply inapplicable, and treating both as one kind of null loses that distinction. Note that rules 8 and 9 are the same physical and logical independence from §1.5.2, now stated as a requirement rather than a description.` }
            ],
            analogy: `Building codes describe a house nobody quite builds. That does not make them decorative — they are the yardstick that tells you what a shortcut cost you. Codd's rules work the same way, and the analogy holds right up to enforcement: no inspector refuses to certify a database.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.6.2 E. F. Codd's Laws for a Fully Functional Relational Database Management System. Alpha Science International.`, note: `The twelve rules plus Rule 0, and the statement that rule 3 is the most controversial because of the ternary-logic debate.` },
              { ref: `Codd, E. F. (1970). A relational model of data for large shared data banks. <em>Communications of the ACM</em>, 13(6), 377-387.`, note: `The foundational paper by the same author; the rules were a later elaboration of the model set out here.` }
            ]
          },
          example: {
            label: "Which rule is at stake?",
            steps: [
              `A system stores some information in a table and some in a hidden config file — RULE 1. Information must be represented in one and only one way, as values in a table.`,
              `A system's catalogue can only be read with a special admin tool, not the query language — RULE 4. The catalogue must be reachable through the regular query language.`,
              `A bulk-loading utility writes rows straight to disk, skipping constraint checks — RULE 12, and this is the subtle one. Nothing about the table structure is wrong; the fault is that a low-level path can bypass the high-level integrity rules.`
            ]
          },
          quiz: {
            question: "A DBMS treats 'value not yet supplied' and 'value does not apply to this row' as the same null. Which rule does this touch, and why is it debated?",
            options: [
              "Rule 1, because information must appear in only one way",
              "Rule 3, because ternary logic makes all missing data unknown",
              "Rule 10, because integrity constraints must be separate from programs",
              "Rule 6, because views must be updatable if theoretically updatable"
            ],
            correct: 1,
            explanation: `Rule 3 requires systematic treatment of nulls for both missing and inapplicable information, and the controversy is precisely that ternary logic renders everything missing as unknown when not all of it is. Rule 1 is a fair guess since the case is about representation, but rule 1 concerns where information lives, not how absence is modelled.`
          },
          recall: {
            prompt: "What are Codd's rules for, do real systems satisfy them, and which is described as most controversial?",
            answer: `Codd's twelve rules — thirteen counting Rule 0, the foundation rule — define an ideal relational database and are used as a guideline for designing relational database systems. No commercial database system completely conforms to all of them; they interpret the relational approach rather than serving as a conformance test. Rule 3, the systematic treatment of null values, is described as the most controversial. The reason is a debate over three-valued or ternary logic: Codd's rules and SQL use null to represent missing data, and comparing anything to null yields an unknown truth state, but not all data that is missing is genuinely unknown — some is simply inapplicable.`,
            points: [
              `Define an ideal relational database; a design guideline`,
              `No commercial system conforms to all of them`,
              `Rule 3 (systematic treatment of nulls) is most controversial`,
              `Because ternary logic treats all missing data as unknown`
            ]
          },
          wisdomTags: ["evidence", "uncertainty"]
        },

        {
          title: "Structure, Integrity, Manipulation",
          explain: {
            blocks: [
              { text: `The chapter reduces the relational model to three basic components: <strong>data structure</strong>, <strong>data integrity</strong>, and <strong>data manipulation</strong>. Everything else in the topic hangs off one of these.` },
              { heading: "Structure and its vocabulary", text: `The relational data structure is the table, and its parts have precise names. A <strong>relation</strong> is the table. Rows are <strong>tuples</strong>; columns are <strong>attributes</strong>. The number of attributes is the <strong>degree</strong>; the number of tuples is the <strong>cardinality</strong>. A <strong>primary key</strong> identifies each tuple uniquely.<br><br>Learn degree and cardinality as a pair — columns and rows respectively — because they are easy to swap under exam pressure.` },
              { heading: "Integrity, in four kinds", text: `Integrity constraints mean that changes made by authorised users must not cost the database its consistency.<br><br><strong>Domain constraints</strong> specify the set of values an attribute may take, are checked whenever a new item is entered, and may prohibit nulls for particular fields. <strong>Referential integrity</strong> means a value appearing in one relation for a set of attributes also appears in another relation — a foreign key leading to a primary key elsewhere. <strong>Entity integrity</strong> says no attribute of a primary key may be null in a base relation, since a primary key must identify tuples uniquely. <strong>Enterprise constraints</strong> are additional rules specified by users or administrators.<br><br>Manipulation is the third component: relational algebra together with relational calculus.` }
            ],
            analogy: `Think of a passenger manifest. Domain constraints say a seat number must look like a seat number. Referential integrity says the flight it names must exist. Entity integrity says no row may lack the ticket number that identifies it. Each rule fails differently, which is why one rule cannot replace the other three.`,
            sources: [
              { ref: `Vidhya, V., Jeyaram, G., & Ishwarya, K. (2016). <em>Database Management Systems</em>, §2.6.3 Principle Components of Relational Model. Alpha Science International.`, note: `The three components, the tuple/attribute/degree/cardinality vocabulary, and the four kinds of integrity constraint.` },
              { ref: `IBM. <em>What is a relational database?</em> https://www.ibm.com/topics/relational-databases`, note: `Openly readable confirmation of the primary-key and foreign-key roles described here.` }
            ]
          },
          example: {
            label: "Which constraint stops it?",
            steps: [
              `An order row names a customer ID that exists in no customer row — REFERENTIAL INTEGRITY. The value must appear in the other relation.`,
              `A row is inserted with a null in its primary key column — ENTITY INTEGRITY. A primary key cannot identify anything if part of it is missing.`,
              `An age column is given the value "purple" — DOMAIN CONSTRAINT, and note the difference from the other two: nothing about relationships or identification is wrong here, only the set of permitted values.`
            ]
          },
          quiz: {
            question: "A table has 8 columns and 4,000 rows. What are its degree and cardinality?",
            options: [
              "Degree 8, cardinality 4,000",
              "Degree 4,000, cardinality 8",
              "Degree 32,000, cardinality 8",
              "Degree 4,000, cardinality 4,000"
            ],
            correct: 0,
            explanation: `Degree counts attributes, which are the columns; cardinality counts tuples, which are the rows. The second option is the one most people reach for under time pressure, because "cardinality" sounds like it should describe the larger number — the terms have to be learned as a pair rather than guessed at.`
          },
          recall: {
            prompt: "Name the three principal components of the relational model, and the four kinds of integrity constraint.",
            answer: `The three principal components are data structure, data integrity and data manipulation. Data structure is the relation, or table: rows are tuples, columns are attributes, the number of attributes is the degree, the number of tuples is the cardinality, and a primary key identifies tuples uniquely. Data integrity covers four kinds of constraint: domain constraints, specifying the set of values an attribute may take and possibly prohibiting nulls; referential integrity, meaning a value appearing in one relation also appears in another, via a foreign key to a primary key; entity integrity, meaning no attribute of a primary key may be null in a base relation; and enterprise constraints, additional rules specified by users or database administrators. Data manipulation is relational algebra together with relational calculus.`,
            points: [
              `Data structure, data integrity, data manipulation`,
              `Relation/tuple/attribute; degree = columns, cardinality = rows`,
              `Domain, referential, entity, enterprise constraints`,
              `Manipulation = relational algebra and relational calculus`
            ]
          },
          wisdomTags: ["evidence", "persistence"]
        }
      ],
      examQuestions: [
        {
          question: "Who introduced the relational model, and in what year?",
          options: [
            "The CODASYL Data Base Task Group, in 1971",
            "E. F. Codd, in 1970",
            "Silberschatz and Korth, in 1986",
            "E. F. Codd, in 1980"
          ],
          correct: 1
        },
        {
          question: "In the relational model, how is a relationship between two tables expressed?",
          options: [
            "By a stored pointer maintained by the storage manager",
            "By storing the two tables adjacently on disk",
            "By values shared between the tables, matched when a query runs",
            "By a parent-child link declared when the tables are created"
          ],
          correct: 2
        },
        {
          question: "A table has 12 columns and 500 rows. What is its degree?",
          options: [
            "500",
            "6,000",
            "512",
            "12"
          ],
          correct: 3
        },
        {
          question: "Which constraint states that no attribute of a primary key may be null in a base relation?",
          options: [
            "Entity integrity",
            "Referential integrity",
            "A domain constraint",
            "An enterprise constraint"
          ],
          correct: 0
        },
        {
          question: "Why is Codd's rule 3 described as the most controversial?",
          options: [
            "Because no commercial system implements online catalogues correctly",
            "Because ternary logic treats all missing data as unknown, though some is merely inapplicable",
            "Because it conflicts directly with the rule on physical data independence",
            "Because it requires views to be updatable when they are only theoretically so"
          ],
          correct: 1
        }
      ]
    }
  ]
};
