import { useEffect, useRef, useState } from "react";

import {
  createInitialRouteState,
  goBack,
  navigate,
  type AppPage,
  type RouteParams
} from "./core/app-state";
import {
  addToHistory,
  categories,
  createInitialMediaState,
  dramas,
  getDramaById,
  getDramasByCategory,
  getHistoryWithDetails,
  getLatestDramas,
  getPopularDramas,
  isFavorite,
  toggleFavorite,
  type Category,
  type Drama,
  type Episode,
  type MediaState,
  type WatchHistoryDetails
} from "./data/media-library";

const FALLBACK_IMAGE = "assets/CodeBubbyAssets/3052_654/2.png";
const APP_LOGO = "assets/CodeBubbyAssets/3052_414/1.svg";
const HERO_MOSAIC_IMAGES = [
  "assets/CodeBubbyAssets/3099_737/2.png",
  "assets/CodeBubbyAssets/3099_737/3.png",
  "assets/CodeBubbyAssets/3099_737/4.png",
  "assets/CodeBubbyAssets/3099_737/5.png",
  "assets/CodeBubbyAssets/3099_737/6.png"
];

const CATEGORY_ICONS: Record<string, string> = {
  romance: "R",
  drama: "D",
  comedy: "C",
  action: "A",
  thriller: "T",
  "sci-fi": "SF",
  fantasy: "F"
};

const KEY_CODES = {
  enter: 13,
  left: 37,
  up: 38,
  right: 39,
  down: 40,
  escape: 27,
  back: 10009,
  exit: 10182,
  play: 415,
  pause: 19,
  fastForward: 417,
  rewind: 412
} as const;

interface RemoteKeyEventDetail {
  keyCode: number;
}

export default function App() {
  useAppScale();

  const [routeState, setRouteState] = useState(createInitialRouteState);
  const [mediaState, setMediaState] = useState(createInitialMediaState);
  const [isLoading, setIsLoading] = useState(true);

  const showHeader = routeState.currentPage === "detail" || routeState.currentPage === "player";
  const showMainNav = !showHeader;
  const currentDrama = routeState.currentParams.dramaId
    ? getDramaById(routeState.currentParams.dramaId)
    : undefined;
  const currentEpisode =
    currentDrama && routeState.currentParams.episodeId
      ? currentDrama.episodesList.find(
          (episode) => episode.id === routeState.currentParams.episodeId
        )
      : undefined;
  const historyItems = getHistoryWithDetails(mediaState);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (routeState.currentPage !== "player" || !currentDrama || !currentEpisode) {
      return;
    }

    setMediaState((currentState) =>
      addToHistory(currentState, currentDrama.id, currentEpisode.id)
    );
  }, [routeState.currentPage, currentDrama?.id, currentEpisode?.id]);

  const navigateTo = (page: AppPage, params: RouteParams = {}) => {
    setRouteState((currentState) => navigate(currentState, page, params));
  };

  const handleGoBack = () => {
    setRouteState((currentState) => goBack(currentState));
  };

  const handleToggleFavorite = (dramaId: number) => {
    setMediaState((currentState) => toggleFavorite(currentState, dramaId));
  };

  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleShowExit = () => {
    setShowExitConfirm(true);
  };

  const handleExitConfirm = () => {
    setShowExitConfirm(false);
    exitTizenApp();
  };

  const handleExitCancel = () => {
    setShowExitConfirm(false);
  };

  useRemoteControl(routeState.currentPage, handleGoBack, routeState.pageStack.length > 0, handleShowExit);

  return (
    <>
      {isLoading ? <LoadingPage /> : null}

      <div id="app" className="app-container">
        {showMainNav ? (
          <MainNav activePage={routeState.currentPage} onNavigate={navigateTo} />
        ) : null}

        {showHeader ? (
          <PageHeader
            currentDrama={currentDrama}
            currentEpisode={currentEpisode}
            currentPage={routeState.currentPage}
            onBack={handleGoBack}
          />
        ) : null}

        <main id="page-container" className="page-container">
          <div
            id="home-page"
            className={getPageClassName(routeState.currentPage === "home")}
          >
            {routeState.currentPage === "home" ? (
              <HomePage
                mediaState={mediaState}
                onOpenDetail={(dramaId) => navigateTo("detail", { dramaId })}
                onOpenDiscover={() => navigateTo("discover")}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : null}
          </div>

          <div
            id="discover-page"
            className={getPageClassName(routeState.currentPage === "discover")}
          >
            {routeState.currentPage === "discover" ? (
              <DiscoverPage
                onNavigateHome={() => navigateTo("home")}
                onOpenDetail={(dramaId) => navigateTo("detail", { dramaId })}
              />
            ) : null}
          </div>

          <div
            id="detail-page"
            className={getPageClassName(routeState.currentPage === "detail")}
          >
            {routeState.currentPage === "detail" ? (
              <DetailPage
                currentDrama={currentDrama}
                isFavoriteDrama={
                  currentDrama ? isFavorite(mediaState, currentDrama.id) : false
                }
                onOpenDetail={(dramaId) => navigateTo("detail", { dramaId })}
                onPlayEpisode={(dramaId, episodeId) =>
                  navigateTo("player", { dramaId, episodeId })
                }
                onToggleFavorite={handleToggleFavorite}
              />
            ) : null}
          </div>

          <div
            id="player-page"
            className={getPageClassName(routeState.currentPage === "player")}
          >
            {routeState.currentPage === "player" ? (
              <PlayerPage
                currentDrama={currentDrama}
                currentEpisode={currentEpisode}
                onSelectEpisode={(dramaId, episodeId) =>
                  navigateTo("player", { dramaId, episodeId })
                }
              />
            ) : null}
          </div>

          <div
            id="history-page"
            className={getPageClassName(routeState.currentPage === "history")}
          >
            {routeState.currentPage === "history" ? (
              <HistoryPage
                historyItems={historyItems}
                onOpenDetail={(dramaId) => navigateTo("detail", { dramaId })}
              />
            ) : null}
          </div>

          <div
            id="settings-page"
            className={getPageClassName(routeState.currentPage === "settings")}
          >
            {routeState.currentPage === "settings" ? <SettingsPage /> : null}
          </div>
        </main>

        <footer className="app-footer">
          <div className="footer-content">
            <p>GoMax Short - Free Short Drama Series, Anytime, Anywhere!</p>
            <p>Use arrow keys to navigate and OK/Enter to select</p>
          </div>
        </footer>
      </div>

      {showExitConfirm ? (
        <ExitConfirmationModal
          onConfirm={handleExitConfirm}
          onCancel={handleExitCancel}
        />
      ) : null}
    </>
  );
}

