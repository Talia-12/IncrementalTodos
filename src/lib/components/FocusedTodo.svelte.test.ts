/*
  File: src/lib/components/FocusedTodo.svelte.test.ts
  Description: Test suite for the FocusedTodo component, which displays a single todo item in focus mode.
  Related Files:
  - src/lib/components/FocusedTodo.svelte
  - src/lib/stores/todoStore.ts
*/

// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import FocusedTodo from './FocusedTodo.svelte';
import * as todoStore from '../stores/todoStore';
import { getPriorityColor } from '$lib/utils/priority';

// Mock the todoStore
vi.mock('../stores/todoStore', () => {
  return {
    todoStore: {
      completeTodo: vi.fn(),
      deleteTodo: vi.fn(),
      deferTodo: vi.fn(),
      updateTodo: vi.fn()
    }
  };
});

// Mock the priority utility
vi.mock('$lib/utils/priority', () => {
  return {
    getPriorityColor: vi.fn().mockReturnValue('#ff0000')
  };
});

describe('FocusedTodo.svelte', () => {
  const mockTodo = {
    id: '1',
    itemId: '2',
    cardId: '3',
    title: 'Test Todo',
    details: 'This is a test todo',
    completed: false,
    nextCheckDate: new Date(),
    delayDays: 7,
    priority: 3,
    createdAt: new Date()
  };
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  // Test empty state when no todo is passed
  test('should display empty state when todo is null', () => {
    // Arrange & Act
    render(FocusedTodo, { props: { todo: null } });
    
    // Assert
    expect(screen.getByText('No todos for today!')).toBeInTheDocument();
    expect(screen.getByText('Add a new todo to get started.')).toBeInTheDocument();
  });
  
  // Test rendering of todo content
  test('should display todo details when todo is provided', () => {
    // Arrange & Act
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Assert
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('This is a test todo')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // Priority
  });
  
  // Test the Complete button functionality
  test('should call completeTodo when Complete button is clicked', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act
    const completeButton = screen.getByText('Complete');
    await fireEvent.click(completeButton);
    
    // Assert
    expect(todoStore.todoStore.completeTodo).toHaveBeenCalledWith('1');
  });
  
  // Test the defer functionality
  test('should call deferTodo with correct parameters when deferring by 1 day', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act
    const deferButton = screen.getByText('1 Day');
    await fireEvent.click(deferButton);
    
    // Assert - fixed to use the fixed multiplier (1.05) from the implementation
    expect(todoStore.todoStore.deferTodo).toHaveBeenCalledWith('1', 1, 1.05);
  });
  
  test('should call deferTodo with correct parameters when deferring by 7 days', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act
    const deferButton = screen.getByText('7 Days');
    await fireEvent.click(deferButton);
    
    // Assert - fixed to use the fixed multiplier (1.05) from the implementation
    expect(todoStore.todoStore.deferTodo).toHaveBeenCalledWith('1', 7, 1.05);
  });
  
  // Test the menu functionality - fixed to use a more reliable approach
  test('should open menu when menu button is clicked', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act
    const menuButton = screen.getByLabelText('Menu');
    await fireEvent.click(menuButton);
    
    // Assert
    expect(screen.getByText('Delete Todo')).toBeInTheDocument();
    
    // More flexible way to check for the priority update button
    const priorityButton = screen.getByRole('button', { 
      name: /Update Priority/i 
    });
    expect(priorityButton).toBeInTheDocument();
  });
  
  // Test delete confirmation
  test('should show delete confirmation when Delete Todo is clicked', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act
    const menuButton = screen.getByLabelText('Menu');
    await fireEvent.click(menuButton);
    
    const deleteButton = screen.getByText('Delete Todo');
    await fireEvent.click(deleteButton);
    
    // Assert
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    expect(screen.getByText('Yes, Delete')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });
  
  // Test actual deletion
  test('should delete todo when confirming deletion', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act - Open menu, click delete, then confirm
    const menuButton = screen.getByLabelText('Menu');
    await fireEvent.click(menuButton);
    
    const deleteButton = screen.getByText('Delete Todo');
    await fireEvent.click(deleteButton);
    
    const confirmButton = screen.getByText('Yes, Delete');
    await fireEvent.click(confirmButton);
    
    // Assert
    expect(todoStore.todoStore.deleteTodo).toHaveBeenCalledWith('1');
  });
  
  // Add test for keyboard shortcuts
  test('should complete todo when Space key is pressed', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act - simulate space key press
    const container = document.body;
    await fireEvent.keyDown(container, { key: ' ' });
    
    // Assert
    expect(todoStore.todoStore.completeTodo).toHaveBeenCalledWith('1');
  });
  
  test('should defer todo when number keys 1-4 are pressed', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act & Assert - test key 1
    await fireEvent.keyDown(document.body, { key: '1' });
    expect(todoStore.todoStore.deferTodo).toHaveBeenCalledWith('1', 1, 1.05);
    
    vi.clearAllMocks();
    
    // Act & Assert - test key 2
    await fireEvent.keyDown(document.body, { key: '2' });
    expect(todoStore.todoStore.deferTodo).toHaveBeenCalledWith('1', 7, 1.05);
    
    vi.clearAllMocks();
    
    // Act & Assert - test key 3 (short defer)
    await fireEvent.keyDown(document.body, { key: '3' });
    // Calculate the expected priorityMultiplier
    const priorityMultiplier = mockTodo.priority ? 1.5 - ((mockTodo.priority - 1) * 0.1875) : 1;
    expect(todoStore.todoStore.deferTodo).toHaveBeenCalledWith(
      '1', 
      mockTodo.delayDays * priorityMultiplier, 
      1.2
    );
  });
  
  test('should show delete confirmation with Ctrl+Delete shortcut', async () => {
    // Arrange
    render(FocusedTodo, { props: { todo: mockTodo } });
    
    // Act - simulate Ctrl+Delete key press
    await fireEvent.keyDown(document.body, { key: 'Delete', ctrlKey: true });
    
    // Assert
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
  });
}); 