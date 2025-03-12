/*
  File: src/lib/components/AddTodoButton.svelte.test.ts
  Description: Test suite for the AddTodoButton component, which allows users to add a new todo.
  Related Files:
  - src/lib/components/AddTodoButton.svelte
  - src/routes/+page.svelte
*/

// @vitest-environment jsdom
import { describe, test, expect, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AddTodoButton from './AddTodoButton.svelte';

describe('AddTodoButton.svelte', () => {
  // Test that the button renders properly
  test('should render with the correct aria-label', () => {
    // Arrange & Act
    render(AddTodoButton);
    
    // Assert
    const button = screen.getByRole('button', { name: 'Add new todo' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Add new todo');
  });
  
  // Test that the button has the correct CSS class
  test('should have the correct CSS class', () => {
    // Arrange & Act
    render(AddTodoButton);
    
    // Assert
    const button = screen.getByRole('button');
    expect(button).toHaveClass('add-todo-button');
  });
  
  // Test that the button contains the plus icon
  test('should display the plus icon', () => {
    // Arrange & Act
    render(AddTodoButton);
    
    // Assert - Look for SVG elements
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    
    // Check for the two lines that make the plus sign
    const lines = document.querySelectorAll('line');
    expect(lines.length).toBe(2);
  });
  
  // Test that the button dispatches a custom event when clicked
  test('should dispatch custom event when clicked', async () => {
    // Arrange
    render(AddTodoButton);
    const dispatchEventSpy = vi.spyOn(window, 'dispatchEvent');
    
    // Act
    const button = screen.getByRole('button', { name: 'Add new todo' });
    await fireEvent.click(button);
    
    // Assert
    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    expect(dispatchEventSpy.mock.calls[0][0].type).toBe('open-add-todo-dialog');
  });
  
  // Test that the provided onOpenDialog callback is called when clicked
  test('should call provided onOpenDialog prop when clicked', async () => {
    // Arrange
    const mockCallback = vi.fn();
    render(AddTodoButton, { props: { onOpenDialog: mockCallback } });
    
    // Act
    const button = screen.getByRole('button', { name: 'Add new todo' });
    await fireEvent.click(button);
    
    // Assert
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
}); 