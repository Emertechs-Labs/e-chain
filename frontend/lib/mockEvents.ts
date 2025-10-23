import { Event } from '../types/event';

// Kenya Tech Events Mock Data - Enhanced events for the Kenyan tech ecosystem
export const kenyaTechEvents: Partial<Event>[] = [
  {
    id: 101,
    name: "BG125 Hackathon",
    organizer: "0x1234567890123456789012345678901234567890",
    description: "By Beyond The Code & World Bank. Join Kenya's premier blockchain hackathon bringing together developers, designers, and entrepreneurs to build the future of Web3 in East Africa.",
    venue: "Blockchain Centre NIBO",
    category: "Hackathon",
    startTime: new Date('2025-11-14T16:00:00').getTime() / 1000,
    endTime: new Date('2025-11-16T20:00:00').getTime() / 1000,
    ticketPrice: BigInt('10000000000000000'), // 0.01 ETH
    maxTickets: 500,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Web3", "Blockchain", "Innovation"],
    isLive: true,
    attendees: 234,
    image: "/placeholder-hackathon.jpg",
    // Additional details
    details: {
      about: "Join us for a week-long global hackathon focused on enhancing beneficial projects using AI and ASI technologies. Hosted by BGI and partners, this event empowers developers to build without borders, protect their IP, and collaborate across continents.",
      whatsHappening: [
        "October 14-25, 2025",
        "Fully remote via Zoom",
        "4 thematic tracks (ideals in hack pack)",
        "Global experts across AI, blockchain, and more"
      ],
      prizes: [
        "$5,000 in Cudos compute credits for developers",
        "8 winners total (2 per track)",
        "4 x $750 (1st place)",
        "4 x $500 (2nd place)",
        "Finalist Present announced October 23 during BGI25 Live from Istanbul Un Conference",
        "Winners Announced October 25th. Time TBD"
      ],
      whatYouGet: [
        "Access to a curated Hack Pack with required technologies",
        "Mentorship from global AI leaders",
        "Opportunities to showcase your work during the BGI Summit",
        "Exclusive BGI25 Summit Watch Party for participants only during BGI25 Live from Istanbul"
      ],
      whoShouldJoin: [
        "Developers, researchers, and builders working on beneficial tech",
        "Teams or solo participants ready to enhance existing projects",
        "Anyone passionate about AI, ASI, and open innovation"
      ],
      registration: "Please register and see more details via our https://bgihackathon.com/",
      hosts: [
        { name: "Beyond The Code", role: "Main Organizer", avatar: "👥" },
        { name: "World Bank", role: "Partner", avatar: "🏛️" }
      ],
      socialLinks: {
        website: "https://bgihackathon.com/",
        twitter: "https://twitter.com/beyondthecode",
        discord: "https://discord.gg/bgihackathon"
      }
    }
  },
  {
    id: 102,
    name: "Base - East Africa Builders Bootcamp",
    organizer: "0x2345678901234567890123456789012345678901",
    description: "By Eddie Kago, Xiaoman, Frank Huzard & Chris Okonkwo. Learn to build decentralized applications on Base, the secure, low-cost, builder-friendly Ethereum L2.",
    venue: "Google Meet",
    category: "Workshop",
    startTime: new Date('2025-11-15T18:30:00').getTime() / 1000,
    endTime: new Date('2025-11-15T20:30:00').getTime() / 1000,
    ticketPrice: BigInt('0'),
    maxTickets: 1000,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Base", "Ethereum", "DeFi"],
    isLive: true,
    attendees: 567,
    details: {
      about: "Join Base ecosystem builders for an intensive bootcamp designed to onboard East African developers to Base, Coinbase's Layer 2 solution. Learn best practices, build your first dApp, and connect with the growing Base community in Kenya.",
      whatsHappening: [
        "Introduction to Base and L2 technology",
        "Hands-on smart contract deployment",
        "Building frontend interfaces with Web3",
        "Q&A with Base core team members"
      ],
      whatYouGet: [
        "Base testnet tokens for development",
        "Exclusive Base developer resources",
        "Certificate of completion",
        "Access to Base Africa developer community"
      ],
      whoShouldJoin: [
        "Web3 developers new to Layer 2",
        "Ethereum developers looking to reduce gas costs",
        "Builders interested in the Base ecosystem",
        "Anyone wanting to build on a secure, low-cost chain"
      ],
      hosts: [
        { name: "Eddie Kago", role: "Lead Instructor", avatar: "👨‍💻" },
        { name: "Xiaoman", role: "Base Team", avatar: "👩‍💻" },
        { name: "Frank Huzard", role: "Guest Speaker", avatar: "🎤" },
        { name: "Chris Okonkwo", role: "Community Lead", avatar: "🌍" }
      ]
    }
  },
  {
    id: 103,
    name: "AI For Policy & Communication",
    organizer: "0x3456789012345678901234567890123456789012",
    description: "By Dennis Ndonga & Grace Mwanania. Explore how artificial intelligence is transforming policy making and strategic communication in Kenya's digital landscape.",
    venue: "Zoom",
    category: "Conference",
    startTime: new Date('2025-11-18T11:00:00').getTime() / 1000,
    endTime: new Date('2025-11-18T13:00:00').getTime() / 1000,
    ticketPrice: BigInt('5000000000000000'), // 0.005 ETH
    maxTickets: 200,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["AI", "Policy", "GovTech"],
    isLive: false,
    attendees: 89,
    details: {
      about: "A groundbreaking conference exploring the intersection of AI and policy-making in Kenya. Learn how government agencies and organizations are leveraging AI for better decision-making and communication strategies.",
      whatsHappening: [
        "Keynote on AI in African governance",
        "Panel discussion with policy makers",
        "Case studies from Kenya and Rwanda",
        "Interactive Q&A session"
      ],
      whatYouGet: [
        "Insights from leading policy experts",
        "AI tools for policy analysis",
        "Networking with government officials",
        "Conference certificate"
      ],
      whoShouldJoin: [
        "Policy makers and government officials",
        "Communication strategists",
        "AI researchers and practitioners",
        "NGO and civil society leaders"
      ],
      hosts: [
        { name: "Dennis Ndonga", role: "Policy Expert", avatar: "📊" },
        { name: "Grace Mwanania", role: "AI Strategist", avatar: "🤖" }
      ]
    }
  },
  {
    id: 104,
    name: "Team1 Women Connect",
    organizer: "0x4567890123456789012345678901234567890123",
    description: "Empowering women in tech through networking, mentorship, and skill-building sessions. Join Kenya's largest women in blockchain community.",
    venue: "iHub Nairobi",
    category: "Networking",
    startTime: new Date('2025-11-20T11:00:00').getTime() / 1000,
    endTime: new Date('2025-11-20T14:00:00').getTime() / 1000,
    ticketPrice: BigInt('0'),
    maxTickets: 150,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Women in Tech", "Networking", "Empowerment"],
    isLive: false,
    attendees: 78,
    details: {
      about: "A dedicated space for women in Kenya's tech ecosystem to connect, learn, and grow together. Features mentorship sessions, skill workshops, and networking opportunities with leading women in blockchain and Web3.",
      whatsHappening: [
        "Speed networking sessions",
        "Mentorship matching",
        "Technical workshops on blockchain basics",
        "Panel: Women leading in Web3"
      ],
      whatYouGet: [
        "1-on-1 mentorship opportunities",
        "Access to exclusive women in tech community",
        "Workshop materials and resources",
        "Professional headshot session"
      ],
      whoShouldJoin: [
        "Women developers and designers",
        "Female entrepreneurs in tech",
        "Students interested in blockchain",
        "Anyone supporting women in technology"
      ],
      hosts: [
        { name: "Team1 Community", role: "Organizer", avatar: "👩‍💻" }
      ]
    }
  },
  {
    id: 105,
    name: "Nairobi DeFi Summit 2025",
    organizer: "0x5678901234567890123456789012345678901234",
    description: "The premier DeFi conference in East Africa. Connect with industry leaders, explore cutting-edge protocols, and shape the future of decentralized finance.",
    venue: "Sarit Centre Expo Hall",
    category: "Summit",
    startTime: new Date('2025-11-22T09:00:00').getTime() / 1000,
    endTime: new Date('2025-11-22T18:00:00').getTime() / 1000,
    ticketPrice: BigInt('20000000000000000'), // 0.02 ETH
    maxTickets: 800,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["DeFi", "Finance", "Blockchain"],
    isLive: false,
    attendees: 432,
    details: {
      about: "East Africa's largest DeFi summit bringing together developers, investors, and enthusiasts to explore the future of decentralized finance. Features keynotes from global DeFi leaders, hands-on workshops, and networking opportunities.",
      whatsHappening: [
        "Opening keynote: DeFi in emerging markets",
        "Protocol showcases and demos",
        "Investor pitch sessions",
        "DeFi hackathon finals"
      ],
      prizes: [
        "Best DeFi Protocol: $10,000",
        "Most Innovative Solution: $5,000",
        "Community Choice: $2,500"
      ],
      whatYouGet: [
        "Access to all summit sessions",
        "Networking app with attendee matching",
        "DeFi toolkit and resources",
        "Lunch and refreshments",
        "Summit swag bag"
      ],
      whoShouldJoin: [
        "DeFi developers and protocols",
        "Crypto investors and funds",
        "Traditional finance professionals",
        "Blockchain entrepreneurs"
      ],
      hosts: [
        { name: "DeFi Kenya", role: "Main Organizer", avatar: "🏦" }
      ]
    }
  },
  {
    id: 106,
    name: "Blockchain Kenya Meetup",
    organizer: "0x6789012345678901234567890123456789012345",
    description: "Monthly gathering of blockchain enthusiasts, developers, and entrepreneurs. Share ideas, learn from experts, and build the Web3 ecosystem in Kenya.",
    venue: "Nairobi Garage",
    category: "Meetup",
    startTime: new Date('2025-11-25T17:00:00').getTime() / 1000,
    endTime: new Date('2025-11-25T20:00:00').getTime() / 1000,
    ticketPrice: BigInt('0'),
    maxTickets: 100,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Community", "Blockchain", "Networking"],
    isLive: false,
    attendees: 67,
    details: {
      about: "Join Nairobi's vibrant blockchain community for our monthly meetup. Connect with fellow builders, share your projects, and learn about the latest developments in Web3.",
      whatsHappening: [
        "Project demos and showcases",
        "Technical deep-dive session",
        "Community announcements",
        "Networking and refreshments"
      ],
      whatYouGet: [
        "Platform to showcase your project",
        "Feedback from community members",
        "Connection with potential collaborators",
        "Free refreshments"
      ],
      whoShouldJoin: [
        "Blockchain developers",
        "Web3 entrepreneurs",
        "Crypto enthusiasts",
        "Anyone curious about blockchain"
      ],
      hosts: [
        { name: "Blockchain Association Kenya", role: "Organizer", avatar: "🔗" }
      ]
    }
  },
  {
    id: 107,
    name: "Smart Contract Security Workshop",
    organizer: "0x7890123456789012345678901234567890123456",
    description: "Learn best practices for writing secure smart contracts. Hands-on workshop covering common vulnerabilities, auditing techniques, and security tools.",
    venue: "Moringa School",
    category: "Workshop",
    startTime: new Date('2025-11-27T10:00:00').getTime() / 1000,
    endTime: new Date('2025-11-27T16:00:00').getTime() / 1000,
    ticketPrice: BigInt('15000000000000000'), // 0.015 ETH
    maxTickets: 50,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Security", "Smart Contracts", "Development"],
    isLive: false,
    attendees: 34,
    details: {
      about: "Intensive workshop on smart contract security. Learn to identify and prevent common vulnerabilities, use security tools, and follow best practices for secure contract development.",
      whatsHappening: [
        "Common vulnerability patterns",
        "Hands-on hacking exercises",
        "Security tools walkthrough",
        "Code review best practices"
      ],
      whatYouGet: [
        "Security audit checklist",
        "Access to premium security tools",
        "Workshop certificate",
        "1-month follow-up support"
      ],
      whoShouldJoin: [
        "Smart contract developers",
        "Security researchers",
        "DeFi protocol builders",
        "Anyone writing on-chain code"
      ],
      hosts: [
        { name: "Security DAO Kenya", role: "Instructor", avatar: "🛡️" }
      ]
    }
  },
  {
    id: 108,
    name: "Africa NFT Conference",
    organizer: "0x8901234567890123456789012345678901234567",
    description: "Showcasing African digital art and NFT innovations. Connect with artists, collectors, and builders shaping the creative economy on blockchain.",
    venue: "Two Rivers Mall Convention Centre",
    category: "Conference",
    startTime: new Date('2025-11-30T09:00:00').getTime() / 1000,
    endTime: new Date('2025-11-30T17:00:00').getTime() / 1000,
    ticketPrice: BigInt('25000000000000000'), // 0.025 ETH
    maxTickets: 500,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["NFT", "Art", "Creative"],
    isLive: false,
    attendees: 289,
    details: {
      about: "Africa's premier NFT conference celebrating digital art, music, and culture on the blockchain. Features exhibitions, panel discussions, and workshops on creating and collecting NFTs.",
      whatsHappening: [
        "NFT art exhibition",
        "Live minting sessions",
        "Panel: NFTs and African culture",
        "Marketplace partnerships announcement"
      ],
      whatYouGet: [
        "Exclusive conference NFT",
        "Access to artist meet & greets",
        "NFT creation workshop",
        "Networking with collectors"
      ],
      whoShouldJoin: [
        "Digital artists and creators",
        "NFT collectors and investors",
        "Gallery owners and curators",
        "Culture and art enthusiasts"
      ],
      hosts: [
        { name: "Africa NFT Community", role: "Organizer", avatar: "🎨" }
      ]
    }
  },
  {
    id: 109,
    name: "Kenya Blockchain & AI Summit",
    organizer: "0x9012345678901234567890123456789012345678",
    description: "Exploring the convergence of blockchain and artificial intelligence. Learn how these technologies are reshaping industries in Kenya and Africa.",
    venue: "KICC Nairobi",
    category: "Conference",
    startTime: new Date('2025-12-05T09:00:00').getTime() / 1000,
    endTime: new Date('2025-12-05T18:00:00').getTime() / 1000,
    ticketPrice: BigInt('30000000000000000'), // 0.03 ETH
    maxTickets: 1000,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["AI", "Blockchain", "Innovation"],
    isLive: false,
    attendees: 523,
    details: {
      about: "A groundbreaking summit exploring how AI and blockchain converge to create powerful solutions for African challenges. Features demos, workshops, and networking with industry leaders.",
      whatsHappening: [
        "Keynote: AI meets Blockchain",
        "Use case presentations",
        "Technical workshops",
        "Startup pitch competition"
      ],
      whatYouGet: [
        "Summit access pass",
        "Workshop materials",
        "Networking app access",
        "Certificate of attendance"
      ],
      whoShouldJoin: [
        "AI and blockchain developers",
        "Tech entrepreneurs",
        "Investors and VCs",
        "Enterprise innovation teams"
      ],
      hosts: [
        { name: "Tech Summit Kenya", role: "Organizer", avatar: "🚀" }
      ]
    }
  },
  {
    id: 110,
    name: "Web3 Gaming Workshop",
    organizer: "0x0123456789012345678901234567890123456789",
    description: "Build your first blockchain game. Learn Unity integration with smart contracts, NFT game assets, and play-to-earn mechanics.",
    venue: "Nairobi Game Dev Studio",
    category: "Workshop",
    startTime: new Date('2025-12-10T14:00:00').getTime() / 1000,
    endTime: new Date('2025-12-10T18:00:00').getTime() / 1000,
    ticketPrice: BigInt('12000000000000000'), // 0.012 ETH
    maxTickets: 80,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Gaming", "NFT", "Development"],
    isLive: false,
    attendees: 45,
    details: {
      about: "Hands-on workshop on building Web3 games. Learn to integrate blockchain features into Unity, create NFT game assets, and implement play-to-earn mechanics.",
      whatsHappening: [
        "Unity Web3 SDK setup",
        "Smart contract integration",
        "NFT asset creation",
        "Play-to-earn economics"
      ],
      whatYouGet: [
        "Game development toolkit",
        "Sample game code",
        "NFT assets for testing",
        "Discord community access"
      ],
      whoShouldJoin: [
        "Game developers",
        "Unity developers",
        "Web3 enthusiasts",
        "Indie game creators"
      ],
      hosts: [
        { name: "GameFi Kenya", role: "Instructor", avatar: "🎮" }
      ]
    }
  },
  {
    id: 111,
    name: "Ethereum Kenya Developer Bootcamp",
    organizer: "0x5678901234567890123456789012345678901234",
    description: "Intensive 3-day bootcamp covering Solidity, Web3.js, and DApp development. Build and deploy your first decentralized application.",
    venue: "Strathmore University",
    category: "Bootcamp",
    startTime: new Date('2026-01-15T09:00:00').getTime() / 1000,
    endTime: new Date('2026-01-17T17:00:00').getTime() / 1000,
    ticketPrice: BigInt('50000000000000000'), // 0.05 ETH
    maxTickets: 200,
    ticketContract: "0x0000000000000000000000000000000000000000",
    metadataURI: "",
    isActive: true,
    createdAt: Date.now() / 1000,
    tags: ["Ethereum", "Solidity", "DApp"],
    isLive: false,
    attendees: 112,
    details: {
      about: "Comprehensive 3-day bootcamp designed to take you from blockchain basics to deploying your own DApp. Learn Solidity, Web3.js, and best practices from Ethereum experts.",
      whatsHappening: [
        "Day 1: Blockchain fundamentals and Solidity basics",
        "Day 2: Advanced smart contracts and testing",
        "Day 3: Frontend integration and deployment"
      ],
      whatYouGet: [
        "Bootcamp certificate",
        "Ethereum developer toolkit",
        "3 months of mentorship",
        "Job placement assistance",
        "Access to alumni network"
      ],
      whoShouldJoin: [
        "Aspiring blockchain developers",
        "Web developers transitioning to Web3",
        "Computer science students",
        "Anyone serious about Ethereum development"
      ],
      hosts: [
        { name: "Ethereum Foundation", role: "Partner", avatar: "⟠" },
        { name: "Strathmore University", role: "Host", avatar: "🎓" }
      ]
    }
  }
];

// Helper function to get a mock event by ID
export function getMockEventById(id: number): Partial<Event> | undefined {
  return kenyaTechEvents.find(event => event.id === id);
}

// Helper function to check if an ID belongs to a mock event
export function isMockEvent(id: number): boolean {
  return id >= 101 && id <= 111;
}
