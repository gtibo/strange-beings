<script>
  import { token } from '$lib/stores';
  import { goto } from '$app/navigation';
  import request_path from "$lib/request_path.js";

  let password = "";

  async function submitLogin(e){
    e.preventDefault();
    let login_promise = await fetch(`${request_path}/admin/login`,{
      body: JSON.stringify({"password": password}),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
    });
    if(login_promise.ok == false) return false;
    let {accessToken} = await login_promise.json();
    $token = accessToken;
    goto("/");
  }


</script>
{#if $token == null}
<form on:submit={submitLogin}>
  <input autocomplete type="password" bind:value={password} />
  <input type="submit" value="ok">
</form>
{/if}
