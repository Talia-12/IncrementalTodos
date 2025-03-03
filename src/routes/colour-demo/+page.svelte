<script lang="ts">
  // Color categories from peach.css
  const colorCategories = [
    {
      title: "Base Colors",
      description: "Used for backgrounds in accented color areas",
      colors: [
        { name: "Grey", variable: "--color-grey-base-hsl1" },
        { name: "Red", variable: "--color-red-base-hsl1" },
        { name: "Orange", variable: "--color-orange-base-hsl1" },
        { name: "Yellow", variable: "--color-yellow-base-hsl1" },
        { name: "Green", variable: "--color-green-base-hsl1" },
        { name: "Mint", variable: "--color-mint-base-hsl1" },
        { name: "Cyan", variable: "--color-cyan-base-hsl1" },
        { name: "Blue", variable: "--color-blue-base-hsl1" },
        { name: "Purple", variable: "--color-purple-base-hsl1" },
        { name: "Pink", variable: "--color-pink-base-hsl1" }
      ]
    },
    {
      title: "Tint Colors",
      description: "Used for borders in accented color areas",
      colors: [
        { name: "Grey", variable: "--color-grey-tint-hsl1" },
        { name: "Red", variable: "--color-red-tint-hsl1" },
        { name: "Orange", variable: "--color-orange-tint-hsl1" },
        { name: "Yellow", variable: "--color-yellow-tint-hsl1" },
        { name: "Green", variable: "--color-green-tint-hsl1" },
        { name: "Mint", variable: "--color-mint-tint-hsl1" },
        { name: "Cyan", variable: "--color-cyan-tint-hsl1" },
        { name: "Blue", variable: "--color-blue-tint-hsl1" },
        { name: "Purple", variable: "--color-purple-tint-hsl1" },
        { name: "Pink", variable: "--color-pink-tint-hsl1" }
      ]
    },
    {
      title: "Text Colors",
      description: "Used for text in accented color areas and syntax highlighting",
      colors: [
        { name: "Grey", variable: "--color-grey-text-hsl1" },
        { name: "Red", variable: "--color-red-text-hsl1" },
        { name: "Orange", variable: "--color-orange-text-hsl1" },
        { name: "Yellow", variable: "--color-yellow-text-hsl1" },
        { name: "Green", variable: "--color-green-text-hsl1" },
        { name: "Mint", variable: "--color-mint-text-hsl1" },
        { name: "Cyan", variable: "--color-cyan-text-hsl1" },
        { name: "Blue", variable: "--color-blue-text-hsl1" },
        { name: "Purple", variable: "--color-purple-text-hsl1" },
        { name: "Pink", variable: "--color-pink-text-hsl1" }
      ]
    },
    {
      title: "UI Text Colors",
      description: "Different shades of text used in the editor and UI",
      colors: [
        { name: "Normal", variable: "--text-normal-hsl1" },
        { name: "Muted", variable: "--text-muted-hsl1" },
        { name: "Faint", variable: "--text-faint-hsl1" }
      ]
    },
    {
      title: "Background Colors",
      description: "UI background colors",
      colors: [
        { name: "Primary", variable: "--background-primary-hsl1" },
        { name: "Primary Alt", variable: "--background-primary-alt-hsl1" },
        { name: "Secondary", variable: "--background-secondary-hsl1" },
        { name: "Secondary Blur", variable: "--background-secondary-blur-hsl1" },
        { name: "Secondary Alt", variable: "--background-secondary-alt-hsl1" }
      ]
    },
    {
      title: "Shadow Colors",
      description: "Used for shadows in modals and popups",
      colors: [
        { name: "Shadow Color", variable: "--shadow-color-hsl1" }
      ]
    }
  ];
  
  // Theme examples
  const themeExamples = [
    {bg: "--color-blue-base-hsl1", border: "--color-blue-tint-hsl1", text: "--color-blue-text-hsl1", name: "Blue Theme"},
    {bg: "--color-green-base-hsl1", border: "--color-green-tint-hsl1", text: "--color-green-text-hsl1", name: "Green Theme"},
    {bg: "--color-purple-base-hsl1", border: "--color-purple-tint-hsl1", text: "--color-purple-text-hsl1", name: "Purple Theme"},
    {bg: "--color-pink-base-hsl1", border: "--color-pink-tint-hsl1", text: "--color-pink-text-hsl1", name: "Pink Theme"},
    {bg: "--color-orange-base-hsl1", border: "--color-orange-tint-hsl1", text: "--color-orange-text-hsl1", name: "Orange Theme"}
  ];
  
  // Function to copy CSS variable to clipboard
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert(`Copied ${text} to clipboard!`);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  }
</script>

