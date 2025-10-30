import { NextResponse } from 'next/server';
import { readContract } from '../../../../lib/contract-wrapper';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, attendeeAddress, ticketContract } = body;

    if (!eventId || !attendeeAddress || !ticketContract) {
      return NextResponse.json(
        { error: 'Missing required parameters: eventId, attendeeAddress, ticketContract' },
        { status: 400 }
      );
    }

    // Verify that the attendee actually owns tickets for this event
    try {
      // Check if the attendee owns any tickets from the event's ticket contract
      const balance = await readContract(
        ticketContract,
        'balanceOf',
        [attendeeAddress]
      );

      if (Number(balance) === 0) {
        return NextResponse.json(
          { error: 'No tickets found for this address and event' },
          { status: 400 }
        );
      }

      // Check if already claimed POAP for this event
      const hasClaimed = await readContract(
        'POAPAttendance',
        'hasClaimed',
        [eventId, attendeeAddress]
      );

      if (hasClaimed) {
        return NextResponse.json(
          { error: 'POAP already claimed for this event' },
          { status: 400 }
        );
      }

      // For now, implement a simplified claiming approach
      // In a production system, you'd want proper authorization
      // This could be done by having the event organizer sign claims
      // or by checking ticket ownership on-chain

      // For demo purposes, we'll return validation success
      // The actual POAP minting would require contract modifications
      // to allow simpler claiming mechanisms
      return NextResponse.json({
        success: true,
        message: 'Ticket ownership verified. POAP claiming requires contract authorization.',
        ticketBalance: Number(balance),
        canClaim: true,
        note: 'POAP claiming is under development and requires backend authorization'
      }, { status: 200 });

    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Failed to validate ticket ownership: ' + validationError.message },
        { status: 400 }
      );
    }

  } catch (err: any) {
    console.error('[app/api/poap/claim] Error:', err);
    return NextResponse.json(
      { error: err?.message ?? 'Failed to create POAP claim transaction' },
      { status: 500 }
    );
  }
}