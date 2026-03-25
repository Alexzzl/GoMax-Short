import { describe, expect, it } from "vitest";

import {
  createInitialRouteState,
  goBack,
  navigate
} from "./app-state";

describe("app-state", () => {
  it("starts on the home page with an empty page stack", () => {
    const state = createInitialRouteState();

    expect(state.currentPage).toBe("home");
    expect(state.currentParams).toEqual({});
    expect(state.pageStack).toEqual([]);
  });

  it("pushes the previous page onto the stack when navigating to a new page", () => {
    const state = createInitialRouteState();
    const nextState = navigate(state, "detail", { dramaId: 12 });

    expect(nextState.currentPage).toBe("detail");
    expect(nextState.currentParams).toEqual({ dramaId: 12 });
    expect(nextState.pageStack).toEqual([
      {
        page: "home",
        params: {}
      }
    ]);
  });

  it("does not duplicate stack entries when navigating to the current page", () => {
    const state = createInitialRouteState();
    const nextState = navigate(state, "home");

    expect(nextState.currentPage).toBe("home");
    expect(nextState.pageStack).toEqual([]);
  });

  it("returns to the previous page when going back", () => {
    const detailState = navigate(createInitialRouteState(), "detail", {
      dramaId: 7
    });
    const playerState = navigate(detailState, "player", {
      dramaId: 7,
      episodeId: "7-1"
    });

    const previousState = goBack(playerState);

    expect(previousState.currentPage).toBe("detail");
    expect(previousState.currentParams).toEqual({ dramaId: 7 });
    expect(previousState.pageStack).toEqual([
      {
        page: "home",
        params: {}
      }
    ]);
  });

  it("keeps the current page when there is no previous page to go back to", () => {
    const state = createInitialRouteState();

    expect(goBack(state)).toEqual(state);
  });
});
