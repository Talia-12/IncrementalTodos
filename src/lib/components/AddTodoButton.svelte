<script lang="ts">
  import AddTodoDialog from './AddTodoDialog.svelte';
  
  let dialogOpen = false;
  
  function openDialog() {
    dialogOpen = true;
  }
  
  function handleDialogClose() {
    dialogOpen = false;
  }
</script>

<button class="add-todo-button" on:click={openDialog} aria-label="Add new todo">
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
</button>

<AddTodoDialog bind:open={dialogOpen} on:close={handleDialogClose} />

<style>
  .add-todo-button {
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background-color: #4a90e2;
    color: white;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    z-index: 100;
  }
  
  .add-todo-button:hover {
    background-color: #3a80d2;
    transform: scale(1.05);
  }
  
  .add-todo-button:active {
    transform: scale(0.95);
  }
</style> 