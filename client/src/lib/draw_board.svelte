<script>
import {
  onMount
} from "svelte";
import Util from "$lib/utils.js";
import SizePicker from "$lib/size_picker.svelte"
import ColorPicker from "$lib/color_picker.svelte"
import { createEventDispatcher } from 'svelte';
export const getDrawing = () => {
  return new Promise(function(resolve, reject) {
    canvas.toBlob(function(blob) {
      resolve(blob);
    });
  })
};
const dispatch = createEventDispatcher();

export let previousPart = undefined, is_last_part = false;

let canvas, ctx;
let max_w = 640,
    max_h = 370;
let background;
let history = [],
  currentHistory = 0;
let draw_behind = false;

let show_cursor = false;

onMount(() => {
  ctx = canvas.getContext("2d");
  setBackground();
  show_cursor = !window.matchMedia("(pointer: coarse)").matches;
});

function setBackground() {
  background = new Image();
  background.src = canvas.toDataURL();
  if (history.length > 10) {
    history.splice(0, 1);
  }
  history = [...history, background];
  currentHistory = history.length - 1;

}

function checkHistory() {
  if (currentHistory < history.length - 1) {
    history = history.slice(0, currentHistory + 1);
    background = history[currentHistory];
  }
}

function goBackward() {
  currentHistory -= 1;
  ctx.clearRect(0, 0, max_w, max_h);
  ctx.drawImage(history[currentHistory], 0, 0);
}

function goForward() {
  currentHistory += 1;
  ctx.clearRect(0, 0, max_w, max_h);
  ctx.drawImage(history[currentHistory], 0, 0);
}

function flush() {
  ctx.clearRect(0, 0, max_w, max_h);
  checkHistory();
  setBackground();
}

