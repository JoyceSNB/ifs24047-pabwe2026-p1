<script lang="ts">
  import "../index.css";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import Navbar from "../features/common/components/Navbar.svelte";
  import { user, initAuth } from "../features/auth/states/authStore";

  let { children } = $props();
  let ready = $state(false);

  onMount(async () => {
    try {
      await initAuth();
    } finally {
      ready = true; // apa pun hasilnya, jangan biarkan halaman kosong selamanya
    }
  });

  const isAuthRoute = $derived(page.url.pathname.startsWith("/auth"));

  // Tamu hanya boleh membuka halaman masuk/daftar; yang sudah login diarahkan ke beranda.
  $effect(() => {
    if (!ready) return;
    if (!$user && !isAuthRoute) goto("/auth/login");
    else if ($user && isAuthRoute) goto("/");
  });

  const allowed = $derived(ready && (isAuthRoute ? !$user : !!$user));
</script>

{#if allowed}
  {#if isAuthRoute}
    {@render children()}
  {:else}
    <Navbar />
    <main class="mx-auto max-w-5xl px-4 py-8">{@render children()}</main>
  {/if}
{:else if !ready}
  <p class="p-10 text-center text-muted">Memuat...</p>
{/if}
