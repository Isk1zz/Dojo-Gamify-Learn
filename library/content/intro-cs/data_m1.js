const MODULE_1 = {
  id: "networks",
  unit: 6,
  title: "Computer Networks",
  icon: "🖧",
  topics: [
    {
      id: "what-are-networks",
      title: "What Are Computer Networks?",
      desc: "The foundation of modern communication — connecting devices together.",
      icon: "🌐",
      chunks: [
        {
          title: "Definition & Purpose of Networks",
          explain: {
            text: `A computer network is a group of interconnected devices that can share data and resources. Networks allow file sharing, communication (email, messaging), sharing hardware (like printers), and centralized data management.<br><br>Networks are made up of <strong>nodes</strong> (devices like computers, phones, servers), <strong>links</strong> (connections like cables or WiFi), and <strong>protocols</strong> (rules for how data is transmitted). The primary goal is to facilitate seamless communication and resource sharing.`,
            analogy: "Like a postal system connecting different houses to deliver letters and packages."
          },
          example: {
            label: "Real-world Examples",
            steps: [
              "Office LAN (Local Area Network) sharing a single printer.",
              "Home WiFi connecting phones, laptops, and smart TVs.",
              "The Internet itself, which is a massive global network of networks."
            ]
          },
          quiz: {
            question: "What is the primary purpose of a computer network?",
            options: [
              "To isolate computers from one another",
              "To share data and resources among interconnected devices",
              "To process data locally without external input",
              "To increase the physical weight of computers"
            ],
            correct: 1,
            explanation: "The main purpose of a network is to connect devices so they can share data, communicate, and utilize shared resources."
          }
        },
        {
          title: "History of Networks",
          explain: {
            text: `The history of networking began with <strong>ARPANET</strong> (1969, created by the US Department of Defense). The very first message was sent from a computer at UCLA to one at Stanford Research Institute. The user tried to send the word "LOGIN", but the system crashed after sending just "LO".<br><br>A key innovation was <strong>packet switching</strong>, which breaks data into small blocks (packets) and sends them independently across the network. From ARPANET, networking evolved through the adoption of the TCP/IP protocol in 1983, and later the invention of the World Wide Web in 1991 by Tim Berners-Lee, leading to the modern internet.`,
            analogy: "Like the evolution from the telegraph to modern high-speed digital communication."
          },
          example: {
            label: "Key Milestones",
            steps: [
              "<strong>1969:</strong> ARPANET established, first message sent.",
              "<strong>1983:</strong> TCP/IP adopted as standard, birthing the modern internet architecture.",
              "<strong>1991:</strong> World Wide Web introduced by Tim Berners-Lee."
            ]
          },
          quiz: {
            question: "What was the name of the first computer network?",
            options: ["Internet", "World Wide Web", "ARPANET", "Ethernet"],
            correct: 2,
            explanation: "ARPANET, created by the US DoD in 1969, was the very first computer network."
          }
        },
        {
          title: "Distributed Processing",
          explain: {
            text: `Instead of relying on one massive central computer to do everything, modern systems use <strong>distributed processing</strong>. This means work is divided and distributed across multiple interconnected computers on a network.<br><br>The main benefits are <strong>reliability</strong> (if one computer fails, others continue the work), scalability (easy to add more computers), cost-effectiveness, and faster processing. Common models include the <strong>client-server</strong> model (where centralized servers provide resources to clients) and the <strong>peer-to-peer</strong> model (where devices communicate directly without a central server).`,
            analogy: "Like a team of specialists working on different parts of a project simultaneously, rather than one person doing everything sequentially."
          },
          example: {
            label: "Processing Models",
            steps: [
              "<strong>Client-Server:</strong> Browsing a website (your browser is the client, the website host is the server).",
              "<strong>Peer-to-Peer (P2P):</strong> BitTorrent or direct file sharing between two laptops."
            ]
          },
          quiz: {
            question: "What is a key advantage of distributed processing?",
            options: [
              "It relies on a single massive computer",
              "It decreases network security",
              "If one node fails, others can continue working (reliability)",
              "It prevents data sharing"
            ],
            correct: 2,
            explanation: "Distributed processing increases reliability because there is no single point of failure; other computers can take over if one goes down."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which of the following components are essential parts of a network?",
          options: [
            "Nodes, links, and protocols",
            "Only computers and cables",
            "Monitors and keyboards",
            "Printers and scanners"
          ],
          correct: 0
        },
        {
          question: "What was the key innovation that allowed data to be broken into smaller blocks and sent independently?",
          options: ["Circuit switching", "Packet switching", "Token passing", "Broadcasting"],
          correct: 1
        },
        {
          question: "What event in 1983 was crucial for the development of the modern internet?",
          options: [
            "Invention of the telegraph",
            "Adoption of TCP/IP",
            "Creation of the World Wide Web",
            "First email sent"
          ],
          correct: 1
        },
        {
          question: "In which processing model do devices communicate directly with each other without relying on a central server?",
          options: ["Client-Server", "Mainframe", "Peer-to-Peer", "Centralized"],
          correct: 2
        },
        {
          question: "What word was famously attempted to be sent as the first message over ARPANET?",
          options: ["HELLO", "START", "LOGIN", "CONNECT"],
          correct: 2
        }
      ]
    },
    {
      id: "network-categories",
      title: "Network Categories",
      desc: "PAN, LAN, MAN, WAN — networks classified by their reach.",
      icon: "📡",
      chunks: [
        {
          title: "PAN & LAN",
          explain: {
            text: `A <strong>PAN (Personal Area Network)</strong> has a tiny range (typically around 10 meters) and connects personal devices around an individual. Examples include connecting Bluetooth headphones to a phone or a smartwatch to a laptop.<br><br>A <strong>LAN (Local Area Network)</strong> covers a building or campus. Examples include an office network, a school computer lab, or your home WiFi. LANs typically offer high speed and low latency, and often use technologies like Ethernet or WiFi to connect devices.`,
            analogy: "PAN is like the space on your desk; LAN is like the entire building."
          },
          example: {
            label: "Real-world Scenarios",
            steps: [
              "<strong>PAN:</strong> Sending a file from a phone to a laptop via Bluetooth.",
              "<strong>LAN:</strong> All computers in a corporate office connected to the same local servers and printers."
            ]
          },
          quiz: {
            question: "Which network type would connect a Bluetooth keyboard to a laptop?",
            options: ["LAN", "WAN", "PAN", "MAN"],
            correct: 2,
            explanation: "A Personal Area Network (PAN) is used for connecting devices in very close proximity, like a Bluetooth keyboard and laptop."
          }
        },
        {
          title: "MAN & WAN",
          explain: {
            text: `A <strong>MAN (Metropolitan Area Network)</strong> covers a city or large campus. Examples include city-wide public WiFi, a cable TV network, or a large university network spanning multiple buildings.<br><br>A <strong>WAN (Wide Area Network)</strong> covers large geographical areas such as countries or the entire globe. The Internet is the largest example of a WAN. WANs use leased telecommunication lines, satellite links, and undersea cables, and typically have higher latency compared to LANs.`,
            analogy: "If LAN is a building, a MAN is the whole city, and a WAN is the entire world connecting cities together."
          },
          example: {
            label: "Comparison Overview",
            steps: [
              "<strong>MAN:</strong> Covers a city, moderate to high speed (e.g., city-wide fiber network).",
              "<strong>WAN:</strong> Covers the globe, lower speed/higher latency (e.g., the global Internet)."
            ]
          },
          quiz: {
            question: "The Internet is an example of which network category?",
            options: ["PAN", "LAN", "MAN", "WAN"],
            correct: 3,
            explanation: "The Internet spans the entire globe, making it the largest Wide Area Network (WAN) in existence."
          }
        },
        {
          title: "Network Prerequisites",
          explain: {
            text: `For any network to function, several key components are required. First, a <strong>communication medium</strong> is needed to carry the data (wired like Ethernet and fiber optic, or wireless like WiFi and Bluetooth).<br><br>Second, you need <strong>network protocols</strong>, which are standard rules for communication (like TCP/IP or HTTP). Third, <strong>network devices</strong> like routers and switches direct the traffic. Finally, <strong>network software</strong> (operating systems and drivers) manages the connections. Standards like <code>IEEE 802.11</code> (WiFi) ensure devices from different manufacturers can interoperate.`,
            analogy: "Like a road system: you need roads (medium), traffic rules (protocols), intersections/traffic lights (devices), and drivers who know the rules (software)."
          },
          example: {
            label: "Setting up a simple home network",
            steps: [
              "Medium: WiFi radio waves or Ethernet cables.",
              "Devices: A wireless router provided by your ISP.",
              "Protocols: TCP/IP running on your laptop and router.",
              "Software: Your OS network settings managing the connection."
            ]
          },
          quiz: {
            question: "What ensures devices from different manufacturers can communicate on a network?",
            options: [
              "Using the exact same hardware",
              "Network standards and protocols",
              "Having identical operating systems",
              "Connecting to the same power outlet"
            ],
            correct: 1,
            explanation: "Network standards and protocols provide common rules that all manufacturers follow, allowing interoperability regardless of brand."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which network type has the smallest geographical coverage area?",
          options: ["LAN", "MAN", "WAN", "PAN"],
          correct: 3
        },
        {
          question: "Which of the following is the best example of a LAN?",
          options: [
            "The global internet",
            "A city's public WiFi system",
            "A home network connecting a laptop, phone, and smart TV",
            "A Bluetooth connection between a phone and earbuds"
          ],
          correct: 2
        },
        {
          question: "What type of network would a cable television company most likely use to deliver services across a city?",
          options: ["PAN", "LAN", "MAN", "WAN"],
          correct: 2
        },
        {
          question: "In the context of networking, what is the role of a communication medium?",
          options: [
            "To process user input",
            "To physically or wirelessly carry data between devices",
            "To display information on a screen",
            "To store long-term data files"
          ],
          correct: 1
        },
        {
          question: "What does the IEEE 802.11 standard primarily define?",
          options: ["Ethernet cables", "Bluetooth pairing", "WiFi wireless networking", "Fiber optic transmission"],
          correct: 2
        }
      ]
    },
    {
      id: "network-topologies",
      title: "Network Topologies",
      desc: "Bus, star, ring, mesh — how devices are physically and logically arranged.",
      icon: "🔗",
      chunks: [
        {
          title: "Bus & Ring Topology",
          explain: {
            text: `In a <strong>bus topology</strong>, all devices are connected to a single central cable (the backbone). Data travels in both directions. It is simple and cheap to install, but it has a single point of failure: if the main cable breaks, the entire network goes down.<br><br>In a <strong>ring topology</strong>, each device connects to exactly two others, forming a circle. Data travels in one direction (unidirectional) using a token system; only the device holding the token can send data. It is predictable, but if one node or cable fails, the ring breaks, halting the network (unless it uses a dual-ring architecture).`,
            analogy: "Bus is like a single highway with many driveways connecting to it. Ring is like passing a baton in a circle of people."
          },
          example: {
            label: "Data Flow Visualization",
            steps: [
              "<strong>Bus:</strong> Data broadcasts onto the main cable and travels to all nodes.",
              "<strong>Ring:</strong> Data passes through each node sequentially until it reaches its destination."
            ]
          },
          quiz: {
            question: "In a basic ring topology, what happens if one node fails?",
            options: [
              "The network continues normally",
              "The ring breaks and the entire network goes down",
              "Data reverses direction automatically",
              "Only that specific node loses connection"
            ],
            correct: 1,
            explanation: "Because data must pass through each node sequentially, a single failed node breaks the circuit, causing the entire ring network to fail."
          }
        },
        {
          title: "Star & Tree Topology",
          explain: {
            text: `A <strong>star topology</strong> connects all devices to a central hub or switch. This is the most common setup for modern LANs. It is easy to add or remove devices, and if one cable fails, only that device is affected. However, the central switch represents a single point of failure for the whole network.<br><br>A <strong>tree topology</strong> is a hierarchical combination of multiple star topologies. It features a root node at the top with branches extending downward. It is highly scalable and used in large corporate or campus networks, though it can become complex to manage.`,
            analogy: "Star is like the spokes of a bicycle wheel connecting to a central hub. Tree is like an organizational chart with a CEO at the top branching down."
          },
          example: {
            label: "Why Home WiFi is a Star Topology",
            steps: [
              "Your wireless router acts as the central hub.",
              "Your phone, laptop, and smart TV all connect individually to that central router.",
              "If your laptop disconnects, the TV still works."
            ]
          },
          quiz: {
            question: "What is the single point of failure in a star topology?",
            options: ["The peripheral devices", "The central hub or switch", "The longest cable", "The network software"],
            correct: 1,
            explanation: "Because all devices connect directly to the central hub, if that hub fails, the entire network loses connectivity."
          }
        },
        {
          title: "Mesh & Hybrid Topology",
          explain: {
            text: `In a <strong>full mesh topology</strong>, every device connects directly to every other device. This provides maximum redundancy and extreme reliability; if one link fails, data can simply take another path. However, it is very expensive and complex to wire. A partial mesh connects only some critical devices.<br><br>A <strong>hybrid topology</strong> combines two or more different topologies (e.g., a tree-star hybrid). Because pure topologies rarely fit large-scale needs perfectly, most real-world enterprise networks are hybrids, blending the strengths of different layouts.`,
            analogy: "Mesh is like a city grid where every house has a direct private road to every other house. Hybrid is combining highways, grids, and roundabouts."
          },
          example: {
            label: "Mesh Connections Calculation",
            steps: [
              "Formula: n * (n - 1) / 2",
              "For 5 devices: 5 * 4 / 2 = 10 connections.",
              "For 10 devices: 10 * 9 / 2 = 45 connections (scales very quickly!)."
            ]
          },
          quiz: {
            question: "How many connections does a full mesh of 6 devices need?",
            options: ["6", "12", "15", "30"],
            correct: 2,
            explanation: "Using the formula n*(n-1)/2, for 6 devices: 6*(5)/2 = 30/2 = 15 connections."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which topology uses a single backbone cable to which all nodes connect?",
          options: ["Star", "Ring", "Mesh", "Bus"],
          correct: 3
        },
        {
          question: "Which topology relies on passing a token sequentially from node to node?",
          options: ["Ring", "Tree", "Star", "Mesh"],
          correct: 0
        },
        {
          question: "Which network topology is most commonly used in modern home and office LANs?",
          options: ["Bus", "Ring", "Star", "Full Mesh"],
          correct: 2
        },
        {
          question: "What is the primary disadvantage of a full mesh topology?",
          options: ["Low reliability", "Slow speed", "High cost and complexity", "Single point of failure"],
          correct: 2
        },
        {
          question: "A network combining star and bus topologies is an example of what?",
          options: ["Tree topology", "Hybrid topology", "Partial mesh", "Complex ring"],
          correct: 1
        }
      ]
    },
    {
      id: "transmission-modes-devices",
      title: "Transmission Modes & Network Devices",
      desc: "Simplex, half-duplex, full-duplex — and the devices that make networks work.",
      icon: "📻",
      chunks: [
        {
          title: "Simplex & Half-Duplex",
          explain: {
            text: `<strong>Simplex</strong> mode means data flows in ONE direction only. It is a permanent one-way street. Examples include a keyboard sending data to a computer, or a traditional TV broadcast where the station sends signals to your television.<br><br><strong>Half-duplex</strong> mode allows data to flow in BOTH directions, but NOT simultaneously. Like a single-lane bridge, traffic must wait for one side to finish before the other can start. Examples include walkie-talkies (you must press a button to talk and release to listen) and older WiFi standards.`,
            analogy: "Simplex is a one-way street. Half-duplex is a single-lane bridge where cars take turns crossing."
          },
          example: {
            label: "Directional Data Flow",
            steps: [
              "<strong>Simplex:</strong> Keyboard -> Computer. The computer never sends data back to the keyboard keys.",
              "<strong>Half-Duplex:</strong> Walkie-Talkie. 'Over to you' is used because both cannot transmit at the exact same moment."
            ]
          },
          quiz: {
            question: "A walkie-talkie is an example of which transmission mode?",
            options: ["Simplex", "Half-Duplex", "Full-Duplex", "Multiplex"],
            correct: 1,
            explanation: "Walkie-talkies allow two-way communication, but only one person can speak at a time, which defines half-duplex mode."
          }
        },
        {
          title: "Full-Duplex Communication",
          explain: {
            text: `In <strong>full-duplex</strong> mode, data flows in BOTH directions SIMULTANEOUSLY. This is achieved by having two separate communication channels (one for sending and one for receiving).<br><br>Most modern networks use full-duplex communication because it essentially doubles the effective bandwidth compared to half-duplex. Examples include telephone calls, modern Ethernet connections, and video conferencing applications where both parties can speak and hear each other at the exact same time without waiting.`,
            analogy: "Full-duplex is like a standard two-lane highway where cars can travel in both directions at the same time without waiting."
          },
          example: {
            label: "Comparing Modes",
            steps: [
              "Simplex: One way only.",
              "Half-Duplex: Both ways, one at a time.",
              "Full-Duplex: Both ways, at the same time."
            ]
          },
          quiz: {
            question: "Which mode allows simultaneous two-way communication?",
            options: ["Simplex", "Half-Duplex", "Full-Duplex", "Auto-Duplex"],
            correct: 2,
            explanation: "Full-duplex provides two separate channels, allowing data to be transmitted and received at the exact same time."
          }
        },
        {
          title: "Network Devices",
          explain: {
            text: `A <strong>Hub</strong> is a "dumb" device that simply broadcasts incoming data out to ALL its ports. It is wasteful and largely obsolete. A <strong>Switch</strong> is a "smart" hub; it learns which specific device is connected to which port and sends data ONLY to the intended recipient, making it the backbone of modern LANs.<br><br>A <strong>Router</strong> connects different networks together (e.g., your home LAN to the global WAN/Internet) and makes decisions on the best path for data using IP addresses. A <strong>Bridge</strong> connects two local network segments to reduce traffic. An <strong>Access Point (AP)</strong> allows wireless devices to connect to a wired network.`,
            analogy: "A hub is like a person shouting a message in a crowded room. A switch is like handing a letter directly to the person. A router is like the post office sorting mail for different cities."
          },
          example: {
            label: "The Path of Data",
            steps: [
              "Your laptop connects to a Switch (or Access Point).",
              "The Switch forwards the request to the Router.",
              "The Router directs the request out to the Internet.",
              "The response comes back through the Router, to the Switch, and finally to your laptop."
            ]
          },
          quiz: {
            question: "What device connects your home network to the internet?",
            options: ["Hub", "Switch", "Router", "Bridge"],
            correct: 2,
            explanation: "A router's primary job is to connect separate networks together, such as routing traffic between your local home network and the public internet."
          }
        }
      ],
      examQuestions: [
        {
          question: "Which transmission mode is analogous to a traditional television broadcast?",
          options: ["Simplex", "Half-Duplex", "Full-Duplex", "Multiplex"],
          correct: 0
        },
        {
          question: "What is a primary advantage of full-duplex over half-duplex?",
          options: [
            "It requires only one wire",
            "It allows simultaneous two-way communication",
            "It is cheaper to implement",
            "It broadcasts to all devices"
          ],
          correct: 1
        },
        {
          question: "Which network device learns the addresses of connected devices and sends data only to the intended port?",
          options: ["Hub", "Repeater", "Switch", "Modem"],
          correct: 2
        },
        {
          question: "What is the primary function of a router?",
          options: [
            "To connect wireless devices to a LAN",
            "To connect different networks together and route traffic based on IP addresses",
            "To broadcast data to all local devices",
            "To convert digital signals to analog"
          ],
          correct: 1
        },
        {
          question: "Which device is considered largely obsolete because it inefficiently broadcasts data to all ports regardless of the destination?",
          options: ["Switch", "Router", "Hub", "Access Point"],
          correct: 2
        }
      ]
    }
  ]
};
