<script>
  import GleanMetrics from './metrics.js';
  import { getContext } from "svelte";
  import { fly } from "svelte/transition";
  const page = getContext("page");
</script>

<style>
  div {
    padding-top: 2rem;
    padding-bottom: 4rem;
  }
  button {
    float: right;
  }
</style>

<section
  out:fly={{ duration: 300, y: 5 }}
  in:fly={{ duration: 300, y: 5, delay: 300 }}>
  <h1>Terms of Service</h1>

  <div>
    <p>
      These Terms and Conditions constitute a legally binding agreement made
      between you, whether personally or on behalf of an entity (“you”) and
      [business entity name] (“we,” “us” or “our”), concerning your access to
      and use of the [website name.com] website as well as any other media form,
      media channel, mobile website or mobile application related, linked, or
      otherwise connected thereto (collectively, the “Site”).
    </p>
    <p>
      You agree that by accessing the Site, you have read, understood, and agree
      to be bound by all of these Terms and Conditions. If you do not agree with
      all of these Terms and Conditions, then you are expressly prohibited from
      using the Site and you must discontinue use immediately.
    </p>
  </div>
  <button on:click={() => {page.set('survey'); GleanMetrics.cmOnboarding.acceptTerms.record();}}>
    I Consent, Get me to the Clicks
  </button>
</section>
