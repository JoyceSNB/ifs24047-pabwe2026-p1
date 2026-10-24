/** Membuat id sementara di sisi klien (misalnya untuk key baris form). Bukan untuk keperluan keamanan. */
export const newClientId = (): string => Math.random().toString(36).slice(2, 10);