<svelte:head>
  <title>Color Demo | IncrementalTodos</title>
</svelte:head>

<div class="color-demo">
  <h1>Peach.css Color Demo</h1>
  <p class="description">Click on any color to copy its CSS variable name to clipboard.</p>
  
  {#each colorCategories as category}
    <section class="color-category">
      <h2>{category.title}</h2>
      <p>{category.description}</p>
      
      <div class="color-grid">
        {#each category.colors as color}
          <div class="color-item">
            <button 
              class="color-box" 
              style="background-color: var({color.variable});" 
              on:click={() => copyToClipboard(color.variable)}
              title="Click to copy {color.variable}"
            ></button>
            <div class="color-info">
              <span class="color-name">{color.name}</span>
              <span class="color-variable">{color.variable}</span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/each}
  
  <section class="color-combinations">
    <h2>Color Combination Examples</h2>
    <p>Here are some practical examples of color combinations:</p>
    
    <div class="example-cards">
      {#each themeExamples as { bg, border, text, name }}
        <div class="example-card" style="background-color: var({bg}); border-color: var({border});">
          <h3 style="color: var({text});">{name}</h3>
          <p style="color: var({text});">This is sample text showing how colors look together. The background uses the base color, the border uses the tint color, and the text uses the text color.</p>
        </div>
      {/each}
    </div>
  </section>
  
  <section class="ui-examples">
    <h2>UI Component Examples</h2>
    
    <div class="ui-components">
      <div class="ui-component" style="background-color: var(--background-primary-hsl1);">
        <h3 style="color: var(--text-normal-hsl1);">Primary Background</h3>
        <p style="color: var(--text-muted-hsl1);">This shows text on primary background.</p>
        <p style="color: var(--text-faint-hsl1);">This is faint text on primary background.</p>
      </div>
      
      <div class="ui-component" style="background-color: var(--background-secondary-hsl1);">
        <h3 style="color: var(--text-normal-hsl1);">Secondary Background</h3>
        <p style="color: var(--text-muted-hsl1);">This shows text on secondary background.</p>
        <p style="color: var(--text-faint-hsl1);">This is faint text on secondary background.</p>
      </div>
    </div>
  </section>
</div>

<style>
  .color-demo {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }
  
  h1 {
    margin-bottom: 0.5rem;
  }
  
  .description {
    margin-bottom: 2rem;
    color: var(--text-muted-hsl1);
  }
  
  .color-category {
    margin-bottom: 3rem;
  }
  
  .color-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1.5rem;
    margin-top: 1rem;
  }
  
  .color-item {
    display: flex;
    flex-direction: column;
  }
  
  .color-box {
    width: 100%;
    height: 80px;
    border-radius: 8px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    cursor: pointer;
    transition: transform 0.2s;
  }
  
  .color-box:hover {
    transform: scale(1.05);
  }
  
  .color-info {
    margin-top: 0.5rem;
  }
  
  .color-name {
    display: block;
    font-weight: bold;
  }
  
  .color-variable {
    display: block;
    font-size: 0.8rem;
    color: var(--text-muted-hsl1);
    font-family: monospace;
  }
  
  .example-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .example-card {
    padding: 1.5rem;
    border-radius: 8px;
    border-width: 2px;
    border-style: solid;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .ui-components {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-top: 1.5rem;
  }
  
  .ui-component {
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
</style> 