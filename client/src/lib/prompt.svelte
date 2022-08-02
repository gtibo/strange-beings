<script>
  export let title = "Prompt title",
  content = "Prompt content",
  cancel_text = false,
  confirm_text = "Confirm";
  import { fly } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

</script>
<div class="prompt" transition:fly={{y:40}}>
  <h2 class="text-3xl mb-4">
    {title}
  </h2>
  <p class="mb-6 text-light/60">
    {content}
  </p>
  <footer class="flex space-x-4 justify-between items-center">
    {#if cancel_text}
      <button class="b-btn" on:click={()=>{dispatch('cancel')}}>{cancel_text}</button>
    {/if}
    <button class="btn" on:click={()=>{dispatch('confirm')}}>{confirm_text}</button>
  </footer>
</div>

<style>
  .prompt{
    @apply absolute z-20 p-8 bg-dark max-w-screen-sm rounded-md shadow-lg;
  }
  .b-btn{
    @apply border border-slate-500 text-slate-500 rounded px-4 py-2 hover:border-orange-700 hover:text-orange-700;
  }
  .btn{
    @apply bg-primary-default hover:bg-primary-dark text-dark font-bold py-2 px-4 rounded;
  }
</style>
