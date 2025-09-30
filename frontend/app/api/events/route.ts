import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Create events table if it doesn't exist
async function initTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
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
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at INTEGER NOT NULL
      )
    `;
  } catch (error) {
    console.error('Error creating table:', error);
  }
}

// Insert initial test event if not exists
async function seedData() {
  try {
    const result = await sql`SELECT COUNT(*) as count FROM events WHERE id = 1`;
    if (result.rows[0].count === '0') {
      await sql`
        INSERT INTO events (id, name, organizer, ticket_contract, metadata_uri, ticket_price, max_tickets, start_time, end_time, is_active, created_at)
        VALUES (1, 'Test001', '0x5474bA789F5CbD31aea2BcA1939989746242680D', '0xb4a07ce953946936083cd8214070b74a1ac94b3e', 'ipfs://placeholder', '0', 100, 1759810380, 1759939980, true, ${Math.floor(Date.now() / 1000)})
      `;
    }
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

// Initialize database
initTable().then(() => seedData());

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
          await sql`
            INSERT INTO events (id, name, organizer, ticket_contract, metadata_uri, ticket_price, max_tickets, start_time, end_time, is_active, created_at)
            VALUES (${eventId}, ${name}, ${organizer}, ${ticketContract}, 'ipfs://placeholder', ${ticketPrice}, ${maxTickets}, 1759810380, 1759939980, true, ${Math.floor(Date.now() / 1000)})
            ON CONFLICT (id) DO UPDATE SET
              name = EXCLUDED.name,
              organizer = EXCLUDED.organizer,
              ticket_contract = EXCLUDED.ticket_contract,
              ticket_price = EXCLUDED.ticket_price,
              max_tickets = EXCLUDED.max_tickets
          `;

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
    const result = await sql`SELECT * FROM events WHERE is_active = true ORDER BY created_at DESC`;

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
      isActive: event.is_active,
      createdAt: event.created_at
    }));

    return NextResponse.json(events);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}