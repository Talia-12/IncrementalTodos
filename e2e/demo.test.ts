import { expect, test } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

// Test the basic workflow of adding a todo and interacting with it
test('can add and interact with todos', async ({ page }) => {
	// Navigate to the home page
	await page.goto('/');
	
	// Click the add todo button
	await page.getByRole('button', { name: 'Add new todo' }).click();
	
	// Wait for the dialog to appear
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	
	// Fill in the todo details
	await page.getByLabel('Title').fill('E2E Test Todo');
	await page.getByLabel('Details').fill('This is a test todo created during E2E testing');
	await page.getByLabel('Priority').selectOption('3');
	
	// Submit the form
	await page.getByRole('button', { name: 'Add Todo' }).click();
	
	// Verify the todo appears on the page
	await expect(page.getByText('E2E Test Todo')).toBeVisible();
	await expect(page.getByText('This is a test todo created during E2E testing')).toBeVisible();
	
	// Test deferring the todo
	await page.getByRole('button', { name: '1 Day' }).click();
	
	// Test completing the todo
	await page.getByRole('button', { name: 'Complete' }).click();
	
	// Verify empty state appears after completing
	await expect(page.getByText('No todos for today!')).toBeVisible();
});

// Test the todo list page
test('can view todos in list view', async ({ page }) => {
	// Create a todo first
	await page.goto('/');
	await page.getByRole('button', { name: 'Add new todo' }).click();
	await page.getByLabel('Title').fill('List View Test Todo');
	await page.getByLabel('Priority').selectOption('5');
	await page.getByRole('button', { name: 'Add Todo' }).click();
	
	// Navigate to the list view
	await page.getByRole('link', { name: 'List' }).click();
	
	// Verify the todo appears in the list
	await expect(page.getByText('List View Test Todo')).toBeVisible();
	
	// Test the filter functionality
	await page.getByLabel('Filter todos').fill('List View');
	await expect(page.getByText('List View Test Todo')).toBeVisible();
	
	// Clear the filter
	await page.getByLabel('Filter todos').clear();
});
