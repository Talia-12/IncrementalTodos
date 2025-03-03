<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  import { onMount, onDestroy } from 'svelte';
  import Calendar from './Calendar.svelte';

  export let open = false;
  export let onClose = () => {};
  
  let title = '';
  let details = '';
  let showAdvanced = false;
  let priority = 5;
  let mustBeCompletedBy: Date | null = null;
  let mustBeCompletedOn: Date | null = null;
  let isRecurring = false;
  let recurringPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';
  let recurringInterval = 1;

  let titleInput: HTMLInputElement;

  function handleSubmit() {
    if (!title.trim()) return;
    
    const newTodo: Omit<Todo, 'id' | 'createdAt' | 'completed' | 'nextCheckDate' | 'delayDays'> = {
      title,
      priority,
    };
    
    if (details) newTodo.details = details;
    
      
    if (mustBeCompletedBy) {
      newTodo.mustBeCompletedBy = mustBeCompletedBy;
    }
    
    if (mustBeCompletedOn) {
      newTodo.mustBeCompletedOn = mustBeCompletedOn;
    }
    
    if (isRecurring) {
      newTodo.recurring = {
        period: recurringPeriod,
        interval: recurringInterval
      };
    }
    
    todoStore.addTodo(newTodo);
    resetForm();
    close();
  }
  
  function resetForm() {
    title = '';
    details = '';
    showAdvanced = false;
    priority = 5;
    mustBeCompletedBy = null;
    mustBeCompletedOn = null;
    isRecurring = false;
    recurringPeriod = 'daily';
    recurringInterval = 1;
  }
  
  function close() {
    open = false;
    onClose();
  }
  
  function toggleAdvanced() {
    showAdvanced = !showAdvanced;
  }
  
  // Ensure mutual exclusivity between "by" and "on" dates
  function handleMustBeCompletedByChange() {
    if (mustBeCompletedBy) {
      mustBeCompletedOn = null;
    }
  }
  
  function handleMustBeCompletedOnChange() {
    if (mustBeCompletedOn) {
      mustBeCompletedBy = null;
    }
  }
  
  // Handle keyboard shortcuts
  function handleKeydown(event: KeyboardEvent) {
    if (open) {
      // Escape key to close dialog
      if (event.key === 'Escape') {
        close();
      }
      
      // Ctrl+Enter to submit form
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (title.trim()) {
          handleSubmit();
        }
      }
    }
  }
  
  // Prevent form submission on Enter key
  function handleFormKeydown(event: KeyboardEvent) {
    if (!open) return;
    
    // Allow Enter in textarea but prevent form submission for other inputs
    if (event.key === 'Enter' && !(event.ctrlKey || event.metaKey) && 
        !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault();
    }
  }
  
  // Set up and clean up event listeners
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('keydown', handleFormKeydown);
    
    // Focus the title input when dialog opens
    if (open && titleInput) {
      titleInput.focus();
    }
  });
  
  // Watch for changes to open state
  $: if (open && titleInput) {
    // Use setTimeout to ensure DOM is updated
    setTimeout(() => titleInput.focus(), 0);
  }
  
  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
    document.removeEventListener('keydown', handleFormKeydown);
  });
</script>

{#if open}
  <div class="dialog-backdrop">
    <div class="dialog" role="dialog" aria-modal="true">
      <h2>Add New Todo</h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="title">Todo Item *</label>
          <input 
            type="text" 
            id="title" 
            bind:this={titleInput}
            bind:value={title} 
            placeholder="What needs to be done?" 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="details">Details (Optional)</label>
          <textarea 
            id="details" 
            bind:value={details} 
            placeholder="Any additional details..."
            rows="3"
          ></textarea>
        </div>
        
        <button type="button" class="toggle-advanced" on:click={toggleAdvanced}>
          {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
        </button>
        
        {#if showAdvanced}
          <div class="advanced-options">
            <div class="form-group">
              <label for="priority">Priority (1-10)</label>
              <input 
                type="range" 
                id="priority" 
                bind:value={priority} 
                min="1" 
                max="10" 
                step="1" 
              />
              <span class="priority-value">{priority}</span>
            </div>
            
            <div class="form-group">
              <label for="mustBeCompletedBy">Must Be Completed By</label>
              <Calendar 
                bind:value={mustBeCompletedBy}
                placeholder="Select completion date..."
                onChange={() => handleMustBeCompletedByChange()}
              />
            </div>
            
            <div class="form-group">
              <label for="mustBeCompletedOn">Must Be Completed On</label>
              <Calendar 
                bind:value={mustBeCompletedOn}
                placeholder="Select exact completion date..."
                onChange={() => handleMustBeCompletedOnChange()}
              />
            </div>
            
            <div class="form-group checkbox">
              <label>
                <input type="checkbox" bind:checked={isRecurring} />
                Recurring Todo
              </label>
            </div>
            
            {#if isRecurring}
              <div class="recurring-options">
                <div class="form-group">
                  <label for="recurringPeriod">Recurrence Period</label>
                  <select id="recurringPeriod" bind:value={recurringPeriod}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="recurringInterval">Every</label>
                  <input 
                    type="number" 
                    id="recurringInterval" 
                    bind:value={recurringInterval} 
                    min="1" 
                    max="365"
                  />
                  <span>{recurringPeriod.slice(0, -2)}{recurringInterval > 1 ? 's' : ''}</span>
                </div>
              </div>
            {/if}
          </div>
        {/if}
        
        <div class="dialog-actions">
          <button type="button" class="cancel-btn" on:click={close}>Cancel</button>
          <button type="submit" class="add-btn">Add Todo</button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  
  .dialog {
    background-color: var(--background);
    border-radius: 8px;
    padding: 24px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--text-primary);
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: var(--text-primary);
  }
  
  input[type="text"],
  input[type="number"],
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-size: 16px;
  }
  
  textarea {
    resize: vertical;
  }
  
  .checkbox {
    display: flex;
    align-items: center;
  }
  
  .checkbox label {
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  
  .checkbox input {
    margin-right: 8px;
    width: auto;
  }
  
  .toggle-advanced {
    background: none;
    border: none;
    color: var(--text-tertiary);
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    margin-bottom: 16px;
    text-decoration: underline;
  }
  
  .advanced-options {
    border-top: 1px solid var(--border);
    padding-top: 16px;
    margin-top: 8px;
  }
  
  .recurring-options {
    margin-left: 16px;
    padding-left: 16px;
    border-left: 2px solid var(--border);
  }
  
  .priority-value {
    margin-left: 8px;
    font-weight: bold;
  }
  
  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 24px;
  }
  
  button {
    padding: 10px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .cancel-btn {
    background-color: var(--background-secondary-hsl1);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }
  
  .add-btn {
    background-color: var(--primary);
    border: 1px solid var(--primary-dark);
    color: var(--text-primary);
  }
  
  .cancel-btn:hover {
    background-color: var(--background-secondary-hsl1);
  }
  
  .add-btn:hover {
    background-color: var(--primary-dark);
    color: var(--text-primary-dark);
  }
</style> 