import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlayerModal from "@/components/PlayerModal";
import type { Player } from "@/types/roster";

const player: Player = {
  ign: "TestKnight",
  realName: "Alex Example",
  role: "Duelist",
  bio: "Longtime member.",
  image: "/knighto.png",
  socials: { x: "https://x.com/testknight", twitch: "https://twitch.tv/testknight" },
};

describe("PlayerModal", () => {
  it("renders nothing when player is null", () => {
    const { container } = render(<PlayerModal player={null} onClose={() => {}} />);
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders an accessible dialog with the player's details", () => {
    render(<PlayerModal player={player} onClose={() => {}} />);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAttribute("aria-labelledby", "player-modal-title");
    expect(screen.getByRole("heading", { name: "TestKnight" })).toHaveAttribute(
      "id",
      "player-modal-title"
    );
    expect(screen.getByText("Alex Example")).toBeInTheDocument();
    expect(screen.getByText("Duelist")).toBeInTheDocument();
    expect(screen.getByText("Longtime member.")).toBeInTheDocument();
  });

  it("focuses the close button on open", () => {
    render(<PlayerModal player={player} onClose={() => {}} />);
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("calls onClose on Escape", async () => {
    const onClose = vi.fn();
    render(<PlayerModal player={player} onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes on overlay click but not on clicks inside the panel", () => {
    const onClose = vi.fn();
    render(<PlayerModal player={player} onClose={onClose} />);

    fireEvent.click(screen.getByRole("heading", { name: "TestKnight" }));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("dialog").parentElement!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("wraps Tab from the last focusable back to the close button", () => {
    render(<PlayerModal player={player} onClose={() => {}} />);
    const links = screen.getAllByRole("link");
    links[links.length - 1].focus();

    fireEvent.keyDown(window, { key: "Tab" });
    expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
  });

  it("wraps Shift+Tab from the close button to the last focusable", () => {
    render(<PlayerModal player={player} onClose={() => {}} />);
    const closeBtn = screen.getByRole("button", { name: "Close" });
    closeBtn.focus();

    fireEvent.keyDown(window, { key: "Tab", shiftKey: true });
    const links = screen.getAllByRole("link");
    expect(links[links.length - 1]).toHaveFocus();
  });

  it("locks body scroll while open and releases it on close", () => {
    const { rerender, baseElement } = render(<PlayerModal player={player} onClose={() => {}} />);
    const styleText = () =>
      [...baseElement.ownerDocument.querySelectorAll("style")].map((s) => s.textContent).join("");
    expect(styleText()).toContain("overflow: hidden");

    rerender(<PlayerModal player={null} onClose={() => {}} />);
    expect(styleText()).not.toContain("overflow: hidden");
  });

  it("restores focus to the previously focused element on close", () => {
    const trigger = document.createElement("button");
    document.body.appendChild(trigger);
    trigger.focus();

    const { rerender } = render(<PlayerModal player={player} onClose={() => {}} />);
    expect(trigger).not.toHaveFocus();

    rerender(<PlayerModal player={null} onClose={() => {}} />);
    expect(trigger).toHaveFocus();
    trigger.remove();
  });

  it("renders only the socials the player has, as safe external links", () => {
    render(<PlayerModal player={player} onClose={() => {}} />);
    const x = screen.getByRole("link", { name: "TestKnight on X" });
    expect(x).toHaveAttribute("href", "https://x.com/testknight");
    expect(x).toHaveAttribute("target", "_blank");
    expect(x).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByRole("link", { name: "TestKnight on Twitch" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "TestKnight on Instagram" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("omits the Follow section when the player has no socials", () => {
    render(<PlayerModal player={{ ...player, socials: undefined }} onClose={() => {}} />);
    expect(screen.queryByText("Follow")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });
});
