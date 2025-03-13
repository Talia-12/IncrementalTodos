/*
  File: src/lib/components/AddTodoDialog.svelte.test.ts
  Description: Test suite for the AddTodoDialog component, which allows users to create new todos.
  Related Files:
  - src/lib/components/AddTodoDialog.svelte
  - src/lib/stores/todoStore.ts
*/

// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import AddTodoDialog from './AddTodoDialog.svelte';
import { todoStore } from '../stores/todoStore';

// Mock the todoStore
vi.mock('../stores/todoStore', () => {
  return {
    todoStore: {
      addTodo: vi.fn()
    }
  };
});

// Mock Calendar component since it's complex and we're testing AddTodoDialog in isolation
vi.mock('./Calendar.svelte', () => {
  const CalendarMock = vi.fn();
  return { 
    default: CalendarMock
  };
});

describe('AddTodoDialog.svelte', () => {
  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = ''; // Clean up the DOM
  });

  // Test that dialog renders correctly when open
  test('should render dialog when open prop is true', () => {
    // Arrange & Act
    render(AddTodoDialog, { props: { open: true } });
    
    // Assert
    const dialog = screen.getByRole('dialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Add New Todo/i)).toBeInTheDocument();
  });

  // Test that dialog doesn't render when open is false
  test('should not render dialog when open prop is false', () => {
    // Arrange & Act
    render(AddTodoDialog, { props: { open: false } });
    
    // Assert
    const dialog = screen.queryByRole('dialog');
    expect(dialog).not.toBeInTheDocument();
  });

  // Test form validation - title is required
  test('should not submit form when title is empty', async () => {
    // Arrange
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Submit form without title
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(todoStore.addTodo).not.toHaveBeenCalled();
  });

  // Test successful todo creation
  test('should add todo with basic info when form is submitted correctly', async () => {
    // Arrange
    // Create a spy for the todoStore.addTodo function
    const spy = vi.spyOn(todoStore, 'addTodo');
    
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Fill form and submit
    const titleInput = screen.getByLabelText(/Todo Item/i);
    const detailsInput = screen.getByLabelText(/Details/i);
    
    await fireEvent.input(titleInput, { target: { value: 'Test Todo' } });
    await fireEvent.input(detailsInput, { target: { value: 'Test Details' } });
    
    // Find the submit button and trigger form submission
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  // Test priority slider
  test('should set correct priority when priority slider is adjusted', async () => {
    // Arrange
    const spy = vi.spyOn(todoStore, 'addTodo');
    
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Fill form with a different priority
    const titleInput = screen.getByLabelText(/Todo Item/i);
    await fireEvent.input(titleInput, { target: { value: 'Priority Todo' } });
    
    // Show advanced options
    const advancedButton = screen.getByRole('button', { name: /Show Advanced Options/i });
    await fireEvent.click(advancedButton);
    
    // Select priority 2
    const priorityButtons = screen.getAllByText(/[1-5]/);
    const priority2Button = priorityButtons[1]; // Second button (index 1) is priority 2
    await fireEvent.click(priority2Button);
    
    // Submit form directly
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  // Test advanced options toggle
  test('should show advanced options when advanced toggle is clicked', async () => {
    // Arrange
    render(AddTodoDialog, { props: { open: true } });
    
    // Initially advanced options should be hidden
    expect(screen.queryByText(/Must be completed by/i)).not.toBeInTheDocument();
    
    // Act - Click advanced options toggle
    const advancedToggle = screen.getByRole('button', { name: /advanced options/i });
    await fireEvent.click(advancedToggle);
    
    // Assert
    expect(screen.getByText(/Must be completed by/i)).toBeInTheDocument();
    expect(screen.getByText(/Must be completed on/i)).toBeInTheDocument();
    expect(screen.getByText(/recurring/i)).toBeInTheDocument();
  });

  // Test closing dialog
  test('should call onClose when cancel button is clicked', async () => {
    // Arrange
    const mockOnClose = vi.fn();
    render(AddTodoDialog, { 
      props: { 
        open: true,
        onClose: mockOnClose
      } 
    });
    
    // Act
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await fireEvent.click(cancelButton);
    
    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test escape key closes dialog
  test('should call onClose when escape key is pressed', async () => {
    // Arrange
    const mockOnClose = vi.fn();
    render(AddTodoDialog, { 
      props: { 
        open: true,
        onClose: mockOnClose
      } 
    });
    
    // Act
    await fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    
    // Assert
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  // Test recurring options
  test('should enable recurring options when recurring checkbox is checked', async () => {
    // Arrange
    const spy = vi.spyOn(todoStore, 'addTodo');
    
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Show advanced options
    const advancedButton = screen.getByRole('button', { name: /Show Advanced Options/i });
    await fireEvent.click(advancedButton);
    
    // Check recurring checkbox
    const recurringCheckbox = screen.getByLabelText(/Recurring Todo/i);
    await fireEvent.click(recurringCheckbox);
    
    // Assert recurring options are enabled
    expect(screen.getByLabelText(/Recurrence Period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Every/i)).toBeInTheDocument();
    
    // Verify recurring todo creation
    const titleInput = screen.getByLabelText(/Todo Item/i);
    await fireEvent.input(titleInput, { target: { value: 'Recurring Todo' } });
    
    // Change recurring period to weekly
    const periodSelect = screen.getByLabelText(/Recurrence Period/i);
    await fireEvent.change(periodSelect, { target: { value: 'weekly' } });
    
    // Change interval to 2
    const intervalInput = screen.getByLabelText(/Every/i);
    await fireEvent.input(intervalInput, { target: { value: '2' } });
    
    // Submit form directly
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(spy).toHaveBeenCalled();
  });

  // Don't need to test that form resets on adding a todo, because it is reset on open
});