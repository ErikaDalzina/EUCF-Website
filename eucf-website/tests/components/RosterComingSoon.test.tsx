import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RosterComingSoon from "@/components/RosterComingSoon";

describe("RosterComingSoon", () => {
  it("renders the heading and names the game in the supporting copy", () => {
    render(<RosterComingSoon gameName="Valorant" icon="/knighto.png" />);
    expect(screen.getByRole("heading", { name: "Roster coming soon!" })).toBeInTheDocument();
    expect(screen.getByText(/finalizing the Valorant lineup/)).toBeInTheDocument();
  });

  it("links back to the titles index", () => {
    render(<RosterComingSoon gameName="Overwatch" icon="/knighto.png" />);
    expect(screen.getByRole("link", { name: "Browse other titles" })).toHaveAttribute(
      "href",
      "/titles"
    );
  });

  it("labels the section by its heading and keeps the game logo decorative", () => {
    const { container } = render(<RosterComingSoon gameName="Valorant" icon="/VALlogo.png" />);
    expect(screen.getByRole("region", { name: "Roster coming soon!" })).toBeInTheDocument();
    expect(container.querySelector('img[alt=""]')).toHaveAttribute("src", "/VALlogo.png");
  });
});
