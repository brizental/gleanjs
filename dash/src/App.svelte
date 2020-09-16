<script>
  import Logomark from "./components/Logomark.svelte";
  import { fields } from "./config.js";
  import Sankey from "./components/chart/Sankey.svelte";

  const data = [
    {
      [fields.FROM]: "open_join_modal",
      [fields.TO]: "agree_to_terms",
      [fields.VALUE]: 60,
    }, // 100 here

    {
      [fields.FROM]: "agree_to_terms",
      [fields.TO]: "set_user_name",
      [fields.VALUE]: 40,
    }, // 60 here

    {
      [fields.FROM]: "set_user_name",
      [fields.TO]: "submit_survey",
      [fields.VALUE]: 20,
    },
    {
      [fields.FROM]: "set_user_name",
      [fields.TO]: "skip_survey",
      [fields.VALUE]: 10,
    },
    {
      [fields.FROM]: "submit_survey",
      [fields.TO]: "close_modal",
      [fields.VALUE]: 12,
    },
    {
      [fields.FROM]: "skip_survey",
      [fields.TO]: "close_modal",
      [fields.VALUE]: 5,
    },
    // all bounced nodes should be at the end of the list.
    {
      [fields.FROM]: "skip_survey",
      [fields.TO]: "BOUNCE",
      [fields.VALUE]: 5,
      [fields.BOUNCE]: true,
    },
    {
      [fields.FROM]: "submit_survey",
      [fields.TO]: "BOUNCE",
      [fields.VALUE]: 8,
      [fields.BOUNCE]: true,
    },
    {
      [fields.FROM]: "open_join_modal",
      [fields.TO]: "BOUNCE",
      [fields.VALUE]: 40,
      [fields.BOUNCE]: true,
    },
    {
      [fields.FROM]: "set_user_name",
      [fields.TO]: "BOUNCE",
      [fields.VALUE]: 10,
      [fields.BOUNCE]: true,
    },
    {
      [fields.FROM]: "agree_to_terms",
      [fields.TO]: "BOUNCE",
      [fields.VALUE]: 20,
      [fields.BOUNCE]: true,
    },
  ];
</script>

<header>
  <h1 class="gafc" style="grid-column-gap:.5rem;">
    <Logomark />
    Glean.js
    <span>Demoware</span>
  </h1>
</header>
<main>
  <header>
    <div>Pioneer</div>
    <h2>First Run Onboarding</h2>
    <div>
      What percentage of new users make it from joining to a complete profile?
    </div>
  </header>
  <Sankey {data} />
</main>
<footer>Demoware</footer>
