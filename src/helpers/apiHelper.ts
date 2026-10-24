import { clearToken, getToken } from "./tokenStorage";

interface FetchOptions {
  method?: string;
  body?: unknown;
}

let onUnauthorized: (() => void) | null = null;

/** Mendaftarkan aksi yang dijalankan saat server menolak token (sesi berakhir). */
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

/** Alamat lengkap file (mis. gambar resep) yang disajikan backend. */
export const fileUrl = (path: string) => `${API_URL}${path}`;

/** Pembungkus fetch ke backend Express. Mengembalikan { ok, message, data }. */
export async function apiFetch(path: string, { method = "GET", body }: FetchOptions = {}): Promise<ApiResult> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const isForm = body instanceof FormData;
  if (body && !isForm) headers["Content-Type"] = "application/json";

  let payload: FormData | string | undefined;
  if (body) payload = isForm ? body : JSON.stringify(body);

  try {
    const res = await fetch(`${API_URL}/api${path}`, { method, headers, body: payload });
    // 401 saat membawa token = token kedaluwarsa/tidak valid -> sesi diakhiri.
    if (res.status === 401 && token) {
      clearToken();
      onUnauthorized?.();
    }
    const json = await res.json();
    return { ok: json.success === true, message: json.message, data: json.data };
  } catch {
    return { ok: false, message: "Gagal terhubung ke server", data: null };
  }
}