<!-- 
  File: src/lib/components/Calendar.svelte
  Description: A reusable calendar component that provides a date picker with a popup calendar interface. Features include month navigation, date selection with min/max constraints, and keyboard accessibility.
  Related Files:
  - src/lib/components/AddTodoDialog.svelte
-->

<script lang="ts">
  import { onMount } from 'svelte';
  import { fade } from 'svelte/transition';
  
  // Props
  export let value: Date | null = null;
  export let min: Date | null = new Date(); // Default to current date
  export let max: Date | null = null;
  export let open = false;
  export let disabled = false;
  export let placeholder = "Select date...";
  export let format = "MMMM d, yyyy";
  export let onChange = (date: Date) => {};
  export let onOpen = () => {};
  export let onClose = () => {};
  
  // Internal state
  let currentMonth: Date;
  let selectedDate: Date | null = value;
  let inputElement: HTMLInputElement;
  let calendarElement: HTMLDivElement;
  
  // Initialize current month based on value or current date
  $: currentMonth = value ? new Date(value) : new Date();
  
  // Format date for display
  function formatDate(date: Date | null): string {
    if (!date) return '';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
  }
  
  // Get days in month
  function getDaysInMonth(year: number, month: number): number {
    return new Date(year, month + 1, 0).getDate();
  }
  
  // Get day of week (0-6) for first day of month
  function getFirstDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 1).getDay();
  }
  
  // Generate calendar days for current month view
  function generateCalendarDays(): { date: Date; isCurrentMonth: boolean; isToday: boolean; isSelected: boolean; isDisabled: boolean }[] {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    // Get days from previous month to fill first week
    const daysFromPrevMonth = firstDayOfMonth;
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const daysInPrevMonth = getDaysInMonth(prevMonthYear, prevMonth);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const days = [];
    
    // Add days from previous month
    for (let i = daysInPrevMonth - daysFromPrevMonth + 1; i <= daysInPrevMonth; i++) {
      const date = new Date(prevMonthYear, prevMonth, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date)
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date)
      });
    }
    
    // Add days from next month to complete the grid (6 rows x 7 days = 42 cells)
    const daysToAdd = 42 - days.length;
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= daysToAdd; i++) {
      const date = new Date(nextMonthYear, nextMonth, i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        isSelected: selectedDate ? date.getTime() === selectedDate.getTime() : false,
        isDisabled: isDateDisabled(date)
      });
    }
    
    return days;
  }
  
  // Check if date is disabled based on min/max constraints
  function isDateDisabled(date: Date): boolean {
    if (min && date < min) return true;
    if (max && date > max) return true;
    return false;
  }
  
  // Navigate to previous month
  function prevMonth(): void {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    if (month === 0) {
      currentMonth = new Date(year - 1, 11, 1);
    } else {
      currentMonth = new Date(year, month - 1, 1);
    }
  }
  
  // Navigate to next month
  function nextMonth(): void {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    if (month === 11) {
      currentMonth = new Date(year + 1, 0, 1);
    } else {
      currentMonth = new Date(year, month + 1, 1);
    }
  }
  
  // Select a date
  function selectDate(date: Date): void {
    if (isDateDisabled(date)) return;
    
    selectedDate = date;
    value = date;
    onChange(date);
    close();
  }
  
  // Toggle calendar visibility
  function toggleCalendar(): void {
    if (disabled) return;
    
    if (open) {
      close();
    } else {
      open = true;
      onOpen();
    }
  }
  
  // Close calendar
  function close(): void {
    open = false;
    onClose();
  }
  
  // Handle click outside to close calendar
  function handleClickOutside(event: MouseEvent): void {
    if (open && calendarElement && !calendarElement.contains(event.target as Node) && 
        inputElement && !inputElement.contains(event.target as Node)) {
      close();
    }
  }
  
  // Handle keyboard events for the calendar
  function handleKeydown(event: KeyboardEvent): void {
    if (!open) return;
    
    // Escape key to close calendar
    if (event.key === 'Escape') {
      close();
    }
  }
  
  // Set up event listeners
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeydown);
    
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<div class="calendar-container">
  <div class="calendar-input">
    <input
      type="text"
      bind:this={inputElement}
      value={selectedDate ? formatDate(selectedDate) : ''}
      placeholder={placeholder}
      readonly
      {disabled}
      on:click={toggleCalendar}
    />
    <button 
      type="button" 
      class="calendar-toggle" 
      on:click={toggleCalendar}
      {disabled}
      aria-label="Toggle calendar"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
        <line x1="16" y1="2" x2="16" y2="6"></line>
        <line x1="8" y1="2" x2="8" y2="6"></line>
        <line x1="3" y1="10" x2="21" y2="10"></line>
      </svg>
    </button>
  </div>
  
  {#if open}
    <div 
      class="calendar-popup" 
      bind:this={calendarElement}
      transition:fade={{ duration: 150 }}
    >
      <div class="calendar-header">
        <button type="button" class="nav-button" on:click={prevMonth} aria-label="Previous month">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <div class="current-month">
          {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <button type="button" class="nav-button" on:click={nextMonth} aria-label="Next month">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
      
      <div class="calendar-weekdays">
        <div class="weekday">Su</div>
        <div class="weekday">Mo</div>
        <div class="weekday">Tu</div>
        <div class="weekday">We</div>
        <div class="weekday">Th</div>
        <div class="weekday">Fr</div>
        <div class="weekday">Sa</div>
      </div>
      
      <div class="calendar-days">
        {#each generateCalendarDays() as { date, isCurrentMonth, isToday, isSelected, isDisabled }}
          <button
            type="button"
            class="day-button"
            class:other-month={!isCurrentMonth}
            class:today={isToday}
            class:selected={isSelected}
            class:disabled={isDisabled}
            on:click={() => selectDate(date)}
            disabled={isDisabled}
          >
            {date.getDate()}
          </button>
        {/each}
      </div>
      
      <div class="calendar-footer">
        <button type="button" class="today-button" on:click={() => selectDate(new Date())}>
          Today
        </button>
        <button type="button" class="close-button" on:click={close}>
          Close
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .calendar-container {
    position: relative;
    width: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  .calendar-input {
    position: relative;
    display: flex;
    align-items: center;
  }
  
  input {
    width: 100%;
    padding: 10px;
    padding-right: 40px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
  }
  
  input:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  
  .calendar-toggle {
    position: absolute;
    right: 10px;
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 0;
  }
  
  .calendar-toggle:disabled {
    color: #aaa;
    cursor: not-allowed;
  }
  
  .calendar-popup {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    z-index: 1000;
    width: 300px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 16px;
  }
  
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  .current-month {
    font-weight: 600;
    font-size: 16px;
  }
  
  .nav-button {
    background: none;
    border: none;
    color: #555;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
  }
  
  .nav-button:hover {
    background-color: #f5f5f5;
  }
  
  .calendar-weekdays {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    margin-bottom: 8px;
  }
  
  .weekday {
    text-align: center;
    font-size: 14px;
    font-weight: 500;
    color: #555;
    padding: 8px 0;
  }
  
  .calendar-days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 2px;
  }
  
  .day-button {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 36px;
    background: none;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .day-button:hover:not(.disabled) {
    background-color: #f5f5f5;
  }
  
  .other-month {
    color: #aaa;
  }
  
  .today {
    font-weight: bold;
    color: #4a90e2;
  }
  
  .selected {
    background-color: #4a90e2;
    color: white;
  }
  
  .selected:hover {
    background-color: #3a80d2;
  }
  
  .disabled {
    color: #ddd;
    cursor: not-allowed;
  }
  
  .calendar-footer {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #eee;
  }
  
  .today-button, .close-button {
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .today-button {
    background-color: #f1f1f1;
    border: 1px solid #ddd;
    color: #555;
  }
  
  .close-button {
    background-color: #4a90e2;
    border: 1px solid #3a80d2;
    color: white;
  }
  
  .today-button:hover {
    background-color: #e5e5e5;
  }
  
  .close-button:hover {
    background-color: #3a80d2;
  }
</style> 