/**
 * Implementation of the HippocampusService interface.
 * 
 * This service implementation communicates with the Hippocampus API for storing and
 * scheduling todo items.
 */

import type { 
  HippocampusService 
} from './hippocampusService';
import type { 
  ItemType, 
  Item, 
  Card, 
  Review, 
  TodoItemData, 
  ServiceResponse,
  HippocampusConfig,
  CreateItemTypeRequest,
  CreateItemRequest,
  CreateReviewRequest
} from './types';

export class HippocampusServiceImpl implements HippocampusService {
  private initialized = false;
  private config: HippocampusConfig | null = null;
  private todoItemTypeId: string | null = null;
  private readonly TODO_ITEM_TYPE_NAME = 'Todo';
  
  public async initialize(config: HippocampusConfig): Promise<ServiceResponse<void>> {
    // This will be implemented with actual API communication
    // Placeholder implementation
    this.config = config;
    this.initialized = true;
    return { success: true };
  }
  
  // This queries the server for the Todo item type
  // if it doesn't exist, it creates it
  public async getTodoItemType(): Promise<ServiceResponse<ItemType>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }

    try {
      // If we already have the item type ID, get it from the server
      if (this.todoItemTypeId) {
        try {
          const response = await this.fetchFromApi<ItemType>(`/item_types/${this.todoItemTypeId}`);
          
          // Verify we got a valid item type with the expected name
          if (response && response.name === this.TODO_ITEM_TYPE_NAME) {
            return { success: true, data: response };
          }
          // If the item type exists but has wrong name or is invalid, continue to find/create the correct one
        } catch (error) {
          // If there was an error fetching the item type (e.g., it was deleted),
          // we'll continue to try finding or creating it below
        }
        
        // Reset the ID since it was invalid or not found
        this.todoItemTypeId = null;
      }
      
      // Try to find the Todo item type
      const allItemTypes = await this.fetchFromApi<ItemType[]>('/item_types');
      const todoItemType = allItemTypes.find(type => type.name === this.TODO_ITEM_TYPE_NAME);
      
      if (todoItemType) {
        // Found the todo item type
        this.todoItemTypeId = todoItemType.id;
        return { success: true, data: todoItemType };
      } else {
        // Need to create the todo item type
        const createRequest: CreateItemTypeRequest = { name: this.TODO_ITEM_TYPE_NAME };
        const createdItemType = await this.postToApi<ItemType, CreateItemTypeRequest>('/item_types', createRequest);
        this.todoItemTypeId = createdItemType.id;
        return { success: true, data: createdItemType };
      }
    } catch (error) {
      return { success: false, error: `Failed to get Todo item type: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  // This creates a new todo item in the server, returning the item
  // the server will create a card for the todo item
  // we will then need to query again to get the created card so we can return it
  public async createTodo(title: string, data: TodoItemData): Promise<ServiceResponse<{item: Item, card: Card}>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Get or create the Todo item type
      const itemTypeResponse = await this.getTodoItemType();
      if (!itemTypeResponse.success || !itemTypeResponse.data) {
        return { success: false, error: itemTypeResponse.error || "Failed to get Todo item type" };
      }
      
      // Create the item
      const createItemRequest: CreateItemRequest = {
        item_type_id: itemTypeResponse.data.id,
        title,
        item_data: data
      };
      
      const createdItem = await this.postToApi<Item, CreateItemRequest>('/items', createItemRequest);
      
      // Get the card for the created item
      const cardResponse = await this.getCardForTodo(createdItem.id);
      if (!cardResponse.success || !cardResponse.data) {
        return { success: false, error: cardResponse.error || "Failed to get card for created todo" };
      }
      
      return { 
        success: true, 
        data: { item: createdItem, card: cardResponse.data } 
      };
    } catch (error) {
      return { success: false, error: `Failed to create todo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  // This gets all todo items from the server, returning an array of items and cards
  // this is done by querying the server for all items and then for each item, querying the server for the card
  public async getAllTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Get the Todo item type
      const itemTypeResponse = await this.getTodoItemType();
      if (!itemTypeResponse.success || !itemTypeResponse.data) {
        return { success: false, error: itemTypeResponse.error || "Failed to get Todo item type" };
      }
      
      // Get all items of the Todo type
      const items = await this.fetchFromApi<Item[]>(`/items?item_type_id=${itemTypeResponse.data.id}`);
      
      // Get cards for all items
      const todosWithCards = await Promise.all(
        items.map(async (item) => {
          const cardResponse = await this.getCardForTodo(item.id);
          if (!cardResponse.success || !cardResponse.data) {
            throw new Error(`Failed to get card for item ${item.id}: ${cardResponse.error}`);
          }
          return { item, card: cardResponse.data };
        })
      );
      
      return { success: true, data: todosWithCards };
    } catch (error) {
      return { success: false, error: `Failed to get all todos: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  // This gets all todo items from the server that are due for review
  // this is done by querying the server for all items, and then for each item, querying the server for the card
  // and then filtering them by due date
  public async getDueTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Get all todos
      const allTodosResponse = await this.getAllTodos();
      if (!allTodosResponse.success || !allTodosResponse.data) {
        return { success: false, error: allTodosResponse.error || "Failed to get all todos" };
      }
      
      // Filter to only include todos that are due (due_date is not null and is before or equal to now)
      const now = new Date().toISOString();
      const dueTodos = allTodosResponse.data.filter(todo => {
        return (
          todo.card.due_date !== null && 
          !todo.card.suspended && 
          todo.card.due_date <= now
        );
      });
      
      return { success: true, data: dueTodos };
    } catch (error) {
      return { success: false, error: `Failed to get due todos: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  // This completes a todo item by suspending its card
  // the server will then stop reviewing the todo item
  public async completeTodo(cardId: string): Promise<ServiceResponse<Card>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // TODO: fix this - it doesn't work because suspending isn't setup on the server yet.
      const updatedCard = await this.patchToApi<Card, { suspended: boolean }>(`/cards/${cardId}`, { suspended: true });
      
      return { success: true, data: updatedCard };
    } catch (error) {
      return { success: false, error: `Failed to complete todo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }
  
  // This reschedules a todo item by creating a review
  // the server will then review the todo item again at the specified interval
  public async rescheduleTodo(cardId: string, rating: number): Promise<ServiceResponse<Review>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Create a review for the card
      const createReviewRequest: CreateReviewRequest = {
        card_id: cardId,
        rating
      };
      
      const createdReview = await this.postToApi<Review, CreateReviewRequest>('/reviews', createReviewRequest);
      
      return { success: true, data: createdReview };
    } catch (error) {
      return { success: false, error: `Failed to reschedule todo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // This updates a todo item by updating the item and the card
  public async updateTodo(itemId: string, title: string, data: TodoItemData): Promise<ServiceResponse<Item>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Update the item
      const updatedItem = await this.patchToApi<Item, { title: string, item_data: TodoItemData }>(
        `/items/${itemId}`, 
        { title, item_data: data }
      );
      
      return { success: true, data: updatedItem };
    } catch (error) {
      return { success: false, error: `Failed to update todo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // This gets the card for a todo item
  public async getCardForTodo(itemId: string): Promise<ServiceResponse<Card>> {
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    try {
      // Get the card for the item
      const cards = await this.fetchFromApi<Card[]>(`/cards?item_id=${itemId}`);
      
      if (cards.length === 0) {
        return { success: false, error: `No card found for item ${itemId}` };
      }
      
      return { success: true, data: cards[0] };
    } catch (error) {
      return { success: false, error: `Failed to get card for todo: ${error instanceof Error ? error.message : String(error)}` };
    }
  }

  // Private helper methods for API communication
  
  private async fetchFromApi<T>(endpoint: string): Promise<T> {
    if (!this.config) {
      throw new Error("Service not initialized");
    }
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
  
  private async postToApi<T, R>(endpoint: string, data: R): Promise<T> {
    if (!this.config) {
      throw new Error("Service not initialized");
    }
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
  
  private async patchToApi<T, R>(endpoint: string, data: R): Promise<T> {
    if (!this.config) {
      throw new Error("Service not initialized");
    }
    
    const url = `${this.config.baseUrl}${endpoint}`;
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    
    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json() as Promise<T>;
  }
} 