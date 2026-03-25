import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import App from "./App";

describe("App", () => {
  it("renders the home page and switches between navigation tabs", async () => {
    const user = userEvent.setup();

    render(<App />);

    expect(
      screen.getByText("Free Short Drama Series, Anytime, Anywhere!")
    ).toBeInTheDocument();

    await user.click(screen.getByText("Discover"));
    expect(screen.getByText("Discover Short Dramas")).toBeInTheDocument();

    await user.click(screen.getByText("Categories"));
    expect(screen.getByText("Browse by Category")).toBeInTheDocument();
  });

  it("opens a featured drama, toggles favorite, and enters the player", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Watch Now" })[0]);

    const detailHeading = screen.getByRole("heading", { level: 1 });
    expect(detailHeading.textContent).not.toBe("");

    await user.click(screen.getByRole("button", { name: "Favorite" }));
    expect(screen.getByRole("button", { name: "Favorited" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Play" }));
    expect(screen.getByRole("button", { name: /Next/i })).toBeInTheDocument();

    await user.click(screen.getByText("< Back"));
    expect(screen.getByRole("button", { name: "Favorited" })).toBeInTheDocument();
  });

  it("records watched episodes in the history page", async () => {
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getAllByRole("button", { name: "Watch Now" })[0]);
    const detailTitle = screen.getByRole("heading", { level: 1 }).textContent ?? "";

    await user.click(screen.getByRole("button", { name: "Play" }));
    await user.click(screen.getByText("< Back"));
    await user.click(screen.getByText("< Back"));
    await user.click(screen.getByText("My List"));

    const historyPage = document.getElementById("history-page");
    expect(historyPage).not.toBeNull();
    expect(within(historyPage as HTMLElement).getByText(detailTitle)).toBeInTheDocument();
  });
});
