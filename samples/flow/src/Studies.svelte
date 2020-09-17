<script>
  import { fly } from "svelte/transition";
</script>

<section
  out:fly={{ duration: 300, y: 5 }}
  in:fly={{ duration: 300, y: 5, delay: 300 }}>
  <h1>Studies</h1>

  <button
    on:click={() => {
      // instrument here!
    }}>
    Demo click study
  </button>
</section>
