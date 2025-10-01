import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { readContract, writeContract } from '../../../lib/contract-wrapper';

// Initialize Turso client
const client = process.env.TURSO_DATABASE_URL ? createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
}) : null;

// Create events table if it doesn't exist
async function initTable() {
  if (!client) return;
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        organizer TEXT NOT NULL,
        ticket_contract TEXT,
        poap_contract TEXT,
        incentive_contract TEXT,
        metadata_uri TEXT,
        ticket_price TEXT NOT NULL,
        max_tickets INTEGER NOT NULL,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT 1,
        created_at INTEGER NOT NULL
      )
    `);
  } catch (error) {
    console.error('Error creating table:', error);
  }
}// Webhook secret from environment (set in MultiBaas)
const WEBHOOK_SECRET = process.env.MULTIBAAS_WEBHOOK_SECRET || 'your-webhook-secret';

export async function POST(request: NextRequest) {
  try {
    // Initialize table if needed
    await initTable();

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
          const startTime = parseInt(inputs.find((i: any) => i.name === 'startTime')?.value);
          const endTime = parseInt(inputs.find((i: any) => i.name === 'endTime')?.value);
          const metadataUri = inputs.find((i: any) => i.name === 'metadataURI')?.value || '';

          // Insert event into database
          if (!client) {
            throw new Error('Database not configured');
          }
          await client.execute({
            sql: `INSERT INTO events (id, name, organizer, ticket_contract, metadata_uri, ticket_price, max_tickets, start_time, end_time, is_active, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT (id) DO UPDATE SET
                    name = EXCLUDED.name,
                    organizer = EXCLUDED.organizer,
                    ticket_contract = EXCLUDED.ticket_contract,
                    metadata_uri = EXCLUDED.metadata_uri,
                    ticket_price = EXCLUDED.ticket_price,
                    max_tickets = EXCLUDED.max_tickets,
                    start_time = EXCLUDED.start_time,
                    end_time = EXCLUDED.end_time`,
            args: [eventId, name, organizer, ticketContract, metadataUri, ticketPrice, maxTickets, startTime, endTime, 1, Math.floor(Date.now() / 1000)]
          });

          console.log('Stored new event:', { eventId, name, organizer, startTime, endTime });
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
  if (!client) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }
  try {
    // Initialize table if needed
    await initTable();

    // Fetch all active events from database
    const result = await client.execute('SELECT * FROM events WHERE is_active = 1 ORDER BY created_at DESC');

    // Convert to expected format
    const events = result.rows.map((event: any) => ({
      id: event.id,
      name: event.name,
      organizer: event.organizer,
      ticketContract: event.ticket_contract,
      poapContract: event.poap_contract,
      incentiveContract: event.incentive_contract,
      metadataURI: event.metadata_uri,
      ticketPrice: event.ticket_price,
      maxTickets: event.max_tickets,
      startTime: event.start_time,
      endTime: event.end_time,
      isActive: event.is_active === 1,
      createdAt: event.created_at
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}