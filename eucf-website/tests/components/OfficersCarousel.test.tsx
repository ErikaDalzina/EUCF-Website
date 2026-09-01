import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import OfficersCarousel from "@/components/OfficersCarousel";

const officers = [
  { name: "Prez", position: "President", image: "/knighto.png" },
  { name: "Veep", position: "Vice President", image: "/knighto.png" },
];

// setup() keeps pointer position across calls, which unhover depends on.
function renderCarousel() {
  const user = userEvent.setup();
  const { container } = render(<OfficersCarousel officers={officers} />);
  return {
    user,
    wrapper: container.firstElementChild as HTMLElement,
    prez: screen.getByRole("button", { name: /Prez/ }),
    veep: screen.getByRole("button", { name: /Veep/ }),
  };
}

describe("OfficersCarousel", () => {
  it("enlarges a card when it is clicked", async () => {
    const { user, prez } = renderCarousel();
    expect(prez).toHaveAttribute("aria-pressed", "false");

    await user.click(prez);
    expect(prez).toHaveAttribute("aria-pressed", "true");
  });

  it("shrinks the card again when the pointer leaves the carousel", async () => {
    const { user, wrapper, prez } = renderCarousel();
    await user.click(prez);

    await user.unhover(wrapper);
    expect(prez).toHaveAttribute("aria-pressed", "false");
  });

  it("shrinks the card again when something outside the carousel is tapped", async () => {
    const { user, prez } = renderCarousel();
    await user.click(prez);

    fireEvent.pointerDown(document.body);
    expect(prez).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps only the most recently clicked card enlarged", async () => {
    const { user, prez, veep } = renderCarousel();

    await user.click(prez);
    await user.click(veep);

    expect(prez).toHaveAttribute("aria-pressed", "false");
    expect(veep).toHaveAttribute("aria-pressed", "true");
  });

  it("collapses the card when it is clicked a second time", async () => {
    const { user, prez } = renderCarousel();

    await user.click(prez);
    await user.click(prez);

    expect(prez).toHaveAttribute("aria-pressed", "false");
  });
});

// Tapping a card marks the strip as user-scrolled and re-renders in the same
// gesture. That combination used to strand the pause flag and kill the loop
// for good, so this drives the real rAF loop rather than asserting state.
describe("OfficersCarousel auto-scroll", () => {
  const proto = Element.prototype;
  const originalWidth = Object.getOwnPropertyDescriptor(proto, "scrollWidth");
  const originalLeft = Object.getOwnPropertyDescriptor(proto, "scrollLeft");

  beforeAll(() => {
    // jsdom does no layout, so the loop has nothing to scroll without this.
    const positions = new WeakMap<object, number>();
    Object.defineProperty(proto, "scrollWidth", { configurable: true, get: () => 1000 });
    Object.defineProperty(proto, "scrollLeft", {
      configurable: true,
      get() {
        return positions.get(this as object) ?? 0;
      },
      set(value: number) {
        positions.set(this as object, value);
      },
    });
  });

  afterAll(() => {
    if (originalWidth) Object.defineProperty(proto, "scrollWidth", originalWidth);
    if (originalLeft) Object.defineProperty(proto, "scrollLeft", originalLeft);
  });

  it("keeps scrolling after a card is tapped and the pointer leaves", async () => {
    const user = userEvent.setup();
    const { container } = render(<OfficersCarousel officers={officers} />);
    const wrapper = container.firstElementChild as HTMLElement;
    const strip = screen.getByRole("region", { name: "Officers list" });

    await waitFor(() => expect(strip.scrollLeft).toBeGreaterThan(0), { timeout: 3000 });

    strip.scrollLeft = 0;
    await user.click(screen.getByRole("button", { name: /Prez/ }));
    await user.unhover(wrapper);

    await waitFor(() => expect(strip.scrollLeft).toBeGreaterThan(0), { timeout: 3000 });
  });
});
