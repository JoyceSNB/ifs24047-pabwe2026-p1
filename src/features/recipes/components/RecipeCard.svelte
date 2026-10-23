<script lang="ts">
  import { Clock, Users } from "lucide-svelte";
  import { fileUrl } from "../../../helpers/apiHelper";

  let { recipe }: { recipe: Recipe } = $props();
</script>

<a href={`/recipes/${recipe.id}`} class="group block overflow-hidden rounded-xl border border-line bg-paper transition hover:-translate-y-0.5 hover:shadow-md">
  {#if recipe.image_url}
    <img src={fileUrl(recipe.image_url)} alt={recipe.title} class="h-36 w-full object-cover" />
  {:else}
    <div class="flex h-36 items-center justify-center bg-turmeric/20 font-display text-5xl font-bold text-turmeric" aria-hidden="true">
      {recipe.title.charAt(0)}
    </div>
  {/if}
  <div class="p-4">
    <p class="text-xs font-medium text-leaf">{recipe.category_name}</p>
    <h2 class="mt-1 text-lg font-bold leading-snug group-hover:text-chili">{recipe.title}</h2>
    <p class="mt-1 line-clamp-2 text-sm text-muted">{recipe.description}</p>
    <div class="mt-3 flex items-center gap-4 text-xs text-muted">
      <span class="flex items-center gap-1"><Clock class="h-3.5 w-3.5" /> {recipe.cooking_time} menit</span>
      <span class="flex items-center gap-1"><Users class="h-3.5 w-3.5" /> {recipe.servings} porsi</span>
      <span class="ml-auto rounded-full border border-line px-2 py-0.5">{recipe.difficulty}</span>
    </div>
  </div>
</a>
