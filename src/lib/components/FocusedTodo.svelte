<!-- 
  File: src/lib/components/FocusedTodo.svelte
  Description: A component that displays a single todo item in focus mode with full details and actions. It provides functionality for completing, deferring, updating priority, and deleting todos. Includes keyboard shortcuts for quick actions.
  Related Files:
  - src/routes/+page.svelte
  - src/lib/stores/todoStore.ts
  - src/lib/utils/priority.ts
-->

<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  import { onMount, onDestroy } from 'svelte';
  import { getPriorityColor } from '$lib/utils/priority';
  
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
  
  function deferTodo(days: number | string) {
    if (todo) {
      // Calculate delay multiplier based on priority
      // Priority 1 (low) = 1.5x delay
      // Priority 3 (medium) = 1x delay  
      // Priority 5 (high) = 0.75x delay
      const priorityMultiplier = todo.priority 
        ? 1.5 - ((todo.priority - 1) * 0.1875) 
        : 1;
      
      if (typeof days === 'number') {
        // Defer by a fixed number of days - this shouldn't be
        // affected by priority multiplier since we want the actual
        // deferred days to be the same as the displayed days
        todoStore.deferTodo(todo.id, days, 1.05);
      } else if (days === 'short') {
        todoStore.deferTodo(todo.id, todo.delayDays * priorityMultiplier, 1.2);
      } else if (days === 'long') {
        todoStore.deferTodo(todo.id, todo.delayDays * priorityMultiplier * 2, 1.5);
      }
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
          deferTodo('short');
        } else if (event.key === '4') {
          event.preventDefault();
          deferTodo('long');
        }
      }
    }
  }
  
  // Add and remove document event listeners
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
      if (months > 0) result += '<br>';
      // Don't show days if years are visible
    }
    
    if (months > 0) {
      result += `${months} ${months === 1 ? 'Month' : 'Months'}`;
      // Only show days if no years are present
      if (remainingDays > 0 && years === 0) result += '<br>';
    }
    
    // Only show days if no years are present
    if ((remainingDays > 0 && years === 0) || (years === 0 && months === 0)) {
      result += `${remainingDays} ${remainingDays === 1 ? 'Day' : 'Days'}`;
    }
    
    return result;
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
          <span class="priority-badge priority-indicator" style="--priority-color: {getPriorityColor(todo.priority)}">
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
                  {#each Array(5) as _, i}
                    <button 
                      class="priority-option priority-indicator" 
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
            1 Day
          </button>
          <button class="defer-btn" on:click={() => deferTodo(7)}>
            7 Days
          </button>
          <!-- Priority affects defer duration:
               Priority 1 (low) = 1.5x longer
               Priority 3 (med) = 1.0x base duration  
               Priority 5 (high) = 0.75x shorter -->
          <button class="defer-btn" on:click={() => deferTodo('short')}>
            {@html formatDeferDuration(Math.round(todo.delayDays * (todo.priority ? 1.5 - ((todo.priority - 1) * 0.1875) : 1) * 1.2))}
          </button>
          <button class="defer-btn" on:click={() => deferTodo('long')}>
            {@html formatDeferDuration(Math.round(todo.delayDays * (todo.priority ? 1.5 - ((todo.priority - 1) * 0.1875) : 1) * 2))}
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
    padding: var(--spacing-md);
  }
  
  .todo-card {
    background-color: var(--surface);
    border-radius: var(--border-radius-md);
    border: 1px solid var(--border);
    padding: var(--spacing-xl);
    width: 100%;
    max-width: 800px;
    position: relative;
  }
  
  .todo-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: var(--spacing-md);
  }
  
  h1 {
    margin: 0;
    font-size: var(--font-size-2xl);
    color: var(--text-primary);
    word-break: break-word;
    flex: 1;
    padding-right: var(--spacing-md);
    display: flex;
    align-items: center;
  }
  
  .menu-container {
    position: relative;
  }
  
  .menu-btn {
    width: 42px;
    height: 42px;
    border-radius: var(--border-radius-sm);
    background-color: var(--border);
    color: var(--text-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: none;
    padding: 0;
    flex-shrink: 0;
    transition: background-color var(--transition-fast);
  }
  
  .menu-btn:hover {
    background-color: var(--border-dark);
  }
  
  .hamburger-icon {
    font-size: 32px;
    line-height: 1;
  }
  
  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: var(--surface);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-md);
    min-width: 320px;
    z-index: 10;
    overflow: hidden;
  }
  
  .menu-item {
    display: block;
    width: 100%;
    text-align: left;
    padding: var(--spacing-md) var(--spacing-lg);
    background: none;
    border: none;
    border-bottom: 1px solid var(--border);
    cursor: pointer;
    font-size: var(--font-size-md);
    transition: background-color var(--transition-fast);
    color: var(--text-primary);
  }
  
  .menu-item:hover {
    background-color: var(--surface-hover);
  }
  
  .delete-item:hover {
    background-color: var(--danger-dark);
    color: var(--text-primary-dark);
  }
  
  .shortcut-hint {
    float: right;
    opacity: 0.7;
    font-size: var(--font-size-sm);
    margin-left: var(--spacing-md);
    padding: 4px 8px;
    background-color: var(--border);
    border-radius: var(--border-radius-sm);
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
    padding: var(--spacing-sm) var(--spacing-md);
    text-align: center;
    font-weight: 500;
    color: var(--danger);
    border-bottom: 1px solid var(--border);
  }
  
  .confirmation-buttons {
    display: flex;
    padding: var(--spacing-sm);
    gap: var(--spacing-sm);
  }
  
  .confirm-btn {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-size-sm);
    border-radius: var(--border-radius-sm);
  }
  
  .confirm-yes {
    background-color: var(--danger);
    color: var(--text-primary-dark);
  }
  
  .confirm-yes:hover {
    background-color: var(--danger-dark);
  }
  
  .confirm-no {
    background-color: var(--border);
    color: var(--text-primary);
  }
  
  .confirm-no:hover {
    background-color: var(--border-dark);
  }
  
  .priority-submenu {
    background-color: var(--surface);
    border-top: 1px solid var(--border);
    padding: var(--spacing-md);
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: var(--spacing-sm);
  }
  
  .priority-option.priority-indicator {
    width: 42px;
    height: 42px;
    cursor: pointer;
    border: none;
    font-size: var(--font-size-md);
    transition: opacity var(--transition-fast);
  }
  
  .priority-option:hover {
    opacity: 0.8;
  }
  
  .priority-badge.priority-indicator {
    display: inline-block;
    text-align: center;
    line-height: 42px;
    width: 42px;
    height: 42px;
    margin-right: var(--spacing-md);
    vertical-align: middle;
    position: relative;
    top: -1px;
  }
  
  .todo-dates {
    margin-bottom: var(--spacing-xl);
    color: var(--text-secondary);
  }
  
  .todo-dates p {
    margin: var(--spacing-sm) 0;
  }
  
  .todo-details {
    background-color: var(--surface-alt);
    border-radius: var(--border-radius-sm);
    border: 1px solid var(--border);
    padding: var(--spacing-md);
    margin-bottom: var(--spacing-xl);
  }
  
  .todo-details p {
    margin: 0;
    white-space: pre-wrap;
    color: var(--text-secondary);
  }
  
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  button {
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
    font-weight: 500;
    cursor: pointer;
    transition: background-color var(--transition-fast);
    border: none;
    font-size: var(--font-size-md);
  }
  
  .complete-btn {
    background-color: var(--success);
    color: var(--text-primary-dark);
  }
  
  .defer-buttons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--spacing-sm);
  }
  
  .defer-btn {
    background-color: var(--warning);
    color: white;
  }
  
  .complete-btn:hover {
    background-color: var(--success-dark);
  }
  
  .defer-btn:hover {
    background-color: var(--warning-dark);
  }
  
  .empty-state {
    text-align: center;
    color: var(--text-tertiary);
  }
  
  .empty-state h2 {
    font-size: var(--font-size-xl);
    margin-bottom: var(--spacing-sm);
  }
  
  @media (max-width: 600px) {
    .todo-card {
      padding: var(--spacing-md);
      max-width: 95%;
    }
    
    h1 {
      font-size: var(--font-size-xl);
    }
    
    .defer-buttons {
      grid-template-columns: 1fr 1fr;
      gap: var(--spacing-md);
    }
    
    .priority-submenu {
      grid-template-columns: repeat(5, 1fr);
      padding: var(--spacing-sm);
    }
  }
</style> 