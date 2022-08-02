<script>
  import { fade, scale } from 'svelte/transition';

  import DrawBoard from "$lib/draw_board.svelte";
  import DrawingGallery from "$lib/drawing_gallery.svelte";
  import StrangeHeader from "$lib/strange_header.svelte";
  import request_path from "$lib/request_path.js";
  import { makePrompt, setLoader, closeLoader } from "$lib/prompt_util.js";
  import PromptView from "$lib/prompt_view.svelte";
  import { onMount } from "svelte";

  let is_drawing = false;
  let getDrawing;
  let current_editor_data = null;

  async function requestDrawing() {
    const res = await fetch(`${request_path}/drawings/request`);
    const editor_data = await res.json();
    if (res.ok) {
      current_editor_data = editor_data;
      return editor_data;
    } else {
      throw new Error(text);
    }
  }

  async function cancelDrawing() {
    if(current_editor_data == null) return true;
    const res = await fetch(`${request_path}/drawings/cancel`,{
      body: JSON.stringify({"editor_data":current_editor_data}),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    return res.ok;
  }

  async function submitDrawing() {
    let image_to_send = await getDrawing();
    let formData = new FormData();
    formData.append('picture', image_to_send, "image.png");
    formData.append('editor_data', JSON.stringify(current_editor_data));
    let res = await fetch(`${request_path}/drawings/send`,{
      body: formData,
      method: "POST"
    });
    return res.ok;
  }

  async function askToDraw() {
    setLoader("Requesting server...");
    let drawing_promise = await requestDrawing();
    closeLoader();
    let prompt_promise = await makePrompt(
      (drawing_promise == null) ? "You are starting a new drawing" : "You will continue an existing drawing",
      (drawing_promise == null) ? "You are creating a new drawing, don't forget to draw at the bottom of the page to give indications to the next person who will have to continue this drawing." : "You will have to connect your drawing to the previous drawing, use the hint on the top of the drawing pannel to do so.",
      "Ok, Let's draw!",
      "I've changed my mind, I don't want to draw..."
    );
    if (prompt_promise) {
      // User wants to draw
      is_drawing = true;
    } else {
      // User is not interested...
      notifyCancel();
    }
  }

  async function requestCancelDrawing(){
    let prompt_promise = await makePrompt(
      "Cancel your drawing",
      "Are you sure you want to cancel your drawing? ",
      "Yes, cancel my drawing",
      "No, I want to continue"
    );
    if(prompt_promise){
      is_drawing = false;
      notifyCancel();
    }
  }

  async function requestConfirmDrawing(){
    let prompt_promise = await makePrompt(
      "Submit my drawing",
      "Your drawing will be submitted, make sure you're happy with your part.",
      "Yes, it's good",
      "Wait, I want to change something!"
    );
    if(prompt_promise){
      setLoader("Submitting drawing...");
      await submitDrawing();
      closeLoader();
      is_drawing = false;
    }
  }

  function drawingIssue(issues){
    makePrompt(
      (issues.length > 1)?"Your drawing has multiple issues" : "Your drawing has an issue",
      issues.join(" "),
      "Ok"
    );
  }

  async function notifyCancel(){
    if(current_editor_data == null) return;
    setLoader("Cancelling drawing...");
    let cancel_res = await cancelDrawing();
    closeLoader();
  }


</script>

<PromptView/>
{#if !is_drawing}
  <main
  class="container mx-auto px-4 py-8 flex flex-col h-full">
  <div out:fade={{duration:100}} in:fade={{duration:500, delay:500}}>
    <StrangeHeader/>
  </div>
  <button
  transition:scale
  on:click={askToDraw}
  class="
  fixed bottom-8 right-8 z-10
  flex space-x-2 items-center p-3 rounded-full bg-primary-default hover:bg-primary-dark"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="md:w-12 w-8 fill-dark" viewBox="0 0 20 20">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  </button>
  <DrawingGallery/>
  </main>
{:else}
  <div
  out:fade={{duration:500}} in:fade={{duration:500, delay:500}}
  class="touch-none fixed z-10 flex items-center justify-center top-0 left-0 w-full h-full">
    <DrawBoard
      previousPart={(current_editor_data?.last_part)?`${request_path}${current_editor_data.last_part}`:undefined}
      is_last_part={(current_editor_data?.parts_count == 2)? true : false}
      on:cancel={()=>requestCancelDrawing()}
      on:confirm={()=>requestConfirmDrawing()}
      on:issue={(event)=>drawingIssue(event.detail.issues)}
      bind:getDrawing={getDrawing}
    />
  </div>
{/if}
