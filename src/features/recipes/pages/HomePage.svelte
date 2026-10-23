<script lang="ts">
  import { onMount } from "svelte";
  import { Search } from "lucide-svelte";
  import { recipes, categories, loading, fetchRecipes, fetchCategories } from "../states/recipesStore";
  import RecipeCard from "../components/RecipeCard.svelte";

  let search = $state("");
  let category = $state<number | "">("");

  onMount(fetchCategories);

  // Muat ulang (dengan jeda singkat) setiap kali pencarian atau kategori berubah.
  $effect(() => {
    const s = search;
    const c = category;
    const t = setTimeout(() => fetchRecipes(s, c), 250);
    return () => clearTimeout(t);
  });

  const chip = (active: boolean) =>
    `rounded-full border px-3 py-1 text-sm ${active ? "border-chili bg-chili text-white" : "border-line bg-paper hover:border-chili"}`;
</script>

<h1 class="text-3xl font-bold">Koleksi Resep Masakan</h1>
<p class="mt-1 text-muted">Cari resep, lihat bahan dan langkahnya, lalu masak.</p>

<div class="relative mt-5">
  <Search class="absolute left-3 top-3 h-4 w-4 text-muted" />
  <input bind:value={search} placeholder="Cari judul resep..." aria-label="Cari resep" class="w-full rounded-lg border border-line bg-paper py-2 pl-9 pr-3" />
</div>

<div class="mt-3 flex flex-wrap gap-2">
  <button class={chip(category === "")} onclick={() => (category = "")}>Semua</button>
  {#each $categories as c (c.id)}
    <button class={chip(category === c.id)} onclick={() => (category = c.id)}>{c.name}</button>
  {/each}
</div>

<div class="mt-6">
  {#if $loading}
    <p class="text-muted">Memuat...</p>
  {:else if $recipes.length === 0}
    <p class="text-muted">Tidak ada resep yang cocok.</p>
  {:else}
    <ul class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each $recipes as r (r.id)}
        <li><RecipeCard recipe={r} /></li>
      {/each}
    </ul>
  {/if}
</div>
