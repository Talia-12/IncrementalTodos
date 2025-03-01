<script lang="ts">
  import { todoStore, type Todo } from '../stores/todoStore';
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();
  
  export let open = false;
  
  let title = '';
  let details = '';
  let showAdvanced = false;
  let priority = 5;
  let dueDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format
  let mustBeCompletedBy: string | null = null;
  let mustBeCompletedOn: string | null = null;
  let isRecurring = false;
  let recurringPeriod: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily';
  let recurringInterval = 1;

  function handleSubmit() {
    if (!title.trim()) return;
    
    const newTodo: Omit<Todo, 'id' | 'createdAt' | 'completed'> = {
      title,
      dueDate: new Date(dueDate),
    };
    
    if (details) newTodo.details = details;
    
    if (showAdvanced) {
      newTodo.priority = priority;
      
      if (mustBeCompletedBy) {
        newTodo.mustBeCompletedBy = new Date(mustBeCompletedBy);
      }
      
      if (mustBeCompletedOn) {
        newTodo.mustBeCompletedOn = new Date(mustBeCompletedOn);
      }
      
      if (isRecurring) {
        newTodo.recurring = {
          period: recurringPeriod,
          interval: recurringInterval
        };
      }
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
    dueDate = new Date().toISOString().split('T')[0];
    mustBeCompletedBy = null;
    mustBeCompletedOn = null;
    isRecurring = false;
    recurringPeriod = 'daily';
    recurringInterval = 1;
  }
  
  function close() {
    open = false;
    dispatch('close');
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
</script>

{#if open}
  <div class="dialog-backdrop">
    <div class="dialog">
      <h2>Add New Todo</h2>
      
      <form on:submit|preventDefault={handleSubmit}>
        <div class="form-group">
          <label for="title">Todo Item *</label>
          <input 
            type="text" 
            id="title" 
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
        
        <div class="form-group">
          <label for="dueDate">Due Date</label>
          <input type="date" id="dueDate" bind:value={dueDate} required />
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
              <input 
                type="date" 
                id="mustBeCompletedBy" 
                bind:value={mustBeCompletedBy} 
                on:change={handleMustBeCompletedByChange}
              />
            </div>
            
            <div class="form-group">
              <label for="mustBeCompletedOn">Must Be Completed On</label>
              <input 
                type="date" 
                id="mustBeCompletedOn" 
                bind:value={mustBeCompletedOn}
                on:change={handleMustBeCompletedOnChange}
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
    background-color: white;
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
    color: #333;
  }
  
  .form-group {
    margin-bottom: 16px;
  }
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #555;
  }
  
  input[type="text"],
  input[type="date"],
  input[type="number"],
  textarea,
  select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
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
    color: #4a90e2;
    cursor: pointer;
    padding: 0;
    font-size: 14px;
    margin-bottom: 16px;
    text-decoration: underline;
  }
  
  .advanced-options {
    border-top: 1px solid #eee;
    padding-top: 16px;
    margin-top: 8px;
  }
  
  .recurring-options {
    margin-left: 16px;
    padding-left: 16px;
    border-left: 2px solid #eee;
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
    background-color: #f1f1f1;
    border: 1px solid #ddd;
    color: #555;
  }
  
  .add-btn {
    background-color: #4a90e2;
    border: 1px solid #3a80d2;
    color: white;
  }
  
  .cancel-btn:hover {
    background-color: #e5e5e5;
  }
  
  .add-btn:hover {
    background-color: #3a80d2;
  }
</style> 