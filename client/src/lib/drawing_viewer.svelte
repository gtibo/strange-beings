<script>
  export let parts = [];
  let images = [];
  import {onMount} from "svelte";
  let loading = true;
  onMount(()=>{

    let images_load_promises = images.map(img=>{
      return new Promise((res, reject)=>{
        img.onload = res;
        img.onerror = reject;
      });
    });
    Promise.all(images_load_promises).then(()=>{
      // All parts loaded...
      loading = false;
    });

  });


  let part_width = import.meta.env.VITE_DRAWING_WIDTH,
      part_height = import.meta.env.VITE_DRAWING_HEIGHT;


</script>
<div class="bg-white shadow-md rounded-sm">
  <div class="boo select-none" class:hide={loading}>
    {#each parts as part, i}
    <img
    bind:this={images[i]}
    width={part_width}
    height={part_height}
    class="w-full mix-blend-multiply pointer-events-none"
    src="{part}"
    />
    {/each}
  </div>
</div>
<style>

.boo{
  transition:all 0.2s;
  opacity: 1;
}

.boo.hide{
  opacity: 0;
}

</style>
