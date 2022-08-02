<script>
import request_path from "$lib/request_path.js";
import { token } from '$lib/stores';
export let drawing_id = 0, parts_count = new Array(2).fill(0).map((el, i)=> i);;

let part_id_selected = 0;

function requestDrawingDeletion(){
    fetch(`${request_path}/admin/deleteDrawing/${drawing_id}`,{
      method: 'DELETE',
      headers: {
        "Authorization": `Bearer ${$token}`
      },
    }).then(async v=>{
      if(!v.ok) return;
    });
}

function requestDrawingEdition(){
    fetch(`${request_path}/admin/restartDrawing/${drawing_id}/${part_id_selected}`,{
      method: 'GET',
      headers: {
        "Authorization": `Bearer ${$token}`
      },
    }).then(async v=>{
      if(!v.ok) return;
    });
}

</script>

{#if $token != null}
  <footer class="flex gap-2 p-4">
    <button class="border p-2" on:click={requestDrawingDeletion}>Delete</button>
    <div class="flex gap-2 items-center">
      Restart from
      {#each parts_count as part}
        <label class="border p-2" for="part-select-{part}">{part} :
        <input id="part-select-{part}" bind:group={part_id_selected} value={part} type="radio"/>
        </label>
      {/each}
      <button class="border p-2" on:click={requestDrawingEdition}>restart</button>
    </div>
  </footer>
{/if}
