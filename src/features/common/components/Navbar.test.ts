import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { goto } from "$app/navigation";
import * as tools from "../../../helpers/toolsHelper";
import { user, resetAuth } from "../../auth/states/authStore";
import { me } from "../../../test-utils";
import Navbar from "./Navbar.svelte";

vi.mock("../../../helpers/toolsHelper");

describe("Navbar", () => {
  beforeEach(() => resetAuth());

  it("belum login: hanya merek, tanpa menu akun", () => {
    render(Navbar);
    expect(screen.getByRole("link", { name: /Koleksi Resep/ })).toHaveAttribute("href", "/");
    expect(screen.queryByRole("button", { name: "Keluar" })).toBeNull();
    expect(screen.queryByRole("link", { name: /Tambah Resep/ })).toBeNull();
  });
  it("sudah login: beranda, tambah resep, dan profil", () => {
    user.set(me);
    render(Navbar);
    expect(screen.getByRole("link", { name: "Beranda" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: /Tambah Resep/ })).toHaveAttribute("href", "/recipes/new");
    expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profile");
    expect(screen.getByText("Chef Demo")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });
    it("menampilkan foto profil bila ada", () => {
    user.set({ ...me, avatar_url: "/api/users/1/avatar?v=2" });
    render(Navbar);
    expect(screen.getByRole("img", { name: "Foto profil Chef Demo" })).toHaveAttribute("src", `${API_URL}/api/users/1/avatar?v=2`);
  });
  it("keluar: dibatalkan di dialog konfirmasi tidak melakukan apa pun", async () => {
    user.set(me);
    localStorage.setItem("token", "t");
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(false);
    render(Navbar);
    await userEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(tools.showConfirmDialog).toHaveBeenCalledWith("Yakin ingin keluar dari akun ini?");
    expect(localStorage.getItem("token")).toBe("t");
    expect(goto).not.toHaveBeenCalled();
  });
  it("keluar: dikonfirmasi menghapus sesi dan ke halaman masuk", async () => {
    user.set(me);
    localStorage.setItem("token", "t");
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(true);
    render(Navbar);
    await userEvent.click(screen.getByRole("button", { name: "Keluar" }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(localStorage.getItem("token")).toBeNull();
  });
});
