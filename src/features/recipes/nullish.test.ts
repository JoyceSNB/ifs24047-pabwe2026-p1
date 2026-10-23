import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/svelte";
import * as api from "./api/recipeApi";
import RecipeCard from "./components/RecipeCard.svelte";
import RecipeForm from "./components/RecipeForm.svelte";
import DetailPage from "./pages/DetailPage.svelte";
import { sampleRecipe } from "../../test-utils";

vi.mock("./api/recipeApi");
beforeEach(() => vi.resetAllMocks());

// Data dari API bisa saja memuat nilai kosong; komponen harus tetap tampil tanpa galat.
const blank: any = { cooking_time: undefined, servings: undefined };

describe("nilai kosong dari API", () => {
  it("RecipeCard", () => {
    render(RecipeCard, { recipe: sampleRecipe(blank) });
    expect(screen.getByText("Arsik Ikan Mas")).toBeInTheDocument();
  });
  it("DetailPage", async () => {
    vi.mocked(api.getRecipeApi).mockResolvedValue({
      ok: true,
      message: "",
      data: sampleRecipe({ ...blank, ingredients: [{ id: 1 } as any], steps: [{ id: 1 } as any] }),
    });
    render(DetailPage, { id: "1" });
    expect(await screen.findByRole("heading", { name: "Arsik Ikan Mas" })).toBeInTheDocument();
  });
  it("RecipeForm tanpa kategori dan opsi tanpa nama", () => {
    const initial: any = sampleRecipe({ category_id: undefined as any, ingredients: [{ name: "x" } as any] });
    render(RecipeForm, { categories: [], initial, onsubmit: vi.fn() });
    render(RecipeForm, { categories: [{ id: 1 } as any, { id: null, name: "N" } as any], onsubmit: vi.fn() });
    expect(screen.getAllByLabelText("Judul")).toHaveLength(2);
  });
  it("RecipeForm: daftar kategori diperbarui dengan isi yang sama / berbeda", async () => {
    const { rerender } = render(RecipeForm, { categories: [{ id: 1, name: "A" }], onsubmit: vi.fn() });
    await rerender({ categories: [{ id: 1, name: "A" }], onsubmit: vi.fn() });
    await rerender({ categories: [{ id: 1, name: "B" }], onsubmit: vi.fn() });
    expect(screen.getByRole("option", { name: "B" })).toBeInTheDocument();
  });
});
