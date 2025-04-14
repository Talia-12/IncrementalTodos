/**
 * Tests for the HippocampusService
 * 
 * These tests ensure that the HippocampusService interface functions correctly
 * and maintains its expected behavior regardless of the implementation.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { getHippocampusService, resetHippocampusService } from './hippocampusServiceFactory';
import type { TodoItemData, ReviewRating } from './types';
import { MockHippocampusService } from './mockHippocampusService';

describe('HippocampusService', () => {
  // Reset the service before each test
  beforeEach(() => {
    resetHippocampusService();
  });
  
  // Clean up after tests
  afterEach(() => {
    resetHippocampusService();
    vi.resetAllMocks();
  });
  
  // Test initialization
  test('should initialize with configuration', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    const config = { baseUrl: 'https://api.hippocampus.example.com' };
    
    // Act
    const response = await service.initialize(config);
    
    // Assert
    expect(response.success).toBe(true);
  });
  
  // Test initialization failure
  test('should handle initialization failure', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    service.shouldFailNext = true;
    const config = { baseUrl: 'https://api.hippocampus.example.com' };
    
    // Act
    const response = await service.initialize(config);
    
    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });
  
  // Test getting Todo item type
  test('should get or create Todo item type', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    // Act
    const response = await service.getTodoItemType();
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.name).toBe('Todo');
  });
  
  // Test creating a todo
  test('should create a todo item with associated card', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const response = await service.createTodo('Test Todo', todoData);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.item.title).toBe('Test Todo');
    expect(response.data?.item.item_data).toEqual(todoData);
    expect(response.data?.card.item_id).toBe(response.data?.item.id);
    expect(response.data?.card.suspended).toBe(false);
    
    // Verify count increased
    expect(service.todoItemsCount).toBe(1);
  });
  
  // Test creating a todo failure
  test('should handle todo creation failure', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    service.shouldFailNext = true;
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const response = await service.createTodo('Test Todo', todoData);
    
    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
    
    // Verify count did not increase
    expect(service.todoItemsCount).toBe(0);
  });
  
  // Test getting all todos
  test('should get all todos with their cards', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    // Create a couple of todos
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    await service.createTodo('Todo 1', todoData);
    await service.createTodo('Todo 2', todoData);
    
    // Act
    const response = await service.getAllTodos();
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.length).toBe(2);
    expect(response.data?.[0].item.title).toBe('Todo 1');
    expect(response.data?.[1].item.title).toBe('Todo 2');
  });
  
  // Test getting due todos
  test('should get only due todos', async () => {
    // Arrange - Create mock implementation where one todo is due and one is not
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create todos (by default they're due tomorrow in mock)
    const todo1 = await service.createTodo('Todo 1', todoData);
    const todo2 = await service.createTodo('Todo 2', todoData);
    
    // Get the cards and manually update one to be due now
    if (todo1.success && todo1.data) {
      const card = todo1.data.card;
      // Update to be due in the past
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      card.due_date = pastDate.toISOString();
    }
    
    // Act
    const response = await service.getDueTodos();
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.length).toBe(1);
    expect(response.data?.[0].item.title).toBe('Todo 1');
  });
  
  // Test completing a todo
  test('should complete a todo by suspending its card', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create a todo
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(true);
    
    const itemId = createResponse.data!.item.id;
    const cardId = createResponse.data!.card.id;
    
    // Act
    const completeResponse = await service.completeTodo(cardId);
    
    // Assert
    expect(completeResponse.success).toBe(true);
    expect(completeResponse.data).toBeNull();
    
    
    // Verify the todo no longer shows up in due todos
    const dueResponse = await service.getDueTodos();
    expect(dueResponse.data?.find(todo => todo.item.id === itemId)).toBeUndefined();
  });
  
  // Test completing a todo with an invalid card ID
  test('should fail when completing a todo with invalid card ID', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    // Act - Use invalid card ID
    const completeResponse = await service.completeTodo('invalid-card-id');
    
    // Assert
    expect(completeResponse.success).toBe(false);
    expect(completeResponse.error).toBeDefined();
  });
  
  // Test rescheduling a todo
  test('should reschedule a todo by creating a review', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create a todo
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(true);
    
    const cardId = createResponse.data!.card.id;
    
    // Act - Reschedule with "Hard" rating
    const rescheduleResponse = await service.rescheduleTodo(cardId, 2); // 2 = Hard
    
    // Assert
    expect(rescheduleResponse.success).toBe(true);
    expect(rescheduleResponse.data).toBeDefined();
    expect(rescheduleResponse.data?.card_id).toBe(cardId);
    expect(rescheduleResponse.data?.rating).toBe(2);
  });
  
  // Test rescheduling a todo with invalid rating
  test('should fail when rescheduling with invalid rating', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create a todo
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(true);
    
    const cardId = createResponse.data!.card.id;
    
    // Act - Use invalid rating
    const rescheduleResponse = await service.rescheduleTodo(cardId, 5); // Invalid rating
    
    // Assert
    expect(rescheduleResponse.success).toBe(false);
    expect(rescheduleResponse.error).toBeDefined();
  });
  
  // Test updating a todo
  test('should update a todo item', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create a todo
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(true);
    
    const itemId = createResponse.data!.item.id;
    
    // Updated data
    const updatedData: TodoItemData = {
      details: 'Updated details',
      priority: 4,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const updateResponse = await service.updateTodo(itemId, 'Updated Todo', updatedData);
    
    // Assert
    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data).toBeDefined();
    expect(updateResponse.data?.title).toBe('Updated Todo');
    expect(updateResponse.data?.item_data).toEqual(updatedData);
  });
  
  // Test getting a card for a todo
  test('should get the card associated with a todo', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    await service.initialize({ baseUrl: 'https://api.hippocampus.example.com' });
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create a todo
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(true);
    
    const itemId = createResponse.data!.item.id;
    const originalCard = createResponse.data!.card;
    
    // Act
    const cardResponse = await service.getCardForTodo(itemId);
    
    // Assert
    expect(cardResponse.success).toBe(true);
    expect(cardResponse.data).toBeDefined();
    expect(cardResponse.data?.id).toBe(originalCard.id);
    expect(cardResponse.data?.item_id).toBe(itemId);
  });
  
  // Test not initialized errors
  test('should require initialization before using methods', async () => {
    // Arrange
    const service = getHippocampusService(true) as MockHippocampusService;
    // Deliberately not initializing
    
    const todoData: TodoItemData = {
      details: 'Test details',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act & Assert - Methods should fail when not initialized
    const typeResponse = await service.getTodoItemType();
    expect(typeResponse.success).toBe(false);
    expect(typeResponse.error).toContain('not initialized');
    
    const createResponse = await service.createTodo('Test Todo', todoData);
    expect(createResponse.success).toBe(false);
    expect(createResponse.error).toContain('not initialized');
    
    const getAllResponse = await service.getAllTodos();
    expect(getAllResponse.success).toBe(false);
    expect(getAllResponse.error).toContain('not initialized');
  });
}); 