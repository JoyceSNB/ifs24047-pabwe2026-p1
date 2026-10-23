import { describe, it, expect } from "vitest";
import { getToken, setToken, clearToken } from "./tokenStorage";

describe("tokenStorage", () => {
  it("menyimpan, membaca, dan menghapus token", () => {
    expect(getToken()).toBeNull();
    setToken("abc");
    expect(getToken()).toBe("abc");
    clearToken();
    expect(getToken()).toBeNull();
  });
});
