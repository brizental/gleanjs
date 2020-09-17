<script>
  import { setContext } from "svelte";
  import { writable } from "svelte/store";
  import Home from "./Home.svelte";
  import Terms from "./Terms.svelte";
  import Survey from "./Survey.svelte";
  import Studies from "./Studies.svelte";

  // change the initial page value if you want to work on a single page design.
  const page = writable("home");
  setContext("page", page);
</script>

<style>
  main {
    align-self: start;
  }

  h1 {
    font-size: 1.5rem;
    padding: 0px;
    margin: 0px;
  }

  h1 span {
    font-weight: normal;
  }

  main {
    height: 100%;
    width: 800px;
    margin: auto;
  }

  :global(button) {
    padding: 0.5rem 1rem;
    background-color: hsl(190, 50%, 50%);
    color: white;
    border: none;
    border-radius: 0.5rem;
  }
</style>

<div id="app">
  <header>
    <h1>ClickMonkey<span>.biz</span></h1>
  </header>

  <main>
    {#if $page === 'home'}
      <Home />
    {:else if $page === 'terms'}
      <Terms />
    {:else if $page === 'survey'}
      <Survey />
    {:else}
      <Studies />
    {/if}
  </main>

  <footer>2020 ClickMonkey Group</footer>
</div>
