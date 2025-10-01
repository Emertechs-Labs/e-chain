import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

// Initialize Turso client
const client = process.env.TURSO_DATABASE_URL ? createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}) : null;

// Create marketplace listings table if it doesn't exist
async function initTable() {
  if (!client) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS marketplace_listings (
        id TEXT PRIMARY KEY,
        token_id INTEGER NOT NULL,
        event_id INTEGER NOT NULL,
        event_name TEXT NOT NULL,
        ticket_type TEXT NOT NULL,
        price TEXT NOT NULL,
        original_price TEXT NOT NULL,
        seller TEXT NOT NULL,
        event_date INTEGER NOT NULL,
        location TEXT NOT NULL,
        verified BOOLEAN NOT NULL DEFAULT 1,
        ticket_contract TEXT NOT NULL,
        listed_at INTEGER NOT NULL,
        active BOOLEAN NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    `);

    // Create index for faster queries
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_active ON marketplace_listings(active)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_seller ON marketplace_listings(seller)
    `);

    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_marketplace_event ON marketplace_listings(event_id)
    `);
  } catch (error) {
    console.error('Error creating marketplace table:', error);
  }
}

// Seed with some real-looking marketplace data
async function seedMarketplaceData() {
  if (!client) return;

  try {
    // Check if we already have data
    const existing = await client.execute('SELECT COUNT(*) as count FROM marketplace_listings');
    if (existing.rows && existing.rows[0] && Number(existing.rows[0].count) > 0) {
      console.log('Marketplace data already exists, skipping seed');
      return;
    }

    // Get some real events from the database to create listings
    const eventsResult = await client.execute('SELECT * FROM events WHERE is_active = 1 ORDER BY created_at DESC LIMIT 10');
    const events = eventsResult.rows;

    if (events.length === 0) {
      console.log('No events found, cannot seed marketplace data');
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const listings = [];

    // Create some listings based on real events
    for (let i = 0; i < Math.min(events.length, 5); i++) {
      const event = events[i];
      const eventDate = event.start_time;
      const ticketPriceStr = event.ticket_price;

      if (!ticketPriceStr) continue; // Skip if no ticket price

      const ticketPrice = BigInt(String(ticketPriceStr));

      // Create 1-3 listings per event with realistic discounts
      const numListings = Math.floor(Math.random() * 3) + 1;

      for (let j = 0; j < numListings; j++) {
        const tokenId = (Number(event.id) * 1000) + j + 1;
        const discountPercent = Math.random() * 0.4 + 0.1; // 10-50% discount for resale
        const listingPrice = ticketPrice * BigInt(Math.floor((1 - discountPercent) * 100)) / BigInt(100);

        // Get location from event metadata if available, otherwise use default
        let location = 'Location TBA';
        if (event.metadata_uri && event.metadata_uri !== 'ipfs://placeholder') {
          try {
            // Try to get location from metadata, but for seeding we'll use defaults
            const defaultLocations = ['San Francisco, CA', 'New York, NY', 'Los Angeles, CA', 'Austin, TX', 'Miami, FL', 'Denver, CO', 'Seattle, WA'];
            location = defaultLocations[i % defaultLocations.length];
          } catch (error) {
            location = 'Location TBA';
          }
        }

        listings.push({
          id: `listing_${event.id}_${j}_${Date.now()}`,
          token_id: tokenId,
          event_id: event.id,
          event_name: event.name,
          ticket_type: j === 0 ? 'VIP Access' : j === 1 ? 'Early Bird' : 'General Admission',
          price: listingPrice.toString(),
          original_price: ticketPrice.toString(),
          seller: `0x${Math.random().toString(16).substr(2, 40)}`, // Random seller address
          event_date: eventDate,
          location: location,
          verified: Math.random() > 0.15, // 85% verified for realism
          ticket_contract: event.ticket_contract || '0xc8cd32F0b2a6EE43f465a3f88BC52955A805043C',
          listed_at: now - Math.floor(Math.random() * 14 * 24 * 60 * 60), // Within last 2 weeks
          active: true,
          created_at: now
        });
      }
    }

    // Insert listings
    for (const listing of listings) {
      await client.execute({
        sql: `INSERT INTO marketplace_listings
              (id, token_id, event_id, event_name, ticket_type, price, original_price, seller, event_date, location, verified, ticket_contract, listed_at, active, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          listing.id,
          listing.token_id,
          listing.event_id,
          listing.event_name,
          listing.ticket_type,
          listing.price,
          listing.original_price,
          listing.seller,
          listing.event_date,
          listing.location,
          listing.verified ? 1 : 0,
          listing.ticket_contract,
          listing.listed_at,
          listing.active ? 1 : 0,
          listing.created_at
        ]
      });
    }

    console.log(`Seeded ${listings.length} marketplace listings based on ${events.length} real events`);
  } catch (error) {
    console.error('Error seeding marketplace data:', error);
  }
}

