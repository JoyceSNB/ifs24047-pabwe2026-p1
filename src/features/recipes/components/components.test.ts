import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import RecipeCard from "./RecipeCard.svelte";
import RecipeForm from "./RecipeForm.svelte";
import { sampleRecipe, sampleCategories } from "../../../test-utils";

describe("RecipeCard", () => {
  it("tanpa gambar menampilkan inisial", () => {
    render(RecipeCard, { recipe: sampleRecipe() });
    expect(screen.getByText("Arsik Ikan Mas")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute("href", "/recipes/1");
  });
  it("dengan gambar", () => {
    render(RecipeCard, { recipe: sampleRecipe({ image_url: "/api/recipes/1/image?v=5" }) });
    expect(screen.getByRole("img")).toHaveAttribute("src", `${API_URL}/api/recipes/1/image?v=5`);
  });
});

describe("RecipeForm", () => {
  it("form kosong: kirim data lengkap, tambah/hapus bahan dan langkah", async () => {
    const onsubmit = vi.fn();
    const user = userEvent.setup();
    render(RecipeForm, { categories: sampleCategories, onsubmit });
    await user.type(screen.getByLabelText("Judul"), "Telur");
    await user.type(screen.getByLabelText("Nama bahan 1"), "Telur");
    await user.type(screen.getByLabelText("Langkah 1"), "Goreng");
    await user.click(screen.getByText("Tambah bahan"));
    await user.click(screen.getByText("Tambah langkah"));
    expect(screen.getByLabelText("Nama bahan 2")).toBeInTheDocument();
    await user.click(screen.getByLabelText("Hapus bahan 2"));
    await user.click(screen.getByLabelText("Hapus langkah 2"));
    expect(screen.queryByLabelText("Nama bahan 2")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    const body = onsubmit.mock.calls[0][0];
    expect(body).toMatchObject({ title: "Telur", category_id: 1, cooking_time: 30, servings: 2, difficulty: "Mudah" });
    expect(body.ingredients).toEqual([{ name: "Telur", quantity: "", unit: "" }]);
    expect(body.steps).toEqual(["Goreng"]);
  });
  it("mode ubah memuat nilai awal dan status menyimpan", () => {
    render(RecipeForm, { categories: sampleCategories, initial: sampleRecipe(), saving: true, onsubmit: vi.fn() });
    expect(screen.getByLabelText("Judul")).toHaveValue("Arsik Ikan Mas");
    expect(screen.getByLabelText("Nama bahan 1")).toHaveValue("Ikan mas");
    expect(screen.getByLabelText("Langkah 1")).toHaveValue("Haluskan bumbu");
    expect(screen.getByRole("button", { name: "Menyimpan..." })).toBeDisabled();
  });
  it("initial tanpa bahan/langkah dan tanpa kategori", () => {
    render(RecipeForm, { categories: [], initial: sampleRecipe({ ingredients: [], steps: [], image_url: "https://x" }), onsubmit: vi.fn() });
    expect(screen.getByLabelText("Nama bahan 1")).toHaveValue("");
    expect(screen.getByLabelText("Langkah 1")).toHaveValue("");
  });
  it("semua kolom bisa diisi dan terkirim (tanpa gambar)", async () => {
    const onsubmit = vi.fn();
    const user = userEvent.setup();
    render(RecipeForm, { categories: sampleCategories, onsubmit });
    await user.type(screen.getByLabelText("Judul"), "Sop");
    await user.type(screen.getByLabelText("Deskripsi"), "Hangat");
    await user.selectOptions(screen.getByLabelText("Kategori"), "2");
    await user.selectOptions(screen.getByLabelText("Tingkat kesulitan"), "Sulit");
    await user.clear(screen.getByLabelText("Waktu memasak (menit)"));
    await user.type(screen.getByLabelText("Waktu memasak (menit)"), "45");
    await user.clear(screen.getByLabelText("Porsi"));
    await user.type(screen.getByLabelText("Porsi"), "6");
    await user.type(screen.getByLabelText("Nama bahan 1"), "Ayam");
    await user.type(screen.getByLabelText("Jumlah bahan 1"), "2");
    await user.selectOptions(screen.getByLabelText("Satuan bahan 1"), "potong");
    await user.type(screen.getByLabelText("Langkah 1"), "Rebus");
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    expect(onsubmit).toHaveBeenCalledWith({
      title: "Sop",
      description: "Hangat",
      image: null,
      remove_image: false,
      cooking_time: 45,
      servings: 6,
      difficulty: "Sulit",
      category_id: 2,
      ingredients: [{ name: "Ayam", quantity: "2", unit: "potong" }],
      steps: ["Rebus"],
    });
  });
  it("memilih gambar: pratinjau tampil dan file ikut terkirim", async () => {
    const onsubmit = vi.fn();
    const user = userEvent.setup();
    render(RecipeForm, { categories: sampleCategories, onsubmit });
    const file = new File(["x"], "a.png", { type: "image/png" });
    await user.upload(screen.getByLabelText(/Gambar \(opsional/), file);
    expect(screen.getByAltText("Pratinjau gambar")).toHaveAttribute("src", "blob:pratinjau");
    await user.type(screen.getByLabelText("Judul"), "T");
    await user.type(screen.getByLabelText("Nama bahan 1"), "B");
    await user.type(screen.getByLabelText("Langkah 1"), "L");
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    expect(onsubmit.mock.calls[0][0].image).toBe(file);
  });
  it("gambar lebih dari 2 MB ditolak; membatalkan pilihan mengosongkan lagi", async () => {
    const user = userEvent.setup();
    render(RecipeForm, { categories: sampleCategories, onsubmit: vi.fn() });
    const input = screen.getByLabelText(/Gambar \(opsional/);
    await user.upload(input, new File([new Uint8Array(2 * 1024 * 1024 + 1)], "b.png", { type: "image/png" }));
    expect(screen.getByText("Ukuran gambar maksimal 2 MB")).toBeInTheDocument();
    expect(screen.queryByAltText("Pratinjau gambar")).toBeNull();
    await user.upload(input, new File(["x"], "ok.png", { type: "image/png" }));
    expect(screen.queryByText("Ukuran gambar maksimal 2 MB")).toBeNull();
    await fireEvent.change(input, { target: { files: [] } });
    expect(screen.queryByAltText("Pratinjau gambar")).toBeNull();
  });
  it("mode ubah: gambar saat ini tampil dan bisa dihapus", async () => {
    const onsubmit = vi.fn();
    const user = userEvent.setup();
    render(RecipeForm, { categories: sampleCategories, initial: sampleRecipe({ image_url: "/api/recipes/1/image?v=5" }), onsubmit });
    expect(screen.getByAltText("Gambar saat ini")).toHaveAttribute("src", `${API_URL}/api/recipes/1/image?v=5`);
    await user.click(screen.getByLabelText("Hapus gambar saat ini"));
    expect(screen.queryByAltText("Gambar saat ini")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Simpan" }));
    expect(onsubmit.mock.calls[0][0].remove_image).toBe(true);
  });
});
