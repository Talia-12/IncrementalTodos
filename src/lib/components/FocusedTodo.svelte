<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  
  export let todo: Todo | null = null;
  
  function completeTodo() {
    if (todo) {
      todoStore.completeTodo(todo.id);
    }
  }
  
  function deleteTodo() {
    if (todo) {
      todoStore.deleteTodo(todo.id);
    }
  }
  
  function deferTodo(days: number) {
    if (todo) {
      todoStore.deferTodo(todo.id, days);
    }
  }
  
  // Format date to display in a readable format
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
</script>

<div class="focused-todo-container">
  {#if todo}
    <div class="todo-card">
      <div class="todo-header">
        <h1>{todo.title}</h1>
        {#if todo.priority !== undefined}
          <span class="priority-badge" style="--priority-color: {getPriorityColor(todo.priority)}">
            Priority: {todo.priority}
          </span>
        {/if}
      </div>
      
      <div class="todo-dates">
        <p>Due: <strong>{formatDate(todo.nextCheckDate)}</strong></p>
        
        {#if todo.mustBeCompletedBy}
          <p>Must be completed by: <strong>{formatDate(todo.mustBeCompletedBy)}</strong></p>
        {/if}
        
        {#if todo.mustBeCompletedOn}
          <p>Must be completed on: <strong>{formatDate(todo.mustBeCompletedOn)}</strong></p>
        {/if}
        
        {#if todo.recurring}
          <p>
            Recurring: Every {todo.recurring.interval} 
            {todo.recurring.period.slice(0, -2)}{todo.recurring.interval > 1 ? 's' : ''}
          </p>
        {/if}
      </div>
      
      {#if todo.details}
        <div class="todo-details">
          <h3>Details</h3>
          <p>{todo.details}</p>
        </div>
      {/if}
      
      <div class="action-buttons">
        <button class="complete-btn" on:click={completeTodo}>
          Complete
        </button>
        
        <button class="delete-btn" on:click={deleteTodo}>
          Delete
        </button>
        
        <div class="defer-buttons">
          <button class="defer-btn" on:click={() => deferTodo(1)}>
            Defer 1 Day
          </button>
          <button class="defer-btn" on:click={() => deferTodo(7)}>
            Defer 7 Days
          </button>
          <button class="defer-btn" on:click={() => deferTodo(14)}>
            Defer 14 Days
          </button>
          <button class="defer-btn" on:click={() => deferTodo(30)}>
            Defer 30 Days
          </button>
        </div>
      </div>
    </div>
  {:else}
    <div class="empty-state">
      <h2>No todos for today!</h2>
      <p>Add a new todo to get started.</p>
    </div>
  {/if}
</div>

<style>
  .focused-todo-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 100px);
    padding: 20px;
  }
  
  .todo-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 32px;
    width: 100%;
    max-width: 600px;
  }
  
  .todo-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  
  h1 {
    margin: 0;
    font-size: 28px;
    color: #333;
    word-break: break-word;
  }
  
  .priority-badge {
    padding: 4px 8px;
    border-radius: 4px;
    font-weight: bold;
    background-color: var(--priority-color, #f1f1f1);
    color: white;
  }
  
  .todo-dates {
    margin-bottom: 24px;
    color: #555;
  }
  
  .todo-dates p {
    margin: 8px 0;
  }
  
  .todo-details {
    background-color: #f9f9f9;
    border-radius: 4px;
    padding: 16px;
    margin-bottom: 24px;
  }
  
  .todo-details h3 {
    margin-top: 0;
    margin-bottom: 8px;
    color: #333;
  }
  
  .todo-details p {
    margin: 0;
    white-space: pre-wrap;
    color: #555;
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  button {
    padding: 12px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
    border: none;
    font-size: 16px;
  }
  
  .complete-btn {
    background-color: #4caf50;
    color: white;
  }
  
  .delete-btn {
    background-color: #f44336;
    color: white;
  }
  
  .defer-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
  }
  
  .defer-btn {
    background-color: #ff9800;
    color: white;
  }
  
  .complete-btn:hover {
    background-color: #3d8b40;
  }
  
  .delete-btn:hover {
    background-color: #d32f2f;
  }
  
  .defer-btn:hover {
    background-color: #f57c00;
  }
  
  .empty-state {
    text-align: center;
    color: #777;
  }
  
  .empty-state h2 {
    font-size: 24px;
    margin-bottom: 8px;
  }
  
  @media (max-width: 600px) {
    .todo-card {
      padding: 20px;
    }
    
    h1 {
      font-size: 24px;
    }
    
    .defer-buttons {
      grid-template-columns: 1fr 1fr;
    }
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