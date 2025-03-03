/*
  File: src/routes/page.svelte.test.ts
  Description: Test suite for the main page component, using Vitest and Testing Library for Svelte component testing.
  Related Files:
  - src/routes/+page.svelte
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/AddTodoButton.svelte
*/

import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render h1', () => {
		render(Page);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
