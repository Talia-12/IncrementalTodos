# IncrementalTodos Build/Development Commands

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `cargo tauri dev` - Run Tauri app in development mode
- `cargo tauri build` - Build Tauri app for production

## Test Commands
- `npm run test` - Run all tests
- `npm run test:unit` - Run unit tests
- `npm run test:unit -- -t "test name"` - Run specific unit test
- `npm run test:e2e` - Run end-to-end tests with Playwright

## Lint/Format Commands
- `npm run check` - Type-check the codebase
- `npm run format` - Format code with Prettier
- `npm run lint` - Check for linting issues

## Code Style Guidelines
- Use TypeScript with strict type checking
- Follow ESLint recommended rules and Prettier formatting
- Use Svelte 5 for components with proper type annotations
- Prefer `const` over `let` when possible
- Use descriptive variable/function names in camelCase
- Components use PascalCase for filenames and definition
- Handle errors with proper error boundaries and logging
- Keep imports organized: 1) external 2) internal 3) relative
- Maintain strict separation between Tauri/Rust backend and frontend code
- Use Rust's Result/Option types for proper error handling