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
        {#each $todaysTodos as todo (todo.id)}
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
    color: #333;
    font-size: 20px;
    font-weight: 600;
    padding-bottom: 8px;
    border-bottom: 2px solid #eee;
  }
  
  .todo-list {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .empty-state {
    background-color: white;
    border-radius: 8px;
    padding: 24px;
    text-align: center;
    color: #888;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .empty-state p {
    margin: 0;
  }
</style> 