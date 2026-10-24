import { describe, it, expect, vi, afterEach } from "vitest";
import { newClientId } from "./idHelper";

afterEach(() => vi.restoreAllMocks());

describe("idHelper", () => {
  it("menghasilkan id string dari angka acak", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    expect(newClientId()).toBe("i");
  });
  it("menghasilkan id berbeda untuk angka acak berbeda", () => {
    vi.spyOn(Math, "random").mockReturnValueOnce(0.123456789).mockReturnValueOnce(0.987654321);
    expect(newClientId()).not.toBe(newClientId());
  });
});