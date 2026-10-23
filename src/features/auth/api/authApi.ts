import { apiFetch } from "../../../helpers/apiHelper";

export const registerApi = (body: { name: string; email: string; password: string }) => apiFetch("/auth/register", { method: "POST", body });
export const loginApi = (body: { email: string; password: string }) => apiFetch("/auth/login", { method: "POST", body });
export const meApi = () => apiFetch("/auth/me");
export const updateProfileApi = (body: { name: string; current_password: string; new_password: string }) =>
  apiFetch("/auth/me", { method: "PUT", body });

export const uploadAvatarApi = (file: File) => {
  const form = new FormData();
  form.append("image", file);
  return apiFetch("/auth/avatar", { method: "PUT", body: form });
};

export const deleteAvatarApi = () => apiFetch("/auth/avatar", { method: "DELETE" });