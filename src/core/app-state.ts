export type AppPage =
  | "home"
  | "discover"
  | "detail"
  | "player"
  | "history"
  | "settings";

export interface RouteParams {
  category?: string;
  dramaId?: number;
  episodeId?: string;
  title?: string;
  episode?: number;
}

export interface PageStackEntry {
  page: AppPage;
  params: RouteParams;
}

export interface RouteState {
  currentPage: AppPage;
  currentParams: RouteParams;
  pageStack: PageStackEntry[];
}

export function createInitialRouteState(): RouteState {
  return {
    currentPage: "home",
    currentParams: {},
    pageStack: []
  };
}

export function navigate(
  state: RouteState,
  page: AppPage,
  params: RouteParams = {}
): RouteState {
  if (state.currentPage === page) {
    return {
      ...state,
      currentParams: params
    };
  }

  const nextStack = [
    ...state.pageStack,
    {
      page: state.currentPage,
      params: state.currentParams
    }
  ];

  return {
    currentPage: page,
    currentParams: params,
    pageStack: nextStack.slice(-10)
  };
}

export function goBack(state: RouteState): RouteState {
  const previousEntry = state.pageStack.at(-1);

  if (!previousEntry) {
    return state;
  }

  return {
    currentPage: previousEntry.page,
    currentParams: previousEntry.params,
    pageStack: state.pageStack.slice(0, -1)
  };
}
