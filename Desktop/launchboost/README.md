# IndieSaasDeals - SaaS Deals Marketplace

A curated marketplace connecting indie SaaS founders with early adopters. Solve the "cold start" problem for new SaaS products while rewarding indie hackers with exclusive discounts.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe

## Features

### For Users (Early Adopters)
- Browse curated SaaS deals
- Filter by category (AI, Marketing, Productivity, Developer Tools)
- Claim exclusive discount codes
- Leave feedback for founders

### For Founders
- Self-serve deal submission
- Upload discount codes in bulk
- Dashboard with analytics
- Feedback inbox from users
- Featured deal placement ($99)

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy the values in `.env.local` with your actual Supabase and Stripe credentials

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)**

## Project Structure

- `/src/app` - Next.js 14 App Router pages and API routes
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions

## Development Phases

- **Phase 1 (July-Sept):** Foundation & Core Features
- **Phase 2 (October):** Interaction & Monetization
- **Phase 3 (November):** Pre-Launch Polish

## Database Schema

See project documentation for complete database schema including:
- `users` - User profiles and founder status
- `deals` - Product deals and metadata
- `deal_codes` - Unique discount codes
- `feedback` - User feedback and ratings
