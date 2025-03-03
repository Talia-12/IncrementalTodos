# IncrementalTodos CSS Guide

This document provides an overview of the global CSS styling system used in the IncrementalTodos application.

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Components](#components)
5. [Utility Classes](#utility-classes)
6. [Responsive Design](#responsive-design)

## Color Palette

The application uses a consistent color palette defined as CSS variables:

### Primary Colors
- `--primary`: #4a90e2 - Main brand color
- `--primary-dark`: #3a80d2 - Darker shade for hover states
- `--primary-light`: #6ba5e9 - Lighter shade for backgrounds
- `--primary-very-light`: #e8f1fc - Very light shade for subtle backgrounds

### Secondary Colors
- `--secondary`: #5c6bc0 - Secondary brand color
- `--secondary-dark`: #4a59b5 - Darker shade for hover states
- `--secondary-light`: #7986cb - Lighter shade for backgrounds

### Semantic Colors
- `--success`: #66bb6a - Green for success states
- `--warning`: #ffa726 - Orange for warning states
- `--danger`: #ef5350 - Red for error states
- `--info`: #29b6f6 - Blue for informational states

### Neutral Colors
- `--background`: #f5f5f5 - Main background color
- `--surface`: #ffffff - Card and component background
- `--surface-hover`: #f9f9f9 - Hover state for surface elements
- `--text-primary`: #333333 - Primary text color
- `--text-secondary`: #666666 - Secondary text color
- `--text-tertiary`: #888888 - Tertiary text color
- `--text-disabled`: #aaaaaa - Disabled text color
- `--border`: #eeeeee - Light border color
- `--border-dark`: #dddddd - Darker border color

### Priority Colors
The application uses a color scale for todo priorities (1-5):
- `--priority-1`: #2e7d32 - Dark green (lowest priority)
- `--priority-2`: #388e3c - Forest green
- `--priority-3`: #558b2f - Olive green
- `--priority-4`: #827717 - Dark lime
- `--priority-5`: #f57f17 - Dark amber (highest priority)

## Typography

The application uses a system font stack for optimal performance and native feel:

```css
--font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
```

### Font Sizes
- `--font-size-xs`: 0.75rem (12px)
- `--font-size-sm`: 0.875rem (14px)
- `--font-size-md`: 1rem (16px)
- `--font-size-lg`: 1.125rem (18px)
- `--font-size-xl`: 1.25rem (20px)
- `--font-size-2xl`: 1.5rem (24px)

## Spacing

Consistent spacing is used throughout the application:

- `--spacing-xs`: 0.25rem (4px)
- `--spacing-sm`: 0.5rem (8px)
- `--spacing-md`: 1rem (16px)
- `--spacing-lg`: 1.5rem (24px)
- `--spacing-xl`: 2rem (32px)
- `--spacing-2xl`: 3rem (48px)

## Components

The global CSS defines styling for common components:

### Buttons
- Default button: Blue background with white text
- Secondary button: Purple background
- Success button: Green background
- Danger button: Red background
- Outline button: Transparent with blue border

### Forms
- Form groups with consistent spacing
- Styled inputs, textareas, and selects
- Custom checkbox styling

### Cards & Containers
- `.card`: Basic card with shadow and rounded corners
- `.todo-card`: Specific styling for todo items
- `.todo-list`: Container for lists of todos
- `.todo-list-item`: Individual todo items in a list

### Dialogs & Modals
- `.dialog-backdrop`: Full-screen overlay
- `.dialog`: Modal dialog box with padding and shadow

## Utility Classes

The CSS includes utility classes for common styling needs:

### Text Alignment
- `.text-center`: Center-aligned text
- `.text-right`: Right-aligned text

### Text Colors
- `.text-primary`: Primary blue color
- `.text-secondary`: Secondary text color
- `.text-success`: Success green color
- `.text-danger`: Error red color
- `.text-warning`: Warning orange color

### Margin Utilities
Margin utilities in 5 sizes (0-5) for all directions:
- `.mt-*`: Margin top
- `.mb-*`: Margin bottom
- `.ml-*`: Margin left
- `.mr-*`: Margin right

## Responsive Design

The CSS includes media queries for responsive design:

### Tablet (max-width: 768px)
- Header layout changes to column
- Navigation becomes centered
- Dialog padding is reduced

### Mobile (max-width: 480px)
- Font size is slightly reduced
- Container padding is reduced
- Main content padding is reduced

## Usage

To use these styles in your components:

1. The global CSS is automatically imported in the root layout
2. Use CSS variables in your component styles:

```css
.my-component {
  color: var(--primary);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-md);
}
```

3. Use utility classes directly in your HTML:

```html
<div class="card mb-3">
  <h2 class="text-primary">Title</h2>
  <p class="text-secondary">Content</p>
</div>
``` 