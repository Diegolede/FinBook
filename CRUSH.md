# CRUSH Development Guidelines

## Essential Commands
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Lint fix: `npm run lint:fix`
- Test: No tests configured yet
- Single test: No tests configured yet

## Code Style Guidelines

### TypeScript/JavaScript
- Strict TypeScript with noImplicitAny
- No unused variables (args prefixed with _ are ignored)
- Prefer interfaces over types for objects
- Use PascalCase for components and interfaces
- Use camelCase for variables and functions
- Use UPPER_SNAKE_CASE for constants

### React
- Functional components with hooks
- Typed props and state
- No React import needed (new JSX transform)
- Components in src/renderer/pages and src/renderer/components

### Electron
- Main process in src/main
- IPC communication via window.electronAPI
- Database operations in src/main/services/DatabaseService.ts

### Imports
- Absolute imports preferred
- Group imports: built-in, external, internal
- No unused imports
- Destructure imports when using multiple exports

### Formatting
- ESLint with TypeScript and React plugins
- Prettier-compatible formatting
- 2 space indentation
- No trailing commas in objects
- Semicolons required

### Error Handling
- Use try/catch for async operations
- Log errors with context
- Handle IPC errors gracefully
- Validate data at API boundaries

## Project Structure
- src/main: Electron main process
- src/renderer: React frontend
- src/renderer/pages: App screens
- src/renderer/components: Reusable UI
- src/main/services: Backend services

## Database
- SQLite via sqlite3 package
- DatabaseService for all DB operations
- Asynchronous operations with Promises

## Testing
- No testing framework configured yet
- Add tests when implementing new features

## Deployment
- Build: `npm run build`
- Package: `npm run dist`
- Platform-specific: `npm run dist:win`, `npm run dist:mac`, `npm run dist:linux`