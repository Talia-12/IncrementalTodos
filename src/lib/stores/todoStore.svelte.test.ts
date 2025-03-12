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
}); 