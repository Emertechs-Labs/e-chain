import { Metadata } from 'next';
import ClientWrapper from './ClientWrapper';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ticket Marketplace - Echain',
  description: 'Buy and sell event tickets securely on the blockchain.',
};

export default function MarketplacePage() {
  return <ClientWrapper />;
}