interface ExitConfirmationModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

function ExitConfirmationModal({ onConfirm, onCancel }: ExitConfirmationModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (cancelRef.current) {
        cancelRef.current.focus();
        cancelRef.current.classList.add("focused");
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const keyCode = event.keyCode || event.which;
      if (keyCode === KEY_CODES.back || keyCode === KEY_CODES.escape) {
        event.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="exit-modal-overlay">
      <div className="exit-modal-dialog">
        <h2 className="exit-modal-title">Exit Application</h2>
        <p className="exit-modal-message">
          Are you sure you want to exit GoMax Short?
        </p>
        <div className="exit-modal-actions">
          <button
            ref={cancelRef}
            className="exit-modal-btn exit-modal-btn-cancel"
            data-focusable="true"
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className="exit-modal-btn exit-modal-btn-confirm"
            data-focusable="true"
            onClick={onConfirm}
            type="button"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingPage() {
  return (
    <div id="loading-page" aria-hidden="true">
      <div className="loading-content">
        <div className="logo-container">
          <div className="logo-icon">
            <img src={APP_LOGO} alt="GoMax Short logo" />
          </div>
        </div>
        <h1 className="app-title">GoMax Short</h1>
      </div>
    </div>
  );
}

interface MainNavProps {
  activePage: AppPage;
  onNavigate: (page: AppPage) => void;
}

function MainNav({ activePage, onNavigate }: MainNavProps) {
  return (
    <nav id="main-nav" className="main-nav">
      <div className="nav-logo">
        <img src={APP_LOGO} alt="GoMax" style={{ width: 40, height: 40 }} />
        <span className="logo-text">GoMax Short</span>
      </div>

      <ul className="nav-menu">
        <NavItem
          isActive={activePage === "home"}
          label="Home"
          onClick={() => onNavigate("home")}
        />
        <NavItem
          isActive={activePage === "discover"}
          label="Discover"
          onClick={() => onNavigate("discover")}
        />
        <NavItem
          isActive={activePage === "history"}
          label="My List"
          onClick={() => onNavigate("history")}
        />
        <NavItem
          isActive={activePage === "settings"}
          label="Categories"
          onClick={() => onNavigate("settings")}
        />
      </ul>
    </nav>
  );
}

interface NavItemProps {
  isActive: boolean;
  label: string;
  onClick: () => void;
}

function NavItem({ isActive, label, onClick }: NavItemProps) {
  return (
    <li
      className={`nav-item${isActive ? " active" : ""}`}
      data-focusable="true"
      onClick={onClick}
    >
      <span className="nav-text">{label}</span>
    </li>
  );
}

interface PageHeaderProps {
  currentPage: AppPage;
  currentDrama?: Drama;
  currentEpisode?: Episode;
  onBack: () => void;
}

function PageHeader({
  currentDrama,
  currentEpisode,
  currentPage,
  onBack
}: PageHeaderProps) {
  return (
    <header id="page-header" className="page-header">
      <div className="page-header-left">
        <button
          className="back-button"
          data-focusable="true"
          id="page-header-back-btn"
          onClick={onBack}
          type="button"
        >
          <span id="page-header-back-text">&lt; Back</span>
        </button>
      </div>

      <div className="page-header-center">
        {currentPage === "detail" ? (
          <div className="nav-logo" id="page-header-logo">
            <img src={APP_LOGO} alt="GoMax" style={{ width: 40, height: 40 }} />
            <span className="logo-text">GoMax Short</span>
          </div>
        ) : (
          <div className="player-header-info" id="page-header-player-info">
            <h2 id="player-header-title">{currentDrama?.title ?? ""}</h2>
            <p id="player-header-episode-info">
              {currentEpisode ? `Episode ${currentEpisode.number}` : ""}
            </p>
          </div>
        )}
      </div>

      <div className="page-header-right" />
    </header>
  );
}

interface HomePageProps {
  mediaState: MediaState;
  onOpenDetail: (dramaId: number) => void;
  onOpenDiscover: () => void;
  onToggleFavorite: (dramaId: number) => void;
}

function HomePage({
  mediaState,
  onOpenDetail,
  onOpenDiscover,
  onToggleFavorite
}: HomePageProps) {
  const featuredDramas = getPopularDramas().slice(0, 4);

  return (
    <>
      <section className="home-hero">
        <div className="hero-mosaic" id="hero-mosaic">
          {HERO_MOSAIC_IMAGES.map((image) => (
            <img key={image} src={image} alt="" className="mosaic-img" />
          ))}
        </div>
        <div className="hero-overlay" />

        <div className="hero-content">
          <h1 className="hero-title">Free Short Drama Series, Anytime, Anywhere!</h1>
          <p className="hero-desc">
            Watch quick, addictive, and easy-to-watch short drama episodes
            <br />
            completely free
          </p>

          <div className="hero-tags">
            <span className="hero-tag">Daily Updated</span>
            <span className="hero-tag">Mini-Series</span>
            <span className="hero-tag">Free Short Drama Series</span>
          </div>

          <div className="hero-cards">
            <HeroCard
              description="Browse through thousands of short drama episodes"
              icon="EP"
              title="Episodes"
              onClick={onOpenDiscover}
            />
            <HeroCard
              description="Watch previews before diving into full series"
              icon="TR"
              title="Trailers"
              onClick={() => undefined}
            />
            <HeroCard
              description="Discover similar shows based on your preferences"
              icon="ML"
              title="More Like This"
              onClick={onOpenDiscover}
            />
          </div>
        </div>
      </section>

      <section className="featured-section">
        <div className="section-header">
          <h2 className="section-title-orange">Featured Series</h2>
          <div className="section-divider" />
        </div>

        <div className="featured-grid" id="popular-dramas">
          {featuredDramas.map((drama) => (
            <div
              key={drama.id}
              className="home-drama-card"
              data-focusable="true"
              onClick={() => onOpenDetail(drama.id)}
            >
              <div className="card-poster">
                <img
                  className="card-image"
                  src={drama.image}
                  alt={drama.title}
                  onError={handleImageError}
                />
                {drama.badge ? <span className="card-badge">{drama.badge}</span> : null}
              </div>

              <div className="card-content">
                <h3 className="card-title">{drama.title}</h3>
                <div className="card-meta">
                  <span>{drama.seasons ? `${drama.seasons} Seasons` : `${drama.episodes} Episodes`}</span>
                  <span>{resolveCategoryName(drama.category)}</span>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="action-btn primary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onOpenDetail(drama.id);
                  }}
                  type="button"
                >
                  Watch Now
                </button>
                <button
                  aria-label={
                    isFavorite(mediaState, drama.id)
                      ? "Remove from favorites"
                      : "Add to favorites"
                  }
                  className="action-btn secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(drama.id);
                  }}
                  type="button"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

interface HeroCardProps {
  description: string;
  icon: string;
  title: string;
  onClick: () => void;
}

function HeroCard({ description, icon, title, onClick }: HeroCardProps) {
  return (
    <div className="hero-card" data-focusable="true" onClick={onClick}>
      <div className="hero-card-icon">{icon}</div>
      <div className="hero-card-title">{title}</div>
      <div className="hero-card-desc">{description}</div>
    </div>
  );
}

interface DiscoverPageProps {
  onNavigateHome: () => void;
  onOpenDetail: (dramaId: number) => void;
}

function DiscoverPage({ onNavigateHome, onOpenDetail }: DiscoverPageProps) {
  const featuredCategories = categories
    .map((category) => ({
      ...category,
      count: getDramasByCategory(category.id).length
    }))
    .filter((category) => category.count > 0)
    .slice(0, 4);
  const trendingDramas = getPopularDramas().slice(0, 6);
  const quickWatchDramas = dramas.filter((drama) => drama.episodes <= 20).slice(0, 8);
  const newReleaseDramas = getLatestDramas().slice(0, 6);

  return (
    <>
      <section className="discover-header">
        <h1 className="discover-title">Discover Short Dramas</h1>
        <p className="discover-subtitle">
          <span className="highlight">Daily Updated</span> · Mini-Series · Quick,
          Addictive, and Easy to Watch
        </p>
      </section>

      <section className="daily-update-banner">
        <div className="daily-update-content">
          <div className="daily-icon">UP</div>
          <h3 className="daily-title">Daily Updated Content</h3>
          <p className="daily-desc">
            New short drama episodes added every day! Our mini-series are perfect
            for quick viewing sessions, with each episode lasting only 5-10
            minutes. Watch anytime, anywhere, completely free.
          </p>
        </div>
      </section>

      <section className="browse-category">
        <div className="category-header">
          <h2 className="section-title-orange">Browse by Category</h2>
          <div className="section-divider" />
        </div>

        <div className="category-grid" id="discover-categories">
          {featuredCategories.map((category) => (
            <div
              key={category.id}
              className="category-card"
              data-focusable="true"
              onClick={() => undefined}
            >
              <div className="category-icon">{resolveCategoryIcon(category)}</div>
              <div className="category-name">{category.name}</div>
              <div className="category-count">{category.count} Series</div>
            </div>
          ))}
        </div>
      </section>

      <section className="free-banner">
        <div className="free-banner-content">
          <h2 className="free-banner-title">Watch Everything For Free!</h2>
          <p className="free-banner-desc">
            No subscriptions, no payments, no hidden fees. Enjoy all our short
            drama series completely free. Perfect for quick breaks, commutes, or
            relaxing evenings.
          </p>
          <button
            className="free-banner-btn"
            data-focusable="true"
            onClick={onNavigateHome}
            type="button"
          >
            Start Watching Now
          </button>
        </div>
      </section>

      <DramaSection
        dramasList={trendingDramas}
        gridClassName="trending-grid"
        itemClassName="trending-card"
        onOpenDetail={onOpenDetail}
        sectionClassName="trending-section"
        title="Trending Now"
      />

      <section className="quick-watch-section">
        <div className="section-header">
          <h2 className="section-title-orange">Quick Watch (Under 10 min)</h2>
          <button className="view-all-btn" data-focusable="true" type="button">
            View All Quick Series
          </button>
        </div>

        <div className="quick-watch-grid" id="quick-watch-dramas">
          {quickWatchDramas.map((drama, index) => (
            <div
              key={drama.id}
              className="quick-watch-card"
              data-focusable="true"
              onClick={() => onOpenDetail(drama.id)}
            >
              <div className="quick-time-badge">{getQuickDuration(index)} min</div>
              <div className="quick-thumbnail">
                <img src={drama.image} alt={drama.title} onError={handleImageError} />
              </div>
              <h3 className="quick-title">{drama.title}</h3>
            </div>
          ))}
        </div>
      </section>

      <DramaSection
        dramasList={newReleaseDramas}
        gridClassName="new-releases-grid"
        itemClassName="new-release-card"
        onOpenDetail={onOpenDetail}
        sectionClassName="new-releases-section"
        title="New Releases"
      />
    </>
  );
}

interface DramaSectionProps {
  dramasList: readonly Drama[];
  gridClassName: string;
  itemClassName: string;
  onOpenDetail: (dramaId: number) => void;
  sectionClassName: string;
  title: string;
}

function DramaSection({
  dramasList,
  gridClassName,
  itemClassName,
  onOpenDetail,
  sectionClassName,
  title
}: DramaSectionProps) {
  return (
    <section className={sectionClassName}>
      <div className="section-header">
        <h2 className="section-title-orange">{title}</h2>
        <button className="view-all-btn" data-focusable="true" type="button">
          View All
        </button>
      </div>

      <div className={gridClassName}>
        {dramasList.map((drama) => (
          <div
            key={drama.id}
            className={itemClassName}
            data-focusable="true"
            onClick={() => onOpenDetail(drama.id)}
          >
            <div className="card-poster">
              <img src={drama.image} alt={drama.title} onError={handleImageError} />
              <span className="card-badge">{drama.badge ?? "NEW"}</span>
            </div>
            <div className="card-content">
              <h3 className="card-title">{drama.title}</h3>
              <p className="card-meta">
                {resolveCategoryName(drama.category)} ·{" "}
                {drama.seasons ? `${drama.seasons} Seasons` : `${drama.episodes} Eps`}
              </p>
              <button className="card-watch-btn" type="button">
                Watch
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface DetailPageProps {
  currentDrama?: Drama;
  isFavoriteDrama: boolean;
  onOpenDetail: (dramaId: number) => void;
  onPlayEpisode: (dramaId: number, episodeId: string) => void;
  onToggleFavorite: (dramaId: number) => void;
}

function DetailPage({
  currentDrama,
  isFavoriteDrama,
  onOpenDetail,
  onPlayEpisode,
  onToggleFavorite
}: DetailPageProps) {
  if (!currentDrama) {
    return null;
  }

  const relatedDramas = getDramasByCategory(currentDrama.category)
    .filter((drama) => drama.id !== currentDrama.id)
    .slice(0, 4);
  const episodes = currentDrama.episodesList.slice(0, 12);

  return (
    <div className="detail-layout">
      <div
        className="detail-backdrop"
        id="detail-backdrop"
        style={{ backgroundImage: `url(${currentDrama.backdrop})` }}
      />
      <div className="detail-overlay" />

      <div className="detail-main">
        <div className="detail-poster" id="detail-poster">
          <img src={currentDrama.image} alt={currentDrama.title} onError={handleImageError} />
        </div>

        <div className="detail-info">
          <h1 className="detail-title" id="detail-title">
            {currentDrama.title}
          </h1>

          <div className="detail-actions">
            <button
              className="action-btn primary"
              data-focusable="true"
              id="play-btn"
              onClick={() => {
                const firstEpisode = currentDrama.episodesList[0];
                if (firstEpisode) {
                  onPlayEpisode(currentDrama.id, firstEpisode.id);
                }
              }}
              type="button"
            >
              <span aria-hidden="true" className="btn-icon">
                &gt;
              </span>
              <span className="btn-text">Play</span>
            </button>

            <button
              className={`action-btn${isFavoriteDrama ? " active" : ""}`}
              data-focusable="true"
              id="favorite-btn"
              onClick={() => onToggleFavorite(currentDrama.id)}
              type="button"
            >
              <span aria-hidden="true" className="btn-icon">
                +
              </span>
              <span className="btn-text">
                {isFavoriteDrama ? "Favorited" : "Favorite"}
              </span>
            </button>

            <button
              className="action-btn"
              data-focusable="true"
              id="share-btn"
              type="button"
            >
              <span aria-hidden="true" className="btn-icon">
                -&gt;
              </span>
              <span className="btn-text">Share</span>
            </button>
          </div>
        </div>
      </div>

      <section className="detail-extended-info">
        <div className="synopsis-section">
          <h2 className="section-title">Synopsis</h2>
          <p className="detail-desc" id="detail-desc">
            {currentDrama.desc}
          </p>
        </div>

        <div className="series-info-section">
          <h2 className="section-title">Series Info</h2>
          <ul className="series-info-list">
            <li id="detail-info-category">
              <strong>Category:</strong>
              <span>{resolveCategoryName(currentDrama.category)}</span>
            </li>
            <li id="detail-info-year">
              <strong>Year:</strong>
              <span>{currentDrama.year}</span>
            </li>
            <li id="detail-info-episodes">
              <strong>Episodes:</strong>
              <span>{currentDrama.episodes}</span>
            </li>
            <li id="detail-info-seasons">
              <strong>Seasons:</strong>
              <span>{currentDrama.seasons}</span>
            </li>
            <li id="detail-info-rating">
              <strong>Rating:</strong>
              <span>{`* ${currentDrama.rating}`}</span>
            </li>
          </ul>
        </div>
      </section>

      <section className="episodes-section">
        <h2 className="section-title">Episodes</h2>
        <div className="episodes-grid" id="episodes-grid">
          {episodes.map((episode) => (
            <div
              key={episode.id}
              className="episode-card"
              data-focusable="true"
              onClick={() => onPlayEpisode(currentDrama.id, episode.id)}
            >
              <div className="episode-thumb">
                <img src={episode.thumbnail} alt={episode.title} onError={handleImageError} />
                <div className="episode-play-icon">&gt;</div>
              </div>

              <div className="episode-info">
                <div className="episode-number">Episode {episode.number}</div>
                <div className="episode-title">{episode.title}</div>
                <div className="episode-desc">{episode.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="related-section">
        <h2 className="section-title">Related Dramas</h2>
        <div className="drama-grid" id="related-dramas">
          {relatedDramas.map((drama) => (
            <div
              key={drama.id}
              className="related-drama-card"
              data-focusable="true"
              onClick={() => onOpenDetail(drama.id)}
            >
              <img
                className="card-image"
                src={drama.image}
                alt={drama.title}
                onError={handleImageError}
              />
              <div className="card-content">
                <h3 className="card-title">{drama.title}</h3>
                <div className="card-meta">
                  <span>{drama.year}</span>
                  <span className="card-rating">{`* ${drama.rating}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface PlayerPageProps {
  currentDrama?: Drama;
  currentEpisode?: Episode;
  onSelectEpisode: (dramaId: number, episodeId: string) => void;
}

function PlayerPage({
  currentDrama,
  currentEpisode,
  onSelectEpisode
}: PlayerPageProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video || !currentEpisode) {
      return;
    }

    video.currentTime = 0;
    video.muted = isMuted;
    setIsPlaying(true);

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }
  }, [currentEpisode?.id, isMuted]);

  useEffect(() => {
    return () => {
      videoRef.current?.pause();
    };
  }, []);

  if (!currentDrama || !currentEpisode) {
    return null;
  }

  const currentEpisodeIndex = currentDrama.episodesList.findIndex(
    (episode) => episode.id === currentEpisode.id
  );

  const playEpisodeAtIndex = (episodeIndex: number) => {
    const nextEpisode = currentDrama.episodesList[episodeIndex];
    if (nextEpisode) {
      onSelectEpisode(currentDrama.id, nextEpisode.id);
    }
  };

  const playPreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      playEpisodeAtIndex(currentEpisodeIndex - 1);
    }
  };

  const playNextEpisode = () => {
    if (currentEpisodeIndex < currentDrama.episodesList.length - 1) {
      playEpisodeAtIndex(currentEpisodeIndex + 1);
    }
  };

  const togglePlayPause = () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      return;
    }

    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => undefined);
    }
    setIsPlaying(true);
  };

  const seekBy = (seconds: number) => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    const duration = Number.isFinite(video.duration) ? video.duration : Infinity;
    const nextTime = Math.max(0, video.currentTime + seconds);
    video.currentTime = Math.min(duration, nextTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  useEffect(() => {
    const handleRemoteKey = (event: Event) => {
      const detail = (event as CustomEvent<RemoteKeyEventDetail>).detail;

      switch (detail.keyCode) {
        case KEY_CODES.play:
        case KEY_CODES.pause:
          togglePlayPause();
          break;
        case KEY_CODES.fastForward:
          seekBy(10);
          break;
        case KEY_CODES.rewind:
          seekBy(-10);
          break;
        default:
          break;
      }
    };

    document.addEventListener("remote-key", handleRemoteKey);

    return () => {
      document.removeEventListener("remote-key", handleRemoteKey);
    };
  });

  return (
    <div className="player-layout">
      <div className="player-main">
        <video
          controls
          id="video-player"
          key={currentEpisode.id}
          poster={currentEpisode.thumbnail}
          ref={videoRef}
          src={currentEpisode.videoUrl}
          className="video-player"
          onEnded={playNextEpisode}
        />

        <div className="player-controls show">
          <div className="controls-left">
            <button
              className="control-btn"
              data-focusable="true"
              id="prev-episode"
              onClick={playPreviousEpisode}
              type="button"
            >
              Prev
            </button>
            <button
              className="control-btn play-pause"
              data-focusable="true"
              id="play-pause"
              onClick={togglePlayPause}
              type="button"
            >
              {isPlaying ? "Pause" : "Play"}
            </button>
            <button
              className="control-btn"
              data-focusable="true"
              id="next-episode"
              onClick={playNextEpisode}
              type="button"
            >
              Next
            </button>
          </div>

          <div className="controls-center">
            <span className="current-episode" id="current-episode">
              Ep {currentEpisode.number}
            </span>
            <span className="episode-title" id="episode-title">
              {currentEpisode.title}
            </span>
          </div>

          <div className="controls-right">
            <button
              className="control-btn"
              data-focusable="true"
              id="rewind-btn"
              onClick={() => seekBy(-10)}
              type="button"
            >
              -10s
            </button>
            <button
              className="control-btn"
              data-focusable="true"
              id="forward-btn"
              onClick={() => seekBy(10)}
              type="button"
            >
              +10s
            </button>
            <button
              className="control-btn"
              data-focusable="true"
              id="volume-btn"
              onClick={toggleMute}
              type="button"
            >
              {isMuted ? "Muted" : "Mute"}
            </button>
          </div>
        </div>
      </div>

      <aside className="player-sidebar">
        <h2 className="sidebar-title">Episodes</h2>
        <ul className="player-episodes" id="player-episodes">
          {currentDrama.episodesList.map((episode) => (
            <li
              key={episode.id}
              className={`player-episode-item${
                episode.id === currentEpisode.id ? " active" : ""
              }`}
              data-focusable="true"
              onClick={() => onSelectEpisode(currentDrama.id, episode.id)}
            >
              <div className="episode-thumb">
                <img src={episode.thumbnail} alt={episode.title} onError={handleImageError} />
              </div>

              <div className="episode-info">
                <div className="episode-number">Episode {episode.number}</div>
                <div className="episode-title">{episode.title}</div>
              </div>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function resolveCategoryName(categoryId: string): string {
  return categories.find((category) => category.id === categoryId)?.name ?? categoryId;
}

function resolveCategoryIcon(category: Category): string {
  return CATEGORY_ICONS[category.id] ?? category.icon;
}

function getQuickDuration(index: number): number {
  const durations = [5, 6, 7, 8, 5, 6, 7, 8];
  return durations[index % durations.length];
}

function getPageClassName(isActive: boolean): string {
  return isActive ? "page active" : "page";
}

function handleImageError(event: React.SyntheticEvent<HTMLImageElement>) {
  const target = event.currentTarget;
  target.onerror = null;
  target.src = FALLBACK_IMAGE;
}

interface HistoryPageProps {
  historyItems: WatchHistoryDetails[];
  onOpenDetail: (dramaId: number) => void;
}

function HistoryPage({ historyItems, onOpenDetail }: HistoryPageProps) {
  return (
    <div className="history-layout">
      <h2 className="page-title">Watch History</h2>
      <div className="drama-grid" id="history-dramas">
        {historyItems.length === 0 ? (
          <div
            className="empty-state"
            style={{ gridColumn: "1 / -1", textAlign: "center", padding: 60 }}
          >
            <p style={{ color: "var(--text-muted)", fontSize: 18 }}>
              No watch history yet
            </p>
          </div>
        ) : (
          historyItems
            .filter((historyItem) => historyItem.drama)
            .map((historyItem) => (
              <div
                key={`${historyItem.dramaId}-${historyItem.episodeId}`}
                className="home-drama-card"
                data-focusable="true"
                onClick={() => onOpenDetail(historyItem.dramaId)}
              >
                <img
                  className="card-image"
                  src={historyItem.drama?.image}
                  alt={historyItem.drama?.title}
                  onError={handleImageError}
                />
                <div className="card-content">
                  <h3 className="card-title">{historyItem.drama?.title}</h3>
                  <div className="card-meta">
                    <span>{`Ep ${historyItem.episode?.number ?? "-"}`}</span>
                  </div>
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="category-page-layout">
      <h2 className="page-title">Browse by Category</h2>
      <div className="category-grid" id="settings-categories">
        {categories.map((category) => (
          <div
            key={category.id}
            className="category-card"
            data-focusable="true"
            onClick={() => undefined}
          >
            <img
              src={resolveCategoryImage(category)}
              alt={category.name}
              className="category-card-thumbnail"
              onError={handleImageError}
            />
            <div className="category-card-overlay" />
            <h3 className="category-card-name">{category.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function resolveCategoryImage(category: Category): string {
  return getDramasByCategory(category.id)[0]?.image ?? FALLBACK_IMAGE;
}

function useAppScale() {
  useEffect(() => {
    const adjustScale = () => {
      const ratio = Math.min(
        document.documentElement.clientWidth / 1920,
        document.documentElement.clientHeight / 1080
      );
      const safeRatio = Number.isFinite(ratio) && ratio > 0 ? ratio : 1;

      document.body.style.transform = `scale(${safeRatio})`;
    };

    window.addEventListener("resize", adjustScale);
    adjustScale();

    return () => {
      window.removeEventListener("resize", adjustScale);
      document.body.style.transform = "";
    };
  }, []);
}

function useRemoteControl(
  currentPage: AppPage,
  onBack: () => void,
  canGoBack: boolean,
  onShowExit: () => void
) {
  const currentFocusRef = useRef<HTMLElement | null>(null);
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    const getFocusableElements = () =>
      Array.from(document.querySelectorAll<HTMLElement>("[data-focusable='true']")).filter(
        isElementVisible
      );

    const clearCurrentFocus = () => {
      if (currentFocusRef.current) {
        currentFocusRef.current.classList.remove("focused");
      }
    };

    const setFocus = (element: HTMLElement | null) => {
      clearCurrentFocus();
      currentFocusRef.current = element;

      if (!element) {
        return;
      }

      element.classList.add("focused");
      if (typeof element.scrollIntoView === "function") {
        element.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest"
        });
      }
    };

    const focusFirstElementForPage = () => {
      const focusableElements = getFocusableElements();
      const firstPageElement =
        focusableElements.find((element) => {
          if (currentPage === "detail" || currentPage === "player") {
            return Boolean(
              element.closest("#page-header") || element.closest(`#${currentPage}-page`)
            );
          }

          return Boolean(
            element.closest("#main-nav") || element.closest(`#${currentPage}-page`)
          );
        }) ?? focusableElements[0] ?? null;

      setFocus(firstPageElement);
    };

    const moveFocus = (direction: "left" | "right" | "up" | "down") => {
      const focusableElements = getFocusableElements();

      if (!focusableElements.length) {
        return;
      }

      if (!currentFocusRef.current || !isElementVisible(currentFocusRef.current)) {
        setFocus(focusableElements[0]);
        return;
      }

      const nextFocus = findClosestElement(
        currentFocusRef.current,
        focusableElements,
        direction
      );

      if (nextFocus) {
        setFocus(nextFocus);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const keyCode = event.keyCode || event.which;

      if (!isInputElementFocused()) {
        event.preventDefault();
      }

      switch (keyCode) {
        case KEY_CODES.up:
          moveFocus("up");
          break;
        case KEY_CODES.down:
          moveFocus("down");
          break;
        case KEY_CODES.left:
          moveFocus("left");
          break;
        case KEY_CODES.right:
          moveFocus("right");
          break;
        case KEY_CODES.enter:
          currentFocusRef.current?.click();
          break;
        case KEY_CODES.back:
        case KEY_CODES.escape:
        case KEY_CODES.exit:
          if (canGoBack) {
            onBackRef.current();
          } else {
            onShowExit();
          }
          break;
        default:
          break;
      }

      document.dispatchEvent(
        new CustomEvent<RemoteKeyEventDetail>("remote-key", {
          detail: { keyCode }
        })
      );
    };

    const observer = new MutationObserver(() => {
      if (!currentFocusRef.current || !isElementVisible(currentFocusRef.current)) {
        focusFirstElementForPage();
      }
    });

    document.addEventListener("keydown", handleKeyDown);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"]
    });
    focusFirstElementForPage();

    return () => {
      clearCurrentFocus();
      document.removeEventListener("keydown", handleKeyDown);
      observer.disconnect();
    };
  }, [currentPage]);
}

function isInputElementFocused(): boolean {
  const tagName = document.activeElement?.tagName.toLowerCase();
  return tagName === "input" || tagName === "textarea";
}

function isElementVisible(element: HTMLElement): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    const style = window.getComputedStyle(currentElement);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }

    currentElement = currentElement.parentElement;
  }

  return true;
}

function findClosestElement(
  currentElement: HTMLElement,
  allElements: HTMLElement[],
  direction: "left" | "right" | "up" | "down"
): HTMLElement | null {
  const currentRect = currentElement.getBoundingClientRect();
  const currentCenterX = currentRect.left + currentRect.width / 2;
  const currentCenterY = currentRect.top + currentRect.height / 2;

  let bestElement: HTMLElement | null = null;
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of allElements) {
    if (candidate === currentElement) {
      continue;
    }

    const candidateRect = candidate.getBoundingClientRect();
    const candidateCenterX = candidateRect.left + candidateRect.width / 2;
    const candidateCenterY = candidateRect.top + candidateRect.height / 2;
    const deltaX = candidateCenterX - currentCenterX;
    const deltaY = candidateCenterY - currentCenterY;

    if (direction === "left" && deltaX >= 0) {
      continue;
    }

    if (direction === "right" && deltaX <= 0) {
      continue;
    }

    if (direction === "up" && deltaY >= 0) {
      continue;
    }

    if (direction === "down" && deltaY <= 0) {
      continue;
    }

    const primaryDistance =
      direction === "left" || direction === "right"
        ? Math.abs(deltaX)
        : Math.abs(deltaY);
    const secondaryDistance =
      direction === "left" || direction === "right"
        ? Math.abs(deltaY)
        : Math.abs(deltaX);
    const score = primaryDistance * 1000 + secondaryDistance;

    if (score < bestScore) {
      bestScore = score;
      bestElement = candidate;
    }
  }

  return bestElement;
}

function exitTizenApp() {
  const maybeTizenWindow = window as Window & {
    tizen?: {
      application?: {
        getCurrentApplication?: () => {
          exit: () => void;
        };
      };
    };
  };

  maybeTizenWindow.tizen?.application?.getCurrentApplication?.().exit();
}
