# Project Context

## Purpose
A TanStack-based React application demonstrating modern full-stack capabilities with data fetching, routing, and server-side rendering capabilities. The project serves as a showcase for integration with TanStack Router, TanStack Query, and TanStack Start for building scalable, performant web applications.

## Tech Stack
- **Frontend Framework**: React 19
- **Build Tool**: Vite
- **Routing**: TanStack Router v1
- **Data Fetching**: TanStack Query (React Query) v5
- **UI Framework**: TanStack Start, shadcn
- **Styling**: Tailwind CSS v4 with Vite plugin
- **Table Library**: TanStack React Table v8
- **Icons**: Lucide React
- **Language**: TypeScript
- **Package Manager**: Bun
- **Server Functions**: TanStack React Start SSR

## Project Conventions

### Code Style
- **Formatter/Linter**: Biome v2.2.4
- **Quote Style**: Double quotes (`"`)
- **Indentation**: Tabs
- **Import Organization**: Automatic with Biome's organize imports action
- **File Naming**: camelCase for files, PascalCase for React components (.tsx)
- **Demo Files**: Files prefixed with `demo` are examples and can be safely deleted

### Architecture Patterns
- **File-Based Routing**: Routes defined in `src/routes/` directory automatically managed by TanStack Router
- **Layout Pattern**: Root layout in `src/routes/__root.tsx` with `<Outlet />` for nested routes
- **Data Loading**: Supports both TanStack Router loaders and TanStack Query hooks for data fetching
- **Server-Side Rendering**: Full SSR support via TanStack React Start with demos in `src/routes/demo/start.*.tsx`
- **Component Architecture**: UI components in `src/components/`, integration providers in `src/integrations/`
- **Utilities**: Shared utility functions in `src/lib/utils.ts`

### Testing Strategy
- **Test Framework**: Vitest v3
- **DOM Testing**: @testing-library/dom and @testing-library/react
- **Command**: `bun run test` or `npm run test`
- **JSDOM Environment**: Used for DOM testing with jsdom v27

### Git Workflow
- Standard branch-based workflow (follow repository conventions if established)
- Commit messages should be clear and descriptive
- VCS is git-based with gitignore configured for common build artifacts

## Domain Context
- The project includes demo data and API utilities in `src/data/` for testing and prototyping
- Multiple demo routes showcase different data fetching patterns:
  - API request patterns (`start.api-request.tsx`)
  - Server functions (`start.server-funcs.tsx`)
  - Data-only SSR (`start.ssr.data-only.tsx`)
  - Full SSR (`start.ssr.full-ssr.tsx`)
  - SPA mode (`start.ssr.spa-mode.tsx`)
  - Table integration (`table.tsx`)
  - TanStack Query integration (`tanstack-query.tsx`)
- Project supports shadcn UI component library integration via `pnpx shadcn@latest add`
- Devtools enabled for TanStack Query and Router debugging

## Important Constraints
- Ignore files: `src/routeTree.gen.ts` (auto-generated) and `src/styles.css` in linting
- Build artifacts in `dist/`, `dist-ssr/`, `.output/`, `.vinxi/` are ignored
- Private npm package (not published)
- Node version: ES module support required (type: "module" in package.json)

## External Dependencies
- **Faker.js**: For generating demo data
- **TanStack Ecosystem**: Router, Query, Table, Start, Devtools
- **Class Variance Authority**: For component styling patterns
- **Babel React Compiler**: For runtime performance optimization
