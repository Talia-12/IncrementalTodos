/*
  File: src/lib/stores/todoStore.ts
  Description: The central store for managing todo items in the application. Provides a Svelte store with persistence to localStorage and derived stores for different views. Includes functionality for adding, completing, deferring, and managing todos.
  Related Files:
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/TodoListItem.svelte
  - src/lib/components/AddTodoDialog.svelte
  - src/routes/+page.svelte
  - src/routes/list/+page.svelte
*/

import { writable, derived, get } from 'svelte/store';
import { browser } from '$app/environment';

export interface Todo {
  id: string;
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

function createTodoStore() {
  // Initialize from localStorage if in browser
  const initialTodos: Todo[] = browser 
    ? JSON.parse(localStorage.getItem('todos') || '[]', reviver) 
    : [];
  
  const { subscribe, update, set } = writable<Todo[]>(initialTodos);
  
  // Save to localStorage whenever the store changes
  const storeWithPersistence = {
    subscribe,
    addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'completed' | 'nextCheckDate' | 'delayDays'>) => {
      const newTodo: Todo = {
        ...todo,
        id: crypto.randomUUID(),
        completed: false,
        createdAt: new Date(),
        nextCheckDate: new Date(),
        delayDays: 1000,
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
    deferTodo: (id: string, days: number, deferMultiplier: number) => {
      update(todos => {
        const updatedTodos = todos.map(todo => {
          if (todo.id === id) {
            const newCheckDate = new Date(todo.nextCheckDate);
            newCheckDate.setDate(newCheckDate.getDate() + days);
            return { ...todo, nextCheckDate: newCheckDate, delayDays: todo.delayDays * deferMultiplier };
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
  
  return $todos.filter(todo => {
    const nextCheckDate = new Date(todo.nextCheckDate);
    nextCheckDate.setHours(0, 0, 0, 0);
    return nextCheckDate.getTime() <= today.getTime() && !todo.completed;
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
  
  // Sort by due date
  return [...todos].sort((a, b) => {
    return a.nextCheckDate.getTime() - b.nextCheckDate.getTime();
  })[0];
} 