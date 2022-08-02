<script>
	import '../app.css';
	import {
	  onMount
	} from "svelte";
	import { fade } from "svelte/transition";
	let mounted = false;
	onMount(()=>{
		mounted = true;
	});

</script>

<svelte:head>
	<title>Strange beings</title>
</svelte:head>


{#if mounted}
		<slot />
{/if}
