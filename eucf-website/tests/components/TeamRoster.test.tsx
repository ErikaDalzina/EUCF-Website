import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import TeamRoster from "@/components/TeamRoster";
import type { Team } from "@/types/roster";

const team: Team = {
  label: "VAL A Team",
  main: [
    { ign: "Alpha", role: "Duelist", image: "/knighto.png" },
    { ign: "Bravo", image: "/knighto.png" },
  ],
  subs: [{ ign: "Subby", image: "/knighto.png" }],
};

describe("TeamRoster", () => {
  it("renders the team heading with a slugified id and the main roster", () => {
    render(<TeamRoster team={team} gameName="Valorant" />);
    const heading = screen.getByRole("heading", { name: "VAL A Team" });
    expect(heading).toHaveAttribute("id", "team-val-a-team");
    expect(screen.getByText("Main Roster")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open details for Alpha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open details for Bravo" })).toBeInTheDocument();
  });

  it("renders the substitutes section only when there are subs", () => {
    const { rerender } = render(<TeamRoster team={team} />);
    expect(screen.getByText("Substitutes")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open details for Subby" })).toBeInTheDocument();

    rerender(<TeamRoster team={{ ...team, subs: [] }} />);
    expect(screen.queryByText("Substitutes")).not.toBeInTheDocument();
  });

  it("opens the player modal on card click and closes it with Escape", async () => {
    render(<TeamRoster team={team} gameName="Valorant" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Open details for Alpha" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Alpha" })).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
