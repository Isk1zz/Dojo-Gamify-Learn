const MODULE_2 = {
  id: `internet`,
  unit: 6,
  title: `The Internet`,
  icon: `🌍`,
  topics: [
    {
      id: `how-internet-works`,
      title: `How the Internet Works`,
      desc: `A network of networks — packets, routing, and protocols.`,
      icon: `🌐`,
      chunks: [
        {
          title: `What is the Internet?`,
          explain: {
            text: `The Internet is a global network of networks. It connects billions of devices worldwide.<br><br>It is <strong>NOT</strong> the same as the World Wide Web (the web runs ON the internet). The internet is the infrastructure (like roads), while the web is a service that uses it (like cars). Other services include email, FTP, and streaming.<br><br>No single entity owns or controls the internet; it is a collaborative global effort.`,
            analogy: `The internet is like the highway system — the Web, email, and streaming are different types of vehicles using those highways.`
          },
          example: {
            label: `Services that run on the internet besides the web`,
            steps: [`Email (SMTP)`, `File Transfer Protocol (FTP)`, `Voice over IP (VoIP)`, `Online Gaming`]
          },
          quiz: {
            question: `Is the Internet the same as the World Wide Web?`,
            options: [`Yes, they are identical`, `No, the Web is a service that runs on the Internet`, `No, the Internet is a service that runs on the Web`, `Yes, they were both invented at the same time`],
            correct: 1,
            explanation: `The Internet is the underlying physical network of networks, whereas the World Wide Web is a collection of linked documents that you access via the Internet.`
          }
        },
        {
          title: `Packets & Routing`,
          explain: {
            text: `Data is broken into small chunks called <strong>packets</strong> before being sent over the network. Each packet contains a source IP, destination IP, sequence number, and the actual data payload.<br><br>Packets can take <strong>different routes</strong> to reach the same destination, a process called <code>packet switching</code>. Routers read the destination IPs and forward the packets along the best path.<br><br>At the destination, packets are reassembled in the correct order using their sequence numbers.`,
            analogy: `Like cutting a book into pages and mailing each page separately — they might take different postal routes but are reassembled at the destination.`
          },
          example: {
            label: `What happens when you send a 1MB image over the internet`,
            steps: [`Image is split into thousands of packets`, `Each packet gets a destination address`, `Packets travel through various routers`, `Packets arrive and are reassembled into the image`]
          },
          quiz: {
            question: `What is packet switching?`,
            options: [`Sending an entire file in one piece`, `Routing packets through a single fixed path`, `Breaking data into packets that can take different routes to the destination`, `Switching between different internet service providers`],
            correct: 2,
            explanation: `Packet switching involves breaking data into packets that can dynamically travel across different routes to reach the same destination.`
          }
        },
        {
          title: `TCP/IP — The Rules of the Internet`,
          explain: {
            text: `<code>TCP/IP</code> is the foundational protocol suite of the internet.<br><br><strong>TCP</strong> (Transmission Control Protocol) ensures reliable delivery, handles ordering, and performs error checking. <strong>IP</strong> (Internet Protocol) handles addressing and routing.<br><br>Together they form the 4-layer model: Application (HTTP, SMTP), Transport (TCP, UDP), Internet (IP), and Network Access (Ethernet, WiFi). <strong>UDP</strong> is a lighter alternative to TCP — it is faster but offers no delivery guarantee, making it ideal for streaming and gaming.`,
            analogy: `TCP is like a certified mail service that requires a signature upon delivery, ensuring you get everything in order. UDP is like throwing flyers out of a car window — fast but no guarantees everyone gets one.`
          },
          example: {
            label: `TCP vs UDP comparison with use cases`,
            steps: [`TCP: Web browsing (HTTP/HTTPS), Email, File transfers`, `UDP: Video streaming, Voice calls, Online multiplayer gaming`]
          },
          quiz: {
            question: `Which protocol ensures packets arrive in the correct order?`,
            options: [`IP`, `UDP`, `TCP`, `HTTP`],
            correct: 2,
            explanation: `TCP (Transmission Control Protocol) guarantees reliable, ordered delivery of packets.`
          }
        }
      ],
      examQuestions: [
        { question: `What is the primary function of a router?`, options: [`To display web pages`, `To forward packets along the best path to their destination`, `To convert domain names to IP addresses`, `To encrypt data`], correct: 1 },
        { question: `Which of the following is an example of an application layer protocol?`, options: [`TCP`, `IP`, `HTTP`, `Ethernet`], correct: 2 },
        { question: `Why is data broken down into packets?`, options: [`To make it harder for hackers to steal`, `To allow multiple users to share network resources efficiently`, `Because routers cannot process large files`, `To compress the data size`], correct: 1 },
        { question: `What happens if a packet is lost in a TCP connection?`, options: [`The connection drops permanently`, `The packet is skipped`, `The destination requests a retransmission of the lost packet`, `The router generates a replacement packet`], correct: 2 },
        { question: `Which protocol is best suited for real-time video streaming?`, options: [`TCP`, `UDP`, `HTTP`, `FTP`], correct: 1 }
      ]
    },
    {
      id: `isp`,
      title: `Internet Service Providers`,
      desc: `The companies that connect you to the internet.`,
      icon: `🏢`,
      chunks: [
        {
          title: `What is an ISP?`,
          explain: {
            text: `An <strong>ISP</strong> (Internet Service Provider) is a company that provides access to the internet. ISPs operate at different levels.<br><br><strong>Tier 1</strong> ISPs are backbone providers that own massive global infrastructure (e.g., AT&T, NTT). <strong>Tier 2</strong> are regional providers that buy transit from Tier 1. <strong>Tier 3</strong> are local ISPs that buy from Tier 2 and sell to consumers.<br><br>ISPs provide internet access, email services, DNS resolution, and sometimes web hosting.`,
            analogy: `Like the electricity grid — power plants (Tier 1) → regional distributors (Tier 2) → your local utility company (Tier 3) → your home.`
          },
          example: {
            label: `The ISP tier system explained`,
            steps: [`Tier 1: Own global submarine cables and backbone networks`, `Tier 2: Connect Tier 1 to local markets`, `Tier 3: The company you pay for your home Wi-Fi`]
          },
          quiz: {
            question: `What tier of ISP provides backbone internet infrastructure?`,
            options: [`Tier 1`, `Tier 2`, `Tier 3`, `Tier 4`],
            correct: 0,
            explanation: `Tier 1 ISPs own the major backbone infrastructure of the internet, such as intercontinental fiber-optic cables.`
          }
        },
        {
          title: `Types of Internet Connections`,
          explain: {
            text: `There are several ways ISPs deliver internet to your home.<br><br><strong>DSL</strong> uses existing phone lines (1-100 Mbps). <strong>Cable</strong> uses coaxial TV cables and is faster but shares bandwidth with neighbors. <strong>Fiber Optic</strong> uses light pulses through glass fibers — it's the fastest and most reliable (up to 10 Gbps).<br><br><strong>Satellite</strong> beams signals from space (high latency, good for rural areas). <strong>Cellular</strong> connections like 4G LTE and 5G provide mobile access.`,
            analogy: `DSL is a dirt road, Cable is a multi-lane highway (but gets jammed in rush hour), and Fiber Optic is a high-speed bullet train.`
          },
          example: {
            label: `Compare connection types by speed and typical use`,
            steps: [`Fiber: Best for heavy use and gaming`, `Cable: Good general-purpose broadband`, `DSL: Budget option for basic browsing`, `Satellite: Last resort for remote locations`]
          },
          quiz: {
            question: `Which internet connection type is generally the fastest and most reliable?`,
            options: [`DSL`, `Cable`, `Fiber Optic`, `Satellite`],
            correct: 2,
            explanation: `Fiber optic uses light to transmit data, making it the fastest and least susceptible to interference.`
          }
        }
      ],
      examQuestions: [
        { question: `What does ISP stand for?`, options: [`Internet Security Protocol`, `International Standard Provider`, `Internet Service Provider`, `Internal System Process`], correct: 2 },
        { question: `Which type of connection suffers most from high latency?`, options: [`Fiber Optic`, `Cable`, `DSL`, `Satellite`], correct: 3 },
        { question: `Why might your cable internet slow down in the evening?`, options: [`The cables get hot`, `Cable internet bandwidth is shared with your neighborhood`, `The ISP turns off servers at night`, `Cable lines rely on solar power`], correct: 1 },
        { question: `Which ISP tier do typical home consumers directly pay for internet access?`, options: [`Tier 1`, `Tier 2`, `Tier 3`, `Tier 0`], correct: 2 },
        { question: `How does a DSL connection physically transmit data?`, options: [`Through coaxial cables`, `Over traditional copper telephone lines`, `Using light in glass fibers`, `Via radio waves from cell towers`], correct: 1 }
      ]
    },
    {
      id: `ip-addresses`,
      title: `IP Addresses`,
      desc: `The unique identifiers for every device on a network.`,
      icon: `🔢`,
      chunks: [
        {
          title: `What is an IP Address?`,
          explain: {
            text: `An <strong>IP (Internet Protocol) address</strong> is a unique numerical label assigned to every device connected to a computer network.<br><br>It serves two primary purposes: <strong>identification</strong> (who the device is) and <strong>location</strong> (where the device is on the network).<br><br>Without IP addresses, routers wouldn't know where to send data packets. Every device that connects to the internet has at least one IP address.`,
            analogy: `Like a mailing address for your house — without it, the postal service can't deliver your mail.`
          },
          example: {
            label: `Finding your own IP address`,
            steps: [`Open terminal or command prompt`, `Type 'ipconfig' (Windows) or 'ifconfig' (Mac/Linux)`, `Or visit a site like whatismyip.com to see your public IP`]
          },
          quiz: {
            question: `What are the two main purposes of an IP address?`,
            options: [`Encryption and Decryption`, `Identification and Location`, `Speed and Reliability`, `Routing and Switching`],
            correct: 1,
            explanation: `An IP address identifies a specific host and provides its location within the network so data can be routed to it.`
          }
        },
        {
          title: `IPv4 vs IPv6`,
          explain: {
            text: `<strong>IPv4</strong> uses 32-bit addresses, written as 4 groups of numbers from 0-255 (e.g., <code>192.168.1.1</code>). It supports about 4.3 billion addresses, which we have run out of!<br><br><strong>IPv6</strong> was introduced to solve this. It uses 128-bit addresses, written as 8 groups of hexadecimal numbers (e.g., <code>2001:0db8:85a3::8a2e:0370:7334</code>). IPv6 supports a practically infinite number of addresses (340 undecillion).<br><br>Both systems coexist today in what is called a "dual-stack" environment.`,
            analogy: `IPv4 is like old 7-digit phone numbers. IPv6 is like adding area codes and country codes because we ran out of 7-digit numbers.`
          },
          example: {
            label: `Size comparison of IPv4 vs IPv6 address space`,
            steps: [`IPv4: 4.3 billion (4.3 x 10^9)`, `IPv6: 340 undecillion (3.4 x 10^38)`, `There are enough IPv6 addresses to assign one to every atom on Earth`]
          },
          quiz: {
            question: `How many bits is an IPv4 address?`,
            options: [`16-bit`, `32-bit`, `64-bit`, `128-bit`],
            correct: 1,
            explanation: `An IPv4 address is 32 bits long, divided into four 8-bit sections.`
          }
        },
        {
          title: `Public vs Private & Static vs Dynamic`,
          explain: {
            text: `A <strong>Public IP</strong> is visible to the entire internet, assigned by your ISP. Your home router has one public IP. A <strong>Private IP</strong> is used within a local network (e.g., <code>192.168.1.5</code>) and is not routable on the internet.<br><br>NAT (Network Address Translation) allows multiple private IPs to share one public IP. A <strong>Static IP</strong> is permanently assigned and never changes, commonly used for servers. A <strong>Dynamic IP</strong> changes periodically and is assigned by DHCP (Dynamic Host Configuration Protocol), typical for home users.`,
            analogy: `Public IP is your apartment building's street address. Private IP is your apartment number. The front desk (NAT) routes mail between the outside and your apartment.`
          },
          example: {
            label: `Your home network setup`,
            steps: [`ISP gives your router a Public IP (e.g. 203.0.113.1)`, `Router uses DHCP to give your phone a Private IP (e.g. 192.168.1.10)`, `Router uses NAT to translate traffic between them`]
          },
          quiz: {
            question: `Which IP range is commonly used for private/home networks?`,
            options: [`8.8.8.x`, `192.168.x.x`, `1.1.1.x`, `203.0.113.x`],
            correct: 1,
            explanation: `The 192.168.x.x block is reserved for private networks and cannot be routed over the public internet.`
          }
        }
      ],
      examQuestions: [
        { question: `Which protocol automatically assigns IP addresses to devices on a network?`, options: [`DNS`, `HTTP`, `DHCP`, `TCP`], correct: 2 },
        { question: `What is the primary reason for the transition from IPv4 to IPv6?`, options: [`IPv6 is more secure`, `IPv6 is faster`, `We ran out of IPv4 addresses`, `IPv4 doesn't support Wi-Fi`], correct: 2 },
        { question: `What technology allows multiple devices on a private network to share a single public IP address?`, options: [`DNS`, `NAT`, `DHCP`, `FTP`], correct: 1 },
        { question: `Which of the following is a valid IPv4 address?`, options: [`256.1.2.3`, `192.168.1.1`, `10.0.0.256`, `fe80::1ff:fe23:4567:890a`], correct: 1 },
        { question: `Why would a web server typically use a static IP address instead of a dynamic one?`, options: [`Static IPs are cheaper`, `Static IPs provide faster download speeds`, `So the server's address doesn't change, allowing DNS to reliably point to it`, `Dynamic IPs cannot be accessed from the public internet`], correct: 2 }
      ]
    },
    {
      id: `dns`,
      title: `Domain Name System`,
      desc: `The phonebook of the internet — translating names to numbers.`,
      icon: `📖`,
      chunks: [
        {
          title: `What is DNS?`,
          explain: {
            text: `<strong>DNS (Domain Name System)</strong> translates human-friendly domain names into IP addresses. Computers use IP addresses to communicate, but humans prefer memorable names like <code>google.com</code>.<br><br>DNS is a highly distributed system — no single server holds all the answers. Instead, millions of servers cooperate worldwide.<br><br>It was invented in 1983 by Paul Mockapetris to replace the old method of manually sharing a giant text file called <code>hosts.txt</code>.`,
            analogy: `Like a phone's contact list — you tap a friend's name instead of dialing their 10-digit number.`
          },
          example: {
            label: `What happens when you type google.com`,
            steps: [`You type 'google.com'`, `DNS translates it to '142.250.190.46'`, `Browser connects to the IP`, `Webpage loads`]
          },
          quiz: {
            question: `What is the primary purpose of DNS?`,
            options: [`To host websites`, `To secure web traffic`, `To translate domain names into IP addresses`, `To assign IP addresses to devices`],
            correct: 2,
            explanation: `DNS maps human-readable domain names to the numerical IP addresses computers use to route data.`
          }
        },
        {
          title: `The DNS Lookup Process`,
          explain: {
            text: `There are 4 main types of DNS servers involved in a lookup:<br><br>1) <strong>Recursive Resolver</strong>: The middleman that does the legwork for your browser.<br>2) <strong>Root Nameserver</strong>: Points the resolver to the correct TLD server. There are 13 root server addresses.<br>3) <strong>TLD Nameserver</strong>: Handles Top-Level Domains (like .com, .org).<br>4) <strong>Authoritative Nameserver</strong>: The final source of truth that holds the actual DNS records for the specific domain.`,
            analogy: `Resolver is a librarian. Root is the library directory. TLD is the section (e.g. History). Authoritative is the specific book holding the answer.`
          },
          example: {
            label: `Full step-by-step lookup for example.com`,
            steps: [`Browser asks Resolver for example.com`, `Resolver asks Root, Root says "go to .com TLD server"`, `Resolver asks .com TLD, TLD says "go to example.com Authoritative server"`, `Resolver asks Authoritative, gets the IP, and gives it to browser`]
          },
          quiz: {
            question: `Which DNS server has the final answer for a domain's IP?`,
            options: [`Recursive Resolver`, `Root Nameserver`, `TLD Nameserver`, `Authoritative Nameserver`],
            correct: 3,
            explanation: `The Authoritative Nameserver is the final stop and holds the actual DNS records for a domain.`
          }
        },
        {
          title: `DNS Record Types`,
          explain: {
            text: `DNS holds different types of records.<br><br><strong>A record</strong>: Maps a domain to an IPv4 address. <strong>AAAA record</strong>: Maps to an IPv6 address.<br><strong>CNAME record</strong>: Maps an alias domain to a canonical domain (e.g., www.example.com to example.com).<br><strong>MX record</strong>: Directs email to a mail server.<br><strong>TXT record</strong>: Holds arbitrary text, often used for verifying domain ownership and email security (SPF/DKIM). <strong>NS record</strong>: Specifies the authoritative nameservers for a domain.`,
            analogy: `A Record = direct phone number. CNAME = forwarding number. MX = mailing address for physical packages.`
          },
          example: {
            label: `Common DNS records for a website`,
            steps: [`example.com A 93.184.216.34`, `www.example.com CNAME example.com`, `example.com MX 10 mail.example.com`]
          },
          quiz: {
            question: `Which record type is used for email delivery?`,
            options: [`A record`, `CNAME record`, `MX record`, `TXT record`],
            correct: 2,
            explanation: `Mail Exchange (MX) records point to the mail servers responsible for accepting emails on behalf of the domain.`
          }
        },
        {
          title: `DNS Caching & Security`,
          explain: {
            text: `<strong>Caching</strong> saves DNS answers locally (in the browser, OS, or resolver) to speed up future lookups. The <strong>TTL (Time to Live)</strong> dictates how long a record stays in cache before expiring.<br><br>DNS security threats include <strong>cache poisoning</strong> (spoofing), where an attacker injects fake records into a resolver to redirect traffic to malicious sites.<br><br><strong>DNSSEC</strong> adds cryptographic signatures to prevent tampering. <strong>DNS over HTTPS (DoH)</strong> encrypts DNS queries to protect user privacy.`,
            analogy: `Caching is like writing down a phone number on a sticky note. TTL is how long you keep the sticky note before calling directory assistance again to verify it hasn't changed.`
          },
          example: {
            label: `How DNS caching works`,
            steps: [`First visit: Browser does full DNS lookup (takes 50ms)`, `Result is cached with a TTL of 3600 seconds`, `Second visit: Browser uses cached IP immediately (takes 0ms)`]
          },
          quiz: {
            question: `What does TTL stand for in DNS?`,
            options: [`Time to Load`, `Total Transfer Latency`, `Time to Live`, `Target Transport Layer`],
            correct: 2,
            explanation: `Time to Live (TTL) tells the resolver how long to cache the DNS record before asking the authoritative server again.`
          }
        }
      ],
      examQuestions: [
        { question: `Which type of DNS server is operated by your ISP or services like Google (8.8.8.8) and acts as a middleman for your queries?`, options: [`Root Nameserver`, `Authoritative Nameserver`, `TLD Nameserver`, `Recursive Resolver`], correct: 3 },
        { question: `What type of DNS record would you use to map a domain to an IPv6 address?`, options: [`A record`, `AAAA record`, `CNAME record`, `MX record`], correct: 1 },
        { question: `What is the purpose of DNSSEC?`, options: [`To encrypt web traffic (HTTPS)`, `To add digital signatures to DNS records to prevent tampering/spoofing`, `To hide your IP address from websites`, `To speed up DNS lookups via caching`], correct: 1 },
        { question: `If a DNS record has a TTL of 86400, how long will it be cached?`, options: [`1 hour`, `1 day`, `1 week`, `1 minute`], correct: 1 },
        { question: `Which DNS hierarchy level includes extensions like .com, .org, and .net?`, options: [`Root`, `TLD (Top-Level Domain)`, `Authoritative`, `Recursive`], correct: 1 }
      ]
    },
    {
      id: `www`,
      title: `The World Wide Web`,
      desc: `The web is not the internet — it's a service that runs on it.`,
      icon: `🕸️`,
      chunks: [
        {
          title: `WWW vs The Internet`,
          explain: {
            text: `The <strong>World Wide Web (WWW)</strong> was invented by Tim Berners-Lee in 1989 at CERN.<br><br>The web is a system of interlinked documents and resources. The internet is the physical infrastructure (cables, routers). The web is an <strong>application</strong> that runs on top of the internet, primarily using the HTTP protocol. A web page is typically a document written in HTML.<br><br>Other internet services that are <em>not</em> the web include email (SMTP), file transfer (FTP), and online gaming.`,
            analogy: `Internet = the physical road network. Web = the shops, houses, and buildings built alongside those roads.`
          },
          example: {
            label: `Internet services that are NOT the web`,
            steps: [`Email (SMTP/IMAP)`, `File sharing (FTP/Torrent)`, `Voice calls (VoIP/Skype)`, `Multiplayer video games`]
          },
          quiz: {
            question: `Who invented the World Wide Web?`,
            options: [`Al Gore`, `Bill Gates`, `Tim Berners-Lee`, `Steve Jobs`],
            correct: 2,
            explanation: `Tim Berners-Lee invented the World Wide Web while working at CERN in 1989.`
          }
        },
        {
          title: `HTTP, HTTPS & URLs`,
          explain: {
            text: `<strong>HTTP (HyperText Transfer Protocol)</strong> is the protocol for transferring web pages. It uses a request-response model: your browser sends a request, and the server replies.<br><br><strong>HTTPS</strong> is HTTP Secure, encrypted using TLS/SSL. It prevents eavesdropping and tampering (indicated by the lock icon).<br><br>A <strong>URL (Uniform Resource Locator)</strong> is a web address. It consists of: protocol (<code>https://</code>), domain (<code>www.example.com</code>), path (<code>/page</code>), query string (<code>?key=value</code>), and fragment (<code>#section</code>).`,
            analogy: `HTTP is sending a postcard (anyone can read it). HTTPS is sending a sealed, tamper-proof envelope.`
          },
          example: {
            label: `Anatomy of a URL`,
            steps: [`https:// (Protocol)`, `www.example.com (Domain)`, `/products/shoes (Path)`, `?size=10 (Query String)`]
          },
          quiz: {
            question: `What does the 'S' in HTTPS stand for?`,
            options: [`System`, `Secure`, `Standard`, `Server`],
            correct: 1,
            explanation: `The 'S' stands for Secure, meaning the HTTP traffic is encrypted using SSL/TLS.`
          }
        }
      ],
      examQuestions: [
        { question: `What is the primary language used to structure documents on the World Wide Web?`, options: [`Python`, `HTML`, `JavaScript`, `C++`], correct: 1 },
        { question: `Which of the following describes the relationship between the Internet and the World Wide Web?`, options: [`They are two names for the same thing`, `The Internet is a service that runs on the World Wide Web`, `The World Wide Web is an application that runs on the Internet`, `The Web was invented before the Internet`], correct: 2 },
        { question: `In the URL 'https://example.com/blog?page=2', what represents the query string?`, options: [`https://`, `example.com`, `/blog`, `?page=2`], correct: 3 },
        { question: `Why is HTTPS preferred over HTTP?`, options: [`It loads images faster`, `It compresses data more efficiently`, `It encrypts the communication between the browser and server`, `It uses less bandwidth`], correct: 2 },
        { question: `What model does HTTP use to communicate?`, options: [`Publish-Subscribe`, `Peer-to-Peer`, `Client-Server (Request-Response)`, `Token Passing`], correct: 2 }
      ]
    },
    {
      id: `browsers-search-engines`,
      title: `Web Browsers & Search Engines`,
      desc: `How browsers render pages and how search engines find them.`,
      icon: `🔍`,
      chunks: [
        {
          title: `How Web Browsers Work`,
          explain: {
            text: `A <strong>web browser</strong> retrieves, interprets, and displays web pages. The process starts when you enter a URL. The browser resolves the domain via DNS, then sends an HTTP request.<br><br>When the server responds with HTML, the browser parses it to build a <strong>DOM tree</strong>. CSS is applied to create a render tree, JavaScript executes to add interactivity, and finally, the page is "painted" onto your screen.<br><br>Major browsers (Chrome, Firefox, Safari) use different rendering engines (Blink, Gecko, WebKit).`,
            analogy: `The server gives the browser a blueprint (HTML), paint (CSS), and machinery (JS). The browser is the construction crew that builds the house on your screen.`
          },
          example: {
            label: `The journey from URL to page`,
            steps: [`DNS Resolution`, `HTTP Request sent`, `HTML/CSS/JS received`, `Browser renders the visual page`]
          },
          quiz: {
            question: `What does a browser do after receiving HTML from a server?`,
            options: [`It sends the HTML back to the server`, `It parses the HTML to build the DOM tree and renders the page`, `It converts the HTML into a database`, `It encrypts the HTML using HTTPS`],
            correct: 1,
            explanation: `The browser parses the HTML document to create a Document Object Model (DOM) tree, which it then uses to render the visible webpage.`
          }
        },
        {
          title: `How Search Engines Work`,
          explain: {
            text: `Search engines help find content through three main processes.<br><br>1) <strong>Crawling</strong>: Automated bots (spiders/crawlers) follow links to discover web pages.<br>2) <strong>Indexing</strong>: The crawler analyzes the content (text, images, keywords) and stores it in a massive database called the index.<br>3) <strong>Ranking</strong>: When a user searches, algorithms (like PageRank) quickly sort indexed pages by relevance to return the best results.<br><br><strong>SEO</strong> (Search Engine Optimization) is the practice of modifying a website to rank higher.`,
            analogy: `Crawling = exploring a massive library. Indexing = creating a detailed card catalog. Ranking = the librarian handing you the best book for your question.`
          },
          example: {
            label: `What happens when you Google 'best pizza'`,
            steps: [`Google looks in its Index for pages containing 'pizza'`, `It filters by your location`, `Its algorithm ranks the results by relevance and quality`, `You see the results page`]
          },
          quiz: {
            question: `What is the process called when search engine bots discover new web pages?`,
            options: [`Indexing`, `Ranking`, `Crawling`, `Spoofing`],
            correct: 2,
            explanation: `Crawling is the process where bots follow links from page to page to discover new content on the web.`
          }
        }
      ],
      examQuestions: [
        { question: `What is the role of a rendering engine in a web browser?`, options: [`To store bookmarks`, `To translate HTML and CSS into the visual webpage you see`, `To encrypt passwords`, `To block advertisements`], correct: 1 },
        { question: `Which of the following is NOT a phase of search engine operation?`, options: [`Crawling`, `Compiling`, `Indexing`, `Ranking`], correct: 1 },
        { question: `What does SEO stand for?`, options: [`Search Engine Optimization`, `System Encryption Options`, `Secure Exchange Operation`, `Standard Execution Order`], correct: 0 },
        { question: `What is the DOM (Document Object Model)?`, options: [`A type of web server`, `A tree-like representation of the HTML document used by the browser`, `A security protocol for browsers`, `A search engine crawler bot`], correct: 1 },
        { question: `Which browser uses the Gecko rendering engine?`, options: [`Google Chrome`, `Apple Safari`, `Mozilla Firefox`, `Microsoft Edge`], correct: 2 }
      ]
    }
  ]
};
