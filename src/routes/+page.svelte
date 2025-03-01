<script lang="ts">
  import { onMount } from 'svelte';
  import { getNextFocusTodo, type Todo } from '$lib/stores/todoStore';
  import FocusedTodo from '$lib/components/FocusedTodo.svelte';
  import AddTodoButton from '$lib/components/AddTodoButton.svelte';
  
  let currentTodo: Todo | null = null;
  
  function updateCurrentTodo() {
    currentTodo = getNextFocusTodo();
  }
  
  onMount(() => {
    updateCurrentTodo();
    
    // Set up an interval to check for new todos every minute
    const interval = setInterval(updateCurrentTodo, 60000);
    
    return () => {
      clearInterval(interval);
    };
  });
</script>

<svelte:head>
  <title>Focus Mode | IncrementalTodos</title>
</svelte:head>

<div class="focus-mode">
  <FocusedTodo bind:todo={currentTodo} />
  <AddTodoButton />
</div>

<style>
  .focus-mode {
    position: relative;
    min-height: calc(100vh - 200px);
  }
</style>
