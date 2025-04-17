<!-- 
  File: src/routes/+layout.svelte
  Description: The root layout component that provides the application shell, including the header with navigation and the AddTodoDialog that can be opened from anywhere in the app. Also handles global keyboard shortcuts.
  Related Files:
  - src/lib/components/AddTodoDialog.svelte
  - src/routes/+page.svelte
  - src/routes/list/+page.svelte
  - src/app.css
-->

<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import AddTodoDialog from '$lib/components/AddTodoDialog.svelte';
  import { onMount, onDestroy } from 'svelte';
  import { initializeLogging } from '$lib/utils/logging';
  import { todoStore } from '$lib/stores/todoStore';
  import '../app.css';
  
  let dialogOpen = false;
  
  const routes = ['/', '/list', '/colour-demo'];
  
  function cycleRoute(direction: 'next' | 'prev') {
    const currentIndex = routes.indexOf($page.url.pathname);
    let nextIndex;
    
    if (direction === 'next') {
      nextIndex = currentIndex + 1 >= routes.length ? 0 : currentIndex + 1;
    } else {
      nextIndex = currentIndex - 1 < 0 ? routes.length - 1 : currentIndex - 1;
    }
    
    goto(routes[nextIndex]);
  }
  
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
      
      // Handle Ctrl+Tab cycle through routes
      if (event.key === 'Tab' && event.ctrlKey) {
        // Prevent the default behavior as early as possible
        event.stopPropagation();
        event.preventDefault();
        
        console.log('Cycling to next route'); 
        cycleRoute('next');
      }
    }
  }
  
  function handleCustomEvent() {
    openDialog();
  }
  
  onMount(() => {
    // Initialize logging as early as possible
    initializeLogging().catch(err => {
      console.error('Failed to initialize logging:', err);
    });
    
    // Use capture phase (true as third parameter) to intercept before browser defaults
    document.addEventListener('keydown', handleKeydown, true);
    window.addEventListener('open-add-todo-dialog', handleCustomEvent);
  });
  
  onDestroy(() => {
    // Make sure to remove the capture phase listener
    document.removeEventListener('keydown', handleKeydown, true);
    window.removeEventListener('open-add-todo-dialog', handleCustomEvent);
    
    // Clean up the todoStore
    todoStore.cleanup();
  });
</script>

<div class="app">
  <header>
    <div class="container">
      <h1>Incremental Todos</h1>
      <nav>
        <a href="/" class:active={$page.url.pathname === '/'}>Focus Mode</a>
        <a href="/list" class:active={$page.url.pathname === '/list'}>List Mode</a>
        <a href="/colour-demo" class:active={$page.url.pathname === '/colour-demo'}>Colour Demo</a>
      </nav>
    </div>
  </header>
  
  <main>
    <div class="container">
      <slot />
    </div>
  </main>
</div>

<AddTodoDialog bind:open={dialogOpen} onClose={handleDialogClose} />

<style>
  /* All styles are now in the global CSS file */
</style> 