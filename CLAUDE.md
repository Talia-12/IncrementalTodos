# IncrementalTodos Development Guide

## Build Commands
- `npm run dev` - Start development server (`-- --open` to open browser)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `cargo tauri dev` - Run Tauri app in development mode
- `cargo tauri build` - Build Tauri app for production

## Test Commands
- `npm run test` - Run all tests (unit + e2e)
- `npm run test:unit` - Run all unit tests with Vitest
- `npm run test:unit -- -t "test name"` - Run specific test by name
- `npm run test:unit -- --watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright e2e tests

## Lint/Format Commands
- `npm run check` - Type-check the codebase
- `npm run format` - Format code with Prettier
- `npm run lint` - Check for linting issues

## Code Style Guidelines
- TypeScript: Use strict mode with explicit return types
- Components: Use PascalCase for filenames and component names
- Variables: Use camelCase with descriptive names
- Imports: Group by 1) external 2) internal 3) relative
- State: Prefer Svelte stores for shared state management
- Errors: Use proper error boundaries and typed error handling
- Comments: Document complex logic and component props
- Responsive: Design for mobile-first with adaptive layouts
- Rust: Use Result/Option types with proper error handling
- Backend: Keep Tauri/Rust logic separate from frontend code