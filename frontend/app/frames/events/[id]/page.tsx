/**
 * Frame Event Route - View event details within Farcaster frame
 * Renders frame-optimized event page with MiniKit wallet integration
 */

import FrameEventPage from '@/components/frames/FrameEventPage';

export const runtime = 'edge';

export default async function EventFramePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <FrameEventPage eventId={id} />;
}
