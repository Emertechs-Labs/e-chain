/**
 * Ticket Routes
 * NFT ticket management and transfers
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';

const router = Router();

// Validation schemas
const purchaseTicketSchema = z.object({
  eventId: z.string().cuid(),
  quantity: z.number().int().min(1).max(10), // Max 10 tickets per purchase
  paymentTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/), // Ethereum tx hash
});

const transferTicketSchema = z.object({
  toAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
});

const checkInSchema = z.object({
  ticketId: z.string().cuid(),
});

/**
 * GET /api/tickets
 * Get user's tickets
 */
router.get('/', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status, eventId } = req.query;

  const where: any = {
    userId: req.user!.id,
  };

  if (status && ['ACTIVE', 'TRANSFERRED', 'TRANSFERRED', 'CANCELLED'].includes(status as string)) {
    where.status = status;
  }

  if (eventId && typeof eventId === 'string') {
    where.eventId = eventId;
  }

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      event: {
        select: {
          id: true,
          name: true,
          startDate: true,
          endDate: true,
          location: true,
          imageUrl: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.json(tickets);
}));

/**
 * GET /api/tickets/:id
 * Get single ticket details
 */
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          description: true,
          startDate: true,
          endDate: true,
          location: true,
          imageUrl: true,
          organizerId: true,
        },
      },
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  // Only ticket owner, event organizer, or admin can view ticket details
  const isOwner = ticket.userId === req.user?.id;
  const isOrganizer = ticket.event.organizerId === req.user?.id;
  const isAdmin = req.user?.role === 'ADMIN';

  if (!isOwner && !isOrganizer && !isAdmin) {
    // Public view - limited info
    return res.json({
      id: ticket.id,
      eventId: ticket.eventId,
      status: ticket.status,
      event: ticket.event,
    });
  }

  res.json(ticket);
}));

/**
 * POST /api/tickets/purchase
 * Purchase ticket(s) for an event
 */
router.post('/purchase', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = purchaseTicketSchema.parse(req.body);

  // Get event
  const event = await prisma.event.findUnique({
    where: { id: data.eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.status !== 'PUBLISHED') {
    throw new AppError(400, 'Event is not available for ticket purchase');
  }

  // Check capacity
  const ticketsRemaining = event.maxCapacity - event.ticketsSold;
  if (ticketsRemaining < data.quantity) {
    throw new AppError(400, `Only ${ticketsRemaining} tickets remaining`);
  }

  // Check if payment already processed
  const existingPayment = await prisma.payment.findFirst({
    where: { txHash: data.paymentTxHash },
  });

  if (existingPayment) {
    throw new AppError(409, 'Payment already processed');
  }

  // Calculate amounts
  const totalAmount = parseFloat(event.price.toString()) * data.quantity;
  const platformFee = totalAmount * 0.025; // 2.5% platform fee
  const organizerAmount = totalAmount - platformFee;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      userId: req.user!.id,
      eventId: data.eventId,
      quantity: data.quantity,
      totalAmount: totalAmount.toString(),
      platformFee: platformFee.toString(),
      organizerAmount: organizerAmount.toString(),
      txHash: data.paymentTxHash,
      status: 'PENDING', // Will be confirmed by blockchain watcher
    },
  });

  // Create tickets (will be minted on-chain separately)
  const ticketPromises = Array.from({ length: data.quantity }).map((_, index) =>
    prisma.ticket.create({
      data: {
        eventId: data.eventId,
        userId: req.user!.id,
        status: 'ACTIVE',
        // tokenId and txHash will be updated after minting
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            startDate: true,
            location: true,
          },
        },
      },
    })
  );

  const tickets = await Promise.all(ticketPromises);

  // Update event tickets sold
  await prisma.event.update({
    where: { id: data.eventId },
    data: {
      ticketsSold: { increment: data.quantity },
    },
  });

  // Update analytics
  await prisma.eventAnalytics.upsert({
    where: { eventId: data.eventId },
    create: {
      eventId: data.eventId,
      ticketPurchases: data.quantity,
      totalRevenue: totalAmount.toString(),
    },
    update: {
      ticketPurchases: { increment: data.quantity },
      totalRevenue: { increment: totalAmount },
    },
  });

  res.status(201).json({
    message: 'Tickets purchased successfully',
    payment,
    tickets,
  });
}));

