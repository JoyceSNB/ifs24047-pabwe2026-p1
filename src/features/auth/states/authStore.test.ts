import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import * as api from "../api/authApi";
import { apiFetch } from "../../../helpers/apiHelper";
import { user, initAuth, resetAuth, login, register, logout, updateProfile, changeAvatar, removeAvatar } from "./authStore";
import { me } from "../../../test-utils";

vi.mock("../api/authApi");
const m = vi.mocked(api);
const res = (ok: boolean, data: any = null) => ({ ok, message: "pesan", data });

beforeEach(() => {
  vi.resetAllMocks();
  resetAuth();
});

describe("authStore", () => {
  it("initAuth tanpa token tidak memanggil API", async () => {
    await initAuth();
    expect(m.meApi).not.toHaveBeenCalled();
    expect(get(user)).toBeNull();
  });
  it("initAuth dengan token valid memulihkan user, dan hanya berjalan sekali", async () => {
    localStorage.setItem("token", "t");
    m.meApi.mockResolvedValue(res(true, { user: me }));
    await initAuth();
    await initAuth();
    expect(get(user)).toEqual(me);
    expect(m.meApi).toHaveBeenCalledTimes(1);
  });
  it("initAuth dengan token kedaluwarsa menghapus token", async () => {
    localStorage.setItem("token", "t");
    m.meApi.mockResolvedValue(res(false));
    await initAuth();
    expect(localStorage.getItem("token")).toBeNull();
    expect(get(user)).toBeNull();
  });
  it("login sukses menyimpan sesi, gagal tidak", async () => {
    m.loginApi.mockResolvedValueOnce(res(false));
    expect((await login({ email: "a", password: "b" })).ok).toBe(false);
    expect(get(user)).toBeNull();
    m.loginApi.mockResolvedValueOnce(res(true, { token: "tok", user: me }));
    await login({ email: "a", password: "b" });
    expect(localStorage.getItem("token")).toBe("tok");
    expect(get(user)).toEqual(me);
  });
  it("register sukses dan gagal", async () => {
    m.registerApi.mockResolvedValueOnce(res(false));
    await register({ name: "a", email: "b", password: "c" });
    expect(get(user)).toBeNull();
    m.registerApi.mockResolvedValueOnce(res(true, { token: "tok2", user: me }));
    await register({ name: "a", email: "b", password: "c" });
    expect(localStorage.getItem("token")).toBe("tok2");
  });
  it("logout menghapus token dan user", async () => {
    m.loginApi.mockResolvedValue(res(true, { token: "tok", user: me }));
    await login({ email: "a", password: "b" });
    logout();
    expect(localStorage.getItem("token")).toBeNull();
    expect(get(user)).toBeNull();
  });
  it("updateProfile: sukses memperbarui user, gagal tidak", async () => {
    user.set(me);
    const body = { name: "Baru", current_password: "", new_password: "" };
    m.updateProfileApi.mockResolvedValueOnce(res(false));
    expect((await updateProfile(body)).ok).toBe(false);
    expect(get(user)).toEqual(me);
    m.updateProfileApi.mockResolvedValueOnce(res(true, { user: { ...me, name: "Baru" } }));
    await updateProfile(body);
    expect(get(user)?.name).toBe("Baru");
  });
  it("token ditolak server di tengah sesi -> otomatis logout", async () => {
    user.set(me);
    localStorage.setItem("token", "kedaluwarsa");
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, json: async () => ({ success: false, message: "x" }) }));
    await apiFetch("/recipes");
    expect(get(user)).toBeNull();
    vi.unstubAllGlobals();
  });
    it("changeAvatar dan removeAvatar memperbarui user bila sukses", async () => {
    user.set(me);
    const withPhoto = { ...me, avatar_url: "/api/users/1/avatar?v=1" };
    m.uploadAvatarApi.mockResolvedValueOnce(res(false));
    expect((await changeAvatar(new File(["x"], "a.png"))).ok).toBe(false);
    expect(get(user)).toEqual(me);
    m.uploadAvatarApi.mockResolvedValueOnce(res(true, { user: withPhoto }));
    await changeAvatar(new File(["x"], "a.png"));
    expect(get(user)).toEqual(withPhoto);
    m.deleteAvatarApi.mockResolvedValueOnce(res(false));
    await removeAvatar();
    expect(get(user)).toEqual(withPhoto);
    m.deleteAvatarApi.mockResolvedValueOnce(res(true, { user: me }));
    await removeAvatar();
    expect(get(user)).toEqual(me);
  });
});
