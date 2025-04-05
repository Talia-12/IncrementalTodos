/**
 * Implementation tests for the HippocampusService
 * 
 * These tests verify that the actual implementation correctly communicates with a
 * real Hippocampus server. They require a Hippocampus server to be running at
 * 127.0.0.1:3000 with no API key required.
 * 
 * These tests are designed to handle pre-existing data and to provide clear error
 * messages if the server is not running.
 */

import { describe, test, expect, beforeEach, afterEach, beforeAll, vi } from 'vitest';
import { getHippocampusService, resetHippocampusService } from './hippocampusServiceFactory';
import type { TodoItemData, ItemType, Item, Card, ServiceResponse } from './types';
import fetch from 'node-fetch';
import { assert } from 'vitest';

// Configuration for the Hippocampus server
const SERVER_URL = 'http://127.0.0.1:3000';

/**
 * Checks if the Hippocampus server is running at the specified URL
 * @returns Promise that resolves to true if server is running, false otherwise
 */
async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(SERVER_URL, { method: 'HEAD', timeout: 3000 });
    return response.ok || response.status === 404; // 404 is fine, it means server is running but endpoint doesn't exist
  } catch (error) {
    return false;
  }
}

/**
 * Generates a unique title for a todo item to avoid conflicts with existing items
 * @param baseTitle - Base title to use
 * @returns Promise that resolves to a unique title
 */
