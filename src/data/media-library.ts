import {
  generatedCategories,
  generatedDramas,
  generatedHeroItems
} from "./mock-data.generated";

export interface Category {
  id: string;
  name: string;
  icon: string;
}

export interface HeroItem {
  id: number;
  title: string;
  desc: string;
  year: string;
  episodes: number;
  rating: number;
  category: string;
  image?: string;
  images?: string[];
  backdrop: string;
}

export interface Episode {
  id: string;
  dramaId: number;
  number: number;
  title: string;
  desc: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
}

export interface Drama {
  id: number;
  title: string;
  year: string;
  episodes: number;
  rating: number;
  category: string;
  seasons: number;
  image: string;
  backdrop: string;
  badge?: string;
  desc: string;
  episodesList: Episode[];
}

export interface WatchHistoryEntry {
  dramaId: number;
  episodeId: string;
  timestamp: number;
}

export interface WatchHistoryDetails extends WatchHistoryEntry {
  drama?: Drama;
  episode?: Episode;
}

export interface MediaState {
  favorites: number[];
  watchHistory: WatchHistoryEntry[];
}

export const categories = generatedCategories as unknown as readonly Category[];
export const heroItems = generatedHeroItems as unknown as readonly HeroItem[];
export const dramas = generatedDramas as unknown as readonly Drama[];

export function createInitialMediaState(): MediaState {
  return {
    favorites: [],
    watchHistory: []
  };
}

export function getPopularDramas(): Drama[] {
  return Array.from(dramas).sort((left, right) => right.rating - left.rating).slice(0, 12);
}

export function getLatestDramas(): Drama[] {
  return Array.from(dramas)
    .sort((left, right) => Number(right.year) - Number(left.year))
    .slice(0, 12);
}

export function getDramasByCategory(category: string): Drama[] {
  if (category === "all") {
    return Array.from(dramas);
  }

  return dramas.filter((drama) => drama.category === category);
}

export function getDramaById(id: number | string): Drama | undefined {
  const numericId = typeof id === "number" ? id : Number.parseInt(id, 10);
  return dramas.find((drama) => drama.id === numericId);
}

export function searchDramas(query: string): Drama[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return dramas.filter(
    (drama) =>
      drama.title.toLowerCase().includes(normalizedQuery) ||
      drama.category.toLowerCase().includes(normalizedQuery)
  );
}

export function toggleFavorite(state: MediaState, dramaId: number): MediaState {
  const isAlreadyFavorite = state.favorites.includes(dramaId);

  return {
    ...state,
    favorites: isAlreadyFavorite
      ? state.favorites.filter((favoriteId) => favoriteId !== dramaId)
      : [...state.favorites, dramaId]
  };
}

export function isFavorite(state: MediaState, dramaId: number): boolean {
  return state.favorites.includes(dramaId);
}

export function addToHistory(
  state: MediaState,
  dramaId: number,
  episodeId: string,
  timestamp = Date.now()
): MediaState {
  const existingIndex = state.watchHistory.findIndex(
    (entry) => entry.dramaId === dramaId && entry.episodeId === episodeId
  );

  if (existingIndex > -1) {
    const watchHistory = state.watchHistory.map((entry, index) =>
      index === existingIndex
        ? {
            ...entry,
            timestamp
          }
        : entry
    );

    return {
      ...state,
      watchHistory
    };
  }

  return {
    ...state,
    watchHistory: [
      {
        dramaId,
        episodeId,
        timestamp
      },
      ...state.watchHistory
    ].slice(0, 20)
  };
}

export function getHistoryWithDetails(state: MediaState): WatchHistoryDetails[] {
  return state.watchHistory.map((entry) => {
    const drama = getDramaById(entry.dramaId);
    const episode = drama?.episodesList.find(
      (candidateEpisode) => candidateEpisode.id === entry.episodeId
    );

    return {
      ...entry,
      drama,
      episode
    };
  });
}
