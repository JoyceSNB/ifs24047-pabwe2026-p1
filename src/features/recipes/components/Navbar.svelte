<script lang="ts">
  import { goto } from "$app/navigation";
  import { Plus } from "lucide-svelte";
  import { user, logout } from "../../auth/states/authStore";
  import { showConfirmDialog } from "../../../helpers/toolsHelper";

  async function signOut() {
    if (!(await showConfirmDialog("Yakin ingin keluar dari akun ini?"))) return;
    logout();
    goto("/auth/login");
  }

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
          <span class="flex h-7 w-7 items-center justify-center rounded-full bg-turmeric/30 font-bold text-turmeric">{$user.name.charAt(0).toUpperCase()}</span>
          <span class="hidden sm:inline">{$user.name}</span>
        </a>
        <button onclick={signOut} class="rounded-lg border border-line px-3 py-2 text-sm font-medium hover:border-chili">Keluar</button>
      </div>
    {/if}
  </nav>
</header>
