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
      addTodo: vi.fn(),
    },
    Todo: vi.fn()
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
  test('should show error message when trying to submit without a title', async () => {
    // Arrange
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Submit form without title
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    expect(todoStore.addTodo).not.toHaveBeenCalled();
  });

  // Test successful todo creation
  test('should add todo with basic info when form is submitted correctly', async () => {
    // Arrange
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Fill form and submit
    const titleInput = screen.getByLabelText(/title/i);
    const detailsInput = screen.getByLabelText(/details/i);
    
    await fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    await fireEvent.change(detailsInput, { target: { value: 'Test Details' } });
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(todoStore.addTodo).toHaveBeenCalledTimes(1);
    expect(todoStore.addTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Todo',
        details: 'Test Details',
        priority: 5 // Default priority
      })
    );
  });

  // Test priority slider
  test('should set correct priority when priority slider is adjusted', async () => {
    // Arrange
    render(AddTodoDialog, { props: { open: true } });
    
    // Act - Fill form with a different priority
    const titleInput = screen.getByLabelText(/title/i);
    await fireEvent.change(titleInput, { target: { value: 'Priority Todo' } });
    
    const prioritySlider = screen.getByRole('slider');
    await fireEvent.change(prioritySlider, { target: { value: '9' } });
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(todoStore.addTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Priority Todo',
        priority: 9
      })
    );
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
    render(AddTodoDialog, { props: { open: true } });
    
    // Show advanced options first
    const advancedToggle = screen.getByRole('button', { name: /advanced options/i });
    await fireEvent.click(advancedToggle);
    
    // Act - Check recurring checkbox
    const recurringCheckbox = screen.getByLabelText(/recurring/i);
    await fireEvent.click(recurringCheckbox);
    
    // Assert recurring options are enabled
    expect(screen.getByLabelText(/period/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/interval/i)).toBeInTheDocument();
    
    // Verify recurring todo creation
    const titleInput = screen.getByLabelText(/title/i);
    await fireEvent.change(titleInput, { target: { value: 'Recurring Todo' } });
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    expect(todoStore.addTodo).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Recurring Todo',
        recurring: {
          period: 'daily', // Default
          interval: 1 // Default
        }
      })
    );
  });

  // Test form reset after submission
  test('should reset form after successful submission', async () => {
    // Arrange
    const mockOnClose = vi.fn();
    render(AddTodoDialog, { 
      props: { 
        open: true,
        onClose: mockOnClose
      } 
    });
    
    // Act - Fill and submit form
    const titleInput = screen.getByLabelText(/title/i);
    await fireEvent.change(titleInput, { target: { value: 'Test Todo' } });
    
    const submitButton = screen.getByRole('button', { name: /add todo/i });
    await fireEvent.click(submitButton);
    
    // Assert
    expect(todoStore.addTodo).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled(); // Dialog should close
    
    // If we reopen, form should be reset
    render(AddTodoDialog, { props: { open: true } });
    const newTitleInput = screen.getByLabelText(/title/i);
    expect(newTitleInput).toHaveValue(''); // Form should be reset
  });
}); 