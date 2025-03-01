<script lang="ts">
  import { page } from '$app/stores';
  import AddTodoDialog from '$lib/components/AddTodoDialog.svelte';
  import { onMount, onDestroy } from 'svelte';
  
  let dialogOpen = false;
  
  function openDialog() {
    dialogOpen = true;
  }
  
  function handleDialogClose() {
    dialogOpen = false;
  }
  
  function handleKeydown(event: KeyboardEvent) {
    // Only trigger if not in an input field or textarea
    const target = event.target as HTMLElement;
    if (target && (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA')) {
      // "A" key to open Add Todo dialog
      if (event.key === 'a' || event.key === 'A') {
        event.preventDefault();
        openDialog();
      }
    }
  }
  
  function handleCustomEvent() {
    openDialog();
  }
  
  onMount(() => {
    document.addEventListener('keydown', handleKeydown);
    window.addEventListener('open-add-todo-dialog', handleCustomEvent);
  });
  
  onDestroy(() => {
    document.removeEventListener('keydown', handleKeydown);
    window.removeEventListener('open-add-todo-dialog', handleCustomEvent);
  });
</script>

<div class="app">
  <header>
    <div class="container">
      <h1>IncrementalTodos</h1>
      <nav>
        <a href="/" class:active={$page.url.pathname === '/'}>Focus Mode</a>
        <a href="/list" class:active={$page.url.pathname === '/list'}>List Mode</a>
      </nav>
    </div>
  </header>
  
  <main>
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<AddTodoDialog bind:open={dialogOpen} on:close={handleDialogClose} />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    background-color: #f5f5f5;
    color: #333;
    line-height: 1.6;
  }
  
  :global(*) {
    box-sizing: border-box;
  }
  
  .app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
  }
  
  header {
    background-color: #4a90e2;
    color: white;
    padding: 16px 0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
  
  nav {
    display: flex;
    gap: 16px;
  }
  
  nav a {
    color: white;
    text-decoration: none;
    padding: 8px 12px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }
  
  nav a:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  nav a.active {
    background-color: rgba(255, 255, 255, 0.2);
    font-weight: 500;
  }
  
  main {
    flex: 1;
    padding: 24px 0;
  }
  
  footer {
    background-color: #f1f1f1;
    color: #777;
    padding: 16px 0;
    text-align: center;
    font-size: 14px;
    border-top: 1px solid #ddd;
  }
  
  @media (max-width: 600px) {
    header .container {
      flex-direction: column;
      gap: 12px;
    }
    
    nav {
      width: 100%;
      justify-content: center;
    }
  }
</style> 