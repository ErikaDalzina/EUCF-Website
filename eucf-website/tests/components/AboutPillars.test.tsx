import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import AboutPillars from "@/components/AboutPillars";
import type { AboutSection } from "@/data/about";

const sections: AboutSection[] = [
  {
    title: "Overview",
    description: "Who the club is.",
    image: "/knighto.png",
    imageAlt: "Overview image",
    eyebrow: "Who we are",
  },
  {
    title: "Compete",
    description: "On the collegiate stage.",
    image: "/knighto.png",
    imageAlt: "Compete image",
    eyebrow: "On the stage",
    tags: ["Tactical FPS", "MOBA"],
  },
  // Deliberately has no eyebrow and no tags: a section the CMS adds before
  // anyone maps it in PRESENTATION must still render.
  {
    title: "Dungeon",
    description: "The home of Esports at UCF.",
    image: "/knighto.png",
    imageAlt: "Dungeon image",
  },
];

const tab = (name: string) => screen.getByRole("tab", { name });

describe("AboutPillars", () => {
  it("renders the first section by default", () => {
    render(<AboutPillars sections={sections} />);
    expect(screen.getByText("Who we are")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByText("Who the club is.")).toBeInTheDocument();
    expect(screen.getByAltText("Overview image")).toBeInTheDocument();
  });

  it("keeps only the active panel in the DOM, labelled by the active tab", async () => {
    render(<AboutPillars sections={sections} />);
    const panels = screen.getAllByRole("tabpanel");
    expect(panels).toHaveLength(1);
    expect(panels[0]).toHaveAttribute("aria-labelledby", tab("Overview").id);

    await userEvent.click(tab("Compete"));
    expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", tab("Compete").id);
  });

  it("uses a roving tabindex so the tablist is a single tab stop", () => {
    render(<AboutPillars sections={sections} />);
    expect(tab("Overview")).toHaveAttribute("tabindex", "0");
    expect(tab("Compete")).toHaveAttribute("tabindex", "-1");
    expect(tab("Dungeon")).toHaveAttribute("tabindex", "-1");
  });

  it("swaps content and selection on click", async () => {
    render(<AboutPillars sections={sections} />);
    await userEvent.click(tab("Dungeon"));

    expect(tab("Dungeon")).toHaveAttribute("aria-selected", "true");
    expect(tab("Overview")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByText("The home of Esports at UCF.")).toBeInTheDocument();
    expect(screen.getByAltText("Dungeon image")).toBeInTheDocument();
    expect(screen.queryByAltText("Overview image")).not.toBeInTheDocument();
  });

  it("moves focus and selection with the arrow keys, wrapping at both ends", async () => {
    render(<AboutPillars sections={sections} />);
    await userEvent.tab();
    expect(tab("Overview")).toHaveFocus();

    await userEvent.keyboard("{ArrowRight}");
    expect(tab("Compete")).toHaveFocus();
    expect(tab("Compete")).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(tab("Overview")).toHaveFocus();

    await userEvent.keyboard("{ArrowLeft}");
    expect(tab("Dungeon")).toHaveFocus();
    expect(tab("Dungeon")).toHaveAttribute("aria-selected", "true");
  });

  it("jumps to the first and last tab with Home and End", async () => {
    render(<AboutPillars sections={sections} />);
    await userEvent.tab();

    await userEvent.keyboard("{End}");
    expect(tab("Dungeon")).toHaveAttribute("aria-selected", "true");

    await userEvent.keyboard("{Home}");
    expect(tab("Overview")).toHaveAttribute("aria-selected", "true");
  });

  it("renders tags and the eyebrow only for sections that have them", async () => {
    render(<AboutPillars sections={sections} />);
    expect(screen.queryByText("Tactical FPS")).not.toBeInTheDocument();

    await userEvent.click(tab("Compete"));
    expect(screen.getByText("Tactical FPS")).toBeInTheDocument();
    expect(screen.getByText("MOBA")).toBeInTheDocument();
    expect(screen.getByText("On the stage")).toBeInTheDocument();

    // Dungeon has neither: no stale pills, and no eyebrow slot at all.
    await userEvent.click(tab("Dungeon"));
    expect(screen.queryByText("Tactical FPS")).not.toBeInTheDocument();
    expect(screen.queryByText("On the stage")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders nothing when the CMS returns no sections", () => {
    const { container } = render(<AboutPillars sections={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
