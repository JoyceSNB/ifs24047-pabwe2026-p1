<script lang="ts">
  import { Plus } from "lucide-svelte";
  import { user } from "../../auth/states/authStore";
  import { confirmSignOut } from "../../auth/helpers/signOut";
  import Avatar from "./Avatar.svelte";

  const link = "rounded-lg px-3 py-2 text-sm font-medium hover:text-chili";
</script>

<header class="border-b border-line bg-paper">
  <nav class="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
    <a href="/" class="flex items-center gap-2 font-display text-xl font-bold text-chili">
      <img src="/logo.png" alt="" class="h-9 w-auto" /> Koleksi Resep
    </a>
    {#if $user}
      <div class="flex items-center gap-1 sm:gap-2">
        <a href="/" class={link}>Beranda</a>
        <a href="/recipes/new" class="flex items-center gap-1 rounded-lg bg-chili px-3 py-2 text-sm font-medium text-white hover:bg-chili/90">
          <Plus class="h-4 w-4" /> Tambah Resep
        </a>
        <a href="/profile" aria-label="Profil" class="flex items-center gap-2 rounded-lg border border-line px-2 py-1.5 text-sm hover:border-chili">
          <Avatar user={$user} />
          <span class="hidden sm:inline">{$user.name}</span>
        </a>
        <button onclick={confirmSignOut} class="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-chili">Keluar</button>
      </div>
    {/if}
  </nav>
</header>