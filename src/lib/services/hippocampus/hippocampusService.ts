/**
 * HippocampusService
 * 
 * This service provides the interface for interacting with the Hippocampus API.
 * It handles mapping between the Todo app's data model and the Hippocampus API's data model,
 * as well as managing communication with the API endpoints.
 */

import type { 
  ItemType, 
  Item, 
  Card, 
  Review, 
  TodoItemData, 
  ServiceResponse,
  HippocampusConfig
} from './types';

/**
 * Interface defining the operations that can be performed with the Hippocampus API
 */
export interface HippocampusService {
  /**
   * Initialize the service with the provided configuration
   * @param config - Configuration for connecting to the Hippocampus API
   */
  initialize(config: HippocampusConfig): Promise<ServiceResponse<void>>;
  
  /**
   * Get or create the "Todo" item type in Hippocampus
   * @returns The Todo item type
   */
  getTodoItemType(): Promise<ServiceResponse<ItemType>>;
  
  /**
   * Create a new todo item in Hippocampus
   * @param title - Title of the todo
   * @param priority - Priority of the todo
   * @param data - Additional todo data
   * @returns The created item with its associated card
   */
  createTodo(title: string, priority: number, data: TodoItemData): Promise<ServiceResponse<{item: Item, card: Card}>>;
  
  /**
   * Get all todo items from Hippocampus
   * @returns Array of todo items with their associated cards
   */
  getAllTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>>;
  
  /**
   * Get todo items that are due (scheduled for review)
   * @returns Array of due todo items with their associated cards
   */
  getDueTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>>;
  
  /**
   * Mark a todo as completed by suspending its card
   * @param cardId - ID of the card associated with the todo
   * @param completed - Whether the todo is completed
   * @returns The updated card
   */
  completeTodo(cardId: string, completed: boolean): Promise<ServiceResponse<null>>;
  
  /**
   * Reschedule a todo by creating a review
   * @param cardId - ID of the card to review
   * @param rating - Rating indicating how long to wait before reviewing the todo again
   * @returns The created review
   */
  rescheduleTodo(cardId: string, rating: number): Promise<ServiceResponse<Review>>;
  
  // /**
  //  * Update a todo item's data
  //  * @param itemId - ID of the item to update
  //  * @param title - New title
  //  * @param data - New todo data
  //  * @returns The updated item
  //  */
  // updateTodo(itemId: string, title: string, data: TodoItemData): Promise<ServiceResponse<Item>>;
  
  /**
   * Get the card associated with a todo item
   * @param itemId - ID of the todo item
   * @returns The associated card
   */
  getCardForTodo(itemId: string): Promise<ServiceResponse<Card>>;
} 