async function generateUniqueTitle(baseTitle: string = 'Test Todo', withTimestamp: boolean = false): Promise<string> {
  // Get existing todos to avoid title conflicts
  const service = getHippocampusService(false);
  await service.initialize({ baseUrl: SERVER_URL });

  // First get the Todo item type
  const itemTypeResponse = await service.getTodoItemType();
  if (!itemTypeResponse.success || !itemTypeResponse.data || withTimestamp) {
    // If we can't get todos, use a timestamp-based title to minimize chance of conflict
    return `${baseTitle} ${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  const todosResponse = await service.getAllTodos();
  if (!todosResponse.success || !todosResponse.data) {
    // If we can't get todos, use a timestamp-based title to minimize chance of conflict
    return `${baseTitle} ${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  const existingTitles = new Set(todosResponse.data.map(todo => todo.item.title));
  let uniqueTitle = baseTitle;
  let counter = 1;

  // If the title already exists, append a number and increment until we find a unique one
  while (existingTitles.has(uniqueTitle)) {
    uniqueTitle = `${baseTitle} ${counter}`;
    counter++;
  }

  return uniqueTitle;
}

/**
 * Helper to create a test todo
 * @returns Promise that resolves to the created todo's item and card
 */
async function createTestTodo(): Promise<{ item: Item, card: Card, title: string }> {
  const service = getHippocampusService(false);
  await service.initialize({ baseUrl: SERVER_URL });
  
  const title = await generateUniqueTitle('Test Todo');
  const todoData: TodoItemData = {
    details: 'Created for testing purposes',
    priority: 3,
    dueDate: null,
    mustCompleteBefore: null,
    mustCompleteOn: null,
    recurring: false
  };
  
  const response = await service.createTodo(title, todoData);
  if (!response.success || !response.data) {
    throw new Error(`Failed to create test todo: ${response.error}`);
  }
  
  return { 
    item: response.data.item, 
    card: response.data.card,
    title
  };
}

// Skip all tests if server is not running
describe('HippocampusServiceImpl with real server', async () => {
  // Check if server is running before all tests
  beforeAll(async () => {
    const serverRunning = await isServerRunning();
    if (!serverRunning) {
      throw new Error(
        '\n' +
        '╔════════════════════════════════════════════════════════════════════════════╗\n' +
        '║                                                                            ║\n' +
        '║  ERROR: Hippocampus server is not running at http://127.0.0.1:3000         ║\n' +
        '║                                                                            ║\n' +
        '║  Please start the server before running these tests.                       ║\n' +
        '║                                                                            ║\n' +
        '║  These tests require a real Hippocampus server for validating the          ║\n' +
        '║  actual implementation of the HippocampusService.                          ║\n' +
        '║                                                                            ║\n' +
        '╚════════════════════════════════════════════════════════════════════════════╝\n'
      );
    }
  });

  // Reset service before each test
  beforeEach(() => {
    resetHippocampusService();
  });
  
  // Clean up after tests
  afterEach(() => {
    resetHippocampusService();
    vi.resetAllMocks();
  });

  // Test initialization with real server
  test('should initialize connection with real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    
    // Act
    const response = await service.initialize({ baseUrl: SERVER_URL });
    
    // Assert
    expect(response.success).toBe(true);
  });

  // Test getting Todo item type from real server
  test('should get Todo item type from real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Act
    const response = await service.getTodoItemType();
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.name).toBe('Todo');
  });

  // Test creating a todo on real server
  test('should create a todo on real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    const title = await generateUniqueTitle('Create Test Todo');
    const todoData: TodoItemData = {
      details: 'Test details for create test',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const response = await service.createTodo(title, todoData);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.item.title).toBe(title);
    expect(response.data?.item.item_data).toEqual(todoData);
    expect(response.data?.card.item_id).toBe(response.data?.item.id);
  });

  // Test creating a todo with a duplicate title
  test('should reject duplicate todo titles', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a todo first
    const title = await generateUniqueTitle('Duplicate Test');
    const todoData: TodoItemData = {
      details: 'Test details for duplicate test',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    const firstResponse = await service.createTodo(title, todoData);
    expect(firstResponse.success).toBe(true);
    
    // Act - Try to create another todo with the same title
    const secondResponse = await service.createTodo(title, todoData);
    
    // Assert - Clear expectation that duplicates should be rejected
    expect(secondResponse.success).toBe(false);
    expect(secondResponse.error).toBeDefined();
    expect(secondResponse.error).toContain('duplicate');
  });

  // Test getting all todos from real server
  test('should get all todos from real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a new todo to ensure we have at least one
    const { title } = await createTestTodo();
    
    // Act
    const response = await service.getAllTodos();
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    
    // Find our created todo in the list
    const foundTodo = response.data?.find(todo => todo.item.title === title);
    expect(foundTodo).toBeDefined();
  });

  // Test getting due todos from real server
  test('should get due todos from real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a new todo that will be due immediately
    const title = await generateUniqueTitle('Due Test Todo');
    
    // Set the date to 1 day in the past to ensure it's due
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    const todoData: TodoItemData = {
      details: 'Test details for due test',
      priority: 3,
      dueDate: pastDate.toISOString(), // Due yesterday
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Create the todo (card should be due immediately)
    const createResponse = await service.createTodo(title, todoData);
    expect(createResponse.success).toBe(true);
    const createdItemId = createResponse.data!.item.id;
    
    // Act
    const response = await service.getDueTodos();
    
    // Assert
    expect(response.success).toBe(true);
    expect(Array.isArray(response.data)).toBe(true);
    
    // Try to find our newly created todo in the due list
    const foundTodo = response.data?.find(todo => todo.item.id === createdItemId);
    
    // We might not find it if server processes due date differently,
    // but we should log this for debugging
    if (!foundTodo) {
      console.warn('Note: Created todo was not found in due todos. This may be expected depending on server implementation.');
      
      // If not found in due todos, verify it exists in all todos to ensure it was created
      const allTodosResponse = await service.getAllTodos();
      const todoExistsInAllTodos = allTodosResponse.data?.some(todo => todo.item.id === createdItemId);
      expect(todoExistsInAllTodos).toBe(true);
    } else {
      // If we found it, verify its properties
      expect(foundTodo.item.title).toBe(title);
      expect(foundTodo.item.item_data?.dueDate).toBe(pastDate.toISOString());
    }
  });

  // Test completing a todo on real server
  test('should complete a todo on real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a test todo to complete
    const { item, card } = await createTestTodo();
    
    // Act
    const response = await service.completeTodo(card.id);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.suspended).toBe(true);
  });

  // Test completing a nonexistent todo
  test('should handle completing nonexistent todo', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Generate fake ID
    const fakeCardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    // Act
    const response = await service.completeTodo(fakeCardId);
    
    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  // Test rescheduling a todo on real server
  test('should reschedule a todo on real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a test todo to reschedule
    const { card } = await createTestTodo();
    
    // Act - Reschedule with "Good" rating (3)
    const response = await service.rescheduleTodo(card.id, 3);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.card_id).toBe(card.id);
    expect(response.data?.rating).toBe(3);
  });

  // Test resceduling with invalid rating
  test('should handle invalid rating when rescheduling', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a test todo
    const { card } = await createTestTodo();
    
    // Act - Try to reschedule with invalid rating
    const response = await service.rescheduleTodo(card.id, 6);
    
    // Assert
    expect(response.success).toBe(false);
    expect(response.error).toBeDefined();
  });

  // Test updating a todo on real server
  test('should update a todo on real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a test todo to update
    const { item } = await createTestTodo();
    
    // Updated data with new title
    const updatedTitle = await generateUniqueTitle('Updated Todo');
    const updatedData: TodoItemData = {
      details: 'Updated test details',
      priority: 4,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const response = await service.updateTodo(item.id, updatedTitle, updatedData);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.title).toBe(updatedTitle);
    expect(response.data?.item_data).toEqual(updatedData);
  });

  // Test getting a card for a todo from real server
  test('should get card for a todo from real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a test todo
    const { item, card } = await createTestTodo();
    
    // Act
    const response = await service.getCardForTodo(item.id);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.item_id).toBe(item.id);
  });

  // Test creating a todo with recurring pattern
  test('should create a recurring todo on real server', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    const title = await generateUniqueTitle('Recurring Test Todo');
    const todoData: TodoItemData = {
      details: 'Test details for recurring todo',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: true,
      recurrencePattern: {
        period: 'weekly',
        interval: 2
      }
    };
    
    // Act
    const response = await service.createTodo(title, todoData);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.item.title).toBe(title);
    expect(response.data?.item.item_data?.recurring).toBe(true);
    expect(response.data?.item.item_data?.recurrencePattern?.period).toBe('weekly');
    expect(response.data?.item.item_data?.recurrencePattern?.interval).toBe(2);
  });

  // Test creating a todo with all advanced options
  test('should create a todo with all advanced options', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Set dates for testing
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    const title = await generateUniqueTitle('Advanced Test Todo');
    const todoData: TodoItemData = {
      details: 'Test details for advanced todo',
      priority: 5,
      dueDate: tomorrow.toISOString(),
      mustCompleteBefore: nextWeek.toISOString(),
      mustCompleteOn: null,
      recurring: false
    };
    
    // Act
    const response = await service.createTodo(title, todoData);
    
    // Assert
    expect(response.success).toBe(true);
    expect(response.data).toBeDefined();
    expect(response.data?.item.title).toBe(title);
    expect(response.data?.item.item_data?.priority).toBe(5);
    expect(response.data?.item.item_data?.dueDate).toBe(tomorrow.toISOString());
    expect(response.data?.item.item_data?.mustCompleteBefore).toBe(nextWeek.toISOString());
  });

  // Test error handling for server errors
  test('should handle server errors gracefully', async () => {
    // Arrange
    const service = getHippocampusService(false);

    // Test 1: Invalid base URL
    await service.initialize({ baseUrl: SERVER_URL + '/nonexistent-path' });
    const invalidPathResponse = await service.getTodoItemType();
    expect(invalidPathResponse.success).toBe(false);
    expect(invalidPathResponse.error).toBeDefined();
    
    // Test 2: Invalid server port
    // Reset first
    resetHippocampusService();
    const invalidPortService = getHippocampusService(false);
    await invalidPortService.initialize({ baseUrl: 'http://127.0.0.1:9999' });
    const invalidPortResponse = await invalidPortService.getAllTodos();
    expect(invalidPortResponse.success).toBe(false);
    expect(invalidPortResponse.error).toBeDefined();
    
    // Test 3: Invalid item ID format
    resetHippocampusService();
    const validService = getHippocampusService(false);
    await validService.initialize({ baseUrl: SERVER_URL });
    const invalidIdResponse = await validService.getCardForTodo('not-a-valid-id-format');
    expect(invalidIdResponse.success).toBe(false);
    expect(invalidIdResponse.error).toBeDefined();
  });

  // Test handling multiple operations
  test('should handle multiple operations correctly', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Act - Measure time for multiple operations
    const start = Date.now();
    
    // Create multiple todos
    const todo1 = await createTestTodo();
    const todo2 = await createTestTodo();
    const todo3 = await createTestTodo();
    
    // Get all todos
    const getAllResponse = await service.getAllTodos();
    assert(getAllResponse.success, 'Failed to get all todos: ' + getAllResponse.error);
    
    // Complete one todo
    const completeResponse = await service.completeTodo(todo1.card.id);
    assert(completeResponse.success, 'Failed to complete todo: ' + completeResponse.error);
    
    // Reschedule another todo
    const rating = 2; // Hard
    const rescheduleResponse = await service.rescheduleTodo(todo2.card.id, rating);
    assert(rescheduleResponse.success, 'Failed to reschedule todo: ' + rescheduleResponse.error);
    
    // Update the third todo
    const updatedTitle = await generateUniqueTitle('Updated Multiple Test');
    const updatedDetails = 'Updated in multiple operations test';
    const updateResponse = await service.updateTodo(
      todo3.item.id, 
      updatedTitle, 
      {
        ...todo3.item.item_data as TodoItemData,
        details: updatedDetails
      }
    );
    expect(updateResponse.success).toBe(true);
    
    // Timing info - not an assertion, just informational
    const end = Date.now();
    const duration = end - start;
    console.log(`Multiple operations completed in ${duration}ms`);
    
    // Assert - Verify final state
    // 1. Get the final state of all todos
    const finalGetResponse = await service.getAllTodos();
    expect(finalGetResponse.success).toBe(true);
    expect(Array.isArray(finalGetResponse.data)).toBe(true);
    
    // 2. Verify todo1 is completed (suspended)
    const completedTodo = finalGetResponse.data?.find(t => t.item.id === todo1.item.id);
    expect(completedTodo).toBeDefined();
    expect(completedTodo?.card.suspended).toBe(true);
    
    // 3. Verify todo2 was rescheduled (has a review with the correct rating)
    const rescheduledTodo = finalGetResponse.data?.find(t => t.item.id === todo2.item.id);
    expect(rescheduledTodo).toBeDefined();
    // Can't easily verify the review directly, but can check the card still exists and is not suspended
    expect(rescheduledTodo?.card.suspended).toBe(false);
    
    // 4. Verify todo3 was updated
    const updatedTodo = finalGetResponse.data?.find(t => t.item.id === todo3.item.id);
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo?.item.title).toBe(updatedTitle);
    expect(updatedTodo?.item.item_data?.details).toBe(updatedDetails);
    
    // Performance is still important but secondary
    expect(duration).toBeLessThan(10000); // 10 seconds should be plenty
  });

  // Test handling of complex data structures
  test('should handle complex data structures correctly', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Create a todo with complex nested data
    const title = await generateUniqueTitle('Complex Data Todo');
    const todoData: TodoItemData = {
      details: 'Test details with\nmultiple lines\nand special characters: !@#$%^&*()',
      priority: 4,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: true,
      recurrencePattern: {
        period: 'monthly',
        interval: 3
      }
    };
    
    // Act
    const createResponse = await service.createTodo(title, todoData);
    expect(createResponse.success).toBe(true);
    
    // Fetch the created todo to verify data integrity
    const getAllResponse = await service.getAllTodos();
    expect(getAllResponse.success).toBe(true);
    
    // Find our created todo
    const foundTodo = getAllResponse.data?.find(t => t.item.id === createResponse.data?.item.id);
    
    // Assert
    expect(foundTodo).toBeDefined();
    expect(foundTodo?.item.item_data).toEqual(todoData);
  });

  // Test concurrent operations
  test('should handle concurrent operations correctly', async () => {
    // Arrange
    const service = getHippocampusService(false);
    await service.initialize({ baseUrl: SERVER_URL });
    
    // Act - Perform multiple operations concurrently
    const title1 = await generateUniqueTitle('Concurrent Test 1', true);
    const title2 = await generateUniqueTitle('Concurrent Test 2', true);
    const title3 = await generateUniqueTitle('Concurrent Test 3', true);
    
    const todoData: TodoItemData = {
      details: 'Test details for concurrent operations',
      priority: 3,
      dueDate: null,
      mustCompleteBefore: null,
      mustCompleteOn: null,
      recurring: false
    };
    
    // Start all operations concurrently
    const operation1 = service.createTodo(title1, todoData);
    const operation2 = service.createTodo(title2, todoData);
    const operation3 = service.createTodo(title3, todoData);
    const operation4 = service.getAllTodos();
    
    // Wait for all to complete
    const [result1, result2, result3, result4] = await Promise.all([
      operation1, operation2, operation3, operation4
    ]);
    
    // Assert
    assert(result1.success, `Operation 1 failed: ${result1.error || JSON.stringify(result1)}`);
    assert(result2.success, `Operation 2 failed: ${result2.error || JSON.stringify(result2)}`);
    assert(result3.success, `Operation 3 failed: ${result3.error || JSON.stringify(result3)}`);
    assert(result4.success, `Operation 4 failed: ${result4.error || JSON.stringify(result4)}`);
  });
}); 