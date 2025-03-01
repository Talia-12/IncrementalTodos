<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  
  export let todo: Todo | null = null;
  let menuOpen = false;
  let priorityMenuOpen = false;
  let deleteConfirmation = false;
  
  function completeTodo() {
    if (todo) {
      todoStore.completeTodo(todo.id);
    }
  }
  
  function deleteTodo() {
    if (todo) {
      todoStore.deleteTodo(todo.id);
      closeMenu();
    }
  }
  
  function showDeleteConfirmation() {
    deleteConfirmation = true;
  }
  
  function cancelDelete() {
    deleteConfirmation = false;
  }
  
  function deferTodo(days: number) {
    if (todo) {
      todoStore.deferTodo(todo.id, days);
    }
  }
  
  function updatePriority(priority: number) {
    if (todo) {
      todoStore.updateTodo(todo.id, { priority });
      closeMenu();
    }
  }
  
  function toggleMenu() {
    menuOpen = !menuOpen;
    if (!menuOpen) {
      priorityMenuOpen = false;
      deleteConfirmation = false;
    }
  }
  
  function togglePriorityMenu(event: Event) {
    event.stopPropagation();
    priorityMenuOpen = !priorityMenuOpen;
  }
  
  function closeMenu() {
    menuOpen = false;
    priorityMenuOpen = false;
    deleteConfirmation = false;
  }
  
  // Handle document clicks to close the menu
  function handleDocumentClick(event: MouseEvent) {
    if (menuOpen && !event.defaultPrevented) {
      const target = event.target as HTMLElement;
      // Close menu if click is outside the menu
      if (!target.closest('.menu-container')) {
        closeMenu();
      }
    }
  }
  
  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    // Only process if not in an input field or textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
      // Escape key to close menu
      if (event.key === 'Escape' && menuOpen) {
        closeMenu();
      }
      
      // Ctrl+Delete to show delete confirmation
      if (event.key === 'Delete' && event.ctrlKey && todo) {
        event.preventDefault();
        menuOpen = true;
        priorityMenuOpen = false;
        showDeleteConfirmation();
      }
      
      // Enter key to confirm deletion when delete confirmation is shown
      if (event.key === 'Enter' && menuOpen && deleteConfirmation) {
        event.preventDefault();
        deleteTodo();
      }
      
      // Only process other shortcuts if menu is not open
      if (!menuOpen && todo) {
        // Space key to complete todo
        if (event.key === ' ' || event.key === 'Spacebar') {
          event.preventDefault();
          completeTodo();
        }
        
        // Number keys 1-4 for defer buttons
        if (event.key === '1') {
          event.preventDefault();
          deferTodo(1); // Defer 1 day
        } else if (event.key === '2') {
          event.preventDefault();
          deferTodo(7); // Defer 7 days
        } else if (event.key === '3') {
          event.preventDefault();
          deferTodo(14); // Defer 14 days
        } else if (event.key === '4') {
          event.preventDefault();
          deferTodo(30); // Defer 30 days
        }
      }
    }
  }
  
  // Add and remove document event listeners
  import { onMount, onDestroy } from 'svelte';
  
  onMount(() => {
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('keydown', handleKeydown);
  });
  
  onDestroy(() => {
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('keydown', handleKeydown);
  });
  
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

<div class="focused-todo-container" 
  role="region"
  aria-label="Todo details"
