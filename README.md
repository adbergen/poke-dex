# Pokédex

A modern web app to browse, search, and favorite Pokémon.

## Features

- Browse paginated Pokémon list
- Search by name and filter by type
- View detailed Pokémon information
- Create account and save favorites
- Responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Authentication**: Better Auth
- **Database**: PostgreSQL with Drizzle ORM
- **API**: tRPC with TanStack Query
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Set up environment variables in `.env.local`:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
4. Run database migrations:
   ```bash
   pnpm db:push
   ```
5. Start the development server:
   ```bash
   pnpm dev
   ```
6. Open [http://localhost:3000](http://localhost:3000)

## Commands

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm lint` - Run linting
- `pnpm type-check` - Run TypeScript checks
- `pnpm db:push` - Push schema changes to database