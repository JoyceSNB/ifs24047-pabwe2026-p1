<script lang="ts">
  import { fieldClass } from "../../../helpers/styles";
  import { MAX_IMAGE_BYTES, MAX_IMAGE_LABEL } from "../../../helpers/constants";
  import { unitOptions } from "../units";
  import { Plus, Trash2 } from "lucide-svelte";
  import { fileUrl } from "../../../helpers/apiHelper";

  let {
    categories,
    initial = null,
    saving = false,
    onsubmit,
  }: { categories: Category[]; initial?: Recipe | null; saving?: boolean; onsubmit: (body: RecipeBody) => void } = $props();

  // Nilai awal hanya dibaca sekali saat form dibuat.
  // svelte-ignore state_referenced_locally
  const init = initial;
  let title = $state(init?.title ?? "");
  let description = $state(init?.description ?? "");
  const currentImage = init?.image_url ?? null;
  let file = $state<File | null>(null);
  let previewUrl = $state<string | null>(null);
  let imageError = $state("");
  let removeImage = $state(false);
  let cookingTime = $state(init?.cooking_time ?? 30);
  let servings = $state(init?.servings ?? 2);
  let difficulty = $state(init?.difficulty ?? "Mudah");
  // svelte-ignore state_referenced_locally
  let categoryId = $state(init?.category_id ?? categories[0]?.id ?? 0);
  let ingredients = $state(
    init?.ingredients?.length
      ? init.ingredients.map((i) => ({ name: i.name, quantity: String(i.quantity), unit: i.unit }))
      : [{ name: "", quantity: "", unit: "" }]
  );
  let steps = $state(init?.steps?.length ? init.steps.map((s) => s.instruction) : [""]);

  const addIngredient = () => ingredients.push({ name: "", quantity: "", unit: "" });
  const removeIngredient = (i: number) => ingredients.splice(i, 1);
  const addStep = () => steps.push("");
  const removeStep = (i: number) => steps.splice(i, 1);

  function pickImage(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const f = input.files![0];
    imageError = "";
    file = null;
    previewUrl = null;
    if (!f) return;
    if (f.size > MAX_IMAGE_BYTES) {
      imageError = `Ukuran gambar maksimal ${MAX_IMAGE_LABEL}`;
      input.value = "";
      return;
    }
    file = f;
    previewUrl = URL.createObjectURL(f);
  }

  function submit(e: SubmitEvent) {
    e.preventDefault();
    onsubmit({
      title,
      description,
      image: file,
      remove_image: removeImage,
      cooking_time: Number(cookingTime),
      servings: Number(servings),
      difficulty,
      category_id: Number(categoryId),
      ingredients: $state.snapshot(ingredients),
      steps: $state.snapshot(steps),
    });
  }
</script>

<form onsubmit={submit} class="space-y-6">
  <div class="grid gap-4 sm:grid-cols-2">
    <label class="sm:col-span-2 text-sm font-medium">Judul
      <input bind:value={title} required maxlength="120" class={fieldClass} />
    </label>
    <label class="sm:col-span-2 text-sm font-medium">Deskripsi
      <textarea bind:value={description} rows="2" class={fieldClass}></textarea>
    </label>
    <div class="sm:col-span-2 text-sm font-medium">
      <label>Gambar (opsional, JPG/PNG/WebP, maks 2 MB)
        <input type="file" accept="image/jpeg,image/png,image/webp" onchange={pickImage} class={fieldClass} />
      </label>
      {#if imageError}<p class="mt-1 text-chili">{imageError}</p>{/if}
      {#if previewUrl}
        <img src={previewUrl} alt="Pratinjau gambar" class="mt-2 h-40 rounded-lg object-cover" />
      {:else if currentImage && !removeImage}
        <img src={fileUrl(currentImage)} alt="Gambar saat ini" class="mt-2 h-40 rounded-lg object-cover" />
      {/if}
      {#if currentImage}
        <label class="mt-2 flex items-center gap-2 font-normal"><input type="checkbox" bind:checked={removeImage} /> Hapus gambar saat ini</label>
      {/if}
    </div>
    <label class="text-sm font-medium">Kategori
      <select bind:value={categoryId} class={fieldClass}>
        {#each categories as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
      </select>
    </label>
    <label class="text-sm font-medium">Tingkat kesulitan
      <select bind:value={difficulty} class={fieldClass}>
        <option>Mudah</option><option>Sedang</option><option>Sulit</option>
      </select>
    </label>
    <label class="text-sm font-medium">Waktu memasak (menit)
      <input bind:value={cookingTime} type="number" min="1" required class={fieldClass} />
    </label>
    <label class="text-sm font-medium">Porsi
      <input bind:value={servings} type="number" min="1" required class={fieldClass} />
    </label>
  </div>

  <fieldset class="space-y-2">
    <legend class="mb-1 font-display text-lg font-bold">Bahan</legend>
    {#each ingredients as ing, i (i)}
      <div class="flex gap-2">
        <input bind:value={ing.name} placeholder="Nama bahan" aria-label={`Nama bahan ${i + 1}`} class={`${fieldClass} flex-[3]`} />
        <input bind:value={ing.quantity} placeholder="Jumlah" aria-label={`Jumlah bahan ${i + 1}`} class={`${fieldClass} flex-1`} />
        <select bind:value={ing.unit} aria-label={`Satuan bahan ${i + 1}`} class={`${fieldClass} flex-1`}>
          <option value="">Satuan</option>
          {#each unitOptions(ing.unit) as o (o.value)}<option>{`${o.value}`}</option>{/each}
        </select>
        <button type="button" onclick={() => removeIngredient(i)} aria-label={`Hapus bahan ${i + 1}`} class="px-2 text-chili"><Trash2 class="h-4 w-4" /></button>
      </div>
    {/each}
    <button type="button" onclick={addIngredient} class="flex items-center gap-1 text-sm font-medium text-leaf"><Plus class="h-4 w-4" /> Tambah bahan</button>
  </fieldset>

  <fieldset class="space-y-2">
    <legend class="mb-1 font-display text-lg font-bold">Langkah</legend>
    {#each steps as _, i (i)}
      <div class="flex gap-2">
        <span class="w-6 pt-2 text-sm text-muted">{i + 1}.</span>
        <textarea bind:value={steps[i]} rows="2" aria-label={`Langkah ${i + 1}`} class={fieldClass}></textarea>
        <button type="button" onclick={() => removeStep(i)} aria-label={`Hapus langkah ${i + 1}`} class="px-2 text-chili"><Trash2 class="h-4 w-4" /></button>
      </div>
    {/each}
    <button type="button" onclick={addStep} class="flex items-center gap-1 text-sm font-medium text-leaf"><Plus class="h-4 w-4" /> Tambah langkah</button>
  </fieldset>

  <div class="flex gap-3">
    <button type="submit" disabled={saving} class="rounded-lg bg-chili px-5 py-2 font-medium text-white disabled:opacity-60">
      {saving ? "Menyimpan..." : "Simpan"}
    </button>
    <a href="/" class="rounded-lg border border-line px-5 py-2">Batal</a>
  </div>
</form>