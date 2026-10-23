<script lang="ts">
  import { fieldClass } from "../../../helpers/styles";
  import { onMount } from "svelte";
  import { ArrowLeft } from "lucide-svelte";
  import { user, updateProfile, changeAvatar, removeAvatar } from "../states/authStore";
  import { recipes, loading, fetchRecipes } from "../../recipes/states/recipesStore";
  import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "../../../helpers/constants";
  import { confirmSignOut } from "../helpers/signOut";
  import RecipeCard from "../../recipes/components/RecipeCard.svelte";
  import Avatar from "../../common/components/Avatar.svelte";

  let editing = $state(false);
  let busy = $state(false);
  let name = $state("");
  let currentPassword = $state("");
  let newPassword = $state("");

  onMount(() => fetchRecipes());

  const mine = $derived($recipes.filter((r) => r.user_id === $user?.id));

  function startEdit() {
    name = $user!.name;
    currentPassword = "";
    newPassword = "";
    editing = true;
  }

  async function pickAvatar(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files![0];
    input.value = ""; // supaya file yang sama bisa dipilih lagi
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) return showErrorDialog(`Ukuran gambar maksimal ${MAX_IMAGE_LABEL}`);
    const r = await changeAvatar(file);
    if (!r.ok) return showErrorDialog(r.message);
    await showSuccessDialog(r.message);
  }

  async function deleteAvatar() {
    if (!(await showConfirmDialog("Hapus foto profil?"))) return;
    const r = await removeAvatar();
    if (!r.ok) showErrorDialog(r.message);
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    busy = true;
    const r = await updateProfile({ name, current_password: currentPassword, new_password: newPassword });
    busy = false;
    if (!r.ok) return showErrorDialog(r.message);
    editing = false;
    await showSuccessDialog(r.message);
  }
</script>

{#if $user}
  <a href="/" class="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-chili"><ArrowLeft class="h-4 w-4" /> Beranda</a>

  <section class="rounded-2xl border border-line bg-paper p-5">
    <div class="flex flex-wrap items-center gap-4">
      <div class="flex flex-col items-center gap-1">
        <Avatar user={$user} size="lg" />
        <label class="cursor-pointer text-xs font-medium text-chili hover:underline">Ganti foto
          <input type="file" accept="image/jpeg,image/png,image/webp" onchange={pickAvatar} class="sr-only" />
        </label>
        {#if $user.avatar_url}
          <button type="button" onclick={deleteAvatar} class="text-xs text-muted hover:text-chili">Hapus foto</button>
        {/if}
      </div>
      <div class="min-w-0 flex-1">
        <h1 class="text-2xl font-bold">{$user.name}</h1>
        <p class="text-muted">{$user.email}</p>
      </div>
      <div class="flex gap-2">
        {#if !editing}
          <button onclick={startEdit} class="rounded-lg border border-line px-4 py-2 text-sm font-medium hover:border-chili">Ubah Profil</button>
        {/if}
        <button onclick={confirmSignOut} class="rounded-lg border border-chili px-4 py-2 text-sm font-medium text-chili">Keluar</button>
      </div>
    </div>

    {#if editing}
      <form onsubmit={save} class="mt-5 space-y-4 border-t border-line pt-5">
        <label class="block text-sm font-medium">Nama
          <input bind:value={name} required minlength="2" maxlength="60" class={fieldClass} />
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block text-sm font-medium">Password saat ini
            <input bind:value={currentPassword} type="password" autocomplete="current-password" class={fieldClass} />
          </label>
          <label class="block text-sm font-medium">Password baru
            <input bind:value={newPassword} type="password" minlength="6" autocomplete="new-password" class={fieldClass} />
          </label>
        </div>
        <p class="text-xs text-muted">Kosongkan kedua kolom password jika tidak ingin mengganti password.</p>
        <div class="flex gap-3">
          <button type="submit" disabled={busy} class="rounded-lg bg-chili px-5 py-2 font-medium text-white disabled:opacity-60">
            {busy ? "Menyimpan..." : "Simpan"}
          </button>
          <button type="button" onclick={() => (editing = false)} class="rounded-lg border border-line px-5 py-2">Batal</button>
        </div>
      </form>
    {/if}
  </section>

  <h2 class="mb-3 mt-8 text-xl font-bold">Resep saya</h2>
  {#if $loading}
    <p class="text-muted">Memuat...</p>
  {:else if mine.length === 0}
    <p class="text-muted">Kamu belum menambahkan resep. <a href="/recipes/new" class="text-chili underline">Tambah resep pertamamu</a>.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each mine as r (r.id)}
        <li><RecipeCard recipe={r} /></li>
      {/each}
    </ul>
  {/if}
{/if}