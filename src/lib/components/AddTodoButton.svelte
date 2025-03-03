<!-- 
  File: src/lib/components/AddTodoButton.svelte
  Description: A floating action button component that appears in the bottom-right corner of the screen. When clicked, it triggers the opening of the AddTodoDialog for creating new todo items.
  Related Files:
  - src/lib/components/AddTodoDialog.svelte
  - src/routes/+page.svelte
  - src/routes/+layout.svelte
-->

<script lang="ts">
  export let onOpenDialog = () => {};
  
  function openDialog() {
    onOpenDialog();
  }
</script>

<button class="add-todo-button" on:click={openDialog} aria-label="Add new todo">
  <svg xmlns="http://www.w3.org/2000/svg" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
</button>

<style>
  .add-todo-button {
    position: fixed;
    bottom: 48px;
    right: 48px;
    width: 168px;
    height: 168px;
    border-radius: 50%;
    background-color: var(--primary);
    color: var(--text-primary);
    border: none;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.2s;
    z-index: 100;
  }
  
  .add-todo-button:hover {
    background-color: var(--primary-dark);
    color: var(--text-primary-dark);
    transform: scale(1.05);
  }
  
  .add-todo-button:active {
    transform: scale(0.95);
  }
</style> 