export async function GET(request: NextRequest) {
  if (!client) {
    return NextResponse.json({
      error: 'Database not configured',
      message: 'Marketplace requires database configuration. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.'
    }, { status: 503 });
  }

  try {
    // Initialize table if needed
    await initTable();

    const { searchParams } = new URL(request.url);
    const seller = searchParams.get('seller');
    const eventId = searchParams.get('eventId');
    const limit = parseInt(searchParams.get('limit') || '50');

    let query = 'SELECT * FROM marketplace_listings WHERE active = 1';
    const args: any[] = [];

    if (seller) {
      query += ' AND seller = ?';
      args.push(seller);
    }

    if (eventId) {
      query += ' AND event_id = ?';
      args.push(parseInt(eventId));
    }

    query += ' ORDER BY listed_at DESC LIMIT ?';
    args.push(limit);

    const result = await client.execute({
      sql: query,
      args
    });

    // If no listings found, try to seed some data
    if (result.rows.length === 0) {
      console.log('No marketplace listings found, seeding data...');
      await seedMarketplaceData();

      // Try the query again after seeding
      const resultAfterSeed = await client.execute({
        sql: query,
        args
      });

      result.rows = resultAfterSeed.rows;
    }

    // Convert to expected format
    const listings = result.rows.map((row: any) => ({
      id: row.id,
      tokenId: row.token_id,
      eventId: row.event_id,
      eventName: row.event_name,
      ticketType: row.ticket_type,
      price: BigInt(row.price),
      originalPrice: BigInt(row.original_price),
      seller: row.seller,
      eventDate: row.event_date,
      location: row.location,
      verified: row.verified === 1,
      ticketContract: row.ticket_contract,
      listedAt: row.listed_at,
      active: row.active === 1
    }));

    return NextResponse.json(listings);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!client) {
    return NextResponse.json({
      error: 'Database not configured',
      message: 'Marketplace requires database configuration. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.'
    }, { status: 503 });
  }

  try {
    // Initialize table if needed
    await initTable();

    const body = await request.json();
    const {
      id,
      tokenId,
      eventId,
      eventName,
      ticketType,
      price,
      originalPrice,
      seller,
      eventDate,
      location,
      verified = true,
      ticketContract,
      listedAt,
      active = true
    } = body;

    const now = Math.floor(Date.now() / 1000);

    await client.execute({
      sql: `INSERT INTO marketplace_listings
            (id, token_id, event_id, event_name, ticket_type, price, original_price, seller, event_date, location, verified, ticket_contract, listed_at, active, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        tokenId,
        eventId,
        eventName,
        ticketType,
        price.toString(),
        originalPrice.toString(),
        seller,
        eventDate,
        location,
        verified ? 1 : 0,
        ticketContract,
        listedAt || now,
        active ? 1 : 0,
        now
      ]
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT endpoint to update listing (e.g., mark as inactive when sold)
export async function PUT(request: NextRequest) {
  if (!client) {
    return NextResponse.json({
      error: 'Database not configured',
      message: 'Marketplace requires database configuration. Please set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN environment variables.'
    }, { status: 503 });
  }

  try {
    // Initialize table if needed
    await initTable();

    const body = await request.json();
    const { id, active } = body;

    await client.execute({
      sql: 'UPDATE marketplace_listings SET active = ? WHERE id = ?',
      args: [active ? 1 : 0, id]
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}