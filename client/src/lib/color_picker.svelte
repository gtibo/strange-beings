<script>
import Util from "./utils.js";
let colors = ["#11232D","#924317", "#F55723","#FFED4D", "#26C94A", "#50A9F4", "#3258E8", "#8577EF", "#FFC3ED"];
export let picked = colors[0];
</script>
<div
style=""
class="h-full flex flex-col w-4 justify-center items-center gap-2">
  {#each colors as color}
  <label class:current={picked == color} class="w-full flex-1 rounded" style="background-color:{color};">
    <input class="hidden" type=radio bind:group={picked} name="colors" value={color}>
  </label>
  {/each}
</div>
<style>
.current{
  width:200%;
  @apply border-4 rounded-full shadow-lg;
}
</style>
