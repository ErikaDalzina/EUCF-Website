import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import Header from "@/components/Header";

const NAV = [
  { href: "/about", label: "ABOUT US" },
  { href: "/officers", label: "OFFICERS" },
  { href: "/titles", label: "TITLES" },
  { href: "/sponsors", label: "SPONSORS" },
  { href: "/connect", label: "CONTACT US" },
];

describe("Header", () => {
  it("renders every nav link in both the desktop and mobile navs", () => {
    render(<Header />);
    for (const { href, label } of NAV) {
      const links = screen.getAllByRole("link", { name: label, hidden: true });
      expect(links).toHaveLength(2);
      for (const link of links) expect(link).toHaveAttribute("href", href);
    }
  });

  it("toggles the mobile menu via the hamburger button", async () => {
    render(<Header />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "mobile-nav");

    const mobileNav = document.getElementById("mobile-nav")!;
    expect(mobileNav).toHaveAttribute("aria-hidden", "true");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(button).toHaveAccessibleName("Close menu");
    expect(mobileNav).toHaveAttribute("aria-hidden", "false");

    await userEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAccessibleName("Open menu");
  });

  it("closes the mobile menu when a mobile nav link is clicked", async () => {
    render(<Header />);
    const button = screen.getByRole("button", { name: "Open menu" });
    await userEvent.click(button);

    const mobileNav = document.getElementById("mobile-nav")!;
    const mobileLink = [...mobileNav.querySelectorAll("a")].find(
      (a) => a.textContent === "ABOUT US"
    )!;
    await userEvent.click(mobileLink);

    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(mobileNav).toHaveAttribute("aria-hidden", "true");
  });
});
