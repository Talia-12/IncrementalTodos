/*
  File: src/lib/stores/todoStore.ts
  Description: The central store for managing todo items in the application. Now uses the Hippocampus service
  to retrieve due todos and sync all actions with the backend server. This store now only manages
  the todos that are currently due and handles the communication with the Hippocampus API.
  Related Files:
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/TodoListItem.svelte
  - src/lib/components/AddTodoDialog.svelte
  - src/routes/+page.svelte
  - src/routes/list/+page.svelte
  - src/lib/services/hippocampus/hippocampusService.ts
*/

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';
import { 
  getHippocampusService, 
  type HippocampusService, 
  type TodoItemData,
  type Item,
  type Card,
  ReviewRating
} from '$lib/services/hippocampus';

export interface Todo {
  id: string;
  itemId: string; // The ID of the item in Hippocampus
  cardId: string; // The ID of the card in Hippocampus
  title: string;
  details?: string;
  completed: boolean;
  nextCheckDate: Date;
  delayDays: number;
  priority: number;
  mustBeCompletedBy?: Date;
  mustBeCompletedOn?: Date;
  recurring?: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

// Configuration for the Hippocampus service
// TODO: Move this to a config file or environment variables
const HIPPOCAMPUS_CONFIG = {
  baseUrl: 'http://localhost:3000', // Default for local development
  refreshInterval: 60000, // 1 minute in milliseconds
};

// Helper function to serialize and deserialize dates in JSON
function replacer(key: string, value: any) {
  if (key === 'nextCheckDate' || key === 'createdAt' || key === 'completedAt' || 
      key === 'mustBeCompletedBy' || key === 'mustBeCompletedOn') {
    if (value && value instanceof Date) {
      return value.toISOString();
    }
    return value;
  }
  return value;
}

function reviver(key: string, value: any) {
  if (key === 'nextCheckDate' || key === 'createdAt' || key === 'completedAt' || 
      key === 'mustBeCompletedBy' || key === 'mustBeCompletedOn') {
    return value ? new Date(value) : null;
  }
  return value;
}

// Helper function to convert from Hippocampus data model to our Todo model
function mapFromHippocampus(item: Item, card: Card): Todo {
  const itemData = item.item_data as TodoItemData | null;
  
  return {
    id: item.id,
    itemId: item.id,
    cardId: card.id,
    title: item.title,
    details: itemData?.details ?? '',
    completed: card.suspended !== null,
    nextCheckDate: card.due_date ? new Date(card.due_date) : new Date(),
    delayDays: 1000, // Default, will be overridden if needed
    priority: card.priority ?? 0.5,
    mustBeCompletedBy: itemData?.mustCompleteBefore ? new Date(itemData.mustCompleteBefore) : undefined,
    mustBeCompletedOn: itemData?.mustCompleteOn ? new Date(itemData.mustCompleteOn) : undefined,
    recurring: itemData?.recurring ? itemData.recurrencePattern : undefined,
    createdAt: new Date(item.created_at),
    completedAt: card.suspended ? new Date(card.suspended) : undefined
  };
}

// Helper function to convert from our Todo model to Hippocampus data model
function mapToHippocampus(todo: Todo): TodoItemData {
  return {
    details: todo.details || '',
    dueDate: todo.nextCheckDate.toISOString(),
    mustCompleteBefore: todo.mustBeCompletedBy?.toISOString() || null,
    mustCompleteOn: todo.mustBeCompletedOn?.toISOString() || null,
    recurring: !!todo.recurring,
    recurrencePattern: todo.recurring
  };
}

function createTodoStore() {
  // Initialize with an empty array
  const { subscribe, update, set } = writable<Todo[]>([]);
  
  // Initialize the Hippocampus service
  const hippocampusService: HippocampusService = getHippocampusService(false);
  let refreshInterval: ReturnType<typeof setInterval> | null = null;
  
  // TODO: this currently stops us interacting with the store until the service is initialized
  // in the future we will cache the todos in the store until the service is initialized
  let initialized = false;
  
  // Function to refresh todos from the server
  async function refreshTodos() {
    if (!initialized) return;
    
    try {
      const response = await hippocampusService.getDueTodos();
      if (response.success && response.data) {
        const todos = response.data.map(({ item, card }) => mapFromHippocampus(item, card));
        set(todos);
      } else {
        console.error('Failed to get due todos:', response.error);
      }
    } catch (error) {
      console.error('Error refreshing todos:', error);
    }
  }
  
  // Initialize the service and start refreshing todos
  async function initialize() {
    if (browser) {
      try {
        const initResponse = await hippocampusService.initialize({
          baseUrl: HIPPOCAMPUS_CONFIG.baseUrl
        });
        
        if (initResponse.success) {
          initialized = true;
          await refreshTodos();
          
          // Start the refresh interval
          refreshInterval = setInterval(refreshTodos, HIPPOCAMPUS_CONFIG.refreshInterval);
        } else {
          console.error('Failed to initialize Hippocampus service:', initResponse.error);
        }
      } catch (error) {
        console.error('Error initializing Hippocampus service:', error);
      }
    }
  }
  
  //  Cleanup the interval
  function cleanup() {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  }
  
  // Call initialize
  initialize();
  
  const storeWithHippocampus = {
    subscribe,
    
    // Add a cleanup method that components can call during their onDestroy
    cleanup,
    
    // Add a new todo to the server
    addTodo: async (todo: Omit<Todo, 'id' | 'cardId' | 'createdAt' | 'completed' | 'nextCheckDate' | 'delayDays'>) => {
      if (!initialized) {
        console.error('Cannot add todo: Hippocampus service not initialized');
        return;
      }
      
      try {
        const todoData: TodoItemData = {
          details: todo.details || '',
          dueDate: new Date().toISOString(),
          mustCompleteBefore: todo.mustBeCompletedBy?.toISOString() || null,
          mustCompleteOn: todo.mustBeCompletedOn?.toISOString() || null,
          recurring: !!todo.recurring,
          recurrencePattern: todo.recurring
        };
        
        const response = await hippocampusService.createTodo(todo.title, todo.priority, todoData);
        
        if (response.success && response.data) {
          // Refresh todos to include the new one if it's due
          await refreshTodos();
        } else {
          console.error('Failed to create todo:', response.error);
        }
      } catch (error) {
        console.error('Error creating todo:', error);
      }
    },
    
    // Mark a todo as completed on the server
    completeTodo: async (id: string, cardId: string, completed: boolean) => {
      if (!initialized) {
        console.error('Cannot complete todo: Hippocampus service not initialized');
        return;
      }
      
      try {
        const response = await hippocampusService.completeTodo(cardId, completed);
        
        if (response.success) {
          // Update the local store
          update(todos => {
            const updatedTodos = todos.filter(todo => todo.id !== id);
            return updatedTodos;
          });
        } else {
          console.error('Failed to complete todo:', response.error);
        }
      } catch (error) {
        console.error('Error completing todo:', error);
      }
    },
    
    // Delete a todo from the server
    // Note: This functionality is not yet directly supported by Hippocampus,
    // so we log an error and do nothing
    deleteTodo: async (id: string, cardId: string) => {
      if (!initialized) {
        console.error('Cannot delete todo: Hippocampus service not initialized');
        return;
      }
      
      console.error('Cannot delete todo: Hippocampus service does not support this functionality');
      // TODO: Implement this functionality in the future
    },
    
    // Defer a todo on the server
    deferTodo: async (id: string, cardId: string, rating: ReviewRating) => {
      if (!initialized) {
        console.error('Cannot defer todo: Hippocampus service not initialized');
        return;
      }
      
      try {       
        const response = await hippocampusService.rescheduleTodo(cardId, rating);
        
        if (response.success) {
          // Update the local store - remove the todo as it's no longer due
          update(todos => {
            const updatedTodos = todos.filter(todo => todo.id !== id);
            return updatedTodos;
          });
        } else {
          console.error('Failed to defer todo:', response.error);
        }
      } catch (error) {
        console.error('Error deferring todo:', error);
      }
    },
    
    // Update a todo on the server
    updateTodo: async (id: string, updates: Partial<Todo>) => {
      if (!initialized) {
        console.error('Cannot update todo: Hippocampus service not initialized');
        return;
      }
      
      try {
        // Get the current todo
        const todos = get({ subscribe });
        const todo = todos.find(t => t.id === id);
        
        if (!todo) {
          console.error('Cannot update todo: Todo not found');
          return;
        }
        
        // Update the local store
        update(todos => {
          const updatedTodos = todos.map(todo => 
            todo.id === id ? { ...todo, ...updates } : todo
          );
          return updatedTodos;
        });
        
        // TODO: Implement the updateTodo method in the Hippocampus service
        // For now, we'll just log a warning
        console.warn('Todo updates are currently only stored locally and not synced to the server');
      } catch (error) {
        console.error('Error updating todo:', error);
      }
    },
    
    // Force a refresh of todos from the server
    refresh: async () => {
      return refreshTodos();
    }
  };
  
  return storeWithHippocampus;
}

// Create the TodoStore type properly, using the correct type for subscribe
type Subscriber<T> = (value: T) => void;
type Unsubscriber = () => void;

interface TodoStore {
  subscribe: (run: Subscriber<Todo[]>, invalidate?: () => void) => Unsubscriber;
  cleanup: () => void;
  addTodo: (todo: Omit<Todo, 'id' | 'cardId' | 'createdAt' | 'completed' | 'nextCheckDate' | 'delayDays'>) => Promise<void>;
  completeTodo: (id: string, cardId: string, completed: boolean) => Promise<void>;
  deleteTodo: (id: string, cardId: string) => Promise<void>;
  deferTodo: (id: string, cardId: string, rating: ReviewRating) => Promise<void>;
  updateTodo: (id: string, updates: Partial<Todo>) => Promise<void>;
  refresh: () => Promise<void>;
}

export const todoStore = createTodoStore() as TodoStore;

// Derived stores for specific views
export const todaysTodos = derived(todoStore, ($todos: Todo[]) => {
  // All todos in the store are already due, so no filtering needed
  return $todos.filter(todo => !todo.completed);
});

// TODO: this is probably not going to work; need to fix to do a different server query
export const completedToday = derived(todoStore, ($todos: Todo[]) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return $todos.filter(todo => {
    if (!todo.completedAt) return false;
    const completedDate = new Date(todo.completedAt);
    return completedDate >= today && completedDate < tomorrow;
  });
});

// Helper to get the next todo to focus on
export function getNextFocusTodo(): Todo | null {
  const todos = get(todaysTodos);
  if (todos.length === 0) return null;
  
  // Sort by priority (highest first) and due date
  return [...todos].sort((a, b) => {
    // First by priority (highest first)
    if (b.priority !== a.priority) {
        return b.priority - a.priority;
    }
    // Then by due date (earliest first)
    return a.nextCheckDate.getTime() - b.nextCheckDate.getTime();
  })[0];
} 