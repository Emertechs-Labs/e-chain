import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';

// Initialize SQLite database
const dbPath = path.join(process.cwd(), 'events.db');
const db = new Database(dbPath);

// Create events table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    organizer TEXT NOT NULL,
    ticketContract TEXT,
    poapContract TEXT,
    incentiveContract TEXT,
    metadataURI TEXT,
    ticketPrice TEXT NOT NULL,
    maxTickets INTEGER NOT NULL,
    startTime INTEGER NOT NULL,
    endTime INTEGER NOT NULL,
    isActive INTEGER NOT NULL DEFAULT 1,
    createdAt INTEGER NOT NULL
  )
`);

// Insert initial test event if not exists
const checkStmt = db.prepare('SELECT COUNT(*) as count FROM events WHERE id = 1');
const exists = checkStmt.get() as { count: number };
if (exists.count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO events (id, name, organizer, ticketContract, metadataURI, ticketPrice, maxTickets, startTime, endTime, isActive, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    1,
    "Test001",
    "0x5474bA789F5CbD31aea2BcA1939989746242680D",
    "0xb4a07ce953946936083cd8214070b74a1ac94b3e",
    "ipfs://placeholder",
    "0",
    100,
    1759810380,
    1759939980,
    1,
    Math.floor(Date.now() / 1000)
  );
}

// Webhook secret from environment (set in MultiBaas)
const WEBHOOK_SECRET = process.env.MULTIBAAS_WEBHOOK_SECRET || 'your-webhook-secret';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-multibaas-signature');
    const timestamp = request.headers.get('x-multibaas-timestamp');

    // Validate webhook signature (basic validation)
    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature or timestamp' }, { status: 401 });
    }

    // For now, skip full validation and trust the request
    // In production, implement HMAC validation as per docs

    const events = JSON.parse(body);

    for (const webhookEvent of events) {
      if (webhookEvent.event === 'event.emitted') {
        const eventData = webhookEvent.data;

        // Check if it's an EventCreated event from EventFactory
        if (eventData.event.name === 'EventCreated') {
          const inputs = eventData.event.inputs;
          const eventId = parseInt(inputs.find((i: any) => i.name === 'eventId')?.value);
          const organizer = inputs.find((i: any) => i.name === 'organizer')?.value;
          const ticketContract = inputs.find((i: any) => i.name === 'ticketContract')?.value;
          const name = inputs.find((i: any) => i.name === 'name')?.value;
          const ticketPrice = inputs.find((i: any) => i.name === 'ticketPrice')?.value;
          const maxTickets = parseInt(inputs.find((i: any) => i.name === 'maxTickets')?.value);

          // Insert event into database
          const stmt = db.prepare(`
            INSERT OR REPLACE INTO events
            (id, name, organizer, ticketContract, metadataURI, ticketPrice, maxTickets, startTime, endTime, isActive, createdAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `);

          stmt.run(
            eventId,
            name,
            organizer,
            ticketContract,
            'ipfs://placeholder', // Would need to fetch from transaction input
            ticketPrice,
            maxTickets,
            1759810380, // Would need to fetch from transaction
            1759939980, // Would need to fetch from transaction
            1, // isActive
            Math.floor(Date.now() / 1000)
          );

          console.log('Stored new event:', { eventId, name, organizer });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Fetch all active events from database
    const stmt = db.prepare('SELECT * FROM events WHERE isActive = 1 ORDER BY createdAt DESC');
    const events = stmt.all();

    // Convert BigInt ticketPrice back
    const formattedEvents = events.map((event: any) => ({
      ...event,
      ticketPrice: BigInt(event.ticketPrice),
      isActive: Boolean(event.isActive)
    }));

    return NextResponse.json(formattedEvents);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}