import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import OfficerCard from "@/components/OfficerCard";

const officer = { name: "Prez", position: "President", image: "/knighto.png" };

describe("OfficerCard", () => {
  it("shows the officer's name, position, and described image", () => {
    render(<OfficerCard {...officer} />);
    expect(screen.getByText("Prez")).toBeInTheDocument();
    expect(screen.getByText("President")).toBeInTheDocument();
    expect(screen.getByAltText("Prez, President of EUCF")).toBeInTheDocument();
  });

  it("reflects the active state via aria-pressed", () => {
    const { rerender } = render(<OfficerCard {...officer} />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "false");

    rerender(<OfficerCard {...officer} isActive />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("removes hidden cards from the accessibility tree and tab order", () => {
    render(<OfficerCard {...officer} hidden />);
    const button = screen.getByRole("button", { hidden: true });
    expect(button).toHaveAttribute("aria-hidden", "true");
    expect(button).toHaveAttribute("tabindex", "-1");
  });

  it("fires onTap when clicked", async () => {
    const onTap = vi.fn();
    render(<OfficerCard {...officer} onTap={onTap} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onTap).toHaveBeenCalledTimes(1);
  });
});
