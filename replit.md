# replit.md

## Overview

LAPGEST-PRO 2.0 is a comprehensive rabbit farm management system built with a modern full-stack architecture. The application provides complete management capabilities for rabbit breeding operations, including animal tracking, breeding records, health monitoring, financial management, and genealogy tracking.

### Current Status (July 30, 2025)
Eight core modules are now fully functional with complete CRUD operations:
- **Lapins**: Complete rabbit management with individual profiles, health status, genealogy tracking, and deletion functionality
- **Enclos**: Housing management with real-time occupancy monitoring and deletion capabilities
- **Reproduction**: Breeding records, mating management, birth tracking, and deletion features
- **Finances**: Sales and expenses tracking with financial dashboards and transaction deletion
- **Santé**: Health management with medical records, treatments, vaccination schedules, and deletion options
- **Stocks**: Inventory management with stock levels, alerts, movement tracking, and deletion functionality
- **Personnel**: Employee management with task assignment, payroll savings, and complete deletion features
- **Dépenses**: Complete expense management with categorization, filtering, financial analysis, and deletion capabilities

**Recent Achievements (July 30, 2025):**
- ✓ Standardized all currency formatting to Franc CFA (XOF) across all modules
- ✓ Added comprehensive deletion functionality to all modules with confirmation dialogs
- ✓ Fixed all critical SelectItem component errors and syntax issues
- ✓ Implemented complete CRUD operations with mutation handlers for all entities
- ✓ Validated full application functionality with fluid navigation between modules

## User Preferences

Preferred communication style: Simple, everyday language.
Authentication: Simple username/password system (changed from Replit OAuth)
Interface: Single main portal without demo modes

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: TanStack React Query for server state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Style**: RESTful API endpoints
- **Authentication**: Replit OAuth integration with session management
- **Database ORM**: Drizzle ORM for type-safe database operations

### Database Architecture
- **Database**: PostgreSQL (configured for Neon serverless)
- **Schema Management**: Drizzle migrations
- **Connection**: Neon serverless with WebSocket support

## Key Components

### Authentication System
- Replit OAuth integration for user authentication
- Session-based authentication with PostgreSQL session store
- Protected routes with middleware authentication checks
- User profile management with role-based access

### Core Business Modules
1. **Rabbit Management**: Individual rabbit tracking with genealogy
2. **Enclosure Management**: Housing and capacity tracking
3. **Breeding Management**: Mating records and birth tracking
4. **Health Management**: Medical treatments and vaccinations
5. **Financial Management**: Sales, expenses, and profit tracking
6. **Employee Management**: Staff and task management
7. **Inventory Management**: Feed, equipment, and supplies

### UI Component System
- Comprehensive shadcn/ui component library
- Responsive design with mobile-first approach
- Dark mode support with CSS variables
- Custom rabbit farm theme with earth tones and green accents
- Accessible components following Radix UI patterns

## Data Flow

### Client-Server Communication
1. React frontend makes API requests to Express backend
2. Authentication middleware validates user sessions
3. Drizzle ORM handles database queries with type safety
4. TanStack React Query manages client-side caching and state

### Database Schema
- Normalized relational schema with proper foreign key relationships
- Enum types for status fields (rabbit status, enclosure types, etc.)
- Audit trails with created/updated timestamps
- Support for genealogy tracking through parent-child relationships

### Session Management
- PostgreSQL-based session storage
- Secure session cookies with HTTP-only flags
- Session expiration and cleanup

## External Dependencies

### Core Technologies
- **@neondatabase/serverless**: PostgreSQL connection for Neon
- **drizzle-orm**: Type-safe ORM with PostgreSQL dialect
- **express**: Web application framework
- **react**: Frontend library
- **@tanstack/react-query**: Server state management

### UI and Styling
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling for server code

## Deployment Strategy

### Development Environment
- Vite development server for frontend hot reloading
- tsx for TypeScript execution in development
- Replit-specific plugins for enhanced development experience

### Production Build
- Vite builds optimized frontend bundle to `dist/public`
- esbuild bundles server code to `dist/index.js`
- Single Node.js process serves both API and static files
- Database migrations run via `drizzle-kit push` command

### Environment Configuration
- `DATABASE_URL` required for PostgreSQL connection
- `SESSION_SECRET` for session encryption
- `REPLIT_DOMAINS` and OAuth configuration for authentication
- Development vs production environment detection

### File Structure
- `/client`: React frontend application
- `/server`: Express backend API
- `/shared`: Shared TypeScript types and schemas
- `/migrations`: Database migration files
- Configuration files in project root