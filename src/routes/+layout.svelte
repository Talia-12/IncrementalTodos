<script lang="ts">
  import { page } from '$app/stores';
  import AddTodoDialog from '$lib/components/AddTodoDialog.svelte';
  import { onMount, onDestroy } from 'svelte';
  import '../app.css';
  
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