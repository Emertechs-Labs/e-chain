/**
 * Authentication Routes
 * Wallet-based authentication with JWT
 */

import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Validation schemas
const registerSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
});

const loginSchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  signature: z.string().optional(), // For future signature verification
});

const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
});

// JWT secret from env
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT token
 */
function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as string,
  } as jwt.SignOptions);
}

/**
 * POST /api/auth/register
 * Register new user with wallet address
 */
router.post('/register', authRateLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = registerSchema.parse(req.body);

  // Check if address already exists
  const existingUser = await prisma.user.findUnique({
    where: { address: data.address.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError(409, 'Address already registered');
  }

  // Check if email is taken (if provided)
  if (data.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (emailExists) {
      throw new AppError(409, 'Email already in use');
    }
  }

  // Create user
  const user = await prisma.user.create({
    data: {
      address: data.address.toLowerCase(),
      email: data.email?.toLowerCase(),
      username: data.username || `user_${data.address.slice(2, 10)}`,
      role: 'ATTENDEE', // Default role
    },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT
  const token = generateToken(user.id);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || 'Unknown',
    },
  });

  res.status(201).json({
    message: 'User registered successfully',
    user,
    token,
  });
}));

/**
 * POST /api/auth/login
 * Login with wallet address
 */
router.post('/login', authRateLimiter, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = loginSchema.parse(req.body);

  // Find user
  const user = await prisma.user.findUnique({
    where: { address: data.address.toLowerCase() },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found. Please register first.');
  }

  // TODO: Verify signature in production
  // For now, we trust the wallet connection from frontend

  // Generate JWT
  const token = generateToken(user.id);

  // Create session
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent: req.headers['user-agent'] || 'Unknown',
      ipAddress: req.ip || 'Unknown',
    },
  });

  res.json({
    message: 'Login successful',
    user,
    token,
  });
}));

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 */
router.post('/logout', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (token) {
    // Delete session
    await prisma.session.deleteMany({
      where: {
        userId: req.user!.id,
        token,
      },
    });
  }

  res.json({
    message: 'Logout successful',
  });
}));

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
      _count: {
        select: {
          organizedEvents: true,
          tickets: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  res.json(user);
}));

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const data = updateProfileSchema.parse(req.body);

  // Check if email is taken (if changing)
  if (data.email) {
    const emailExists = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        NOT: { id: req.user!.id },
      },
    });

    if (emailExists) {
      throw new AppError(409, 'Email already in use');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(data.email && { email: data.email.toLowerCase() }),
      ...(data.username && { username: data.username }),
    },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      role: true,
      createdAt: true,
    },
  });

  res.json(updatedUser);
}));

/**
 * POST /api/auth/verify
 * Verify JWT token
 */
router.post('/verify', asyncHandler(async (req: AuthRequest, res: Response) => {
  const { token } = req.body;

  if (!token) {
    throw new AppError(400, 'Token required');
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    // Check if session exists
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      throw new AppError(401, 'Invalid or expired session');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        address: true,
        email: true,
        username: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    res.json({
      valid: true,
      user,
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AppError(401, 'Invalid token');
    }
    throw error;
  }
}));

/**
 * POST /api/auth/upgrade-to-organizer
 * Request upgrade to organizer role
 */
router.post('/upgrade-to-organizer', authenticate, asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
  });

  if (!user) {
    throw new AppError(404, 'User not found');
  }

  if (user.role === 'ORGANIZER' || user.role === 'ADMIN') {
    throw new AppError(400, 'User already has organizer or admin privileges');
  }

  // Upgrade to organizer
  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: { role: 'ORGANIZER' },
    select: {
      id: true,
      address: true,
      email: true,
      username: true,
      role: true,
    },
  });

  res.json({
    message: 'Successfully upgraded to organizer',
    user: updatedUser,
  });
}));

export default router;
