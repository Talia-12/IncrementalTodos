/*
  File: src/lib/stores/todoStore.svelte.test.ts
  Description: Test suite for the todoStore which manages the application's todo items.
  Related Files:
  - src/lib/stores/todoStore.ts
*/

// @vitest-environment jsdom
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { todoStore, todaysTodos, completedToday, getNextFocusTodo, type Todo } from './todoStore';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

// Setup global mocks
beforeEach(() => {
  // Set up global localStorage before each test
  vi.stubGlobal('localStorage', localStorageMock);
  
  // Mock the browser environment
  vi.mock('$app/environment', async (importOriginal) => {
    return {
      browser: true
    };
  });
  
  // Mock the randomUUID function
  vi.stubGlobal('crypto', {
    randomUUID: vi.fn(() => '123e4567-e89b-12d3-a456-426614174000'),
  });
});

describe('todoStore', () => {
  const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
  
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorageMock.clear();
    vi.clearAllMocks();
    
    // Reset the store with an empty array
    // This is a workaround since we can't directly access the set function
    const todos = get(todoStore);
    todos.forEach(todo => {
      todoStore.deleteTodo(todo.id);
    });
  });
  
  // Test adding a todo
  test('addTodo should create a new todo with correct properties', () => {
    // Arrange
    const newTodoData = {
      title: 'Test Todo',
      details: 'This is a test',
      priority: 3
    };
    
    // Act
    todoStore.addTodo(newTodoData);
    
    // Assert
    const todos = get(todoStore);
    expect(todos.length).toBe(1);
    expect(todos[0].id).toBe(mockUUID);
    expect(todos[0].title).toBe('Test Todo');
    expect(todos[0].details).toBe('This is a test');
    expect(todos[0].completed).toBe(false);
    expect(todos[0].priority).toBe(3);
    expect(todos[0].delayDays).toBe(1000);
    expect(todos[0].nextCheckDate).toBeInstanceOf(Date);
    expect(todos[0].createdAt).toBeInstanceOf(Date);
    
    // Verify localStorage was called
    expect(localStorageMock.setItem).toHaveBeenCalledWith('todos', expect.any(String));
  });
  
  // Test completing a todo
  test('completeTodo should mark a todo as completed', () => {
    // Arrange
    todoStore.addTodo({ title: 'Test Todo', priority: 3 });
    const todos = get(todoStore);
    const todoId = todos[0].id;
    
    // Act
    todoStore.completeTodo(todoId);
    
    // Assert
    const updatedTodos = get(todoStore);
    expect(updatedTodos[0].completed).toBe(true);
    expect(updatedTodos[0].completedAt).toBeInstanceOf(Date);
  });
  
  // Test deleting a todo
  test('deleteTodo should remove a todo from the store', () => {
    // Arrange
    todoStore.addTodo({ title: 'Test Todo', priority: 3 });
    const todos = get(todoStore);
    const todoId = todos[0].id;
    
    // Act
    todoStore.deleteTodo(todoId);
    
    // Assert
    const updatedTodos = get(todoStore);
    expect(updatedTodos.length).toBe(0);
  });
  
  // Test deferring a todo
  test('deferTodo should update the nextCheckDate and delayDays', () => {
    // Arrange
    todoStore.addTodo({ title: 'Test Todo', priority: 3 });
    const todos = get(todoStore);
    const todoId = todos[0].id;
    const originalNextCheckDate = new Date(todos[0].nextCheckDate);
    const originalDelayDays = todos[0].delayDays;
    
    // Act - Defer by 7 days with a multiplier of 1.5
    todoStore.deferTodo(todoId, 7, 1.5);
    
    // Assert
    const updatedTodos = get(todoStore);
    const expectedDate = new Date(originalNextCheckDate);
    expectedDate.setDate(expectedDate.getDate() + 7);
    
    expect(updatedTodos[0].nextCheckDate.getDate()).toBe(expectedDate.getDate());
    expect(updatedTodos[0].delayDays).toBe(originalDelayDays * 1.5);
  });
  
  // Test updating a todo
  test('updateTodo should update the specified properties', () => {
    // Arrange
    todoStore.addTodo({ title: 'Test Todo', priority: 3 });
    const todos = get(todoStore);
    const todoId = todos[0].id;
    
    // Act
    todoStore.updateTodo(todoId, { 
      title: 'Updated Title', 
      details: 'Updated details',
      priority: 5
    });
    
    // Assert
    const updatedTodos = get(todoStore);
    expect(updatedTodos[0].title).toBe('Updated Title');
    expect(updatedTodos[0].details).toBe('Updated details');
    expect(updatedTodos[0].priority).toBe(5);
  });
});

