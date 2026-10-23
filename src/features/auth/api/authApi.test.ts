import { describe, it, expect, vi } from "vitest";
import { apiFetch } from "../../../helpers/apiHelper";
import { registerApi, loginApi, meApi, updateProfileApi, uploadAvatarApi, deleteAvatarApi } from "./authApi";
  it("foto profil: unggah (multipart) dan hapus", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    uploadAvatarApi(file);
    const [path, opt] = f.mock.calls.at(-1)!;
    expect(path).toBe("/auth/avatar");
    expect(opt.method).toBe("PUT");
    expect(opt.body.get("image")).toBeInstanceOf(File);
    deleteAvatarApi();
    expect(f).toHaveBeenLastCalledWith("/auth/avatar", { method: "DELETE" });
  });
  
vi.mock("../../../helpers/apiHelper", () => ({ apiFetch: vi.fn().mockResolvedValue({ ok: true }) }));
const f = apiFetch as unknown as ReturnType<typeof vi.fn>;

describe("authApi", () => {
  it("register, login, me", () => {
    registerApi({ name: "A", email: "a@b.co", password: "123456" });
    expect(f).toHaveBeenLastCalledWith("/auth/register", { method: "POST", body: { name: "A", email: "a@b.co", password: "123456" } });
    loginApi({ email: "a@b.co", password: "123456" });
    expect(f).toHaveBeenLastCalledWith("/auth/login", { method: "POST", body: { email: "a@b.co", password: "123456" } });
    meApi();
    expect(f).toHaveBeenLastCalledWith("/auth/me");
    updateProfileApi({ name: "B", current_password: "", new_password: "" });
    expect(f).toHaveBeenLastCalledWith("/auth/me", { method: "PUT", body: { name: "B", current_password: "", new_password: "" } });
  });
});
