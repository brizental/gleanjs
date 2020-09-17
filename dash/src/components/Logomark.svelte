<script>
import { onMount } from 'svelte';
import { fly } from 'svelte/transition';
import { tweened, spring } from 'svelte/motion';
import { cubicOut as easing } from 'svelte/easing';

export let size = 32;
const duration = 1000;
const delay = 100;

const s = tweened(0.65, { duration, easing, delay });
const t = tweened(0, { duration: duration / 2, easing, delay });
const lightlyBouncing = spring(20, { stiffness: 0.3, damping: 0.2 });
$: s.set(1);
$: t.set(1);
$: lightlyBouncing.set(0);

let mounted = false;
onMount(() => { mounted = true; });
</script>

<style>
svg {
  --top-start: hsl(5, 40%, 90%);
  --top-end: hsl(5, 70%, 80%);
  --bottom-start: var(--pantone-red-600);
  --bottom-end: var(--cool-gray-600);
  --left-start: hsl(5, 20%, 50%);
  --left-end: hsl(5, 60%, 50%);
}
</style>

{#if mounted}
<svg width={size} height={size} viewBox="0 0 172 115" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2">
  <defs>
    <linearGradient id="top">
      <stop offset="0%" stop-color="var(--top-start)" />
      <stop offset="80%" stop-color="var(--top-end)" />
    </linearGradient>
    <linearGradient id="bottom">
      <stop  offset="0%" stop-color="var(--bottom-end)" />
      <stop offset="80%" stop-color="var(--bottom-start)" />
    </linearGradient>
    <linearGradient id="left">
      <stop  offset="0%" stop-color="var(--left-end)" />
      <stop offset="80%" stop-color="var(--left-start)" />
    </linearGradient>
</defs>
  <g style="transform: rotate({(1 - $t) * 10}deg)">
    <g style="transform: translateY({$lightlyBouncing}px) rotate({$lightlyBouncing}deg)">
      <g in:fly={{ duration, x: 30 }}>
        <path d="M57.238 57.242L28.616-.001-.005 57.242l28.621 57.243 28.622-57.243z" fill="url(#left)" />
        <path d="M28.616-.001l{143.109 * $s + 28.616 * (1 - $s)} 57.243H{57.238}z" fill="url(#top)"/>
        <path d="M28.616 114.485l28.622-57.243h{114.487 * $s}z" fill="url(#bottom)"/>
      </g>
    </g>
  </g>
</svg>

{/if}
