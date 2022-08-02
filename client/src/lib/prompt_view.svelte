<script>
  import Prompt from "$lib/prompt.svelte";
  import { prompt, loader } from "$lib/stores.js";
  import { fade } from 'svelte/transition';

  $ : background = $prompt || $loader;

</script>
{#if $loader}
  <div transition:fade={{duration:100}} class="touch-none fixed z-30 flex items-center justify-center inset-0 p-12">
    <h2 class="text-2xl">{$loader}</h2>
  </div>
{/if}
{#if $prompt}
  <div class="touch-none fixed z-30 flex items-center justify-center inset-0 p-12">
    <Prompt
      title={$prompt.title}
      content={$prompt.content}
      confirm_text={$prompt.confirm_text}
      cancel_text={$prompt.cancel_text}
      on:cancel={()=>{prompt.close(false)}}
      on:confirm={()=>{prompt.close(true)}}
    />
  </div>
{/if}
{#if background}
  <div in:fade={{duration:100}} out:fade={{duration:100, delay:500}} class="fixed top-0 left-0 inset-0 bg-black/90 z-20"></div>
{/if}
