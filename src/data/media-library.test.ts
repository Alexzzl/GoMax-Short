import { describe, expect, it } from "vitest";

import {
  addToHistory,
  createInitialMediaState,
  getDramaById,
  getDramasByCategory,
  getHistoryWithDetails,
  getLatestDramas,
  getPopularDramas,
  isFavorite,
  toggleFavorite
} from "./media-library";

describe("media-library", () => {
  it("sorts popular dramas by rating in descending order", () => {
    const dramas = getPopularDramas();

    expect(dramas).toHaveLength(12);
    expect(dramas[0].rating).toBeGreaterThanOrEqual(dramas[1].rating);
  });

  it("looks up a drama by either string or numeric id", () => {
    expect(getDramaById(1)?.id).toBe(1);
    expect(getDramaById("1")?.id).toBe(1);
  });

  it("filters dramas by category", () => {
    const romanceDramas = getDramasByCategory("romance");

    expect(romanceDramas.length).toBeGreaterThan(0);
    expect(romanceDramas.every((drama) => drama.category === "romance")).toBe(
      true
    );
  });

  it("sorts latest dramas by descending year", () => {
    const dramas = getLatestDramas();

    expect(Number(dramas[0].year)).toBeGreaterThanOrEqual(Number(dramas[1].year));
  });

  it("toggles favorites on and off", () => {
    const state = createInitialMediaState();
    const added = toggleFavorite(state, 3);
    const removed = toggleFavorite(added, 3);

    expect(isFavorite(added, 3)).toBe(true);
    expect(isFavorite(removed, 3)).toBe(false);
  });

  it("adds watch history entries and resolves drama and episode details", () => {
    const state = createInitialMediaState();
    const nextState = addToHistory(state, 1, "1-1", 1000);
    const history = getHistoryWithDetails(nextState);

    expect(history).toHaveLength(1);
    expect(history[0].drama?.id).toBe(1);
    expect(history[0].episode?.id).toBe("1-1");
    expect(history[0].timestamp).toBe(1000);
  });
});
