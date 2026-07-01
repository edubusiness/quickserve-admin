import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme-provider";

function Probe() {
  const { theme, mode, setTheme, setMode, reset } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="mode">{mode}</span>
      <button onClick={() => setTheme("emerald")}>emerald</button>
      <button onClick={() => setMode("light")}>light</button>
      <button onClick={reset}>reset</button>
    </div>
  );
}

const renderProbe = () =>
  render(
    <ThemeProvider>
      <Probe />
    </ThemeProvider>,
  );

describe("ThemeProvider", () => {
  it("defaults to blue / dark", () => {
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("blue");
    expect(screen.getByTestId("mode")).toHaveTextContent("dark");
  });

  it("applies theme to <html> and persists to localStorage", () => {
    renderProbe();
    act(() => screen.getByText("emerald").click());
    expect(screen.getByTestId("theme")).toHaveTextContent("emerald");
    expect(document.documentElement.getAttribute("data-theme")).toBe("emerald");
    expect(JSON.parse(localStorage.getItem("quickserve-theme")!).theme).toBe("emerald");
  });

  it("switches mode and persists it", () => {
    renderProbe();
    act(() => screen.getByText("light").click());
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
    expect(JSON.parse(localStorage.getItem("quickserve-theme")!).mode).toBe("light");
  });

  it("hydrates from a saved value", () => {
    localStorage.setItem("quickserve-theme", JSON.stringify({ theme: "purple", mode: "light" }));
    renderProbe();
    expect(screen.getByTestId("theme")).toHaveTextContent("purple");
    expect(screen.getByTestId("mode")).toHaveTextContent("light");
  });

  it("resets to defaults", () => {
    renderProbe();
    act(() => screen.getByText("emerald").click());
    act(() => screen.getByText("reset").click());
    expect(screen.getByTestId("theme")).toHaveTextContent("blue");
    expect(document.documentElement.getAttribute("data-theme")).toBe("blue");
  });
});
