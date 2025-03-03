<!-- 
  File: src/routes/+page.svelte
  Description: The main focus mode page component that displays a single todo item at a time. This is the default landing page of the application that shows the most important/urgent todo item that needs attention.
  Related Files:
  - src/lib/components/FocusedTodo.svelte
  - src/lib/components/AddTodoButton.svelte
  - src/lib/stores/todoStore.ts
  - src/routes/+layout.svelte
-->

<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { getNextFocusTodo, todoStore, type Todo } from '$lib/stores/todoStore';
  import FocusedTodo from '$lib/components/FocusedTodo.svelte';
  import AddTodoButton from '$lib/components/AddTodoButton.svelte';
  
  let currentTodo: Todo | null = null;
  let unsubscribe: () => void;
  
  function updateCurrentTodo() {
    currentTodo = getNextFocusTodo();
  }
  
  function handleOpenDialog() {
    // Dispatch a custom event that the layout will listen for
    const event = new CustomEvent('open-add-todo-dialog');
    window.dispatchEvent(event);
  }
  
  onMount(() => {
    updateCurrentTodo();
    
    // Subscribe to the todoStore to update the current todo whenever the store changes
    unsubscribe = todoStore.subscribe(() => {
      updateCurrentTodo();
    });
    
    // Set up an interval to check for new todos every minute
    const interval = setInterval(updateCurrentTodo, 60000);
    
    return () => {
      clearInterval(interval);
      if (unsubscribe) unsubscribe();
    };
  });
</script>

<svelte:head>
  <title>Focus Mode | IncrementalTodos</title>
</svelte:head>

<div class="focus-mode">
  <FocusedTodo bind:todo={currentTodo} />
  <AddTodoButton onOpenDialog={handleOpenDialog} />
</div>

<style>
  .focus-mode {
    position: relative;
    min-height: calc(100vh - 200px);
  }
</style>
