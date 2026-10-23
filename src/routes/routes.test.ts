import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import { createRawSnippet } from "svelte";
import * as api from "../features/recipes/api/recipeApi";
import { goto } from "$app/navigation";
import { page } from "$app/state";
import { user, resetAuth } from "../features/auth/states/authStore";
import { sampleRecipe, sampleCategories, me } from "../test-utils";
import Layout from "./+layout.svelte";
import Home from "./+page.svelte";
import ErrorPage from "./+error.svelte";
import NewPage from "./recipes/new/+page.svelte";
import DetailRoute from "./recipes/[id]/+page.svelte";
import EditRoute from "./recipes/[id]/edit/+page.svelte";
import LoginRoute from "./auth/login/+page.svelte";
import RegisterRoute from "./auth/register/+page.svelte";
import ProfileRoute from "./profile/+page.svelte";
import { ssr } from "./+layout";

vi.mock("../features/recipes/api/recipeApi");
const m = vi.mocked(api);
const ok = (data: any) => ({ ok: true, message: "", data });

beforeEach(() => {
  vi.resetAllMocks();
  resetAuth();
  (page as any).url = new URL("http://localhost/");
  m.getCategoriesApi.mockResolvedValue(ok({ categories: sampleCategories }));
  m.getRecipesApi.mockResolvedValue(ok({ recipes: [] }));
  m.getRecipeApi.mockResolvedValue(ok(sampleRecipe()));
});

describe("routes", () => {
  const children = createRawSnippet(() => ({ render: () => "<p>isi halaman</p>" }));

  it("layout: sudah login membuka halaman biasa -> navbar + isi", async () => {
    user.set(me);
    render(Layout, { children });
    expect(await screen.findByText("isi halaman")).toBeInTheDocument();
    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(goto).not.toHaveBeenCalled();
    expect(ssr).toBe(false);
  });
  it("layout: menampilkan 'Memuat...' selama status login dicek", async () => {
    (page as any).url = new URL("http://localhost/auth/login");
    render(Layout, { children });
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(await screen.findByText("isi halaman")).toBeInTheDocument();
    expect(screen.queryByText("Memuat...")).toBeNull();
  });
  it("layout: tamu membuka halaman biasa -> diarahkan ke masuk, isi tidak tampil", async () => {
    render(Layout, { children });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(screen.queryByText("isi halaman")).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });
  it("layout: tamu di halaman masuk -> hanya isi halaman masuk (tanpa navbar)", async () => {
    (page as any).url = new URL("http://localhost/auth/login");
    render(Layout, { children });
    expect(await screen.findByText("isi halaman")).toBeInTheDocument();
    expect(screen.queryByRole("navigation")).toBeNull();
    expect(goto).not.toHaveBeenCalled();
  });
  it("layout: sudah login di halaman masuk -> diarahkan ke beranda", async () => {
    user.set(me);
    (page as any).url = new URL("http://localhost/auth/login");
    render(Layout, { children });
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/"));
    expect(screen.queryByText("isi halaman")).toBeNull();
  });
  it("halaman beranda", async () => {
    render(Home);
    expect(await screen.findByText("Koleksi Resep Masakan")).toBeInTheDocument();
  });
  it("halaman error", () => {
    render(ErrorPage);
    expect(screen.getByText("Halaman tidak ditemukan")).toBeInTheDocument();
  });
  it("halaman tambah, detail, dan ubah", async () => {
    const a = render(NewPage);
    expect(await screen.findByRole("heading", { name: "Tambah Resep" })).toBeInTheDocument();
    a.unmount();
    const b = render(DetailRoute);
    expect(await screen.findByRole("heading", { name: "Arsik Ikan Mas" })).toBeInTheDocument();
    b.unmount();
    render(EditRoute);
    expect(await screen.findByRole("heading", { name: "Ubah Resep" })).toBeInTheDocument();
  });
  it("halaman profil", async () => {
    user.set(me);
    render(ProfileRoute);
    expect(await screen.findByRole("heading", { name: "Chef Demo" })).toBeInTheDocument();
  });
  it("halaman masuk dan daftar", () => {
    const a = render(LoginRoute);
    expect(screen.getByRole("heading", { name: "Masuk" })).toBeInTheDocument();
    a.unmount();
    render(RegisterRoute);
    expect(screen.getByRole("heading", { name: "Daftar" })).toBeInTheDocument();
  });
});
