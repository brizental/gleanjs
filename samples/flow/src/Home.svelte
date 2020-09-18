<script>
  import GleanMetrics from './metrics.js';
  import { getContext } from "svelte";
  import { fly } from "svelte/transition";
  const page = getContext("page");
</script>

<style>
  section {
    padding: 12rem 0rem;
  }

  div {
    font-size: 2.5rem;
    color: #444;
    text-align: center;
  }

  button {
    border-radius: 0rem;
    font-size: 2rem;
    padding: 1rem 2rem;
    margin: auto;
    margin-top: 2rem;
    display: block;
    box-shadow: 0.25rem 0.25rem 0rem hsl(217, 80%, 90%);
    cursor: pointer;
    transition: background-color 100ms, transform 1000ms;
  }

  button:hover {
    background-color: hsl(217, 80%, 70%);
    transform: scale(1.05);
  }
</style>

<section
  out:fly={{ duration: 300, y: 5 }}
  in:fly={{ duration: 300, y: 5, delay: 300 }}>
  <div>Discover great clicks at a low price.</div>
  <button on:click={() => { page.set('terms'); GleanMetrics.cmOnboarding.joinCommunity.record();}}>
    join the ClickMonkey community
  </button>
</section>
