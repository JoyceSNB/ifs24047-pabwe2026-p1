import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { goto } from "$app/navigation";
import * as api from "../api/recipeApi";
import * as tools from "../../../helpers/toolsHelper";
import HomePage from "./HomePage.svelte";
import DetailPage from "./DetailPage.svelte";
import FormPage from "./FormPage.svelte";
import { user, resetAuth } from "../../auth/states/authStore";
import { sampleRecipe, sampleCategories, me } from "../../../test-utils";

vi.mock("../api/recipeApi");
vi.mock("../../../helpers/toolsHelper");
const m = vi.mocked(api);
const t = vi.mocked(tools);
const res = (data: any, ok = true, message = "pesan") => ({ ok, message, data });

beforeEach(() => {
  vi.resetAllMocks();
  resetAuth();
  m.getCategoriesApi.mockResolvedValue(res({ categories: sampleCategories }));
});
afterEach(() => vi.useRealTimers());

describe("HomePage", () => {
  it("memuat resep, mencari, dan memfilter kategori", async () => {
    m.getRecipesApi.mockResolvedValue(res({ recipes: [sampleRecipe()] }));
    render(HomePage);
    expect(await screen.findByText("Arsik Ikan Mas")).toBeInTheDocument();
    await fireEvent.input(screen.getByLabelText("Cari resep"), { target: { value: "ars" } });
    await waitFor(() => expect(m.getRecipesApi).toHaveBeenLastCalledWith("ars", ""));
    await userEvent.click(await screen.findByRole("button", { name: "Lauk" }));
    await waitFor(() => expect(m.getRecipesApi).toHaveBeenLastCalledWith("ars", 2));
    await userEvent.click(screen.getByRole("button", { name: "Semua" }));
    await waitFor(() => expect(m.getRecipesApi).toHaveBeenLastCalledWith("ars", ""));
  });
  it("tampilan kosong", async () => {
    m.getRecipesApi.mockResolvedValue(res(null, false));
    render(HomePage);
    expect(await screen.findByText("Tidak ada resep yang cocok.")).toBeInTheDocument();
  });
  it("tampilan memuat", async () => {
    m.getRecipesApi.mockReturnValue(new Promise(() => {}));
    render(HomePage);
    expect(await screen.findByText("Memuat...")).toBeInTheDocument();
  });
});

describe("DetailPage", () => {
  it("menampilkan detail resep (dengan gambar)", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe({ image_url: "/api/recipes/1/image?v=1" })));
    render(DetailPage, { id: "1" });
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "Arsik Ikan Mas" })).toBeInTheDocument();
    expect(screen.getByText("1 ekor Ikan mas")).toBeInTheDocument();
    expect(screen.getByText("Haluskan bumbu")).toBeInTheDocument();
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
  it("detail tanpa bahan/langkah", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe({ ingredients: undefined, steps: undefined })));
    render(DetailPage, { id: "1" });
    expect(await screen.findByRole("heading", { name: "Arsik Ikan Mas" })).toBeInTheDocument();
  });
  it("tidak ditemukan", async () => {
    m.getRecipeApi.mockResolvedValue(res(null, false));
    render(DetailPage, { id: "9" });
    expect(await screen.findByText("Resep tidak ditemukan.")).toBeInTheDocument();
  });
  it("tombol ubah/hapus hanya untuk pemilik resep", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe()));
    const a = render(DetailPage, { id: "1" });
    expect(await screen.findByText("oleh Chef Demo")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Hapus/ })).toBeNull();
    a.unmount();
    user.set({ ...me, id: 2 });
    const b = render(DetailPage, { id: "1" });
    await screen.findByText("oleh Chef Demo");
    expect(screen.queryByRole("link", { name: /Ubah/ })).toBeNull();
    b.unmount();
    user.set(me);
    render(DetailPage, { id: "1" });
    expect(await screen.findByRole("link", { name: /Ubah/ })).toHaveAttribute("href", "/recipes/1/edit");
  });
  it("resep tanpa pembuat tidak menampilkan 'oleh'", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe({ author_name: null, user_id: null })));
    render(DetailPage, { id: "1" });
    await screen.findByRole("heading", { name: "Arsik Ikan Mas" });
    expect(screen.queryByText(/^oleh/)).toBeNull();
  });
  it("hapus: dibatalkan, gagal, dan berhasil", async () => {
    user.set(me);
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe()));
    render(DetailPage, { id: "1" });
    const btn = await screen.findByRole("button", { name: /Hapus/ });
    t.showConfirmDialog.mockResolvedValueOnce(false);
    await userEvent.click(btn);
    expect(m.deleteRecipeApi).not.toHaveBeenCalled();
    t.showConfirmDialog.mockResolvedValueOnce(true);
    m.deleteRecipeApi.mockResolvedValueOnce(res(null, false, "gagal"));
    await userEvent.click(btn);
    await waitFor(() => expect(t.showErrorDialog).toHaveBeenCalledWith("gagal"));
    t.showConfirmDialog.mockResolvedValueOnce(true);
    m.deleteRecipeApi.mockResolvedValueOnce(res(null));
    await userEvent.click(btn);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
  });
});

describe("FormPage", () => {
  beforeEach(() => user.set(me));
  const fill = async () => {
    await screen.findByRole("heading", { name: /Resep/ });
    await waitFor(() => expect(screen.getByLabelText("Judul")).toBeInTheDocument());
    await userEvent.type(screen.getByLabelText("Judul"), "Baru");
    await userEvent.type(screen.getByLabelText("Nama bahan 1"), "Telur");
    await userEvent.type(screen.getByLabelText("Langkah 1"), "Goreng");
  };
  it("tambah resep: gagal lalu berhasil", async () => {
    render(FormPage);
    await fill();
    m.addRecipeApi.mockResolvedValueOnce(res(null, false, "ditolak"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(t.showErrorDialog).toHaveBeenCalledWith("ditolak"));
    m.addRecipeApi.mockResolvedValueOnce(res({ id: 7 }, true, "Resep berhasil ditambahkan"));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/recipes/7"));
  });
  it("ubah resep memuat data lalu menyimpan", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe()));
    m.updateRecipeApi.mockResolvedValue(res({ id: 1 }));
    render(FormPage, { id: "1" });
    expect(await screen.findByDisplayValue("Arsik Ikan Mas")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(m.updateRecipeApi).toHaveBeenCalled());
  });
  it("belum login diarahkan ke halaman masuk", async () => {
    user.set(null);
    render(FormPage);
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(m.getCategoriesApi).not.toHaveBeenCalled();
  });
  it("bukan pemilik resep tidak boleh mengubah", async () => {
    m.getRecipeApi.mockResolvedValue(res(sampleRecipe({ user_id: 99 })));
    render(FormPage, { id: "1" });
    expect(await screen.findByText("Anda bukan pemilik resep ini.")).toBeInTheDocument();
  });
  it("ubah resep yang tidak ada", async () => {
    m.getRecipeApi.mockResolvedValue(res(null, false));
    render(FormPage, { id: "9" });
    expect(await screen.findByText("Resep tidak ditemukan.")).toBeInTheDocument();
  });
});
