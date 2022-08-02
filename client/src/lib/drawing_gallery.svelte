<script>
import { fly } from 'svelte/transition';
import { onMount } from "svelte";
import request_path from "$lib/request_path.js";
import DrawingViewer from "$lib/drawing_viewer.svelte";
import DrawingModerationFooter from "$lib/drawing_moderation_footer.svelte";
let current_page = -1,
page_count = 0,
drawings = [];

let pageFetcher = null;
let ready = false;
let can_load_more = true;

onMount(async()=>{
  page_count = await getPageCount();
  getNextPage();
  ready = true;
});

function getNextPage(){
  current_page += 1;
  pageFetcher = new Promise(async(resolve, reject)=>{
    let new_drawings = await getPage(current_page);
    drawings = [...drawings, ...new_drawings];
    resolve();
    can_load_more = current_page != page_count;
  });
}

async function getPage(pageID = 1) {
  const res = await fetch(`${request_path}/drawings/page/${pageID}`);
  const data = await res.json();
  if (res.ok) {
    return data.drawings;
  } else {
    throw new Error("Failed to fetch drawing :(");
  }
}

async function getPageCount() {
  const res = await fetch(`${request_path}/drawings/count`);
  const {count} = await res.json();
  if (res.ok) {
    return count;
  } else {
    throw new Error("Failed to fetch drawing :(");
  }
}


</script>

<!-- Gallery -->
<div class="sm:grid sm:grid-cols-[repeat(auto-fill,_minmax(400px,_1fr))] flex flex-col flex-1 gap-12">
  {#each drawings as drawing, i }
    <div>
    <div
    transition:fly={{  duration: 500, y:40}}
    style="transform:rotate({((0.5 - Math.random()) * 2) * 2}deg);">
      <DrawingViewer parts={drawing.parts.map(part=>`${request_path}${part}`)}/>
    </div>
    <DrawingModerationFooter drawing_id={drawing.id} />
    </div>
  {/each}
</div>

<footer class="flex flex-1 flex-col items-center justify-center p-14 mt-24 mb-14">
{#if ready}
  {#if can_load_more}
  {#await pageFetcher}
      <svg xmlns="http://www.w3.org/2000/svg" class="animate-spin w-12" viewBox="0 0 32 32" fill="none">
        <path class="stroke-primary-default" d="M30 16C30 13.2311 29.1789 10.5243 27.6406 8.22202C26.1022 5.91973 23.9157 4.12531 21.3576 3.06569C18.7994 2.00606 15.9845 1.72881 13.2687 2.26901C10.553 2.8092 8.05844 4.14257 6.10051 6.10051C4.14257 8.05844 2.8092 10.553 2.26901 13.2687C1.72881 15.9845 2.00606 18.7994 3.06569 21.3576C4.12531 23.9157 5.91973 26.1022 8.22202 27.6406C10.5243 29.1789 13.2311 30 16 30"
        stroke-width="4"/>
        <path class="stroke-primary-default/20" d="M16 30C17.8385 30 19.659 29.6379 21.3576 28.9343C23.0561 28.2307 24.5995 27.1995 25.8995 25.8995C27.1995 24.5995 28.2307 23.0561 28.9343 21.3576C29.6379 19.659 30 17.8385 30 16"
        stroke-width="4"/>
      </svg>
    {:then}
    <button class="border-primary-default border px-6 py-4 rounded" on:click={getNextPage}>
      Load more...
    </button>
  {/await}
  {:else}
    No more drawings to fetch...
  {/if}
{/if}
</footer>

<style>

.pagination{
  @apply flex items-center gap-2;
}

.pagination:disabled{
  @apply opacity-40;
}

</style>
