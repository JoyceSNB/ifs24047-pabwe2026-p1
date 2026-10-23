import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/svelte";
import userEvent from "@testing-library/user-event";
import { goto } from "$app/navigation";
import * as recipeApi from "../../recipes/api/recipeApi";
import * as authApi from "../api/authApi";
import * as tools from "../../../helpers/toolsHelper";
import { user, resetAuth } from "../states/authStore";
import ProfilePage from "./ProfilePage.svelte";
import { sampleRecipe, me } from "../../../test-utils";

vi.mock("../../recipes/api/recipeApi");
vi.mock("../api/authApi");
vi.mock("../../../helpers/toolsHelper");
const rApi = vi.mocked(recipeApi);
const aApi = vi.mocked(authApi);
const t = vi.mocked(tools);
const list = (recipes: Recipe[]) => ({ ok: true, message: "", data: { recipes } });

beforeEach(() => {
  vi.resetAllMocks();
  resetAuth();
  user.set(me);
  rApi.getRecipesApi.mockResolvedValue(list([]));
});

describe("ProfilePage", () => {
  it("menampilkan profil, tautan ke beranda, dan hanya resep milik sendiri", async () => {
    rApi.getRecipesApi.mockResolvedValue(list([sampleRecipe({ id: 1, title: "Resep Saya" }), sampleRecipe({ id: 2, title: "Resep Orang", user_id: 9 })]));
    render(ProfilePage);
    expect(screen.getByRole("heading", { name: "Chef Demo" })).toBeInTheDocument();
    expect(screen.getByText("demo@resep.id")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Beranda/ })).toHaveAttribute("href", "/");
    expect(await screen.findByText("Resep Saya")).toBeInTheDocument();
    expect(screen.queryByText("Resep Orang")).toBeNull();
  });
  it("belum punya resep dan status memuat", async () => {
    render(ProfilePage);
    expect(screen.getByText("Memuat...")).toBeInTheDocument();
    expect(await screen.findByText(/belum menambahkan resep/)).toBeInTheDocument();
  });
  it("keluar: batal di konfirmasi, lalu dikonfirmasi", async () => {
    localStorage.setItem("token", "t");
    render(ProfilePage);
    t.showConfirmDialog.mockResolvedValueOnce(false);
    await userEvent.click(screen.getByRole("button", { name: "Keluar" }));
    expect(goto).not.toHaveBeenCalled();
    t.showConfirmDialog.mockResolvedValueOnce(true);
    await userEvent.click(screen.getByRole("button", { name: "Keluar" }));
    await waitFor(() => expect(goto).toHaveBeenCalledWith("/auth/login"));
    expect(localStorage.getItem("token")).toBeNull();
    await waitFor(() => expect(screen.queryByRole("heading", { name: "Chef Demo" })).toBeNull());
  });
  it("ubah profil: berhasil memperbarui nama", async () => {
    aApi.updateProfileApi.mockResolvedValue({ ok: true, message: "Profil berhasil diperbarui", data: { user: { ...me, name: "Nama Baru" } } });
    render(ProfilePage);
    await userEvent.click(screen.getByRole("button", { name: "Ubah Profil" }));
    expect(screen.queryByRole("button", { name: "Ubah Profil" })).toBeNull();
    const nameInput = screen.getByLabelText("Nama");
    expect(nameInput).toHaveValue("Chef Demo");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Nama Baru");
    await userEvent.type(screen.getByLabelText("Password saat ini"), "demo1234");
    await userEvent.type(screen.getByLabelText("Password baru"), "baru12345");
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    await waitFor(() => expect(t.showSuccessDialog).toHaveBeenCalledWith("Profil berhasil diperbarui"));
    expect(aApi.updateProfileApi).toHaveBeenCalledWith({ name: "Nama Baru", current_password: "demo1234", new_password: "baru12345" });
    expect(await screen.findByRole("heading", { name: "Nama Baru" })).toBeInTheDocument();
    expect(screen.queryByLabelText("Password baru")).toBeNull();
  });
  it("ubah profil: gagal menampilkan pesan dan form tetap terbuka; batal menutup form", async () => {
    let resolve: (v: any) => void = () => {};
    aApi.updateProfileApi.mockReturnValue(new Promise((r) => (resolve = r)));
    render(ProfilePage);
    await userEvent.click(screen.getByRole("button", { name: "Ubah Profil" }));
    await userEvent.click(screen.getByRole("button", { name: "Simpan" }));
    expect(await screen.findByRole("button", { name: "Menyimpan..." })).toBeDisabled();
    resolve({ ok: false, message: "Password saat ini salah", data: null });
    await waitFor(() => expect(t.showErrorDialog).toHaveBeenCalledWith("Password saat ini salah"));
    expect(screen.getByLabelText("Nama")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Batal" }));
    expect(screen.queryByLabelText("Nama")).toBeNull();
    expect(screen.getByRole("button", { name: "Ubah Profil" })).toBeInTheDocument();
  });

  describe("foto profil", () => {
    const png = () => new File(["x"], "a.png", { type: "image/png" });
    const withPhoto = { ...me, avatar_url: "/api/users/1/avatar?v=3" };

    it("belum punya foto: ada inisial dan tombol Ganti foto, tanpa Hapus foto", () => {
      render(ProfilePage);
      expect(screen.getByLabelText("Ganti foto")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Hapus foto" })).toBeNull();
      expect(screen.queryByRole("img", { name: /Foto profil/ })).toBeNull();
    });
    it("ganti foto: berhasil menampilkan gambar baru", async () => {
      aApi.uploadAvatarApi.mockResolvedValue({ ok: true, message: "Foto profil berhasil diperbarui", data: { user: withPhoto } });
      render(ProfilePage);
      await userEvent.upload(screen.getByLabelText("Ganti foto"), png());
      await waitFor(() => expect(t.showSuccessDialog).toHaveBeenCalledWith("Foto profil berhasil diperbarui"));
      expect(await screen.findByRole("img", { name: "Foto profil Chef Demo" })).toHaveAttribute("src", `${API_URL}/api/users/1/avatar?v=3`);
      expect(screen.getByRole("button", { name: "Hapus foto" })).toBeInTheDocument();
    });
    it("ganti foto: gagal dari server menampilkan pesan", async () => {
      aApi.uploadAvatarApi.mockResolvedValue({ ok: false, message: "Format gambar harus JPG, PNG, atau WEBP", data: null });
      render(ProfilePage);
      await userEvent.upload(screen.getByLabelText("Ganti foto"), png());
      await waitFor(() => expect(t.showErrorDialog).toHaveBeenCalledWith("Format gambar harus JPG, PNG, atau WEBP"));
    });
    it("ganti foto: lebih dari 2 MB ditolak di browser, dan pilihan kosong diabaikan", async () => {
      render(ProfilePage);
      const input = screen.getByLabelText("Ganti foto");
      await userEvent.upload(input, new File([new Uint8Array(2 * 1024 * 1024 + 1)], "b.png", { type: "image/png" }));
      expect(t.showErrorDialog).toHaveBeenCalledWith("Ukuran gambar maksimal 2 MB");
      expect(aApi.uploadAvatarApi).not.toHaveBeenCalled();
      await fireEvent.change(input, { target: { files: [] } });
      expect(aApi.uploadAvatarApi).not.toHaveBeenCalled();
    });
    it("hapus foto: dibatalkan, gagal, lalu berhasil", async () => {
      user.set(withPhoto);
      render(ProfilePage);
      const btn = screen.getByRole("button", { name: "Hapus foto" });
      t.showConfirmDialog.mockResolvedValueOnce(false);
      await userEvent.click(btn);
      expect(aApi.deleteAvatarApi).not.toHaveBeenCalled();
      t.showConfirmDialog.mockResolvedValueOnce(true);
      aApi.deleteAvatarApi.mockResolvedValueOnce({ ok: false, message: "gagal hapus", data: null });
      await userEvent.click(btn);
      await waitFor(() => expect(t.showErrorDialog).toHaveBeenCalledWith("gagal hapus"));
      t.showConfirmDialog.mockResolvedValueOnce(true);
      aApi.deleteAvatarApi.mockResolvedValueOnce({ ok: true, message: "", data: { user: me } });
      await userEvent.click(btn);
      await waitFor(() => expect(screen.queryByRole("button", { name: "Hapus foto" })).toBeNull());
    });
  });
});