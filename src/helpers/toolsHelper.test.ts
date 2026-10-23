import { describe, it, expect, vi } from "vitest";
import Swal from "sweetalert2";
import { showConfirmDialog, showErrorDialog, showSuccessDialog } from "./toolsHelper";

vi.mock("sweetalert2", () => ({ default: { fire: vi.fn() } }));
const fire = Swal.fire as unknown as ReturnType<typeof vi.fn>;

describe("toolsHelper", () => {
  it("dialog sukses dan gagal", async () => {
    fire.mockResolvedValue({});
    await showSuccessDialog("a");
    await showErrorDialog("b");
    expect(fire.mock.calls[0][0].icon).toBe("success");
    expect(fire.mock.calls[1][0].icon).toBe("error");
  });
  it("konfirmasi mengembalikan isConfirmed", async () => {
    fire.mockResolvedValueOnce({ isConfirmed: true });
    expect(await showConfirmDialog("?")).toBe(true);
    fire.mockResolvedValueOnce({ isConfirmed: false });
    expect(await showConfirmDialog("?")).toBe(false);
  });
});