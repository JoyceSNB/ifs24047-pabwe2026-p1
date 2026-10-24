import { writable } from "svelte/store";
import { deleteAvatarApi, loginApi, meApi, registerApi, updateProfileApi, uploadAvatarApi } from "../api/authApi";
import { setUnauthorizedHandler } from "../../../helpers/apiHelper";
import { clearToken, getToken, setToken } from "../../../helpers/tokenStorage";

export const user = writable<User | null>(null);

let initPromise: Promise<void> | null = null;

/** Memulihkan sesi dari token tersimpan. Aman dipanggil berkali-kali (hanya berjalan sekali). */
export function initAuth(): Promise<void> {
  if (initPromise === null) {
    initPromise = (async () => {
      if (!getToken()) return;
      const r = await meApi();
      if (r.ok) user.set(r.data.user);
      else clearToken();
    })();
  }
  return initPromise;
}

/** Mengosongkan status auth (dipakai pengujian). */
export function resetAuth() {
  initPromise = null;
  user.set(null);
}

function startSession(data: { token: string; user: User }) {
  setToken(data.token);
  user.set(data.user);
  initPromise = Promise.resolve();
}

export async function login(body: { email: string; password: string }) {
  const r = await loginApi(body);
  if (r.ok) startSession(r.data);
  return r;
}

export async function register(body: { name: string; email: string; password: string }) {
  const r = await registerApi(body);
  if (r.ok) startSession(r.data);
  return r;
}

export function logout() {
  clearToken();
  user.set(null);
  initPromise = Promise.resolve();
}

export async function updateProfile(body: { name: string; current_password: string; new_password: string }) {
  const r = await updateProfileApi(body);
  if (r.ok) user.set(r.data.user);
  return r;
}

export async function changeAvatar(file: File) {
  const r = await uploadAvatarApi(file);
  if (r.ok) user.set(r.data.user);
  return r;
}

export async function removeAvatar() {
  const r = await deleteAvatarApi();
  if (r.ok) user.set(r.data.user);
  return r;
}

// Bila server menolak token di tengah sesi, otomatis keluar (layout lalu mengarahkan ke halaman masuk).
setUnauthorizedHandler(logout);