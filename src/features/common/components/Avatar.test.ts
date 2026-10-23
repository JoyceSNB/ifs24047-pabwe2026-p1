import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/svelte";
import Avatar from "./Avatar.svelte";
import { me } from "../../../test-utils";

describe("Avatar", () => {
  it("tanpa foto: menampilkan inisial", () => {
    render(Avatar, { user: me });
    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
  it("dengan foto: menampilkan gambar dari backend", () => {
    render(Avatar, { user: { ...me, avatar_url: "/api/users/1/avatar?v=5" }, size: "lg" });
    const img = screen.getByRole("img", { name: "Foto profil Chef Demo" });
    expect(img).toHaveAttribute("src", `${API_URL}/api/users/1/avatar?v=5`);
    expect(img.className).toContain("h-16");
  });
});