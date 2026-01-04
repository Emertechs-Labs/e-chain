# Backend API Setup

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Setup PostgreSQL Database**

Install PostgreSQL if not already installed:
- Windows: Download from https://www.postgresql.org/download/windows/
- Mac: `brew install postgresql@14`
- Linux: `sudo apt-get install postgresql-14`

Create database:
```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE echain_events;

# Create user (optional)
CREATE USER echain WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE echain_events TO echain;
```

3. **Configure Environment**

Copy `.env.example` to `.env` and update:
```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env`:
```
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/echain_events?schema=public"
```

4. **Run Database Migration**
```bash
npx prisma migrate dev --name init
```

5. **Generate Prisma Client**
```bash
npx prisma generate
```

## Development

Start development server:
```bash
npm run dev
```

API will be available at `http://localhost:4000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register with wallet
- `POST /api/auth/login` - Login with wallet
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update profile
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/upgrade-to-organizer` - Upgrade to organizer role

### Events
- `GET /api/events` - List events (with pagination & filters)
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (organizer only)
- `PUT /api/events/:id` - Update event (organizer only)
- `DELETE /api/events/:id` - Delete/cancel event (organizer only)
- `POST /api/events/:id/publish` - Publish draft event

### Tickets
- `GET /api/tickets` - Get user's tickets
- `GET /api/tickets/:id` - Get ticket details
- `POST /api/tickets/purchase` - Purchase tickets
- `POST /api/tickets/:id/transfer` - Transfer ticket
- `POST /api/tickets/check-in` - Check in ticket (organizer only)
- `GET /api/tickets/event/:eventId/stats` - Get ticket stats (organizer only)

### Analytics
- `GET /api/analytics/event/:eventId` - Get event analytics
- `POST /api/analytics/track` - Track analytics event
- `PUT /api/analytics/event/:eventId` - Update analytics
- `GET /api/analytics/dashboard` - Organizer dashboard
- `GET /api/analytics/event/:eventId/funnel` - Conversion funnel
- `GET /api/analytics/event/:eventId/referrers` - Top referrers

## Testing

Run tests:
```bash
npm test
```

Run specific test file:
```bash
npm test -- events.test.ts
```

## Database Management

View database in Prisma Studio:
```bash
npx prisma studio
```

Reset database (CAUTION - deletes all data):
```bash
npx prisma migrate reset
```

## Production Build

Build for production:
```bash
npm run build
```

Start production server:
```bash
npm start
```

## Architecture

### Tech Stack
- **Framework**: Express.js 4.18.2
- **Database**: PostgreSQL with Prisma ORM 5.20.0
- **Authentication**: JWT with bcryptjs
- **Validation**: Zod schemas
- **Logging**: Winston
- **Security**: Helmet, CORS, rate limiting

### Database Schema
- **User**: Wallet-based accounts with roles
- **Event**: Event information with pricing and capacity
- **Ticket**: NFT tickets with on-chain data
- **Payment**: Transaction tracking
- **EventAnalytics**: Conversion metrics
- **Session**: JWT session management

### Middleware Stack
1. Helmet (security headers)
2. CORS (cross-origin requests)
3. JSON/URL-encoded parsing
4. Request logging (Winston)
5. Rate limiting (express-rate-limit)
6. Authentication (JWT)
7. Error handling (global handler)

### Security Features
- JWT authentication with 7-day expiration
- Role-based access control (ATTENDEE, ORGANIZER, ADMIN)
- Rate limiting (100 req/min global, 10 req/min strict, 5 attempts/15min auth)
- Input validation with Zod schemas
- SQL injection protection via Prisma
- XSS protection via input sanitization
- CORS whitelist
- Helmet security headers

## Next Steps

1. Set up PostgreSQL database
2. Run migrations to create schema
3. Test API endpoints with Postman/Thunder Client
4. Integrate with smart contracts (Story 2)
5. Add payment processing webhook (Story 3)
6. Deploy to production (Story 4)
