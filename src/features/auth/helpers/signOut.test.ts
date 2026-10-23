import { describe, it, expect, vi, beforeEach } from "vitest";
import { get } from "svelte/store";
import { goto } from "$app/navigation";
import * as tools from "../../../helpers/toolsHelper";
import { user, resetAuth } from "../states/authStore";
import { confirmSignOut } from "./signOut";
import { me } from "../../../test-utils";

vi.mock("../../../helpers/toolsHelper");
beforeEach(() => {
  vi.resetAllMocks();
  resetAuth();
  user.set(me);
  localStorage.setItem("token", "t");
});

describe("confirmSignOut", () => {
  it("dibatalkan: sesi tetap", async () => {
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(false);
    expect(await confirmSignOut()).toBe(false);
    expect(get(user)).toEqual(me);
    expect(goto).not.toHaveBeenCalled();
  });
  it("dikonfirmasi: sesi dihapus dan diarahkan ke halaman masuk", async () => {
    vi.mocked(tools.showConfirmDialog).mockResolvedValue(true);
    expect(await confirmSignOut()).toBe(true);
    expect(get(user)).toBeNull();
    expect(localStorage.getItem("token")).toBeNull();
    expect(goto).toHaveBeenCalledWith("/auth/login");
  });
});
