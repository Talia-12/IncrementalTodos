# Hippocampus API Endpoints Summary

## Available Endpoints

### Item Types

- `GET /item_types` - List all item types
- `POST /item_types` - Create a new item type
- `GET /item_types/{id}` - Get a specific item type by ID
- `GET /item_types/{id}/items` - List all items of a specific type

### Items

- `GET /items` - List all items
- `POST /items` - Create a new item
- `GET /items/{id}` - Get a specific item by ID
- `GET /items/{id}/cards` - List all cards for an item

### Cards

- `GET /cards` - List all cards
- `GET /cards/{id}` - Get a specific card by ID
- `POST /cards/{id}/suspend` - Suspend a card (mark a todo as completed)

### Reviews

- `POST /reviews` - Record a review for a card

## Request/Response Formats

### Item Types

- Create Item Type (POST /item_types)
  - Request: `{ "name": "string" }`
  - Response: `{ "id": "string", "name": "string", "created_at": "timestamp" }`

### Items

- Create Item (POST /items)
  - Request: `{ "item_type_id": "string", "title": "string", "priority": number, "item_data": object|null }`
  - Response: Full item object with ID, timestamps, etc.

### Reviews

- Create Review (POST /reviews)
  - Request: `{ "card_id": "string", "rating": number }` (rating: 1-4)
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


## Todo App Integration

In the IncrementalTodos application, we use the Hippocampus API in the following ways:

1. **Initialization**: 
   - Create a "Todo" item type if it doesn't exist
   - This happens when the app starts

2. **Creating Todos**:
   - When a user creates a todo, we create an item in Hippocampus
   - Todo metadata is stored in the item_data field
   - A card is automatically created for scheduling

3. **Retrieving Due Todos**:
   - We periodically query for items with cards that are due
   - Only due todos are shown to the user

4. **Completing Todos**:
   - When a user completes a todo, we suspend its card
   - This removes it from the due items

5. **Deferring Todos**:
   - When a user defers a todo, we create a review
   - Review ratings determine the next review date:
     - Hard (2): Short deferral
     - Good (3): Medium deferral
     - Easy (4): Long deferral