import { apiFetch } from "../../../helpers/apiHelper";

export const getCategoriesApi = () => apiFetch("/categories");

export const getRecipesApi = (search = "", category: number | string = "") => {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category) params.set("category", String(category));
  const qs = params.toString();
  return apiFetch(`/recipes${qs ? `?${qs}` : ""}`);
};

export const getRecipeApi = (id: number | string) => apiFetch(`/recipes/${id}`);
/** Resep dikirim sebagai multipart: field "data" (JSON) + file "image" bila ada. */
function toFormData({ image, ...data }: RecipeBody) {
  const fd = new FormData();
  fd.append("data", JSON.stringify(data));
  if (image) fd.append("image", image);
  return fd;
}

export const addRecipeApi = (body: RecipeBody) => apiFetch("/recipes", { method: "POST", body: toFormData(body) });
export const updateRecipeApi = (id: number | string, body: RecipeBody) => apiFetch(`/recipes/${id}`, { method: "PUT", body: toFormData(body) });
export const deleteRecipeApi = (id: number | string) => apiFetch(`/recipes/${id}`, { method: "DELETE" });
