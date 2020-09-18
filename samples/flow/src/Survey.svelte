<script>
  import GleanMetrics from './metrics.js';
  import { getContext } from "svelte";
  import { fly } from "svelte/transition";
  const page = getContext("page");
</script>

<style>
  h1 {
    margin: 0px;
    padding-bottom: 3rem;
    font-size: 3rem;
    color: #444;
  }

  .skip {
    background-color: transparent;
    color: #333;
    text-decoration: underline;
    margin-bottom: 3rem;
  }

  label {
    margin-bottom: 3rem;
  }

  input {
    display: block;
    margin-top: 1rem;
  }
</style>

<section
  out:fly={{ duration: 300, y: 5 }}
  in:fly={{ duration: 300, y: 5, delay: 300 }}>
  <h1>Tell us about yourself.</h1>

  <p>This brief survey will help us understand (additional copy).</p>

  <button
    class="skip"
    on:click={() => {
      //instrument here!
      page.set('studies');
      GleanMetrics.cmOnboarding.skipSurvey.record();
    }}>
    skip for now
  </button>

  <label>
    1. If you had to choose just one (I know, it's hard!), what's your favorite
    number? <input id="fav-number" type="number" />
  </label>

  <button
    class="submit"
    on:click={() => {
      //instrument here!
      page.set('studies');
      let favNumber = document.getElementById("fav-number").value;
      GleanMetrics.cmOnboarding.submitSurvey.record((favNumber) ? {favouriteNumber: favNumber} : null);
    }}>
    Submit
  </button>
</section>
