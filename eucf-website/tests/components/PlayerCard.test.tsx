import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import PlayerCard from "@/components/PlayerCard";
import type { Player } from "@/types/roster";

const player: Player = { ign: "Alpha", role: "Duelist", image: "/knighto.png" };

describe("PlayerCard", () => {
  it("labels the card button and shows ign and role", () => {
    render(<PlayerCard player={player} gameName="Valorant" onClick={() => {}} />);
    expect(screen.getByRole("button", { name: "Open details for Alpha" })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Duelist")).toBeInTheDocument();
  });

  it("describes the image with the ign and game name", () => {
    render(<PlayerCard player={player} gameName="Valorant" onClick={() => {}} />);
    expect(screen.getByAltText("Alpha, EUCF Valorant player")).toBeInTheDocument();
  });

  it("omits the role line when the player has none", () => {
    render(<PlayerCard player={{ ign: "Bravo", image: "/knighto.png" }} onClick={() => {}} />);
    expect(screen.queryByText("Duelist")).not.toBeInTheDocument();
  });

  it("fires onClick when activated", async () => {
    const onClick = vi.fn();
    render(<PlayerCard player={player} onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Open details for Alpha" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
