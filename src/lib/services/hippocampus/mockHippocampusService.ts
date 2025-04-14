/**
 * Mock implementation of the HippocampusService for testing purposes.
 * 
 * This implementation does not make any actual API calls but simulates the
 * behavior of the service with in-memory data.
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
  HippocampusConfig
} from './types';

export class MockHippocampusService implements HippocampusService {
  private initialized = false;
  private config: HippocampusConfig | null = null;
  private todoItemType: ItemType | null = null;
  private items: Map<string, Item> = new Map();
  private cards: Map<string, Card> = new Map();
  private reviews: Map<string, Review> = new Map();
  
  // For testing purposes - allows pre-setting values or simulating failures
  public shouldFailNext = false;
  public todoItemsCount = 0;
  public simulateNetworkDelay = 0;
  
  public async initialize(config: HippocampusConfig): Promise<ServiceResponse<void>> {
    await this.delay();
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to initialize" };
    }
    
    this.config = config;
    this.initialized = true;
    return { success: true };
  }
  
  public async getTodoItemType(): Promise<ServiceResponse<ItemType>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to get Todo item type" };
    }
    
    if (!this.todoItemType) {
      this.todoItemType = {
        id: "todo-type-id",
        name: "Todo",
        created_at: new Date().toISOString()
      };
    }
    
    return { success: true, data: this.todoItemType };
  }
  
  public async createTodo(title: string, priority: number, data: TodoItemData): Promise<ServiceResponse<{item: Item, card: Card}>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to create Todo" };
    }
    
    // Ensure we have a todo item type
    if (!this.todoItemType) {
      const response = await this.getTodoItemType();
      if (!response.success || !response.data) {
        return { success: false, error: "Failed to get Todo item type" };
      }
    }
    
    // Create new item
    const itemId = `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    const item: Item = {
      id: itemId,
      item_type_id: this.todoItemType!.id,
      title,
      item_data: data,
      created_at: now,
      updated_at: now
    };
    
    // Create associated card
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const card: Card = {
      id: cardId,
      item_id: itemId,
      due_date: tomorrow.toISOString(),
      last_review: null,
      suspended: null,
      priority,
    };
    
    // Store them
    this.items.set(itemId, item);
    this.cards.set(cardId, card);
    this.todoItemsCount++;
    
    return { success: true, data: { item, card } };
  }
  
  public async getAllTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to get Todos" };
    }
    
    const result: Array<{item: Item, card: Card}> = [];
    
    // Match items with their cards
    for (const [itemId, item] of this.items.entries()) {
      // Find card for this item
      let cardForItem: Card | undefined;
      for (const card of this.cards.values()) {
        if (card.item_id === itemId) {
          cardForItem = card;
          break;
        }
      }
      
      if (cardForItem) {
        result.push({ item, card: cardForItem });
      }
    }
    
    return { success: true, data: result };
  }
  
  public async getDueTodos(): Promise<ServiceResponse<Array<{item: Item, card: Card}>>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to get due Todos" };
    }
    
    const now = new Date().toISOString();
    const result: Array<{item: Item, card: Card}> = [];
    
    // Find cards that are due and not suspended
    for (const card of this.cards.values()) {
      if (card.due_date && card.due_date <= now && !card.suspended) {
        const item = this.items.get(card.item_id);
        if (item) {
          result.push({ item, card });
        }
      }
    }
    
    return { success: true, data: result };
  }
  
  public async completeTodo(cardId: string): Promise<ServiceResponse<null>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to complete Todo" };
    }
    
    const card = this.cards.get(cardId);
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    // Update card to be suspended
    const updatedCard: Card = {
      ...card,
      suspended: new Date().toISOString()
    };
    
    this.cards.set(cardId, updatedCard);
    
    return { success: true, data: null };
  }
  
  public async rescheduleTodo(cardId: string, rating: number): Promise<ServiceResponse<Review>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to reschedule Todo" };
    }
    
    if (rating < 1 || rating > 4) {
      return { success: false, error: "Rating must be between 1 and 4" };
    }
    
    const card = this.cards.get(cardId);
    if (!card) {
      return { success: false, error: "Card not found" };
    }
    
    // Create a review
    const reviewId = `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const now = new Date().toISOString();
    
    const review: Review = {
      id: reviewId,
      card_id: cardId,
      rating,
      created_at: now
    };
    
    // Update the card's due date based on rating
    const daysToAdd = rating === 1 ? 1 : (rating === 2 ? 3 : (rating === 3 ? 7 : 14));
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysToAdd);
    
    const updatedCard: Card = {
      ...card,
      due_date: dueDate.toISOString(),
    };
    
    this.cards.set(cardId, updatedCard);
    this.reviews.set(reviewId, review);
    
    return { success: true, data: review };
  }
  
  public async updateTodo(itemId: string, title: string, data: TodoItemData): Promise<ServiceResponse<Item>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to update Todo" };
    }
    
    const item = this.items.get(itemId);
    if (!item) {
      return { success: false, error: "Item not found" };
    }
    
    const updatedItem: Item = {
      ...item,
      title,
      item_data: data,
      updated_at: new Date().toISOString()
    };
    
    this.items.set(itemId, updatedItem);
    
    return { success: true, data: updatedItem };
  }
  
  public async getCardForTodo(itemId: string): Promise<ServiceResponse<Card>> {
    await this.delay();
    
    if (!this.initialized) {
      return { success: false, error: "Service not initialized" };
    }
    
    if (this.shouldFailNext) {
      this.shouldFailNext = false;
      return { success: false, error: "Failed to get card for Todo" };
    }
    
    // Find card for this item
    for (const card of this.cards.values()) {
      if (card.item_id === itemId) {
        return { success: true, data: card };
      }
    }
    
    return { success: false, error: "Card not found for this item" };
  }
  
  // Helper method to simulate network delay
  private async delay(): Promise<void> {
    if (this.simulateNetworkDelay > 0) {
      return new Promise(resolve => setTimeout(resolve, this.simulateNetworkDelay));
    }
  }
  
  // Test helper methods
  public reset(): void {
    this.initialized = false;
    this.config = null;
    this.todoItemType = null;
    this.items.clear();
    this.cards.clear();
    this.reviews.clear();
    this.shouldFailNext = false;
    this.todoItemsCount = 0;
  }
} 