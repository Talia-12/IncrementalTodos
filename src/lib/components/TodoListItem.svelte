<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  
  export let todo: Todo;
  
  function toggleComplete() {
    if (todo.completed) {
      // If already completed, we're uncompleting it
      todoStore.updateTodo(todo.id, { completed: false, completedAt: undefined });
    } else {
      todoStore.completeTodo(todo.id);
    }
  }
  
  // Format time to display in a readable format
  function formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
</script>

<div class="todo-list-item {todo.completed ? 'completed' : ''}">
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
</div>

<style>
  .todo-list-item {
    display: flex;
    align-items: flex-start;
    padding: var(--spacing-sm) var(--spacing-md);
    border-bottom: 1px solid var(--border);
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
    display: block;
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
  }
  
  .todo-title {
    display: flex;
    align-items: center;
    margin-bottom: var(--spacing-xs);
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
  }
  
  .todo-details {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    margin-bottom: var(--spacing-xs);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  .completed-at {
    font-size: var(--font-size-xs);
    color: var(--text-tertiary);
    font-style: italic;
  }
</style>

<script context="module">
  function getPriorityColor(priority: number): string {
    // Use CSS variables from global styles
    return `var(--priority-${priority}, #757575)`;
  }
</script> 