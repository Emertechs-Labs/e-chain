/**
 * Database Connection and Management for Echain
 * 
 * This module provides a centralized database connection using better-sqlite3
 * for managing dynamic data including pricing tiers, platform statistics, FAQs, and blog content.
 * 
 * @module database
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'echain.db');

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Create database connection
let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH, {
      verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
    });
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    
    // Initialize tables
    initializeTables();
  }
  
  return db;
}

/**
 * Initialize all database tables
 */
function initializeTables() {
  const db = getDatabase();
  
  // Pricing Tiers Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pricing_tiers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price_monthly REAL,
      price_yearly REAL,
      features_json TEXT NOT NULL,
      limits_json TEXT NOT NULL,
      badge TEXT,
      is_active BOOLEAN DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_pricing_tiers_active 
    ON pricing_tiers(is_active, sort_order);
  `);
  
  // Platform Statistics Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS platform_statistics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      metric_name TEXT NOT NULL UNIQUE,
      metric_value TEXT NOT NULL,
      last_calculated DATETIME DEFAULT CURRENT_TIMESTAMP,
      calculation_duration_ms INTEGER
    );
    
    CREATE INDEX IF NOT EXISTS idx_platform_statistics_calculated 
    ON platform_statistics(last_calculated);
  `);
  
  // FAQ Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT,
      helpful_count INTEGER DEFAULT 0,
      not_helpful_count INTEGER DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_faqs_category 
    ON faqs(category, is_active);
    
    CREATE VIRTUAL TABLE IF NOT EXISTS faqs_fts USING fts5(
      question, answer, 
      content=faqs, 
      content_rowid=rowid
    );
  `);
  
  // Content/Blog Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS content_posts (
      id TEXT PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      excerpt TEXT,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL,
      tags_json TEXT,
      featured_image TEXT,
      is_published BOOLEAN DEFAULT 0,
      published_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_content_posts_slug 
    ON content_posts(slug);
    
    CREATE INDEX IF NOT EXISTS idx_content_posts_published 
    ON content_posts(is_published, published_at DESC);
  `);
  
  // Seed initial data if tables are empty
  seedInitialData();
}

/**
 * Seed initial data for pricing tiers
 */
function seedInitialData() {
  const db = getDatabase();
  
  // Check if pricing tiers exist
  const pricingCount = db.prepare('SELECT COUNT(*) as count FROM pricing_tiers').get() as { count: number };
  
  if (pricingCount.count === 0) {
    // Insert default pricing tiers
    const insertPricing = db.prepare(`
      INSERT INTO pricing_tiers (id, name, description, price_monthly, price_yearly, features_json, limits_json, badge, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const pricingTiers = [
      {
        id: 'free',
        name: 'Free',
        description: 'Perfect for getting started',
        priceMonthly: 0,
        priceYearly: 0,
        features: ['Up to 5 events/month', 'Up to 100 tickets/event', 'Basic analytics', 'Community support'],
        limits: { eventsPerMonth: 5, ticketsPerEvent: 100, storageGB: 1 },
        badge: null,
        sortOrder: 0
      },
      {
        id: 'starter',
        name: 'Starter',
        description: 'For small to medium events',
        priceMonthly: 29,
        priceYearly: 290,
        features: ['Up to 20 events/month', 'Up to 500 tickets/event', 'Advanced analytics', 'Email support', 'Custom branding'],
        limits: { eventsPerMonth: 20, ticketsPerEvent: 500, storageGB: 10 },
        badge: 'Popular',
        sortOrder: 1
      },
      {
        id: 'professional',
        name: 'Professional',
        description: 'For professional event organizers',
        priceMonthly: 99,
        priceYearly: 990,
        features: ['Unlimited events', 'Up to 5,000 tickets/event', 'Premium analytics', 'Priority support', 'API access', 'White label'],
        limits: { eventsPerMonth: -1, ticketsPerEvent: 5000, storageGB: 100 },
        badge: 'Best Value',
        sortOrder: 2
      },
      {
        id: 'enterprise',
        name: 'Enterprise',
        description: 'For large organizations',
        priceMonthly: 299,
        priceYearly: 2990,
        features: ['Unlimited everything', 'Dedicated account manager', '24/7 support', 'Custom integrations', 'SLA guarantee', 'On-premise option'],
        limits: { eventsPerMonth: -1, ticketsPerEvent: -1, storageGB: -1 },
        badge: null,
        sortOrder: 3
      }
    ];
    
    for (const tier of pricingTiers) {
      insertPricing.run(
        tier.id,
        tier.name,
        tier.description,
        tier.priceMonthly,
        tier.priceYearly,
        JSON.stringify(tier.features),
        JSON.stringify(tier.limits),
        tier.badge,
        tier.sortOrder
      );
    }
    
    console.log('✅ Seeded pricing tiers');
  }
  
  // Seed initial FAQs
  const faqCount = db.prepare('SELECT COUNT(*) as count FROM faqs').get() as { count: number };
  
  if (faqCount.count === 0) {
    const insertFaq = db.prepare(`
      INSERT INTO faqs (id, question, answer, category, tags_json, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const faqs = [
      {
        id: 'faq-1',
        question: 'What is Echain?',
        answer: 'Echain is a Web3-native event management platform built on Base blockchain. It provides transparent, secure, and decentralized event ticketing with built-in NFT tickets and POAP integration.',
        category: 'General',
        tags: ['platform', 'web3', 'blockchain'],
        sortOrder: 0
      },
      {
        id: 'faq-2',
        question: 'How do I create an event?',
        answer: 'Connect your wallet, navigate to "Create Event", fill in event details, set ticket prices and quantities, and deploy your event contract to Base blockchain. The process takes less than 5 minutes.',
        category: 'Events',
        tags: ['create', 'events', 'how-to'],
        sortOrder: 1
      },
      {
        id: 'faq-3',
        question: 'What wallets are supported?',
        answer: 'We support all major Web3 wallets including MetaMask, Coinbase Wallet, WalletConnect, and Rainbow. Make sure your wallet is connected to Base network.',
        category: 'Wallet',
        tags: ['wallet', 'support', 'connection'],
        sortOrder: 2
      },
      {
        id: 'faq-4',
        question: 'What are the transaction fees?',
        answer: 'Echain charges a 2.5% platform fee on ticket sales. Additionally, you\'ll pay Base network gas fees which are typically under $0.01 per transaction.',
        category: 'Pricing',
        tags: ['fees', 'pricing', 'costs'],
        sortOrder: 3
      },
      {
        id: 'faq-5',
        question: 'Can I transfer or resell tickets?',
        answer: 'Yes! All tickets are NFTs that can be transferred or resold on our marketplace. Event organizers can enable/disable resales and set maximum resale prices.',
        category: 'Tickets',
        tags: ['tickets', 'nft', 'resale'],
        sortOrder: 4
      }
    ];
    
    for (const faq of faqs) {
      insertFaq.run(
        faq.id,
        faq.question,
        faq.answer,
        faq.category,
        JSON.stringify(faq.tags),
        faq.sortOrder
      );
    }
    
    console.log('✅ Seeded FAQs');
  }
}

/**
 * Close database connection
 */
export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Types
export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  limits: {
    eventsPerMonth: number;
    ticketsPerEvent: number;
    storageGB: number;
  };
  badge?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface PlatformStatistic {
  id: number;
  metricName: string;
  metricValue: string;
  lastCalculated: string;
  calculationDurationMs: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  helpfulCount: number;
  notHelpfulCount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContentPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: string;
  isPublished: boolean;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export default getDatabase;
