const KEY = "token";

/** Penyimpanan token login di browser (satu-satunya tempat yang menyentuh localStorage untuk token). */
export const getToken = (): string | null => localStorage.getItem(KEY);
export const setToken = (token: string) => localStorage.setItem(KEY, token);
export const clearToken = () => localStorage.removeItem(KEY);
