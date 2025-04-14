/*
  File: src/lib/components/TodoListItem.svelte.test.ts
  Description: Test suite for the TodoListItem component, which displays a single todo item in list view.
  Related Files:
  - src/lib/components/TodoListItem.svelte
  - src/lib/stores/todoStore.ts
*/

// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import TodoListItem from './TodoListItem.svelte';
import { todoStore, type Todo } from '../stores/todoStore';

// Mock the todoStore
vi.mock('../stores/todoStore', () => {
  return {
    todoStore: {
      updateTodo: vi.fn(),
      completeTodo: vi.fn(),
      deleteTodo: vi.fn()
    },
    // Include the Todo type to avoid type errors
    Todo: vi.fn()
  };
});

describe('TodoListItem.svelte', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Create a base todo for testing
  const createTestTodo = (overrides = {}): Todo => ({
    id: '123',
    itemId: '456',
    cardId: '789',
    title: 'Test Todo',
    details: 'Test details',
    createdAt: new Date(),
    priority: 0.5,
    completed: false,
    nextCheckDate: new Date(),
    delayDays: 0,
    ...overrides
  });

  // Test basic todo rendering
  test('should render a todo item with correct content', () => {
    // Arrange
    const testTodo = createTestTodo();

    // Act
    render(TodoListItem, { props: { todo: testTodo } });

    // Assert
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test details')).toBeInTheDocument();
  });

  // Test priority indicator rendering
  test('should render priority indicator with correct color', () => {
    // Arrange
    const testTodo = createTestTodo({ priority: 1 });

    // Act
    render(TodoListItem, { props: { todo: testTodo } });

    // Assert
    const priorityIndicator = document.querySelector('.priority-indicator');
    expect(priorityIndicator).toBeInTheDocument();
    // Check for the correct CSS custom property
    expect(priorityIndicator).toHaveAttribute('style', expect.stringContaining('--priority-color: var(--priority-1, #757575)'));
  });

  // Test completed todo styling
  test('should apply completed styling when todo is completed', () => {
    // Arrange
    const completedTodo = createTestTodo({
      title: 'Completed Todo',
      details: 'This is done',
      completed: true,
      completedAt: new Date()
    });

    // Act
    render(TodoListItem, { props: { todo: completedTodo } });

    // Assert
    const todoItem = document.querySelector('.todo-list-item');
    expect(todoItem).toHaveClass('completed');
    
    // Check that checkbox is checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  // Test toggling completion status - completing a todo
  test('should call completeTodo when checkbox is checked', async () => {
    // Arrange
    const testTodo = createTestTodo();
    render(TodoListItem, { props: { todo: testTodo } });
    
    // Act
    const checkbox = screen.getByRole('checkbox');
    await fireEvent.click(checkbox);
    
    // Assert
    expect(todoStore.completeTodo).toHaveBeenCalledWith('123');
    expect(todoStore.updateTodo).not.toHaveBeenCalled();
  });

  // Test toggling completion status - uncompleting a todo
  test('should call updateTodo when checkbox is unchecked', async () => {
    // Arrange
    const completedTodo = createTestTodo({
      title: 'Completed Todo',
      details: 'This is done',
      completed: true,
      completedAt: new Date()
    });
    render(TodoListItem, { props: { todo: completedTodo } });
    
    // Act
    const checkbox = screen.getByRole('checkbox');
    await fireEvent.click(checkbox);
    
    // Assert
    expect(todoStore.updateTodo).toHaveBeenCalledWith('123', { 
      completed: false, 
      completedAt: undefined 
    });
    expect(todoStore.completeTodo).not.toHaveBeenCalled();
  });

  // Test delete button functionality
  test('should call deleteTodo when delete button is clicked', async () => {
    // Arrange
    const completedTodo = createTestTodo({
      completed: true,
      completedAt: new Date()
    });
    render(TodoListItem, { props: { todo: completedTodo } });
    
    // Act
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await fireEvent.click(deleteButton);
    
    // Assert
    expect(todoStore.deleteTodo).toHaveBeenCalledWith('123');
  });

  // Test hover state for delete button
  test('should show different icon when delete button is hovered', async () => {
    // Arrange
    const completedTodo = createTestTodo({
      completed: true,
      completedAt: new Date()
    });
    render(TodoListItem, { props: { todo: completedTodo } });
    
    // Act
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    await fireEvent.mouseEnter(deleteButton);
    
    // Assert
    // Check if delete-hover class is applied to the todo item
    const todoItem = document.querySelector('.todo-list-item');
    expect(todoItem).toHaveClass('delete-hover');
  });

  // Test date formatting for completed todos
  test('should format completion date correctly for completed todos', () => {
    // Arrange
    const completionDate = new Date('2023-03-15T14:30:00');
    const testTodo = createTestTodo({
      completed: true,
      completedAt: completionDate
    });
    
    // Act
    render(TodoListItem, { props: { todo: testTodo } });
    
    // Assert
    // Check for the "Completed at" text followed by the time
    const completedText = screen.getByText(/Completed at/);
    expect(completedText).toBeInTheDocument();
    
    // The time format will depend on the locale, but we can check for parts of it
    // For US locale, it would be something like "2:30 PM"
    const timeRegex = /\d{1,2}:\d{2}/;
    expect(completedText.textContent).toMatch(timeRegex);
  });
}); 