describe('derived stores', () => {
  // Basic tests for derived stores existence
  test('todaysTodos is a derived store with subscribe method', () => {
    expect(todaysTodos).toBeDefined();
    expect(todaysTodos.subscribe).toBeInstanceOf(Function);
  });
  
  test('completedToday is a derived store with subscribe method', () => {
    expect(completedToday).toBeDefined();
    expect(completedToday.subscribe).toBeInstanceOf(Function);
  });

  test('getNextFocusTodo function should be defined', () => {
    expect(getNextFocusTodo).toBeDefined();
    expect(getNextFocusTodo).toBeInstanceOf(Function);
  });
  
  // Add proper tests for todaysTodos filtering logic
  test('todaysTodos should only include non-completed todos due today or earlier', () => {
    // Reset store
    const todos = get(todoStore);
    todos.forEach(todo => {
      todoStore.deleteTodo(todo.id);
    });
    
    // Create test date utility
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Add sample todos
    // 1. Todo due yesterday (should be included)
    todoStore.addTodo({ title: 'Yesterday Todo', priority: 3 });
    const yesterdayTodoId = get(todoStore)[0].id;
    todoStore.updateTodo(yesterdayTodoId, { nextCheckDate: yesterday });
    
    // 2. Todo due today (should be included)
    todoStore.addTodo({ title: 'Today Todo', priority: 3 });
    const todayTodoId = get(todoStore)[1].id;
    todoStore.updateTodo(todayTodoId, { nextCheckDate: today });
    
    // 3. Todo due tomorrow (should NOT be included)
    todoStore.addTodo({ title: 'Tomorrow Todo', priority: 3 });
    const tomorrowTodoId = get(todoStore)[2].id;
    todoStore.updateTodo(tomorrowTodoId, { nextCheckDate: tomorrow });
    
    // 4. Completed todo due today (should NOT be included)
    todoStore.addTodo({ title: 'Completed Todo', priority: 3 });
    const completedTodoId = get(todoStore)[3].id;
    todoStore.updateTodo(completedTodoId, { nextCheckDate: today });
    todoStore.completeTodo(completedTodoId);
    
    // Check todaysTodos
    const filtered = get(todaysTodos);
    expect(filtered.length).toBe(2);
    expect(filtered.find(t => t.title === 'Yesterday Todo')).toBeDefined();
    expect(filtered.find(t => t.title === 'Today Todo')).toBeDefined();
    expect(filtered.find(t => t.title === 'Tomorrow Todo')).toBeUndefined();
    expect(filtered.find(t => t.title === 'Completed Todo')).toBeUndefined();
  });
  
  // Add proper tests for completedToday filtering logic
  test('completedToday should only include todos completed today', () => {
    // Reset store
    const todos = get(todoStore);
    todos.forEach(todo => {
      todoStore.deleteTodo(todo.id);
    });
    
    // Create test date utility
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Setup: create a few todos and complete them at different times
    
    // 1. Todo completed today
    todoStore.addTodo({ title: 'Completed Today', priority: 3 });
    const todayCompletedId = get(todoStore)[0].id;
    todoStore.completeTodo(todayCompletedId);
    
    // Mock completedAt date for yesterday (via direct update)
    // 2. Todo completed yesterday
    todoStore.addTodo({ title: 'Completed Yesterday', priority: 3 });
    const yesterdayCompletedId = get(todoStore)[1].id;
    todoStore.completeTodo(yesterdayCompletedId);
    todoStore.updateTodo(yesterdayCompletedId, { completedAt: yesterday });
    
    // 3. Uncompleted todo
    todoStore.addTodo({ title: 'Not Completed', priority: 3 });
    
    // Check completedToday
    const filtered = get(completedToday);
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Completed Today');
  });
  
  // Add proper test for getNextFocusTodo function
  test('getNextFocusTodo should return the earliest due todo', () => {
    // Reset store
    const todos = get(todoStore);
    todos.forEach(todo => {
      todoStore.deleteTodo(todo.id);
    });
    
    // Create test dates with different times
    const now = new Date();
    
    const earliestDate = new Date(now);
    earliestDate.setHours(now.getHours() - 2);
    
    const middleDate = new Date(now);
    middleDate.setHours(now.getHours() - 1);
    
    const latestDate = new Date(now);
    latestDate.setHours(now.getHours() + 1);
    
    // Add todos in reverse order of due dates
    todoStore.addTodo({ title: 'Latest Todo', priority: 5 });
    const latestId = get(todoStore)[0].id;
    todoStore.updateTodo(latestId, { nextCheckDate: latestDate });
    
    todoStore.addTodo({ title: 'Middle Todo', priority: 3 });
    const middleId = get(todoStore)[1].id;
    todoStore.updateTodo(middleId, { nextCheckDate: middleDate });
    
    todoStore.addTodo({ title: 'Earliest Todo', priority: 1 });
    const earliestId = get(todoStore)[2].id;
    todoStore.updateTodo(earliestId, { nextCheckDate: earliestDate });
    
    // Check getNextFocusTodo returns the earliest todo regardless of priority or creation order
    const nextTodo = getNextFocusTodo();
    expect(nextTodo).not.toBeNull();
    expect(nextTodo?.title).toBe('Earliest Todo');
    
    // Complete the earliest todo and verify the middle one becomes next
    todoStore.completeTodo(earliestId);
    const newNextTodo = getNextFocusTodo();
    expect(newNextTodo).not.toBeNull();
    expect(newNextTodo?.title).toBe('Middle Todo');
  });
  
  test('getNextFocusTodo should return null when no todos are due', () => {
    // Reset store
    const todos = get(todoStore);
    todos.forEach(todo => {
      todoStore.deleteTodo(todo.id);
    });
    
    // Add a todo due tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    todoStore.addTodo({ title: 'Future Todo', priority: 3 });
    const futureId = get(todoStore)[0].id;
    todoStore.updateTodo(futureId, { nextCheckDate: tomorrow });
    
    // Check getNextFocusTodo returns null since no todos are due today
    const nextTodo = getNextFocusTodo();
    expect(nextTodo).toBeNull();
  });
}); 