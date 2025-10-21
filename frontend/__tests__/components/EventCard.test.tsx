/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { EventCard } from '@/components/events/EventCard';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

// Mock next/link
jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    name: 'Test Event',
    description: 'This is a test event',
    date: '2025-12-31',
    location: 'Virtual',
    imageUrl: '/test-image.jpg',
    ticketPrice: '0.1',
    ticketsAvailable: 100,
    organizer: '0x1234567890123456789012345678901234567890',
  };

  it('renders event information correctly', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText('Test Event')).toBeInTheDocument();
    expect(screen.getByText('This is a test event')).toBeInTheDocument();
    expect(screen.getByText(/Virtual/i)).toBeInTheDocument();
  });

  it('displays ticket price', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText(/0.1/)).toBeInTheDocument();
  });

  it('shows tickets available count', () => {
    render(<EventCard event={mockEvent} />);

    expect(screen.getByText(/100/)).toBeInTheDocument();
  });

  it('renders event image with correct src', () => {
    render(<EventCard event={mockEvent} />);

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', '/test-image.jpg');
  });

  it('has a link to event details page', () => {
    render(<EventCard event={mockEvent} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/events/1');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);

    const card = screen.getByRole('article');
    fireEvent.click(card);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays sold out badge when no tickets available', () => {
    const soldOutEvent = { ...mockEvent, ticketsAvailable: 0 };
    render(<EventCard event={soldOutEvent} />);

    expect(screen.getByText(/sold out/i)).toBeInTheDocument();
  });

  it('formats date correctly', () => {
    render(<EventCard event={mockEvent} />);

    // Assuming date is formatted as "Dec 31, 2025"
    expect(screen.getByText(/Dec 31, 2025/i)).toBeInTheDocument();
  });

  it('truncates long descriptions', () => {
    const longDescEvent = {
      ...mockEvent,
      description: 'A'.repeat(200),
    };
    render(<EventCard event={longDescEvent} />);

    const description = screen.getByText(/A+/);
    expect(description.textContent?.length).toBeLessThan(200);
  });
});
