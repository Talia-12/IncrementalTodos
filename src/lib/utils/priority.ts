/*
  File: src/lib/utils/priority.ts
  Description: A utility function that maps todo priority levels to their corresponding CSS color variables. Used to provide consistent color coding for priority indicators across the application.
  Related Files:
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/TodoListItem.svelte
  - src/lib/components/AddTodoDialog.svelte
  - src/app.css
*/

export function getPriorityColor(priority: number): string {
  // Use CSS variables from global styles
  return `var(--priority-${priority}, #757575)`;
} 