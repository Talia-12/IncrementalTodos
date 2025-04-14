/**
 * Types for the Hippocampus API integration
 * 
 * These types define the interface between our Todo app and the Hippocampus spaced repetition system.
 * The Hippocampus system is used to store todos and schedule when they should be revisited.
 */

// Hippocampus API types
export interface ItemType {
  id: string;
  name: string;
  created_at: string;
}

export interface Item {
  id: string;
  item_type_id: string;
  title: string;
  item_data: TodoItemData | null;
  created_at: string;
  updated_at: string;
}

export interface Card {
  id: string;
  item_id: string;
  due_date: string;
  last_review: string | null;
  suspended: string | null; // the suspension date or null if not suspended
  priority: number;
}

export interface Review {
  id: string;
  card_id: string;
  rating: number; // 1-4
  created_at: string;
}

// Todo-specific data that will be stored in item_data
export interface TodoItemData {
  details: string;
  dueDate: string | null;
  mustCompleteBefore: string | null;
  mustCompleteOn: string | null;
  recurring: boolean;
  recurrencePattern?: {
    period: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
  };
}

// Rating options for reviews
export enum ReviewRating {
  Again = 1,  // Didn't remember, short interval
  Hard = 2,   // Remembered with difficulty
  Good = 3,   // Remembered correctly with some effort
  Easy = 4    // Remembered easily, longer interval
}

// API Request/Response types
export interface CreateItemTypeRequest {
  name: string;
}

export interface CreateItemRequest {
  item_type_id: string;
  title: string;
  priority: number;
  item_data: TodoItemData | null;
}

export interface CreateReviewRequest {
  card_id: string;
  rating: number;
}

// Service response types
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Configuration for the Hippocampus service
export interface HippocampusConfig {
  baseUrl: string;
  apiKey?: string;
} 