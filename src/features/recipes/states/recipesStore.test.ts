import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import * as api from "../api/recipeApi";
import * as s from "./recipesStore";
import { sampleRecipe, sampleCategories } from "../../../test-utils";

vi.mock("../api/recipeApi");
const m = vi.mocked(api);
beforeEach(() => vi.resetAllMocks());

describe("recipesStore", () => {
  it("fetchCategories sukses dan gagal", async () => {
    m.getCategoriesApi.mockResolvedValueOnce({ ok: true, message: "", data: { categories: sampleCategories } });
    await s.fetchCategories();
    expect(get(s.categories)).toEqual(sampleCategories);
    m.getCategoriesApi.mockResolvedValueOnce({ ok: false, message: "x", data: null });
    await s.fetchCategories();
    expect(get(s.categories)).toEqual(sampleCategories);
  });
  it("fetchRecipes sukses dan gagal", async () => {
    m.getRecipesApi.mockResolvedValueOnce({ ok: true, message: "", data: { recipes: [sampleRecipe()] } });
    await s.fetchRecipes("a", 1);
    expect(get(s.recipes)).toHaveLength(1);
    expect(get(s.loading)).toBe(false);
    m.getRecipesApi.mockResolvedValueOnce({ ok: false, message: "x", data: null });
    await s.fetchRecipes();
    expect(get(s.recipes)).toEqual([]);
  });
  it("fetchRecipe sukses dan gagal", async () => {
    m.getRecipeApi.mockResolvedValueOnce({ ok: true, message: "", data: sampleRecipe() });
    await s.fetchRecipe(1);
    expect(get(s.recipe)?.id).toBe(1);
    m.getRecipeApi.mockResolvedValueOnce({ ok: false, message: "x", data: null });
    await s.fetchRecipe(2);
    expect(get(s.recipe)).toBeNull();
  });
  it("saveRecipe: tambah vs ubah", async () => {
    m.addRecipeApi.mockResolvedValue({ ok: true, message: "", data: {} });
    m.updateRecipeApi.mockResolvedValue({ ok: true, message: "", data: {} });
    await s.saveRecipe({} as RecipeBody);
    expect(m.addRecipeApi).toHaveBeenCalled();
    await s.saveRecipe({} as RecipeBody, 3);
    expect(m.updateRecipeApi).toHaveBeenCalledWith(3, {});
    expect(get(s.saving)).toBe(false);
  });
  it("removeRecipe", async () => {
    m.deleteRecipeApi.mockResolvedValue({ ok: true, message: "", data: null });
    expect((await s.removeRecipe(1)).ok).toBe(true);
  });
  it("fetchRecipes: respons lama yang datang terlambat diabaikan", async () => {
    let resolveOld: (v: any) => void = () => {};
    m.getRecipesApi.mockReturnValueOnce(new Promise((r) => (resolveOld = r)));
    m.getRecipesApi.mockResolvedValueOnce({ ok: true, message: "", data: { recipes: [sampleRecipe({ id: 2, title: "Baru" })] } });
    const lama = s.fetchRecipes("a");
    await s.fetchRecipes("ab");
    resolveOld({ ok: true, message: "", data: { recipes: [sampleRecipe({ id: 1, title: "Lama" })] } });
    await lama;
    expect(get(s.recipes).map((r) => r.title)).toEqual(["Baru"]);
    expect(get(s.loading)).toBe(false);
  });
});
