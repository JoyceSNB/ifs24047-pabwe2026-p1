import { describe, it, expect } from "vitest";
import { UNITS, unitOptions } from "./units";

describe("unitOptions", () => {
  it("memuat satuan umum", () => {
    expect(UNITS).toEqual(expect.arrayContaining(["gram", "kg", "sendok makan", "sendok teh"]));
  });
  it("satuan standar atau kosong: daftar apa adanya", () => {
    expect(unitOptions("kg").map((o) => o.value)).toEqual(UNITS);
    expect(unitOptions("").map((o) => o.value)).toEqual(UNITS);
  });
  it("satuan lama di luar daftar ditambahkan di akhir", () => {
    expect(unitOptions("sdm").map((o) => o.value)).toEqual([...UNITS, "sdm"]);
  });
});