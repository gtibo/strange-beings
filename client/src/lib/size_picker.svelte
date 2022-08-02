<script>
export let sizes = [], index;
let max_size = Math.max(...sizes);
import Util from "$lib/utils.js";

let sizes_percent = sizes.map((s, index) => {

    return Util.map(index, 0, sizes.length, 25, 90);
});

</script>
<div class="flex flex-col flex-1 justify-center gap-4">
  {#each sizes as size, i}
    <input id="sizes-{i}" class="hidden" name="sizes" type=radio bind:group={index} value={i}>
    <label for="sizes-{i}"
    class="relative border border-black/80 w-6 h-6 md:w-8 md:h-8 block rounded-full
    bg-black/40"
    >
      <div class="inside rounded-full absolute" style="
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      width:{sizes_percent[i]}%; height:{sizes_percent[i]}%;">
      </div>
    </label>
  {/each}
</div>

<style>

.inside{
  @apply bg-light/20 transition;
}

input[type="radio"]:checked+label > .inside{
  @apply bg-primary-default;
}


</style>
