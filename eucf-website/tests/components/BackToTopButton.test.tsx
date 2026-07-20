import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import BackToTopButton from "@/components/BackToTopButton";
import { mockMatchMedia } from "../../vitest.setup";

afterEach(() => {
  mockMatchMedia(false);
});

describe("BackToTopButton", () => {
  it("scrolls smoothly to the top by default", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);

    render(<BackToTopButton />);
    await userEvent.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("uses an instant scroll when the user prefers reduced motion", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    mockMatchMedia(true);

    render(<BackToTopButton />);
    await userEvent.click(screen.getByRole("button", { name: "Back to top" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "auto" });
  });
});
