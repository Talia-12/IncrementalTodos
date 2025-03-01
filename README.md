# IncrementalTodos

A simple Todo application with two display modes: Focus Mode and List Mode.

## Features

### Focus Mode
- Displays a single TODO item in the center of the screen
- Buttons to mark as COMPLETE, DELETE, or DEFER
- Four different DEFER options (1, 7, 14, or 30 days)

### List Mode
- List of all items scheduled for today with checkboxes
- Separate list of items completed today with crossed-out text

### Adding Todos
- Button in the bottom right with a plus icon
- Dialog with minimal fields by default (Todo item and optional details)
- Expandable dialog with additional options:
  - Priority (1-10)
  - "Must be completed by" field
  - "Must be completed on" field
  - Recurring todo options

## Data Persistence
- Todos are saved to localStorage

## Development

This project uses SvelteKit.

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

- `src/lib/components/` - Reusable components
- `src/lib/stores/` - Svelte stores for state management
- `src/routes/` - SvelteKit routes
  - `/` - Focus Mode
  - `/list` - List Mode

## Technologies Used

- SvelteKit
- TypeScript
- localStorage for data persistence
