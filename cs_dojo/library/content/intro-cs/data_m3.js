const MODULE_3 = {
  id: "security",
  unit: 6,
  title: "Security",
  icon: "🛡️",
  topics: [
    {
      id: "security-fundamentals",
      title: "Security Fundamentals",
      desc: "CIA triad, AAA framework — the pillars of cybersecurity.",
      icon: "🔐",
      chunks: [
        {
          title: "Why Security Matters",
          explain: {
            text: `In today's digital world, data is one of the most valuable assets. Security breaches can lead to: financial loss, identity theft, reputation damage, legal consequences.<br><br>The need for security arises because: networks are open and connected (anyone can potentially reach anyone), attacks are automated and constant, human error is the #1 vulnerability.<br><br>Computer security aims to protect: hardware, software, data, and network resources from unauthorized access, misuse, or destruction.`,
            analogy: `Like locking your house — you wouldn't leave your front door open just because your neighborhood seems safe.`
          },
          example: {
            label: `Real-world breach examples and their impact`,
            steps: [`Financial loss`, `Identity theft`, `Reputation damage`, `Legal consequences`]
          },
          quiz: {
            question: `What is the #1 vulnerability in computer security?`,
            options: [`Outdated software`, `Human error`, `Weak passwords`, `DDoS attacks`],
            correct: 1,
            explanation: `Human error is generally considered the biggest vulnerability in computer security, as social engineering and mistakes easily bypass technical controls.`
          }
        },
        {
          title: "The CIA Triad",
          explain: {
            text: `The three fundamental principles of security. <strong>Confidentiality</strong> — ensuring data is accessible ONLY to authorized users. Methods: encryption, access controls, authentication. Example: only you can read your email.<br><br><strong>Integrity</strong> — ensuring data is NOT altered or tampered with without authorization. Methods: checksums, hashing, digital signatures. Example: a bank transfer amount shouldn't change in transit.<br><br><strong>Availability</strong> — ensuring systems and data are accessible when needed. Threats: DDoS attacks, hardware failure, natural disasters. Methods: redundancy, backups, failover systems.`,
            analogy: `Confidentiality = keeping a diary locked. Integrity = ensuring nobody changes what's written. Availability = being able to read it whenever you want.`
          },
          example: {
            label: `How the CIA triad applies to online banking`,
            steps: [`Confidentiality: Only you and the bank can see your balance.`, `Integrity: Your deposit amount isn't changed during processing.`, `Availability: The banking website is online when you need to pay a bill.`]
          },
          quiz: {
            question: `Which CIA principle is violated when a hacker modifies data in transit?`,
            options: [`Confidentiality`, `Integrity`, `Availability`, `Authentication`],
            correct: 1,
            explanation: `Integrity ensures that data is not altered or tampered with. Modifying data in transit is a direct violation of integrity.`
          }
        },
        {
          title: "AAA Framework & Non-Repudiation",
          explain: {
            text: `AAA stands for:<br><br><strong>Authentication</strong> — verifying identity ("Who are you?"). Methods: passwords, biometrics, 2FA/MFA.<br><br><strong>Authorization</strong> — determining permissions ("What can you do?"). Methods: access control lists, role-based access.<br><br><strong>Accounting</strong> — tracking activity ("What did you do?"). Methods: audit logs, monitoring.<br><br><strong>Non-repudiation</strong> — ensuring someone cannot deny having performed an action. Achieved through digital signatures and audit trails. Example: a sender can't deny sending an email if it's digitally signed.`,
            analogy: ``
          },
          example: {
            label: `AAA in action when logging into a company system`,
            steps: [`Authentication: Entering a username and password.`, `Authorization: System checks if you have access to the HR folder.`, `Accounting: Logging that you accessed the HR folder at 10:00 AM.`, `Non-repudiation: A digital signature proving you authorized a change.`]
          },
          quiz: {
            question: `Which AAA component determines what resources a user can access?`,
            options: [`Authentication`, `Authorization`, `Accounting`, `Non-repudiation`],
            correct: 1,
            explanation: `Authorization determines the permissions and what an authenticated user is allowed to do or access.`
          }
        }
      ],
      examQuestions: [
        { question: `What does the "C" in the CIA triad stand for?`, options: [`Control`, `Confidentiality`, `Cryptography`, `Cybersecurity`], correct: 1 },
        { question: `Which concept ensures that a sender cannot deny having sent a message?`, options: [`Integrity`, `Authentication`, `Non-repudiation`, `Availability`], correct: 2 },
        { question: `Using a fingerprint scanner to access a building is an example of what?`, options: [`Authorization`, `Accounting`, `Authentication`, `Auditing`], correct: 2 },
        { question: `Which of the following best describes Availability?`, options: [`Keeping data secret`, `Ensuring data isn't changed`, `Tracking user actions`, `Ensuring systems are accessible when needed`], correct: 3 },
        { question: `What is the primary goal of the Accounting aspect of the AAA framework?`, options: [`Verifying identity`, `Granting permissions`, `Tracking user activity`, `Encrypting data`], correct: 2 }
      ]
    },
    {
      id: "malware",
      title: "Malware",
      desc: "Viruses, worms, trojans — malicious software that threatens your system.",
      icon: "🦠",
      chunks: [
        {
          title: "Viruses",
          explain: {
            text: `A computer <code>virus</code> is malicious code that attaches itself to a legitimate program or file. Key characteristics:<br><br>1) It REQUIRES human action to spread (opening an infected file, running an infected program).<br>2) It replicates by copying itself into other programs/files.<br>3) It can corrupt data, slow performance, or destroy files.<br><br>Types: boot sector virus (infects boot record), macro virus (infects documents like Word/Excel macros), file infector (attaches to executable files). Named after biological viruses because they spread by attaching to a host.`,
            analogy: `Like a biological virus — it needs a host cell (program) to reproduce and can't spread on its own.`
          },
          example: {
            label: `How a virus spreads through an email attachment`,
            steps: [`Attacker sends an email with an infected Word document.`, `User downloads and opens the document.`, `The macro virus executes and infects the user's system.`, `The virus waits for the user to send other files to spread further.`]
          },
          quiz: {
            question: `What makes a virus different from other malware?`,
            options: [`It spreads independently over networks`, `It encrypts files for ransom`, `It requires human action to spread and needs a host`, `It looks like legitimate software`],
            correct: 2,
            explanation: `A key characteristic of a virus is that it requires human action (like executing a file) and must attach itself to a host program or file to spread.`
          }
        },
        {
          title: "Worms",
          explain: {
            text: `A <code>worm</code> is malicious software that can spread INDEPENDENTLY — it does NOT need to attach to a program or require human action.<br><br>Worms exploit network vulnerabilities to replicate themselves across computers. They can spread extremely fast because they're automatic. Effects: consume network bandwidth (causing slowdowns), install backdoors, carry payloads (ransomware, etc).<br><br>Famous worms: Morris Worm (1988, first major internet worm), ILOVEYOU (2000), WannaCry (2017, ransomware worm). Key difference from virus: worms are standalone, viruses need a host.`,
            analogy: ``
          },
          example: {
            label: `How a worm spreads across a network without user interaction`,
            steps: [`Worm infects a machine via a network vulnerability.`, `Worm scans the network for other vulnerable machines.`, `Worm copies itself to the vulnerable machines automatically.`, `The process repeats, leading to rapid, exponential spread.`]
          },
          quiz: {
            question: `What is the key difference between a worm and a virus?`,
            options: [`Worms need a host file, viruses do not`, `Worms spread independently, viruses require a host and human action`, `Worms only affect hardware, viruses affect software`, `Worms are harmless, viruses are destructive`],
            correct: 1,
            explanation: `Worms are standalone programs that can spread across networks without human intervention, whereas viruses require a host file and human action to execute.`
          }
        },
        {
          title: "Trojans, Ransomware & Spyware",
          explain: {
            text: `<strong>Trojan Horse</strong> — malware disguised as legitimate software. Named after the Greek myth. It does NOT replicate itself. The user is tricked into installing it. Once inside, it can: create backdoors, steal data, install other malware. Example: a "free game" that secretly logs your keystrokes.<br><br><strong>Ransomware</strong> — encrypts your files and demands payment (ransom) for the decryption key. Often spread via phishing emails or worms.<br><br><strong>Spyware</strong> — secretly monitors user activity. Can capture: keystrokes (keylogger), screenshots, browsing history, passwords.`,
            analogy: `Trojan = a gift box with a spy inside. Ransomware = a thief who locks your house and sells you the key. Spyware = a hidden camera watching everything you do.`
          },
          example: {
            label: `How a Trojan horse attack works step by step`,
            steps: [`User downloads what appears to be a legitimate free game.`, `User installs the game.`, `The game works normally, but a malicious payload is secretly installed in the background.`, `The payload opens a backdoor for the attacker to access the system.`]
          },
          quiz: {
            question: `What is a Trojan horse named after?`,
            options: [`A famous computer scientist`, `The Greek myth of the Trojan horse used to sneak into Troy`, `A type of horse used by hackers`, `A city in ancient Rome`],
            correct: 1,
            explanation: `It is named after the Greek myth where soldiers hid inside a wooden horse presented as a gift to enter the city of Troy.`
          }
        }
      ],
      examQuestions: [
        { question: `Which type of malware spreads by attaching itself to a host file and requires human action to execute?`, options: [`Worm`, `Trojan`, `Virus`, `Spyware`], correct: 2 },
        { question: `Which of the following spreads independently across a network without needing a host program?`, options: [`Virus`, `Worm`, `Trojan Horse`, `Adware`], correct: 1 },
        { question: `What type of malware is disguised as legitimate software?`, options: [`Trojan Horse`, `Worm`, `Ransomware`, `Keylogger`], correct: 0 },
        { question: `Which malware type encrypts a user's files and demands payment for the decryption key?`, options: [`Spyware`, `Worm`, `Ransomware`, `Virus`], correct: 2 },
        { question: `A keylogger that secretly records what a user types is an example of what?`, options: [`Ransomware`, `Spyware`, `Worm`, `Virus`], correct: 1 }
      ]
    },
    {
      id: "network-attacks",
      title: "Network Attacks",
      desc: "DoS, Man-in-the-Middle, phishing — common attack vectors.",
      icon: "⚔️",
      chunks: [
        {
          title: "Passive vs Active Attacks",
          explain: {
            text: `<strong>Passive attacks</strong> — attacker observes/monitors data without modifying it. Goal: gather information. Hard to detect because nothing is changed. Examples: eavesdropping (sniffing network traffic), traffic analysis.<br><br><strong>Active attacks</strong> — attacker actively modifies, disrupts, or fabricates data. Easier to detect but harder to prevent. Examples: DoS attacks, spoofing, man-in-the-middle, data modification. Think: passive = spying, active = sabotage.`,
            analogy: `Passive = someone reading your mail without opening it (just looking at the envelope). Active = someone opening your mail and changing the contents.`
          },
          example: {
            label: `Examples of passive and active attacks in a corporate network`,
            steps: [`Passive: Using a packet sniffer to capture unencrypted passwords over Wi-Fi.`, `Active: Altering the contents of an email before it reaches the recipient.`, `Passive: Monitoring network traffic volume to deduce business activities.`, `Active: Flooding a server with requests to bring it down (DoS).`]
          },
          quiz: {
            question: `An attacker secretly monitoring network traffic is an example of what type of attack?`,
            options: [`Active attack`, `Passive attack`, `Spoofing`, `DoS attack`],
            correct: 1,
            explanation: `Monitoring traffic without modifying it is a passive attack. Its goal is gathering information, making it hard to detect.`
          }
        },
        {
          title: "Common Attacks: DoS, MitM, Phishing",
          explain: {
            text: `<strong>DoS (Denial of Service)</strong> — flooding a server with so many requests it can't serve legitimate users. <strong>DDoS (Distributed DoS)</strong> — same but from thousands of compromised machines (botnet).<br><br><strong>Man-in-the-Middle (MitM)</strong> — attacker secretly intercepts communication between two parties. Both parties think they're talking directly to each other. Attacker can read, modify, or inject messages. HTTPS prevents this.<br><br><strong>Phishing</strong> — fraudulent communication (usually email) that tricks users into revealing sensitive info. Looks like it's from a trusted source. Spear phishing targets specific individuals.`,
            analogy: ``
          },
          example: {
            label: `How each attack works in a real scenario`,
            steps: [`DoS: A single attacker floods a web server with fake requests until it crashes.`, `DDoS: A botnet of 10,000 infected devices all send requests to a server simultaneously.`, `MitM: An attacker on public Wi-Fi intercepts data between a user and a website.`, `Phishing: An email disguised as the bank asks a user to click a link and log in.`]
          },
          quiz: {
            question: `What is the difference between DoS and DDoS?`,
            options: [`DoS is an active attack, DDoS is a passive attack`, `DoS uses one machine to attack, DDoS uses multiple distributed machines`, `DoS targets software, DDoS targets hardware`, `DoS is illegal, DDoS is legal`],
            correct: 1,
            explanation: `A DoS attack typically originates from a single source, whereas a DDoS attack uses multiple distributed systems (often a botnet) to flood the target.`
          }
        }
      ],
      examQuestions: [
        { question: `Which type of attack involves an attacker secretly intercepting communication between two parties?`, options: [`DoS`, `Phishing`, `Man-in-the-Middle`, `Spoofing`], correct: 2 },
        { question: `A targeted fraudulent email sent to a specific individual is called what?`, options: [`Phishing`, `Spear phishing`, `Whaling`, `Vishing`], correct: 1 },
        { question: `Which of the following is an example of an active attack?`, options: [`Eavesdropping`, `Traffic analysis`, `Packet sniffing`, `Denial of Service (DoS)`], correct: 3 },
        { question: `Why are passive attacks generally harder to detect than active attacks?`, options: [`They use advanced encryption`, `They originate from botnets`, `They do not alter data or disrupt systems`, `They target network hardware directly`], correct: 2 },
        { question: `Flooding a server with traffic from a botnet to take it offline is known as:`, options: [`DoS`, `DDoS`, `MitM`, `Spoofing`], correct: 1 }
      ]
    },
    {
      id: "firewalls-defense",
      title: "Firewalls & Defense",
      desc: "The guards at the gate — filtering traffic to keep you safe.",
      icon: "🧱",
      chunks: [
        {
          title: "What is a Firewall?",
          explain: {
            text: `A <code>firewall</code> is a network security device (hardware or software) that monitors and filters incoming and outgoing network traffic based on predefined security rules.<br><br>It creates a barrier between a trusted internal network and an untrusted external network (like the internet). Think of it as a security guard at a building entrance — it checks everyone's ID and decides who gets in.<br><br>Firewalls operate using rules: ALLOW or DENY traffic based on source IP, destination IP, port number, and protocol.`,
            analogy: `Like a bouncer at a nightclub — checks your ID (IP/port), verifies you're on the list (rules), and lets you in or turns you away.`
          },
          example: {
            label: `How a firewall protects a company network`,
            steps: [`Firewall sits between the company's internal network and the internet.`, `An external attacker tries to connect to the internal database port.`, `The firewall rule explicitly denies external traffic to the database port.`, `The firewall blocks the connection attempt.`]
          },
          quiz: {
            question: `What does a firewall use to decide whether to allow or block traffic?`,
            options: [`Antivirus signatures`, `Predefined security rules`, `The size of the data packet`, `The operating system of the client`],
            correct: 1,
            explanation: `Firewalls use a set of predefined security rules based on IP addresses, ports, and protocols to determine if traffic should be allowed or denied.`
          }
        },
        {
          title: "Types of Firewalls",
          explain: {
            text: `<strong>Packet Filtering Firewall</strong> — examines each packet's header (source/destination IP, port, protocol). Simple and fast but doesn't inspect packet contents.<br><br><strong>Stateful Inspection Firewall</strong> — tracks the state of active connections. Knows if a packet is part of an established connection or a new request. More secure than packet filtering.<br><br><strong>Proxy Firewall (Application Gateway)</strong> — acts as an intermediary. Client connects to proxy, proxy connects to server. Can inspect actual content (application layer). Provides anonymity.<br><br><strong>Next-Generation Firewall (NGFW)</strong> — combines traditional firewall with intrusion prevention, deep packet inspection, and application awareness.`,
            analogy: ``
          },
          example: {
            label: `Compare the 4 types of firewalls`,
            steps: [`Packet filtering: Looks only at packet headers.`, `Stateful inspection: Tracks the state of connections (e.g., TCP handshake).`, `Proxy firewall: Inspects application-layer data (e.g., HTTP content).`, `NGFW: Combines all features plus IDS/IPS and deep packet inspection.`]
          },
          quiz: {
            question: `Which firewall type tracks the state of active connections?`,
            options: [`Packet Filtering Firewall`, `Stateful Inspection Firewall`, `Proxy Firewall`, `Web Application Firewall`],
            correct: 1,
            explanation: `Stateful inspection firewalls track the state of active network connections (like TCP streams) to determine if a packet is part of a legitimate session.`
          }
        },
        {
          title: "Protective Devices & Best Practices",
          explain: {
            text: `Beyond firewalls:<br><br><strong>IDS (Intrusion Detection System)</strong> — monitors network traffic for suspicious activity and ALERTS administrators. Does NOT block traffic.<br><br><strong>IPS (Intrusion Prevention System)</strong> — like IDS but can automatically BLOCK detected threats.<br><br><strong>VPN (Virtual Private Network)</strong> — creates an encrypted tunnel over the internet for secure remote access.<br><br><strong>Antivirus/Anti-malware</strong> — scans files and programs for known malware signatures.<br><br>Best practices: keep software updated (patch vulnerabilities), use strong unique passwords + MFA, regular backups, principle of least privilege (give minimum necessary access), security awareness training.`,
            analogy: ``
          },
          example: {
            label: `Layers of defense in a secure corporate network`,
            steps: [`Firewall blocks unauthorized external traffic.`, `IPS detects and blocks known attack signatures.`, `VPN ensures remote workers have secure access.`, `Antivirus protects endpoints (laptops/desktops) from malware.`]
          },
          quiz: {
            question: `What is the difference between IDS and IPS?`,
            options: [`IDS blocks threats, IPS only alerts`, `IDS only alerts, IPS can automatically block threats`, `IDS is hardware, IPS is software`, `IDS protects networks, IPS protects endpoints`],
            correct: 1,
            explanation: `An Intrusion Detection System (IDS) only monitors and alerts on suspicious activity, whereas an Intrusion Prevention System (IPS) can actively block the detected threats.`
          }
        }
      ],
      examQuestions: [
        { question: `Which type of firewall acts as an intermediary, inspecting application-layer data?`, options: [`Packet Filtering`, `Stateful Inspection`, `Proxy Firewall`, `NAT Firewall`], correct: 2 },
        { question: `What is the main function of an Intrusion Prevention System (IPS)?`, options: [`Only alerting on suspicious activity`, `Automatically blocking detected threats`, `Creating encrypted tunnels`, `Filtering basic packet headers`], correct: 1 },
        { question: `Which security best practice involves granting users only the permissions necessary to perform their job?`, options: [`Multi-Factor Authentication`, `Principle of Least Privilege`, `Regular backups`, `Patch management`], correct: 1 },
        { question: `What technology creates an encrypted tunnel over the internet for secure remote access?`, options: [`VPN`, `IDS`, `Firewall`, `Antivirus`], correct: 0 },
        { question: `Which of the following is true about a packet filtering firewall?`, options: [`It tracks active connection states`, `It is slower than a proxy firewall`, `It only examines packet headers like IP and port`, `It inspects application data payloads`], correct: 2 }
      ]
    }
  ]
};