/**
 * POST /api/tickets/:id/transfer
 * Transfer ticket to another address
 */
router.post('/:id/transfer', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = transferTicketSchema.parse(req.body);

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: true,
    },
  });

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  if (ticket.userId !== req.user!.id) {
    throw new AppError(403, 'Only ticket owner can transfer');
  }

  if (ticket.status !== 'ACTIVE') {
    throw new AppError(400, 'Only valid tickets can be transferred');
  }

  // Check if event is in the future
  if (ticket.event.startDate < new Date()) {
    throw new AppError(400, 'Cannot transfer ticket for past events');
  }

  // Find or create recipient user
  let recipient = await prisma.user.findUnique({
    where: { address: data.toAddress.toLowerCase() },
  });

  if (!recipient) {
    // Auto-create user for the recipient
    recipient = await prisma.user.create({
      data: {
        address: data.toAddress.toLowerCase(),
        username: `user_${data.toAddress.slice(2, 10)}`,
        role: 'ATTENDEE',
      },
    });
  }

  // Update ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id },
    data: {
      status: 'TRANSFERRED',
      transferredTo: data.toAddress.toLowerCase(),
      transferredAt: new Date(),
      // transferredTxHash will be updated after on-chain transfer
    },
  });

  // Create new ticket for recipient
  const newTicket = await prisma.ticket.create({
    data: {
      eventId: ticket.eventId,
      userId: recipient.id,
      tokenId: ticket.tokenId, // Same NFT token ID
      status: 'ACTIVE',
    },
    include: {
      event: {
        select: {
          id: true,
          name: true,
          startDate: true,
          location: true,
        },
      },
    },
  });

  res.json({
    message: 'Ticket transfer initiated',
    oldTicket: updatedTicket,
    newTicket,
  });
}));

/**
 * POST /api/tickets/check-in
 * Check in ticket at event (organizer only)
 */
router.post('/check-in', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = checkInSchema.parse(req.body);

  const ticket = await prisma.ticket.findUnique({
    where: { id: data.ticketId },
    include: {
      event: true,
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
    },
  });

  if (!ticket) {
    throw new AppError(404, 'Ticket not found');
  }

  // Only event organizer can check in tickets
  if (ticket.event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can check in tickets');
  }

  if (ticket.status !== 'ACTIVE') {
    throw new AppError(400, 'Invalid ticket status');
  }

  if (ticket.checkedIn) {
    throw new AppError(400, 'Ticket already checked in');
  }

  // Update ticket
  const updatedTicket = await prisma.ticket.update({
    where: { id: data.ticketId },
    data: {
      checkedIn: true,
      checkedInAt: new Date(),
      checkedInBy: req.user!.id,
      status: 'TRANSFERRED',
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
    },
  });

  res.json({
    message: 'Ticket checked in successfully',
    ticket: updatedTicket,
  });
}));

/**
 * GET /api/tickets/event/:eventId/stats
 * Get ticket statistics for an event (organizer only)
 */
router.get('/event/:eventId/stats', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { eventId } = req.params;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only event organizer can view ticket stats');
  }

  const stats = await prisma.ticket.groupBy({
    by: ['status'],
    where: { eventId },
    _count: {
      status: true,
    },
  });

  const checkedInCount = await prisma.ticket.count({
    where: {
      eventId,
      checkedIn: true,
    },
  });

  res.json({
    eventId,
    totalTickets: event.ticketsSold,
    capacity: event.maxCapacity,
    remaining: event.maxCapacity - event.ticketsSold,
    checkedIn: checkedInCount,
    statusBreakdown: stats.reduce<Record<string, number>>((acc: Record<string, number>, { status, _count }: { status: string; _count: { status: number } }) => {
      acc[status] = _count.status;
      return acc;
    }, {}),
  });
}));

export default router;
