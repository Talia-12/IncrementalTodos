# Hippocampus Integration

## Overview

This service connects our todo application with the Hippocampus spaced repetition system. It allows todos to be scheduled using spaced repetition algorithms, helping users review and complete tasks at optimal intervals.

## How It Works

- Todos are stored in Hippocampus and retrieved only when they're due
- When you defer a todo, it's rescheduled based on the rating you give it
- Completed todos are marked as suspended in Hippocampus
- Recurring todos automatically reappear according to their schedule

## Data Mapping

Here's how our todos map to Hippocampus concepts:

- Each todo becomes an **Item** in Hippocampus
- Each item has a **Card** that tracks when it should be shown next
- Todo properties (recurring, details, etc.) are stored as **ItemData**
- When you interact with a todo, a **Review** is created that affects its next appearance

## Service Components

- **HippocampusService**: Interface defining the operations
- **HippocampusServiceImpl**: Implementation for the real API
- **MockHippocampusService**: Test implementation
- **HippocampusServiceFactory**: Creates appropriate service instances

## Integration with TodoStore

The TodoStore works with Hippocampus by:
- Only storing currently due todos in memory
- Refreshing the todo list periodically from the server
- Syncing all actions (complete, defer, etc.) with Hippocampus

## Setup

The service requires:
- A Hippocampus API URL
- An optional API key for authentication