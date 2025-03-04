<!-- 
  File: src/routes/list/+page.svelte
  Description: The list mode page component that displays two sections: today's todos and completed todos. This view provides a traditional todo list interface showing multiple items at once.
  Related Files:
  - src/lib/components/TodoListItem.svelte
  - src/lib/components/AddTodoButton.svelte
  - src/lib/stores/todoStore.ts
  - src/routes/+layout.svelte
-->

<script lang="ts">
  import { todaysTodos, completedToday } from '$lib/stores/todoStore';
  import TodoListItem from '$lib/components/TodoListItem.svelte';
  import AddTodoButton from '$lib/components/AddTodoButton.svelte';
</script>

<svelte:head>
  <title>List Mode | IncrementalTodos</title>
</svelte:head>

<div class="list-mode">
  <section class="todo-section">
    <h2>Today's Todos</h2>
    
    {#if $todaysTodos.length > 0}
      <div class="todo-list">
        {#each [...$todaysTodos].sort((a, b) => (b.priority ?? 3) - (a.priority ?? 3)) as todo (todo.id)}
          <TodoListItem {todo} />
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <p>No todos scheduled for today. Add a new todo to get started!</p>
      </div>
    {/if}
  </section>
  
  <section class="todo-section">
    <h2>Completed Today</h2>
    
    {#if $completedToday.length > 0}
      <div class="todo-list completed-list">
        {#each $completedToday as todo (todo.id)}
          <TodoListItem {todo} />
        {/each}
      </div>
    {:else}
      <div class="empty-state">
        <p>No todos completed today yet. You can do it!</p>
      </div>
    {/if}
  </section>
  
  <AddTodoButton />
</div>

<style>
  .list-mode {
    position: relative;
  }
  
  .todo-section {
    margin-bottom: 32px;
  }
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    color: var(--text-primary);
    font-size: 20px;
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--border);
  }
  
  .todo-list {
    background-color: white;
    border-radius: 8px;
    border: 1px solid var(--border);
    overflow: hidden;
  }
  
  .empty-state {
    background-color: white;
    border-radius: 8px;
    border: 1px solid var(--border);
    padding: 24px;
    text-align: center;
    color: var(--text-secondary);
  }
  
  .empty-state p {
    margin: 0;
  }
</style> 
