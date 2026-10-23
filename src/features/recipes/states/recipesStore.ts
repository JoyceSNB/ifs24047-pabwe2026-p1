import { writable } from "svelte/store";
import * as api from "../api/recipeApi";

export const recipes = writable<Recipe[]>([]);
export const recipe = writable<Recipe | null>(null);
export const categories = writable<Category[]>([]);
export const loading = writable(false);
/** Pesan galat dari pengambilan daftar resep terakhir (kosong bila sukses). */
export const listError = writable("");
export const saving = writable(false);

export async function fetchCategories() {
  const r = await api.getCategoriesApi();
  if (r.ok) categories.set(r.data.categories);
  return r;
}

let latestListRequest = 0;

export async function fetchRecipes(search = "", category: number | string = "") {
  const requestId = ++latestListRequest;
  loading.set(true);
  listError.set("");
  const r = await api.getRecipesApi(search, category);
  // Abaikan respons lama bila sudah ada permintaan yang lebih baru (mencegah daftar "loncat" saat mengetik cepat).
  if (requestId !== latestListRequest) return r;
  recipes.set(r.ok ? r.data.recipes : []);
  listError.set(r.ok ? "" : r.message);
  loading.set(false);
  return r;
}

export async function fetchRecipe(id: number | string) {
  loading.set(true);
  const r = await api.getRecipeApi(id);
  recipe.set(r.ok ? r.data : null);
  loading.set(false);
  return r;
}

export async function saveRecipe(body: RecipeBody, id?: number | string) {
  saving.set(true);
  const r = id ? await api.updateRecipeApi(id, body) : await api.addRecipeApi(body);
  saving.set(false);
  return r;
}

export async function removeRecipe(id: number | string) {
  return api.deleteRecipeApi(id);
}