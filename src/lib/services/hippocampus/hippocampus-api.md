# Hippocampus API Endpoints Summary

## Available Endpoints

### Item Types

- GET /item_types - List all item types
- POST /item_types - Create a new item type
- GET /item_types/{id} - Get a specific item type by ID
- GET /item_types/{id}/items - List all items of a specific type

### Items

- GET /items - List all items
- POST /items - Create a new item
- GET /items/{id} - Get a specific item by ID
- GET /items/{id}/cards - List all cards for an item

### Cards

- GET /cards - List all cards
- GET /cards/{id} - Get a specific card by ID

### Reviews

- POST /reviews - Record a review for a card

## Request/Response Formats

### Item Types

- Create Item Type (POST /item_types)
  - Request: { "name": "string" }
  - Response: { "id": "string", "name": "string", "created_at": "timestamp" }

### Items

- Create Item (POST /items)
  - Request: { "item_type_id": "string", "title": "string", "item_data": object|null }
  - Response: Full item object with ID, timestamps, etc.

### Reviews

- Create Review (POST /reviews)
  - Request: { "card_id": "string", "rating": number } (rating: 1-4)
  - Response: Review object with ID, timestamps, etc.

## System Architecture

This is a spaced repetition system (SRS) with these key components:

1. Item Types - Define categories of items to memorize (e.g., "Basic", "Vocabulary")
2. Items - The actual content to be memorized
    - Each item belongs to an item type
    - Items contain a title and optional JSON data
3. Cards - Generated automatically for each item
    - A single item can have multiple cards (questions)
    - Cards track review scheduling information
4. Reviews - Record user's memory performance for a card
    - Rating from 1-4 determines next review time
    - Updates the card with new scheduling information

The system implements a spaced repetition algorithm that schedules reviews at
increasing intervals based on user performance. When a user reviews a card and
rates how well they remembered it, the system automatically calculates when to
show that card again - longer intervals for well-remembered items and shorter
intervals for difficult ones.