>
  {#if todo}
    <div class="todo-card">
      <div class="todo-header">
        <h1>
          <span class="priority-badge" style="--priority-color: {getPriorityColor(todo.priority)}">
            {todo.priority}
          </span>

          {todo.title}
        </h1>
        
        <div class="menu-container">
          <button class="menu-btn" on:click|stopPropagation={toggleMenu} aria-label="Menu">
            <span class="hamburger-icon">☰</span>
          </button>
          
          {#if menuOpen}
            <div 
              class="dropdown-menu" 
              on:click|stopPropagation={() => {}}
              on:keydown|stopPropagation={(e) => {
                // Handle Escape key to close menu
                if (e.key === 'Escape') {
                  closeMenu();
                }
                // Handle Enter key to confirm deletion when delete confirmation is shown
                if (e.key === 'Enter' && deleteConfirmation) {
                  deleteTodo();
                }
              }}
              role="menu"
              tabindex="-1"
            >
              {#if !deleteConfirmation}
                <button class="menu-item delete-item" on:click={showDeleteConfirmation}>
                  Delete Todo <span class="shortcut-hint">Ctrl+Del</span>
                </button>
                <button class="menu-item priority-item" on:click={togglePriorityMenu}>
                  Update Priority {priorityMenuOpen ? '▲' : '▼'}
                </button>
              {:else}
                <div class="confirmation-message">
                  Are you sure? <span class="shortcut-hint">Press Enter to confirm</span>
                </div>
                <div class="confirmation-buttons">
                  <button 
                    class="confirm-btn confirm-yes" 
                    on:click={deleteTodo}
                    tabindex="0"
                    aria-label="Yes, delete this todo"
                  >
                    Yes, Delete
                  </button>
                  <button 
                    class="confirm-btn confirm-no" 
                    on:click={cancelDelete}
                    tabindex="0"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                </div>
              {/if}
              
              {#if priorityMenuOpen && !deleteConfirmation}
                <div class="priority-submenu">
                  {#each Array(10) as _, i}
                    <button 
                      class="priority-option" 
                      style="--priority-color: {getPriorityColor(i+1)}"
                      on:click={() => updatePriority(i+1)}
                    >
                      {i+1}
                    </button>
                  {/each}
                </div>
              {/if}
            </div>
          {/if}
        </div>
      </div>
      
      <div class="todo-dates">      
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
          <p>{todo.details}</p>
        </div>
      {/if}
      
      <div class="action-buttons">
        <button class="complete-btn" on:click={completeTodo}>
          Complete
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
    position: relative;
  }
  
  .todo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16px;
  }
  
  h1 {
    margin: 0;
    font-size: 28px;
    color: #333;
    word-break: break-word;
    flex: 1;
    padding-right: 16px;
    display: flex;
    align-items: center;
  }
  
  .menu-container {
    position: relative;
  }
  
  .menu-btn {
    width: 32px;
    height: 32px;
    border-radius: 4px;
    background-color: #f1f1f1;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    padding: 0;
    flex-shrink: 0;
    transition: background-color 0.2s;
  }
  
  .menu-btn:hover {
    background-color: #e0e0e0;
  }
  
  .hamburger-icon {
    font-size: 18px;
    line-height: 1;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 180px;
    z-index: 10;
    overflow: hidden;
  }
  
  .menu-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: 10px 16px;
    background: none;
    border: none;
    border-bottom: 1px solid #f1f1f1;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.2s;
  }
  
  .menu-item:hover {
    background-color: #f9f9f9;
  }
  
  .delete-item:hover {
    background-color: #ffebee;
    color: #d32f2f;
  }
  
  .shortcut-hint {
    float: right;
    opacity: 0.7;
    font-size: 12px;
    margin-left: 8px;
    padding: 2px 4px;
    background-color: #f1f1f1;
    border-radius: 3px;
  }
  
  .confirmation-message .shortcut-hint {
    float: none;
    display: block;
    margin-top: 5px;
    font-size: 11px;
    font-weight: normal;
    text-align: center;
    background-color: transparent;
  }
  
  .confirmation-message {
    padding: 12px 16px;
    text-align: center;
    font-weight: 500;
    color: #d32f2f;
    border-bottom: 1px solid #f1f1f1;
  }
  
  .confirmation-buttons {
    display: flex;
    padding: 8px;
    gap: 8px;
  }
  
  .confirm-btn {
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    border-radius: 4px;
  }
  
  .confirm-yes {
    background-color: #d32f2f;
    color: white;
  }
  
  .confirm-yes:hover {
    background-color: #b71c1c;
  }
  
  .confirm-no {
    background-color: #f1f1f1;
    color: #333;
  }
  
  .confirm-no:hover {
    background-color: #e0e0e0;
  }
  
  .priority-submenu {
    background-color: white;
    border-top: 1px solid #f1f1f1;
    padding: 8px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 4px;
  }
  
  .priority-option {
    width: 30px;
    height: 30px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--priority-color, #f1f1f1);
    color: white;
    font-weight: bold;
    cursor: pointer;
    border: none;
    font-size: 12px;
    transition: opacity 0.2s;
  }
  
  .priority-option:hover {
    opacity: 0.8;
  }
  
  .priority-badge {
    display: inline-block;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: var(--priority-color, #f1f1f1);
    color: white;
    font-weight: bold;
    text-align: center;
    line-height: 24px;
    font-size: 14px;
    margin-right: 8px;
    vertical-align: middle;
    position: relative;
    top: 1px;
  }
  
  .priority-display {
    display: flex;
    align-items: center;
    gap: 8px;
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
    
    .priority-submenu {
      grid-template-columns: repeat(5, 1fr);
    }
  }
</style>

<script context="module">
  function getPriorityColor(priority: number): string {
    // New color scheme with better contrast for white text
    // Uses a blue-to-green-to-orange-to-red gradient that avoids low-contrast yellows
    const colors = {
      1: '#4caf50', // Green - low priority
      2: '#2e7d32', // Darker green
      3: '#1976d2', // Blue
      4: '#0d47a1', // Darker blue
      5: '#5e35b1', // Purple - medium priority
      6: '#4a148c', // Darker purple
      7: '#e65100', // Dark orange
      8: '#ff5722', // Bright orange
      9: '#d32f2f', // Bright red
      10: '#b71c1c'  // Dark red - high priority
    };
    
    return colors[priority as keyof typeof colors] || '#757575';
  }
</script> 