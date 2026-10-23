import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";

// lucide-svelte di-mock: setiap ikon menjadi komponen Svelte 5 kosong
vi.mock("lucide-svelte", () => {
  const Icon = () => {};
  return { Plus: Icon, ChefHat: Icon, Clock: Icon, Users: Icon, Search: Icon, Trash2: Icon, Pencil: Icon, ArrowLeft: Icon };
});

// $app/navigation dan $app/state di-mock supaya komponen bisa diuji tanpa runtime SvelteKit
vi.mock("$app/navigation", () => ({ goto: vi.fn() }));
vi.mock("$app/state", () => ({ page: { url: new URL("http://localhost/"), params: { id: "1" } } }));

// jsdom tidak punya URL.createObjectURL
URL.createObjectURL = vi.fn(() => "blob:pratinjau");

afterEach(() => localStorage.clear());
