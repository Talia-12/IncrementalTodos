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
    padding: 12px 16px;
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s;
  }
  
  .todo-list-item:hover {
    background-color: #f9f9f9;
  }
  
  .todo-list-item.completed .todo-title .title-text {
    text-decoration: line-through;
    color: #888;
  }
  
  .checkbox-container {
    position: relative;
    display: block;
    min-width: 24px;
    height: 24px;
    margin-right: 16px;
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
    background-color: #fff;
    border: 2px solid #ddd;
    border-radius: 4px;
    transition: all 0.2s;
  }
  
  .checkbox-container:hover .checkmark {
    border-color: #4a90e2;
  }
  
  .checkbox-container input:checked ~ .checkmark {
    background-color: #4a90e2;
    border-color: #4a90e2;
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
    margin-bottom: 4px;
  }
  
  .priority-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: var(--priority-color, #ccc);
    margin-right: 8px;
    flex-shrink: 0;
  }
  
  .title-text {
    font-weight: 500;
    color: #333;
  }
  
  .todo-details {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
  
  .completed-at {
    font-size: 12px;
    color: #888;
    font-style: italic;
  }
</style>

<script context="module">
  function getPriorityColor(priority: number): string {
    const colors = {
      1: '#8bc34a', // Light green
      2: '#aed581',
      3: '#cddc39', // Lime
      4: '#dce775',
      5: '#ffeb3b', // Yellow
      6: '#ffd54f',
      7: '#ffc107', // Amber
      8: '#ffb74d',
      9: '#ff9800', // Orange
      10: '#f44336' // Red
    };
    
    return colors[priority as keyof typeof colors] || '#757575';
  }
</script> 