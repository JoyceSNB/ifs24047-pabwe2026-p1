import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import * as api from "./recipeApi";

vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ ok: true }) }));
const f = apiFetch as unknown as ReturnType<typeof vi.fn>;
beforeEach(() => f.mockClear());

const body = (image: File | null = null): RecipeBody => ({
  title: "x", description: "", image, remove_image: false, cooking_time: 1, servings: 1,
  difficulty: "Mudah", category_id: 1, ingredients: [], steps: [],
});

describe("recipeApi", () => {
  it("kategori", () => {
    api.getCategoriesApi();
    expect(f).toHaveBeenCalledWith("/categories");
  });
  it("daftar resep dengan dan tanpa filter", () => {
    api.getRecipesApi();
    expect(f).toHaveBeenLastCalledWith("/recipes");
    api.getRecipesApi("arsik", 2);
    expect(f).toHaveBeenLastCalledWith("/recipes?search=arsik&category=2");
  });
  it("detail dan hapus", () => {
    api.getRecipeApi(1);
    expect(f).toHaveBeenLastCalledWith("/recipes/1");
    api.deleteRecipeApi(1);
    expect(f).toHaveBeenLastCalledWith("/recipes/1", { method: "DELETE" });
  });
  it("tambah dan ubah dikirim sebagai multipart (data JSON + file)", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    api.addRecipeApi(body(file));
    const [path, opt] = f.mock.calls.at(-1)!;
    expect(path).toBe("/recipes");
    expect(opt.method).toBe("POST");
    expect(JSON.parse(opt.body.get("data")).title).toBe("x");
    expect(JSON.parse(opt.body.get("data")).image).toBeUndefined();
    expect(opt.body.get("image")).toBeInstanceOf(File);
    api.updateRecipeApi(3, body());
    const [p2, o2] = f.mock.calls.at(-1)!;
    expect(p2).toBe("/recipes/3");
    expect(o2.method).toBe("PUT");
    expect(o2.body.has("image")).toBe(false);
  });
});
