/** Pilihan satuan bahan pada formulir resep. */
export const UNITS = [
  "gram", "kg", "ml", "liter", "sendok makan", "sendok teh", "cangkir",
  "buah", "butir", "siung", "batang", "lembar", "ruas", "cm", "ekor",
  "potong", "piring", "ikat", "bungkus", "secukupnya",
];

/** Daftar pilihan untuk satu baris bahan; satuan lama di luar daftar tetap ditampilkan agar datanya tidak hilang. */
export const unitOptions = (current: string): { value: string }[] =>
  (current && !UNITS.includes(current) ? [...UNITS, current] : UNITS).map((value) => ({ value }));