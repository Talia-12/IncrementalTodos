<!-- 
  File: src/lib/components/TodoListItem.svelte
  Description: A component that renders a single todo item in a list view. Shows the todo's title, details, priority indicator, and completion status with a checkbox. Used in list views of todos.
  Related Files:
  - src/routes/list/+page.svelte
  - src/lib/stores/todoStore.ts
  - src/lib/utils/priority.ts
  - src/lib/services/hippocampus/hippocampusService.ts
-->

<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  import { getPriorityColor } from '$lib/utils/priority';
	import { ReviewRating } from '$lib/services/hippocampus';
  
  export let todo: Todo;
  let deleteHovered = false;
 
  function toggleComplete() {
    todoStore.completeTodo(todo.id, todo.cardId, !todo.completed);
  }
  
  // Format time to display in a readable format
  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Function to delete todo
  function deleteTodo() {
    todoStore.deleteTodo(todo.id, todo.cardId);
  }
  
  // Format defer duration in a human-readable way
  function formatDeferDuration(days: number): string {
    if (days <= 0) return '0 Days';
    
    const years = Math.floor(days / 365);
    const remainingDaysAfterYears = days % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDays = Math.floor(remainingDaysAfterYears % 30);
    
    let result = '';
    
    if (years > 0) {
      result += `${years} ${years === 1 ? 'Year' : 'Years'}`;
      if (months > 0) result += ', ';
    }
    
    if (months > 0) {
      result += `${months} ${months === 1 ? 'Month' : 'Months'}`;
      if (remainingDays > 0) result += ', ';
    }
    
    if (remainingDays > 0 || (years === 0 && months === 0)) {
      result += `${remainingDays} ${remainingDays === 1 ? 'Day' : 'Days'}`;
    }
    
    return result;
  }

  // TODO: these will need to be updated at some point to use the actual
  // defer durations from the server
  // Calculate short and long defer durations
  const shortDeferDays = Math.round(todo.delayDays * (todo.priority ? 1.5 - ((todo.priority - 1) * 0.1875) : 1) * 1.2);
  const longDeferDays = Math.round(todo.delayDays * (todo.priority ? 1.5 - ((todo.priority - 1) * 0.1875) : 1) * 2);
  
  // Short and long defer strings
  const shortDeferString = formatDeferDuration(shortDeferDays);
  const longDeferString = formatDeferDuration(longDeferDays); 
</script>

<div class="todo-list-item {todo.completed ? 'completed' : ''} {deleteHovered ? 'delete-hover' : ''}">
  <label class="checkbox-container">
    <input 
      type="checkbox" 
      checked={todo.completed} 
      on:change={toggleComplete}
    />
    <span class="checkmark"></span>
  </label>
  
  <div class="todo-content">
    <div class="todo-title">
      {#if todo.priority !== undefined}
        <span 
          class="priority-indicator" 
          style="--priority-color: {getPriorityColor(todo.priority)}"
          title="Priority: {todo.priority}"
        ></span>
      {/if}
      <span class="title-text">{todo.title}</span>
    </div>
    
    {#if todo.details}
      <div class="todo-details">{todo.details}</div>
    {/if}
    
    {#if todo.completedAt}
      <div class="completed-at">
        Completed at {formatTime(todo.completedAt)}
      </div>
    {/if}
  </div>

  {#if !todo.completed}
  <div class="defer-buttons">
    <button class="defer-btn" on:click|stopPropagation={() => todoStore.deferTodo(todo.id, todo.cardId, ReviewRating.Again)} title="Defer 1 day">
      1d
    </button>
    <button class="defer-btn" on:click|stopPropagation={() => todoStore.deferTodo(todo.id, todo.cardId, ReviewRating.Hard)} title="Defer 7 days">
      7d
    </button>
    <button class="defer-btn" on:click|stopPropagation={() => todoStore.deferTodo(todo.id, todo.cardId, ReviewRating.Good)} title={shortDeferString}>
      →
    </button>
    <button class="defer-btn" on:click|stopPropagation={() => todoStore.deferTodo(todo.id, todo.cardId, ReviewRating.Easy)} title={longDeferString}>
      ⟶
    </button>
  </div>
  {:else}
  <div class="action-buttons">
    <button 
      class="delete-btn"
      on:click|stopPropagation={deleteTodo} 
      on:mouseenter={() => deleteHovered = true}
      on:mouseleave={() => deleteHovered = false}
      title="Delete todo"
    >
      Delete
    </button>
  </div>
  {/if}
</div>

<style>
  .todo-list-item {
    display: flex;
    align-items: center;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border);
    &:last-child {
      border-bottom: none;
    }
    transition: background-color var(--transition-fast);
  }
  
  .todo-list-item:hover {
    background-color: var(--surface-hover);
  }
  
  .todo-list-item.completed .todo-title .title-text {
    text-decoration: line-through;
    color: var(--text-tertiary);
  }
  
  .checkbox-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    margin-right: var(--spacing-md);
    cursor: pointer;
  }
  
  .checkbox-container input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }
  
  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 24px;
    width: 24px;
    background-color: var(--surface);
    border: 2px solid var(--border-dark);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-fast);
  }
  
  .checkbox-container:hover .checkmark {
    border-color: var(--primary);
  }
  
  .checkbox-container input:checked ~ .checkmark {
    background-color: var(--primary);
    border-color: var(--primary);
  }
  
  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
  }
  
  .checkbox-container input:checked ~ .checkmark:after {
    display: block;
  }
  
  .checkbox-container .checkmark:after {
    left: 8px;
    top: 4px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .todo-content {
    flex: 1;
    min-width: 0; /* Allow content to shrink below its minimum content size */
  }
  
  .todo-title {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-xs);
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .priority-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--priority-color, var(--border-dark));
    margin-right: var(--spacing-sm);
    flex-shrink: 0;
  }
  
  .title-text {
    font-weight: 500;
    color: var(--text-primary);
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .todo-details {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
    word-wrap: break-word;
    word-break: break-word;
  }
  
  .completed-at {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    font-style: italic;
  }

  .defer-buttons {
    display: flex;
    gap: var(--spacing-xs);
    margin-left: var(--spacing-md);
  }

  .defer-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .defer-btn:hover {
    background-color: var(--surface-hover);
    border-color: var(--border-hover);
    color: var(--text-hover);
  }
  
  .action-buttons {
    display: flex;
    gap: var(--spacing-xs);
    margin-left: var(--spacing-md);
  }
  
  .delete-btn {
    padding: var(--spacing-xs) var(--spacing-sm);
    background-color: var(--danger-dark);
    color: white;
    border: none;
    border-radius: var(--border-radius-sm);
    font-size: var(--font-size-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
  }
  
  .delete-btn:hover {
    background-color: var(--danger-dark);
    box-shadow: var(--shadow-md);
  }

  .todo-list-item.delete-hover {
    background-color: var(--danger);
    transition: background-color var(--transition-fast);
  }
</style> 