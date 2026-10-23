<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { Clock, Users, Pencil, Trash2, ArrowLeft } from "lucide-svelte";
  import { recipe, fetchRecipe, removeRecipe } from "../states/recipesStore";
  import { user } from "../../auth/states/authStore";
  import { fileUrl } from "../../../helpers/apiHelper";
  import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";

  let { id }: { id: string } = $props();
  let ready = $state(false);

  onMount(async () => {
    await fetchRecipe(id);
    ready = true;
  });

  async function remove() {
    if (!(await showConfirmDialog(`Hapus resep "${$recipe?.title}"?`))) return;
    const r = await removeRecipe(id);
    if (!r.ok) return showErrorDialog(r.message);
    await showSuccessDialog("Resep dihapus");
    goto("/");
  }
</script>

<a href="/" class="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-chili"><ArrowLeft class="h-4 w-4" /> Semua resep</a>

{#if !ready}
  <p class="text-muted">Memuat...</p>
{:else if !$recipe}
  <p class="text-muted">Resep tidak ditemukan.</p>
{:else}
  <article>
    {#if $recipe.image_url}
      <img src={fileUrl($recipe.image_url)} alt={$recipe.title} class="mb-5 h-64 w-full rounded-xl object-cover" />
    {/if}
    <p class="text-sm font-medium text-leaf">{$recipe.category_name}</p>
    <div class="flex flex-wrap items-start justify-between gap-3">
      <h1 class="text-3xl font-bold">{$recipe.title}</h1>
      {#if $user && $user.id === $recipe.user_id}
        <div class="flex gap-2">
          <a href={`/recipes/${$recipe.id}/edit`} class="flex items-center gap-1 rounded-lg border border-line px-3 py-2 text-sm"><Pencil class="h-4 w-4" /> Ubah</a>
          <button onclick={remove} class="flex items-center gap-1 rounded-lg border border-chili px-3 py-2 text-sm text-chili"><Trash2 class="h-4 w-4" /> Hapus</button>
        </div>
      {/if}
    </div>
    {#if $recipe.author_name}
      <p class="mt-1 text-sm text-muted">{`oleh ${$recipe.author_name}`}</p>
    {/if}
    <p class="mt-2 text-muted">{$recipe.description}</p>
    <div class="mt-4 flex flex-wrap gap-4 text-sm text-muted">
      <span class="flex items-center gap-1"><Clock class="h-4 w-4" /> {$recipe.cooking_time} menit</span>
      <span class="flex items-center gap-1"><Users class="h-4 w-4" /> {$recipe.servings} porsi</span>
      <span class="rounded-full border border-line px-2">{$recipe.difficulty}</span>
    </div>

    <div class="mt-8 grid gap-8 md:grid-cols-[1fr_2fr]">
      <section>
        <h2 class="mb-3 text-xl font-bold">Bahan</h2>
        <ul class="space-y-1.5">
          {#each $recipe.ingredients ?? [] as ing (ing.id)}
            <li class="border-b border-line pb-1.5">{ing.quantity} {ing.unit} {ing.name}</li>
          {/each}
        </ul>
      </section>
      <section>
        <h2 class="mb-3 text-xl font-bold">Langkah</h2>
        <ol class="space-y-3">
          {#each $recipe.steps ?? [] as s (s.id)}
            <li class="flex gap-3">
              <span class="font-display text-xl font-bold text-turmeric">{s.step_number}</span>
              <p>{s.instruction}</p>
            </li>
          {/each}
        </ol>
      </section>
    </div>
  </article>
{/if}
