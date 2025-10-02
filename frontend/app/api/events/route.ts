import { NextRequest, NextResponse } from 'next/server';
import { readContract, writeContract } from '../../../lib/contract-wrapper';

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
          const startTime = parseInt(inputs.find((i: any) => i.name === 'startTime')?.value);
          const endTime = parseInt(inputs.find((i: any) => i.name === 'endTime')?.value);
          const metadataUri = inputs.find((i: any) => i.name === 'metadataURI')?.value || '';

          // Event is now stored on-chain only - no database storage
          console.log('Received new event (stored on-chain):', { eventId, name, organizer, startTime, endTime });
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
    // Get events directly from the EventFactory contract
    const eventCount = await readContract('EventFactory', 'eventCount', []);

    if (!eventCount || Number(eventCount) === 0) {
      return NextResponse.json([]);
    }

    const events = [];
    const count = Number(eventCount);

    // Get details for each event
    for (let i = 1; i <= count; i++) {
      try {
        const eventDetails = await readContract('EventFactory', 'getEventDetails', [i]);

        if (eventDetails) {
          events.push({
            id: i,
            name: eventDetails.name || 'Unknown Event',
            organizer: eventDetails.organizer || '0x0000000000000000000000000000000000000000',
            ticketContract: eventDetails.ticketContract || null,
            poapContract: null, // Not stored on-chain
            incentiveContract: null, // Not stored on-chain
            metadataURI: eventDetails.metadataURI || '',
            ticketPrice: eventDetails.ticketPrice || '0',
            maxTickets: Number(eventDetails.maxTickets || 0),
            startTime: Number(eventDetails.startTime || 0),
            endTime: Number(eventDetails.endTime || 0),
            isActive: true, // Assume active unless we check contract
            createdAt: Number(eventDetails.createdAt || 0)
          });
        }
      } catch (error) {
        console.warn(`Failed to get details for event ${i}:`, error);
      }
    }

    return NextResponse.json(events);
  } catch (error) {
    console.error('Contract error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}