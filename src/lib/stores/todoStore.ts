import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface Todo {
  id: string;
  title: string;
  details?: string;
  completed: boolean;
  dueDate: Date;
  priority?: number;
  mustBeCompletedBy?: Date;
  mustBeCompletedOn?: Date;
  recurring?: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
  createdAt: Date;
  completedAt?: Date;
}

// Helper function to serialize and deserialize dates in JSON
function replacer(key: string, value: any) {
  if (key === 'dueDate' || key === 'createdAt' || key === 'completedAt' || 
      key === 'mustBeCompletedBy' || key === 'mustBeCompletedOn') {
    return value ? value.toISOString() : null;
  }
  return value;
}

function reviver(key: string, value: any) {
  if (key === 'dueDate' || key === 'createdAt' || key === 'completedAt' || 
      key === 'mustBeCompletedBy' || key === 'mustBeCompletedOn') {
    return value ? new Date(value) : null;
  }
  return value;
}

function createTodoStore() {
  // Initialize from localStorage if in browser
  const initialTodos: Todo[] = browser 
    ? JSON.parse(localStorage.getItem('todos') || '[]', reviver) 
    : [];
  
  const { subscribe, update, set } = writable<Todo[]>(initialTodos);
  
  // Save to localStorage whenever the store changes
  const storeWithPersistence = {
    subscribe,
    addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed'>) => {
      const newTodo: Todo = {
        ...todo,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date(),
      };
      update(todos => {
        const updatedTodos = [...todos, newTodo];
        if (browser) {
          localStorage.setItem('todos', JSON.stringify(updatedTodos, replacer));
        }
        return updatedTodos;
      });
    },
    completeTodo: (id: string) => {
      update(todos => {
        const updatedTodos = todos.map(todo => 
          todo.id === id 
            ? { ...todo, completed: true, completedAt: new Date() } 
            : todo
        );
        if (browser) {
          localStorage.setItem('todos', JSON.stringify(updatedTodos, replacer));
        }
        return updatedTodos;
      });
    },
    deleteTodo: (id: string) => {
      update(todos => {
        const updatedTodos = todos.filter(todo => todo.id !== id);
        if (browser) {
          localStorage.setItem('todos', JSON.stringify(updatedTodos, replacer));
        }
        return updatedTodos;
      });
    },
    deferTodo: (id: string, days: number) => {
      update(todos => {
        const updatedTodos = todos.map(todo => {
          if (todo.id === id) {
            const newDueDate = new Date(todo.dueDate);
            newDueDate.setDate(newDueDate.getDate() + days);
            return { ...todo, dueDate: newDueDate };
          }
          return todo;
        });
        if (browser) {
          localStorage.setItem('todos', JSON.stringify(updatedTodos, replacer));
        }
        return updatedTodos;
      });
    },
    updateTodo: (id: string, updates: Partial<Todo>) => {
      update(todos => {
        const updatedTodos = todos.map(todo => 
          todo.id === id ? { ...todo, ...updates } : todo
        );
        if (browser) {
          localStorage.setItem('todos', JSON.stringify(updatedTodos, replacer));
        }
        return updatedTodos;
      });
    }
  };
  
  return storeWithPersistence;
}

export const todoStore = createTodoStore();

// Derived stores for specific views
export const todaysTodos = derived(todoStore, $todos => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return $todos.filter(todo => {
    const dueDate = new Date(todo.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime() && !todo.completed;
  });
});

export const completedToday = derived(todoStore, $todos => {
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
  
  // Sort by priority (higher first) and then by due date
  return [...todos].sort((a, b) => {
    const priorityA = a.priority || 5;
    const priorityB = b.priority || 5;
    
    if (priorityA !== priorityB) {
      return priorityB - priorityA; // Higher priority first
    }
    
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  })[0];
} 