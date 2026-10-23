<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { get } from "svelte/store";
  import { user, initAuth } from "../../auth/states/authStore";
  import { recipe, categories, saving, fetchCategories, fetchRecipe, saveRecipe } from "../states/recipesStore";
  import { showErrorDialog, showSuccessDialog } from "../../../helpers/toolsHelper";
  import RecipeForm from "../components/RecipeForm.svelte";

  let { id = undefined }: { id?: string } = $props();
  let ready = $state(false);
  let forbidden = $state(false);

  onMount(async () => {
    await initAuth();
    const me = get(user);
    if (!me) return goto("/auth/login");
    await fetchCategories();
    if (id) {
      const r = await fetchRecipe(id);
      forbidden = !!r.data && r.data.user_id !== me.id;
    } else recipe.set(null);
    ready = true;
  });

  async function submit(body: RecipeBody) {
    const r = await saveRecipe(body, id);
    if (!r.ok) return showErrorDialog(r.message);
    await showSuccessDialog(r.message);
    goto(`/recipes/${r.data.id}`);
  }
</script>

<h1 class="mb-5 text-3xl font-bold">{id ? "Ubah Resep" : "Tambah Resep"}</h1>

{#if !ready}
  <p class="text-muted">Memuat...</p>
{:else if forbidden}
  <p class="text-muted">Anda bukan pemilik resep ini.</p>
{:else if id && !$recipe}
  <p class="text-muted">Resep tidak ditemukan.</p>
{:else}
  <RecipeForm categories={$categories} initial={$recipe} saving={$saving} onsubmit={submit} />
{/if}
