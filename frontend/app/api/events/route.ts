import { NextRequest, NextResponse } from 'next/server';
import { readContract } from '../../../lib/contract-wrapper';

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