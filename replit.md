# Overview

This is a full-stack fitness management platform called "Reshape Fitness" that provides a luxury gym experience with member management, trainer coordination, and subscription services. The application supports three user types (members, trainers, admins) with role-based dashboards and features including personal training session management, membership subscriptions, nutrition planning, and administrative tools.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based dashboard redirects
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system featuring gold accent colors and glass morphism effects
- **State Management**: TanStack Query for server state management, React hooks for local state
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Framework**: Express.js with TypeScript running on Node.js
- **Database**: SQLite with Drizzle ORM for local development, configured to support PostgreSQL for production
- **Authentication**: Session-based authentication with optional Replit Auth integration
- **API Design**: RESTful endpoints with role-based access control
- **File Structure**: Monorepo structure with shared schema between client and server

## Data Storage Solutions
- **Primary Database**: SQLite (development) / PostgreSQL (production) with Drizzle ORM
- **Schema Management**: Centralized schema definitions in `/shared/schema.ts`
- **Session Storage**: Database-backed session store for authentication persistence
- **Data Models**: Users, membership tiers, trainer/member profiles, sessions, workout/nutrition plans

## Authentication and Authorization
- **Session Management**: Express session middleware with database-backed storage
- **Role-based Access**: Three user types (member, trainer, admin) with corresponding dashboard access
- **Password Security**: bcrypt for password hashing with salt rounds
- **Token-based Operations**: Secure tokens for password reset and email change operations
- **Route Protection**: Middleware-based authentication checks on protected API endpoints

# External Dependencies

## Payment Processing
- **Stripe Integration**: Full payment processing with subscription management
- **Components**: React Stripe.js components for secure payment forms
- **Webhook Support**: Configured for handling Stripe webhook events

## Email Services
- **Provider**: Gmail SMTP with nodemailer for transactional emails
- **Use Cases**: Password reset emails, membership confirmations, system notifications
- **Fallback**: Mock email service for development when credentials unavailable

## Development Tools
- **Replit Integration**: Specialized plugins for Replit development environment
- **Build Pipeline**: ESBuild for server bundling, Vite for client bundling
- **Development Server**: Hot module replacement with error overlay

## UI and Styling
- **Component Library**: Comprehensive Radix UI primitive collection
- **Icon System**: Lucide React for consistent iconography
- **Typography**: Google Fonts integration (Inter, Poppins)
- **Animation**: CSS transitions with custom animation classes

## Hosting and Deployment
- **Database**: Neon PostgreSQL for production database hosting
- **Environment**: Configured for both local SQLite development and cloud PostgreSQL production
- **Static Assets**: Vite-managed asset pipeline with public directory serving