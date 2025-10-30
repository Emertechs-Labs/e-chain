import { NextRequest, NextResponse } from 'next/server';
import { securityLogger } from '@/lib/security-logger';
import { createFrameValidationMiddleware, FrameData } from '@/lib/frame-validation';

const validateFrameRequest = createFrameValidationMiddleware();

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return validateFrameRequest(request, async (validatedData: FrameData) => {
    const eventId = params.id;

    // Log Frame interaction with validated data
    securityLogger.frameInteraction(`rsvp_${eventId}`, 'rsvp_attempt', undefined, {
      frameData: validatedData,
      eventId,
    });

    // Additional business logic validation
    if (!eventId || eventId.length > 100) {
      securityLogger.securityEvent('invalid_event_id', { eventId });
      return NextResponse.json(
        { error: 'Invalid event ID' },
        { status: 400 }
      );
    }

    // In a real app, process the RSVP with validated data
    // For now, return a success frame

    const frameResponse = {
      'fc:frame': 'vNext',
      'fc:frame:image': 'https://echain.com/rsvp-success.png',
      'fc:frame:button:1': 'View Full Event',
      'fc:frame:button:1:action': 'link',
      'fc:frame:button:1:target': `https://echain.com/events/${eventId}`,
    };

    securityLogger.frameInteraction(`rsvp_${eventId}`, 'rsvp_success', undefined, {
      eventId,
      fid: validatedData.fid,
    });

    return new NextResponse(JSON.stringify(frameResponse), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  });
}