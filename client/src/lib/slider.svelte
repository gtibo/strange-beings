<script>
import Util from "$lib/utils.js";
let slider;
export let min = 0,
  max = 10,
  value = 2,
  bg_color = "#DEDEDE",
  track_color = "#305BFF";
let active = false;

function handleUp() {
  active = false;
}

function handleDown(e) {
  active = true;
  updateValue(e);
}

function handleMove(e) {
  if (!active) return;
  updateValue(e);
}

function updateValue(e) {
  let y = e.pageY - slider.offsetTop;
  value = Math.round(Util.map(y, 0, slider.clientHeight, max, min));
}
$: percent = Util.map(value + .5, min, max, 0, 100);
$: weight = Util.map(value + .5, min, max, 20, 80);

</script>
<svelte:window on:pointerup={handleUp} on:pointermove={handleMove}/>
<div
  class="slider"
  on:pointerdown={handleDown}
  >
  <div
  bind:this={slider}
  class="twrap"
  style="width:{weight}%; background-color: {bg_color};"
  >
    <div class="track" style="height:{percent}%; background-color: {track_color};"></div>
  </div>
</div>

<style>
.slider{
  height: 100%;
  width:1.5em;
  display: flex;
  justify-content: center;
}
.twrap{
  user-select: none;
  height: 100%;
  position: relative;
  border-radius: 4em;
  width: .6em;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
  transition: width .2s;

}
.track{
  width: 100%;
  border-radius: 1em;
  pointer-events: none;
  transition: all .2s;
}
</style>
