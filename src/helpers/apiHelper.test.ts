import { describe, it, expect, vi, afterEach } from "vitest";
import { apiFetch, fileUrl, setUnauthorizedHandler } from "./apiHelper";

afterEach(() => vi.unstubAllGlobals());
const stub = (json: unknown) => {
  const f = vi.fn().mockResolvedValue({ json: async () => json });
  vi.stubGlobal("fetch", f);
  return f;
};

describe("apiFetch", () => {
  it("GET sukses tanpa body dan tanpa token", async () => {
    const f = stub({ success: true, message: "ok", data: { a: 1 } });
    expect(await apiFetch("/recipes")).toEqual({ ok: true, message: "ok", data: { a: 1 } });
    expect(f).toHaveBeenCalledWith(`${API_URL}/api/recipes`, { method: "GET", headers: {}, body: undefined });
  });
  it("menyertakan token bila sudah login", async () => {
    const f = stub({ success: true });
    localStorage.setItem("token", "abc");
    await apiFetch("/auth/me");
    expect(f.mock.calls[0][1].headers.Authorization).toBe("Bearer abc");
  });
  it("POST JSON, dan success=false ditandai gagal", async () => {
    const f = stub({ success: false, message: "salah" });
    const r = await apiFetch("/x", { method: "POST", body: { x: 1 } });
    expect(r.ok).toBe(false);
    expect(f.mock.calls[0][1].body).toBe('{"x":1}');
    expect(f.mock.calls[0][1].headers["Content-Type"]).toBe("application/json");
  });
  it("FormData dikirim apa adanya tanpa Content-Type", async () => {
    const f = stub({ success: true });
    const fd = new FormData();
    await apiFetch("/x", { method: "POST", body: fd });
    expect(f.mock.calls[0][1].body).toBe(fd);
    expect(f.mock.calls[0][1].headers["Content-Type"]).toBeUndefined();
  });
  it("galat jaringan", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("x")));
    expect(await apiFetch("/x")).toEqual({ ok: false, message: "Gagal terhubung ke server", data: null });
  });
  it("fileUrl menambahkan alamat backend", () => {
    expect(fileUrl("/api/recipes/1/image")).toBe(`${API_URL}/api/recipes/1/image`);
  });
  it("401 saat membawa token: token dihapus dan handler dipanggil", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, json: async () => ({ success: false, message: "x" }) }));
    localStorage.setItem("token", "kedaluwarsa");
    const r = await apiFetch("/auth/me");
    expect(r.ok).toBe(false);
    expect(localStorage.getItem("token")).toBeNull();
    expect(handler).toHaveBeenCalledTimes(1);
  });
  it("401 tanpa token (mis. salah password) tidak memicu handler", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ status: 401, json: async () => ({ success: false, message: "Email atau password salah" }) }));
    await apiFetch("/auth/login", { method: "POST", body: {} });
    expect(handler).not.toHaveBeenCalled();
  });
});
