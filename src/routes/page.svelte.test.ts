/*
  File: src/routes/page.svelte.test.ts
  Description: Test suite for the main page component, using Vitest and Testing Library for Svelte component testing.
  Related Files:
  - src/routes/+page.svelte
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/AddTodoButton.svelte
*/

import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';
import * as todoStore from '$lib/stores/todoStore';

// Mock the todoStore
vi.mock('$lib/stores/todoStore', () => {
	return {
		getNextFocusTodo: vi.fn(),
		todoStore: {
			subscribe: vi.fn((callback) => {
				callback();
				return () => {};
			})
		}
	};
});

describe('/+page.svelte', () => {
	// Reset mocks before each test
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// Test for proper rendering of empty state
	test('should render empty state when no todos exist', () => {
		// Mock getNextFocusTodo to return null (no todos)
		vi.mocked(todoStore.getNextFocusTodo).mockReturnValue(null);
		
		render(Page);
		
		// Test for the h2 heading that appears in empty state
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('No todos for today!');
		expect(screen.getByText('Add a new todo to get started.')).toBeInTheDocument();
	});
	
	// Test for proper rendering when a todo exists
	test('should render a todo when one exists', () => {
		// Mock getNextFocusTodo to return a sample todo that matches the Todo interface
		vi.mocked(todoStore.getNextFocusTodo).mockReturnValue({
			id: '1',
			title: 'Test Todo',
			details: 'This is a test todo',
			completed: false,
			nextCheckDate: new Date(),
			delayDays: 1000,
			priority: 3,
			createdAt: new Date()
		});
		
		render(Page);
		
		// The todo title should be rendered somewhere in the component
		expect(screen.getByText('Test Todo')).toBeInTheDocument();
	});
	
	// Test for the AddTodoButton component being rendered
	test('should render the add todo button', () => {
		vi.mocked(todoStore.getNextFocusTodo).mockReturnValue(null);
		
		render(Page);
		
		// The add button should have an accessible name
		expect(screen.getByRole('button', { name: 'Add new todo' })).toBeInTheDocument();
	});
});
