/**
 * Event Routes
 * RESTful API endpoints for event management
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import { authenticate, authorize, optionalAuth, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Validation schemas
const createEventSchema = z.object({
  name: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  location: z.string().min(3).max(500),
  imageUrl: z.string().url().optional(),
  price: z.string().regex(/^\d+(\.\d{1,18})?$/), // ETH price with up to 18 decimals
  maxCapacity: z.number().int().min(1).max(100000),
  tags: z.array(z.string()).max(10).optional(),
  category: z.string().max(50).optional(),
  visibility: z.enum(['PUBLIC', 'UNLISTED', 'PRIVATE']).optional(),
});

const updateEventSchema = createEventSchema.partial();

const queryEventsSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED']).optional(),
  organizerId: z.string().cuid().optional(),
  sortBy: z.enum(['startDate', 'createdAt', 'price', 'ticketsSold']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

/**
 * GET /api/events
 * List events with pagination, filtering, and search
 */
router.get('/', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const query = queryEventsSchema.parse(req.query);
  
  const page = query.page || 1;
  const limit = Math.min(query.limit || 20, 100); // Max 100 per page
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  // Only show published events to non-authenticated users
  if (!req.user) {
    where.status = 'PUBLISHED';
    where.visibility = 'PUBLIC';
  } else if (req.user.role !== 'ADMIN') {
    // Regular users see published events or their own events
    where.OR = [
      { status: 'PUBLISHED', visibility: { in: ['PUBLIC', 'UNLISTED'] } },
      { organizerId: req.user.id },
    ];
  }

  // Apply filters
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
      { location: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.category) {
    where.category = query.category;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.organizerId) {
    where.organizerId = query.organizerId;
  }

  // Get total count for pagination
  const total = await prisma.event.count({ where });

  // Get events
  const events = await prisma.event.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      [query.sortBy || 'startDate']: query.sortOrder || 'asc',
    },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  res.json({
    data: events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}));

/**
 * GET /api/events/:id
 * Get single event details
 */
router.get('/:id', optionalAuth, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          address: true,
          email: true,
        },
      },
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  // Check visibility permissions
  if (event.visibility === 'PRIVATE' && event.organizerId !== req.user?.id && req.user?.role !== 'ADMIN') {
    throw new AppError(403, 'Access denied to private event');
  }

  // Calculate tickets remaining
  const ticketsRemaining = event.maxCapacity - event.ticketsSold;

  res.json({
    ...event,
    ticketsRemaining,
  });
}));

/**
 * POST /api/events
 * Create new event (organizers and admins only)
 */
router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  strictRateLimiter,
  asyncHandler(async (req: AuthRequest, res: Response) => {
    const data = createEventSchema.parse(req.body);

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate <= startDate) {
      throw new AppError(400, 'End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new AppError(400, 'Start date must be in the future');
    }

    const event = await prisma.event.create({
      data: {
        ...data,
        startDate,
        endDate,
        organizerId: req.user!.id,
        status: 'DRAFT', // Events start as drafts
      },
      include: {
        organizer: {
          select: {
            id: true,
            username: true,
            address: true,
          },
        },
      },
    });

    res.status(201).json(event);
  })
);

/**
 * PUT /api/events/:id
 * Update event (organizer only)
 */
router.put('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const data = updateEventSchema.parse(req.body);

  // Check if event exists and user is organizer
  const existingEvent = await prisma.event.findUnique({
    where: { id },
  });

  if (!existingEvent) {
    throw new AppError(404, 'Event not found');
  }

  if (existingEvent.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only the organizer can update this event');
  }

  // Can't update sold out or completed events
  if (existingEvent.status === 'SOLD_OUT' || existingEvent.status === 'COMPLETED') {
    throw new AppError(400, 'Cannot update sold out or completed events');
  }

  // Validate dates if provided
  if (data.startDate || data.endDate) {
    const startDate = data.startDate ? new Date(data.startDate) : existingEvent.startDate;
    const endDate = data.endDate ? new Date(data.endDate) : existingEvent.endDate;

    if (endDate <= startDate) {
      throw new AppError(400, 'End date must be after start date');
    }
  }

  const updatedEvent = await prisma.event.update({
    where: { id },
    data: {
      ...data,
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    },
    include: {
      organizer: {
        select: {
          id: true,
          username: true,
          address: true,
        },
      },
    },
  });

  res.json(updatedEvent);
}));

/**
 * DELETE /api/events/:id
 * Delete/cancel event (organizer only)
 */
router.delete('/:id', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          tickets: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only the organizer can delete this event');
  }

  // If event has tickets sold, mark as cancelled instead of deleting
  if (event._count.tickets > 0) {
    await prisma.event.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });

    res.json({
      message: 'Event cancelled successfully',
      note: 'Event has sold tickets and was marked as cancelled instead of deleted',
    });
  } else {
    // No tickets sold, safe to delete
    await prisma.event.delete({
      where: { id },
    });

    res.json({
      message: 'Event deleted successfully',
    });
  }
}));

/**
 * POST /api/events/:id/publish
 * Publish a draft event
 */
router.post('/:id/publish', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
  });

  if (!event) {
    throw new AppError(404, 'Event not found');
  }

  if (event.organizerId !== req.user!.id && req.user!.role !== 'ADMIN') {
    throw new AppError(403, 'Only the organizer can publish this event');
  }

  if (event.status !== 'DRAFT') {
    throw new AppError(400, 'Only draft events can be published');
  }

  const publishedEvent = await prisma.event.update({
    where: { id },
    data: { status: 'PUBLISHED' },
  });

  res.json(publishedEvent);
}));

export default router;