function point(x, y) {
  ctx.beginPath();
  ctx.arc(x, y, currentSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
}

function line(points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  if (points.length == 1) {
    point(points[0].x, points[0].y);
  } else if (points.length < 2) {
    for (var i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  } else {
    let i = 0;
    for (i; i < points.length - 2; i++) {
      var xc = (points[i].x + points[i + 1].x) / 2;
      var yc = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
    }
    ctx.quadraticCurveTo(
      points[i].x,
      points[i].y,
      points[i + 1].x,
      points[i + 1].y
    );
    ctx.stroke();
  }
}

$: draw_mode = (draw_behind) ? "destination-over" : "source-over";

let pen = {
  erase: false,
  points: [],
  addPoint: function() {
    this.points.push({
      x: cursor.position.x,
      y: cursor.position.y
    });
  },
  start: function() {
    this.addPoint();
    if (this.erase) ctx.globalCompositeOperation = "destination-out";
    line(this.points);
    ctx.globalCompositeOperation = draw_mode;
  },
  drag: function() {
    this.addPoint();
    ctx.clearRect(0, 0, max_w, max_h);
    ctx.drawImage(background, 0, 0);
    if (this.erase) ctx.globalCompositeOperation = "destination-out";
    line(this.points);
    ctx.globalCompositeOperation = draw_mode;
  },
  end: function() {
    this.points = [];
    setBackground();
  }
};


let cursor_active = false;

let c_r_pos_x = 0,
  c_r_pos_y = 0;

let cursor = {
  position: {
    x: 0,
    y: 0
  },
  setPos: function(e){
    c_r_pos_x = e.offsetX;
    c_r_pos_y = e.offsetY;
    this.position.x = Util.map(c_r_pos_x,0,canvas.clientWidth,0,max_w);
    this.position.y = Util.map(c_r_pos_y,0,canvas.clientHeight,0,max_h);
  },
  down: function(e) {
    this.setPos(e);
    cursor_active = true;
    checkHistory();
    if (typeof currentTool.start == "function") currentTool.start();
  },
  up: function(e) {
    if(!cursor_active) return false;
    cursor_active = false;
    if (typeof currentTool.end == "function") currentTool.end();
  },
  move: function(e) {
    this.setPos(e);
    if (cursor_active && typeof currentTool.drag == "function") currentTool.drag();
  }
};

let currentTool = pen,
  currentToolName = "pen";
let knownSizes = [4, 10, 16, 24, 40, 80];
let sizeIndex = 0;
$: currentSize = knownSizes[sizeIndex];

function selectTool(toolName) {
  currentToolName = toolName;
  switch (toolName) {
    case "pen":
    currentTool = pen;
    pen.erase = false;
      break;
    case "eraser":
    currentTool = pen;
    pen.erase = true;
      break;
  }
}
let pickedColor;
$: {
  if (ctx != undefined) {
    ctx.strokeStyle = ctx.fillStyle = pickedColor;
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.lineWidth = currentSize;
  }
}

function requestConfirm() {
  // Check if drawing is filled?
  let issues = [];
  let hint_height = 30;
  let has_previous_part = previousPart != undefined;
  // if has previous part Check top_coverage
  if(has_previous_part){
    let top_coverage = zoneCoverage(0, 0, max_w, hint_height) > 0.01;
    if(!top_coverage) issues.push("Your drawing does not appear to be connected to the upper part shown.");
  }
  if(!is_last_part){
    let bottom_coverage = zoneCoverage(0, max_h - hint_height, max_w, hint_height) > 0.01;
    if(!bottom_coverage) issues.push("Your drawing doesn't seem to reach the bottom of the page. The next person who continues this drawing will not have enough clues.");
  }
  if (issues.length > 0) {
    // There is an issue with the drawing
    dispatch('issue', {
      issues
    })
  } else {
    dispatch('confirm')
  }
}

function zoneCoverage(x, y, width, height) {
  let imageData = ctx.getImageData(x, y, width, height).data;
  let total = 0;
  for (let i = 3; i < imageData.length; i += 4) {
    total += imageData[i] / 255;
  }
  return total / (imageData.length / 4);
}

</script>

<svelte:window on:pointerup={(e)=>{cursor.up(e)}}/>

<main class="board">
  <header class="canHide flex pointer-events-none justify-between" class:shouldHide={cursor_active}>
    <div class="header-left flex items-center gap-2 pointer-events-auto">
      <button
      class="btn rounded-xl"
      on:click={requestConfirm}>
        <svg xmlns="http://www.w3.org/2000/svg" class="fill-dark" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        <span id="submit-text" class="mx-1 font-bold text-dark">Submit</span>
      </button>
      <button
      class="btn small dark rounded-xl"
      on:click={()=>{dispatch('cancel')}}>
        <svg xmlns="http://www.w3.org/2000/svg" class="fill-dark" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>

    <div class="header-right flex items-center gap-2 pointer-events-auto">
      <div class="btn-group">
        <button class="btn" disabled={(currentHistory) < 1} on:click={goBackward}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
          <path d="M11.8906 5.0729L5.49619 9.33587C4.30872 10.1275 4.30872 11.8724 5.49619 12.6641L11.8906 16.927C13.2198 17.8131 15 16.8603 15 15.2629V12.5H18C21.0376 12.5 23.5 14.9624 23.5 18C23.5 21.0375 21.0376 23.5 18 23.5H12.5C11.6716 23.5 11 24.1715 11 25C11 25.8284 11.6716 26.5 12.5 26.5H18C22.6945 26.5 26.5 22.6944 26.5 18C26.5 13.3056 22.6945 9.49997 18 9.49997H15V6.73701C15 5.13961 13.2197 4.18683 11.8906 5.0729Z"/>
          </svg>
        </button>
        <button class="btn" disabled={(currentHistory) == history.length-1} on:click={goForward}>
          <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="0 0 32 32" fill="none">
          <path d="M19.215 5.0729L25.6094 9.33587C26.7969 10.1275 26.7969 11.8724 25.6094 12.6641L19.2149 16.927C17.8858 17.8131 16.1056 16.8603 16.1056 15.2629V12.5H13.1055C10.068 12.5 7.60555 14.9624 7.60555 18C7.60555 21.0375 10.068 23.5 13.1055 23.5H18.6056C19.434 23.5 20.1056 24.1715 20.1056 25C20.1056 25.8284 19.434 26.5 18.6056 26.5H13.1055C8.41113 26.5 4.60555 22.6944 4.60555 18C4.60555 13.3056 8.41113 9.49997 13.1055 9.49997H16.1056V6.73701C16.1056 5.13961 17.8858 4.18683 19.215 5.0729Z"
          />
          </svg>
        </button>
      </div>

      <button class="btn rounded-xl" on:click={flush}>
        <svg xmlns="http://www.w3.org/2000/svg" class="" viewBox="0 0 32 32" fill="none">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M9.34998 7V5.44995C9.34998 2.96467 11.3647 0.949951 13.85 0.949951H19.1833C21.6686 0.949951 23.6833 2.96467 23.6833 5.44995V7H25C26.1046 7 27 7.89543 27 9V12H6V9C6 7.89543 6.89543 7 8 7H9.34998ZM12.35 5.44995C12.35 4.62152 13.0215 3.94995 13.85 3.94995H19.1833C20.0117 3.94995 20.6833 4.62152 20.6833 5.44995V7H12.35V5.44995Z" fill="white"/>
        <path d="M6 14L8.23967 27.3314C8.40149 28.2946 9.23533 29 10.212 29H22.788C23.7647 29 24.5985 28.2946 24.7603 27.3314L27 14H6Z" fill="white"/>
        </svg>
      </button>
    </div>
    
  </header>
  <section>
  <div class="canvasHolder">
    <div
    class="hint border-b-2"
    style="
    {(previousPart == undefined)?"":`background-image:url(${previousPart});`}
    background-position: center bottom;
    background-size: cover;
    "
    >
      <span class="txt canHide" class:shouldHide={cursor_active}>
      {(previousPart == undefined)?"You're making the first part of this drawing":"Hint of the previous part of the drawing"}
      </span>
    </div>
    <div class="relative">
      {#if show_cursor}
        <!-- cursor viewer -->
        <div style="position:absolute;
        left:{c_r_pos_x}px;
        top:{c_r_pos_y}px;
        transform:translate(-50%, -50%);
        width:{currentSize}px; height:{currentSize}px; border-radius:50%; background-color:rgba(0,0,0,0.3);">
        </div>
      {/if}
      <canvas
      bind:this={canvas}
      width={max_w}
      height={max_h}
      aspect-ratio={max_w / max_h}
      on:pointerdown={(e)=>{cursor.down(e)}}
      on:pointermove={(e)=>{cursor.move(e)}}
      ></canvas>
      {#if !is_last_part}
        <div class="hint border-t-2 absolute bottom-0 w-full select-none pointer-events-none">
          <span class="txt canHide" class:shouldHide={cursor_active}>Part of the drawing the next person will see</span>
        </div>
      {/if}
    </div>
  </div>
  </section>
</main>


<style>

  .btn-group{
    @apply flex items-center;
  }
  .btn-group .btn:first-child{
    @apply rounded-l-xl;
  }
  .btn-group .btn:last-child{
    @apply rounded-r-xl;
  }
  .btn{
    @apply p-2 flex justify-center items-center bg-primary-default;
  }
  .btn.dark{
    @apply bg-light;
  }
  .btn:hover{
    @apply bg-primary-dark;
  }
  .btn:active{
    @apply bg-primary-light;
  }
  .btn:disabled, .btn.selected{
    @apply bg-gray;
  }
  .btn:disabled svg, .btn.selected svg{
    @apply fill-dark;
  }
  .btn:not(:disabled):active{
    @apply bg-primary-default;
  }
  .btn svg{
    @apply fill-dark w-6 h-6;
  }
  .btn.small svg{
    @apply w-4 h-4;
  }
  .board{
    @apply flex flex-col gap-2 md:gap-4 p-4;
  }
  .board > header{
    @apply z-20;
  }
  .canHide{
    opacity: 1;
    transition: opacity 0.4s .2s;
  }
  .shouldHide{
    opacity: 0;
  }
  .hint{
    @apply border-dashed border-black/40
    select-none
    flex items-center justify-center;
    width:100%;
    height:auto;
    aspect-ratio: 640/30;
  }

  .hint .txt{
    @apply
    absolute
    text-xs font-medium
    text-white bg-black/80 py-1 px-2 rounded-lg;
  }

  canvas{
    @apply touch-none w-full h-auto mix-blend-multiply;
  }
  .canvasHolder {
    /*background-image:url(paper.jpg);*/
    background-size: cover;
    background-position: center;
    @apply shadow-md;
    background-color:white;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100vw;
    height: calc((400 / 640) * 100vw);
  }

  @media (min-aspect-ratio: 640/400) {
    .canvasHolder {
      width: 160vh;
      height: 100vh;
    }
  }

  @media (min-width: 640px) and (min-height: 400px) {
    .canvasHolder {
      max-width: 640px;
      max-height: 400px;
      position: relative;
    }
  }

  @media screen and (max-width: 800px),
         screen and (max-height: 600px) {
      .canvasHolder{
        position: absolute;
      }
      .board {
        width: 100%;
        height: 100%;
      }
      .board{
        justify-content: center;
      }
      .board #submit-text{
        @apply hidden;
      }
      .board header{
        align-items: center;
      }
      .board .header-left{
        flex-direction: column;
      }
      .board .header-right{
        flex-direction: column;
      }
      .btn-group{
        @apply flex flex-col items-center;
      }
      .btn-group .btn:first-child{
        @apply rounded-none rounded-t-xl;
      }
      .btn-group .btn:last-child{
        @apply rounded-none rounded-b-xl;
      }
    }

</style>
