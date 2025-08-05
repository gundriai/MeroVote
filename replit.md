# Overview

MeroVote is a modern Nepali voting application built with a full-stack TypeScript architecture. The application supports three types of voting systems: daily rating polls (गजब/बेकार/यस्तो नी हुन्छ गथे), political rating polls (उत्कृष्ट/राम्रो/औसत/खराब), and comparison voting for statistical analysis. The platform features real-time voting, comment systems with reactions, and comprehensive admin controls for poll management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The client-side application is built using **React 18** with **TypeScript** and **Vite** as the build tool. The architecture follows a component-based approach with:

- **UI Framework**: Implements shadcn/ui components with Radix UI primitives for accessibility
- **Styling**: Uses Tailwind CSS with custom Nepal-themed color variables and responsive design
- **Routing**: Utilizes Wouter for lightweight client-side routing
- **State Management**: Leverages TanStack Query (React Query) for server state management and caching
- **Form Handling**: Implements React Hook Form with Zod validation for type-safe form processing

The frontend supports multiple voting interfaces based on poll types, with real-time vote tracking and local vote persistence to prevent duplicate voting.

## Backend Architecture

The server-side is built with **Express.js** and **TypeScript**, following a RESTful API design:

- **Database Layer**: Uses Drizzle ORM with PostgreSQL (Neon Database) for type-safe database operations
- **API Structure**: Implements modular route handlers with comprehensive error handling
- **Vote Integrity**: Uses IP address tracking and browser fingerprinting to prevent duplicate votes
- **Session Management**: Implements PostgreSQL-based session storage with connect-pg-simple

The storage layer abstracts database operations through a comprehensive interface supporting users, polls, candidates, votes, comments, and reactions.

## Data Storage Architecture

**Primary Database**: PostgreSQL (Neon Database) with the following schema design:

- **Users**: Admin authentication system with role-based access
- **Polls**: Support for three poll types with configurable duration and media attachments
- **Candidates**: Dynamic candidate system for comparison voting
- **Votes**: Fingerprint and IP-based vote tracking with multiple vote types per poll type
- **Comments**: User-generated content with reaction support
- **Comment Reactions**: Three-tier reaction system (गजब/बेकार/furious)

The database uses UUID primary keys and implements proper foreign key relationships with cascade deletes for data integrity.

## Vote Tracking System

Implements a dual-layer vote prevention system:
- **Client-side**: Browser fingerprinting using canvas rendering and WebGL detection
- **Server-side**: IP address and fingerprint combination validation
- **Local Storage**: Maintains vote history for immediate UI feedback

## Development Environment

The application uses a monorepo structure with shared TypeScript types and schemas between client and server. The development setup includes:

- **Hot Module Replacement**: Vite dev server with Express API proxy
- **Type Safety**: Shared schema definitions using Drizzle Zod integration
- **Database Migrations**: Drizzle Kit for schema management and migrations

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Drizzle ORM**: Type-safe database operations with PostgreSQL dialect

## UI and Styling
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom Nepal-themed design tokens
- **Lucide React**: Icon library for consistent iconography

## Development Tools
- **Vite**: Frontend build tool with TypeScript support and development server
- **TanStack Query**: Server state management with caching and synchronization
- **React Hook Form**: Form state management with Zod validation integration
- **Wouter**: Lightweight routing solution for single-page application navigation

## Authentication and Security
- **Browser Fingerprinting**: Canvas and WebGL-based device identification
- **Session Management**: PostgreSQL session store with secure cookie handling
- **Input Validation**: Zod schema validation for API endpoints and forms

## Deployment Infrastructure
- **Replit Integration**: Development environment optimization with runtime error handling
- **ESBuild**: Production bundling for server-side code
- **Static Asset Serving**: Vite production build with optimized asset delivery