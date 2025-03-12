/*
  File: src/lib/components/Calendar.svelte.test.ts
  Description: Test suite for the Calendar component, which provides a date picker with a popup calendar interface.
  Related Files:
  - src/lib/components/Calendar.svelte
  - src/lib/components/AddTodoDialog.svelte
*/

// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import Calendar from './Calendar.svelte';

describe('Calendar.svelte', () => {
  // Reset before each test
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = ''; // Clean up the DOM
    // Set a fixed date for testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-05-15'));
  });

  // Cleanup after tests
  afterEach(() => {
    vi.useRealTimers();
  });

  // Test basic rendering of the calendar input
  test('should render calendar input with placeholder', () => {
    // Arrange & Act
    render(Calendar, { props: { placeholder: 'Select date...' } });
    
    // Assert
    const input = screen.getByPlaceholderText('Select date...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'text');
  });

  // Test calendar popup visibility
  test('should not show calendar popup initially', () => {
    // Arrange & Act
    render(Calendar);
    
    // Assert
    const calendarPopup = document.querySelector('.calendar-popup');
    expect(calendarPopup).not.toBeVisible();
  });

  // Test calendar popup opens on input click
  test('should show calendar popup when input is clicked', async () => {
    // Arrange
    render(Calendar);
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Assert
    const calendarPopup = document.querySelector('.calendar-popup');
    expect(calendarPopup).toBeVisible();
  });

  // Test displaying the current month
  test('should display the current month when opened', async () => {
    // Arrange
    render(Calendar);
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Assert - Check for May 2023
    expect(screen.getByText('May 2023')).toBeInTheDocument();
    
    // Check for some days in May
    expect(screen.getByText('15')).toBeInTheDocument(); // Today
    expect(screen.getByText('1')).toBeInTheDocument(); // First day
    expect(screen.getByText('31')).toBeInTheDocument(); // Last day
  });

  // Test selecting a date
  test('should select a date when day is clicked', async () => {
    // Arrange
    const onChange = vi.fn();
    render(Calendar, { props: { onChange } });
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Click on day 20
    const day20 = screen.getByText('20');
    await fireEvent.click(day20);
    
    // Assert
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    
    // The selected date should be May 20, 2023
    const selectedDate = onChange.mock.calls[0][0];
    expect(selectedDate.getFullYear()).toBe(2023);
    expect(selectedDate.getMonth()).toBe(4); // 0-indexed, so 4 = May
    expect(selectedDate.getDate()).toBe(20);
    
    // Calendar should close after selection
    const calendarPopup = document.querySelector('.calendar-popup');
    expect(calendarPopup).not.toBeVisible();
  });

  // Test navigation between months
  test('should navigate to previous month when previous button is clicked', async () => {
    // Arrange
    render(Calendar);
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Initially shows May 2023
    expect(screen.getByText('May 2023')).toBeInTheDocument();
    
    // Click previous month button
    const prevButton = screen.getByRole('button', { name: /previous month/i });
    await fireEvent.click(prevButton);
    
    // Assert
    expect(screen.getByText('April 2023')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument(); // Last day of April
  });

  test('should navigate to next month when next button is clicked', async () => {
    // Arrange
    render(Calendar);
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Click next month button
    const nextButton = screen.getByRole('button', { name: /next month/i });
    await fireEvent.click(nextButton);
    
    // Assert
    expect(screen.getByText('June 2023')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument(); // Last day of June
  });

  // Test minimum date restriction
  test('should disable dates before minimum date', async () => {
    // Arrange - Set min date to May 10, 2023
    const minDate = new Date('2023-05-10');
    render(Calendar, { props: { min: minDate } });
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Assert
    // Days before May 10 should be disabled
    const day5 = screen.getByText('5');
    expect(day5.closest('.day')).toHaveClass('disabled');
    
    // Day 10 and after should be enabled
    const day10 = screen.getByText('10');
    expect(day10.closest('.day')).not.toHaveClass('disabled');
    
    const day15 = screen.getByText('15');
    expect(day15.closest('.day')).not.toHaveClass('disabled');
  });

  // Test maximum date restriction
  test('should disable dates after maximum date', async () => {
    // Arrange - Set max date to May 20, 2023
    const maxDate = new Date('2023-05-20');
    render(Calendar, { props: { max: maxDate } });
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Assert
    // Days after May 20 should be disabled
    const day25 = screen.getByText('25');
    expect(day25.closest('.day')).toHaveClass('disabled');
    
    // Day 20 and before should be enabled
    const day20 = screen.getByText('20');
    expect(day20.closest('.day')).not.toHaveClass('disabled');
    
    const day15 = screen.getByText('15');
    expect(day15.closest('.day')).not.toHaveClass('disabled');
  });

  // Test keyboard navigation
  test('should close calendar when escape key is pressed', async () => {
    // Arrange
    render(Calendar);
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Calendar should be visible
    const calendarPopup = document.querySelector('.calendar-popup');
    expect(calendarPopup).toBeVisible();
    
    // Press Escape key
    await fireEvent.keyDown(document.body, { key: 'Escape', code: 'Escape' });
    
    // Assert
    expect(calendarPopup).not.toBeVisible();
  });

  // Test formatting the selected date
  test('should format the selected date according to format prop', async () => {
    // Arrange
    render(Calendar, { 
      props: { 
        format: 'yyyy-MM-dd',
        value: new Date('2023-05-15')
      } 
    });
    
    // Assert
    const input = screen.getByRole('textbox');
    expect(input).toHaveValue('2023-05-15');
  });

  // Test the onChange callback
  test('should call onChange when date is selected', async () => {
    // Arrange
    const onChange = vi.fn();
    render(Calendar, { props: { onChange } });
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Select day 10
    const day10 = screen.getByText('10');
    await fireEvent.click(day10);
    
    // Assert
    expect(onChange).toHaveBeenCalledTimes(1);
    const selectedDate = onChange.mock.calls[0][0];
    expect(selectedDate.getDate()).toBe(10);
  });

  // Test the onOpen callback
  test('should call onOpen when calendar is opened', async () => {
    // Arrange
    const onOpen = vi.fn();
    render(Calendar, { props: { onOpen } });
    
    // Act
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Assert
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  // Test the onClose callback
  test('should call onClose when calendar is closed', async () => {
    // Arrange
    const onClose = vi.fn();
    render(Calendar, { props: { onClose } });
    
    // Act - Open and then close
    const input = screen.getByRole('textbox');
    await fireEvent.click(input);
    
    // Click outside to close
    await fireEvent.mouseDown(document.body);
    
    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  // Test disabled state
  test('should not open calendar when disabled', async () => {
    // Arrange
    render(Calendar, { props: { disabled: true } });
    
    // Act
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    
    await fireEvent.click(input);
    
    // Assert
    const calendarPopup = document.querySelector('.calendar-popup');
    expect(calendarPopup).not.toBeVisible();
  });
}); 