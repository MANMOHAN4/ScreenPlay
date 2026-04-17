import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Clock,
  BookmarkPlus,
  BookmarkCheck,
  Search,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Film,
  Loader2,
  TrendingUp,
  Star,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { videoApi } from "../../api/videoApi";
import { watchlistApi } from "../../api/watchlistApi";
import { imageUrl, videoUrl } from "../../api/fileApi";

// ─────────────────────────────────────────────────────────────────
// Video Player Modal
// ─────────────────────────────────────────────────────────────────
function VideoModal({ video, token, onClose }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/85 backdrop-blur-md" />
      <div
        className="relative w-full max-w-4xl bg-bg-surface rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-base leading-tight">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              {video.year && (
                <span className="text-text-secondary text-xs">
                  {video.year}
                </span>
              )}
              {video.rating && (
                <>
                  <span className="w-1 h-1 rounded-full bg-text-faint" />
                  <span className="text-[10px] px-1.5 py-px rounded border border-white/20 text-text-secondary">
                    {video.rating}
                  </span>
                </>
              )}
              {video.duration && (
                <>
                  <span className="w-1 h-1 rounded-full bg-text-faint" />
                  <span className="flex items-center gap-1 text-text-secondary text-xs">
                    <Clock size={10} />
                    {video.duration}m
                  </span>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.08] transition-all flex-shrink-0"
          >
            <X size={18} />
          </button>
        </div>
        <div className="bg-black aspect-video">
          <video
            src={videoUrl(video.src, token)}
            poster={imageUrl(video.poster, token)}
            controls
            autoPlay
            className="w-full h-full"
          />
        </div>
        {video.description && (
          <div className="px-5 py-4 border-t border-white/[0.06]">
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Navbar
// ─────────────────────────────────────────────────────────────────
function BrowseNavbar({
  scrolled,
  pendingSearch,
  onSearchChange,
  onSearchSubmit,
}) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target))
        setSearchOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-500 ${
        scrolled
          ? "bg-bg-primary/95 backdrop-blur-md border-b border-white/[0.06] shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-full flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
              <polygon points="8,6 8,26 28,16" fill="white" />
            </svg>
          </div>
          <span className="hidden sm:block text-white font-black text-lg tracking-tight">
            Screen<span className="text-accent-light">Play</span>
          </span>
        </div>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          {/* Desktop search */}
          <div ref={searchRef} className="hidden sm:block relative">
            {searchOpen ? (
              <form
                onSubmit={onSearchSubmit}
                className="flex items-center gap-2"
              >
                <div className="relative">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
                  />
                  <input
                    autoFocus
                    type="text"
                    value={pendingSearch}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search titles…"
                    className="w-52 pl-9 pr-4 py-2 rounded-xl bg-bg-surface/80 backdrop-blur-sm border border-white/[0.12] text-white placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/50 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    onSearchChange("");
                  }}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/[0.08] transition-all"
              >
                <Search size={17} />
              </button>
            )}
          </div>

          {/* Watchlist icon */}
          <button
            onClick={() => navigate("/watchlist")}
            title="My Watchlist"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-accent-light hover:bg-accent/10 border border-transparent hover:border-accent/20 transition-all"
          >
            <Bookmark size={17} />
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropRef}>
            <button
              onClick={() => setDropOpen((p) => !p)}
              className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl border border-transparent hover:bg-white/[0.06] hover:border-white/[0.08] transition-all"
            >
              <div className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
                <span className="text-accent-light font-bold text-xs">
                  {initials}
                </span>
              </div>
              <span className="hidden md:block text-white text-sm font-medium max-w-[100px] truncate">
                {user?.fullName?.split(" ")[0]}
              </span>
              <ChevronDown
                size={13}
                className={`text-text-secondary transition-transform flex-shrink-0 ${dropOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-bg-surface/95 backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50">
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                  <p className="text-white text-sm font-semibold truncate">
                    {user?.fullName}
                  </p>
                  <p className="text-text-secondary text-xs truncate">
                    {user?.email}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/profile");
                    setDropOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <User size={14} /> My Profile
                </button>
                <button
                  onClick={() => {
                    navigate("/watchlist");
                    setDropOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-text-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                >
                  <Bookmark size={14} /> My Watchlist
                </button>
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.06] transition-all"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden border-t border-white/[0.06] bg-bg-primary/98 backdrop-blur-md px-4 py-3 flex flex-col gap-2">
          <form onSubmit={onSearchSubmit}>
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
              />
              <input
                type="text"
                value={pendingSearch}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search titles…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-bg-surface border border-white/[0.08] text-white placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>
          </form>
          <button
            onClick={() => {
              navigate("/watchlist");
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <Bookmark size={15} /> Watchlist
          </button>
          <button
            onClick={() => {
              navigate("/profile");
              setMobileOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-text-secondary hover:text-white hover:bg-white/[0.05] transition-all"
          >
            <User size={15} /> My Profile
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
          >
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      )}
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero Carousel
// ─────────────────────────────────────────────────────────────────
function HeroCarousel({ videos, token, onPlay }) {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const [wlLoading, setWlLoading] = useState(null);
  const [localWl, setLocalWl] = useState({});
  const timerRef = useRef(null); // FIX: was missing `const`

  useEffect(() => {
    const map = {};
    videos.forEach((v) => {
      map[v.id] = v.isInWatchlist ?? false;
    });
    setLocalWl(map);
  }, [videos]);

  const goTo = useCallback(
    (idx) => {
      if (animating) return;
      setAnimating(true);
      setActive(idx);
      setTimeout(() => setAnimating(false), 700);
    },
    [animating],
  );

  const next = useCallback(() => {
    setActive((prev) => {
      const idx = (prev + 1) % videos.length;
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
      return idx;
    });
  }, [videos.length]);

  const prev = useCallback(() => {
    setActive((prev) => {
      const idx = (prev - 1 + videos.length) % videos.length;
      setAnimating(true);
      setTimeout(() => setAnimating(false), 700);
      return idx;
    });
  }, [videos.length]);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (!paused && videos.length > 1) {
      timerRef.current = setTimeout(next, 6000);
    }
    return () => clearTimeout(timerRef.current);
  }, [active, paused, next, videos.length]);

  const handleWatchlist = async (video) => {
    const isIn = localWl[video.id] ?? false;
    setWlLoading(video.id);
    setLocalWl((p) => ({ ...p, [video.id]: !isIn }));
    try {
      if (isIn) {
        await watchlistApi.removeFromWatchlist(video.id);
        toast.success("Removed from watchlist");
      } else {
        await watchlistApi.addToWatchlist(video.id);
        toast.success("Added to watchlist");
      }
    } catch {
      setLocalWl((p) => ({ ...p, [video.id]: isIn }));
      toast.error("Failed to update watchlist");
    } finally {
      setWlLoading(null);
    }
  };

  if (!videos.length) return null;

  const slide = videos[active];
  const poster = imageUrl(slide.poster, token);
  const inWl = localWl[slide.id] ?? false;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "clamp(520px, 90vh, 900px)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Backdrop */}
      <div key={`bg-${active}`} className="absolute inset-0 hero-slide-in">
        {poster ? (
          <img
            src={poster}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover hero-slow-zoom"
            loading="eager"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-bg-surface to-bg-primary" />
        )}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/10 to-black/40" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 70% 50%, rgba(79,152,163,0.07) 0%, transparent 60%)",
        }}
      />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-end pb-28 sm:pb-24">
        <div key={`content-${active}`} className="max-w-2xl hero-content-in">
          {/* Trending badge */}
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs font-semibold text-white">
              <TrendingUp size={11} /> Featured
            </div>
            {slide.rating && (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-xs text-text-secondary">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-bold text-xs">
                  {slide.rating}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h1
            className="text-white font-black leading-none mb-3 tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)" }}
          >
            {slide.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {slide.year && (
              <span className="text-text-secondary text-sm">{slide.year}</span>
            )}
            {slide.rating && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-faint" />
                <span className="text-[11px] px-2 py-0.5 rounded border border-white/25 text-text-secondary font-medium">
                  {slide.rating}
                </span>
              </>
            )}
            {slide.duration && (
              <>
                <span className="w-1 h-1 rounded-full bg-text-faint" />
                <span className="flex items-center gap-1 text-text-secondary text-sm">
                  <Clock size={11} />
                  {slide.duration}m
                </span>
              </>
            )}
            {slide.categories?.slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs px-2.5 py-1 rounded-full font-medium bg-accent/20 border border-accent/30 text-accent-light"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Description */}
          {slide.description && (
            <p className="text-text-secondary text-sm leading-relaxed mb-7 max-w-lg line-clamp-2">
              {slide.description}
            </p>
          )}

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onPlay(slide)}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-accent hover:bg-accent/80 text-white font-bold text-sm transition-all hover:scale-[1.03] active:scale-95 shadow-lg"
              style={{ boxShadow: "0 8px 24px rgba(79,152,163,0.3)" }}
            >
              <Play size={16} className="fill-white" /> Start Watching
            </button>
            <button
              onClick={() => handleWatchlist(slide)}
              disabled={wlLoading === slide.id}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-xl backdrop-blur-sm border font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 ${
                inWl
                  ? "bg-accent/20 border-accent/40 text-accent-light hover:bg-accent/30"
                  : "bg-white/10 border-white/20 text-white hover:bg-white/20"
              }`}
            >
              {wlLoading === slide.id ? (
                <Loader2 size={15} className="animate-spin" />
              ) : inWl ? (
                <BookmarkCheck size={15} />
              ) : (
                <BookmarkPlus size={15} />
              )}
              {inWl ? "In Watchlist" : "+ Watchlist"}
            </button>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      {videos.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
          {videos.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === active ? 28 : 8,
                height: 8,
                background: i === active ? "#4f98a3" : "rgba(255,255,255,0.25)",
              }}
            />
          ))}
        </div>
      )}

      {/* Arrows */}
      {videos.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-black/40 hover:bg-black/65 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 z-10"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-black/40 hover:bg-black/65 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95 z-10"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Slide counter */}
      {videos.length > 1 && (
        <div className="absolute top-20 right-6 sm:right-10 text-xs text-white/35 font-mono tabular-nums z-10">
          {String(active + 1).padStart(2, "0")} /{" "}
          {String(videos.length).padStart(2, "0")}
        </div>
      )}

      {/* Bottom page blend */}
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Hero Skeleton
// ─────────────────────────────────────────────────────────────────
function HeroSkeleton() {
  return (
    <div
      className="relative w-full overflow-hidden bg-bg-surface animate-pulse"
      style={{ height: "clamp(520px, 90vh, 900px)" }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
      <div className="relative h-full max-w-7xl mx-auto px-5 sm:px-8 flex flex-col justify-end pb-28 sm:pb-24">
        <div className="max-w-2xl space-y-4">
          <div className="w-28 h-7 bg-white/[0.06] rounded-full" />
          <div className="w-3/4 h-16 bg-white/[0.08] rounded-xl" />
          <div className="flex gap-2">
            {[60, 50, 80, 70].map((w, i) => (
              <div
                key={i}
                style={{ width: w }}
                className="h-5 bg-white/[0.05] rounded-full"
              />
            ))}
          </div>
          <div className="w-[420px] max-w-full h-3.5 bg-white/[0.04] rounded-lg" />
          <div className="w-80 max-w-full h-3.5 bg-white/[0.04] rounded-lg" />
          <div className="flex gap-3 pt-2">
            <div className="w-40 h-12 bg-white/[0.06] rounded-xl" />
            <div className="w-36 h-12 bg-white/[0.04] rounded-xl" />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-bg-primary to-transparent" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Video Card
// ─────────────────────────────────────────────────────────────────
function VideoCard({ video, token, onPlay, onWatchlistToggle, wlLoading }) {
  const [imgError, setImgError] = useState(false);
  const poster = !imgError ? imageUrl(video.poster, token) : null;
  const inWl = video._inWl ?? video.isInWatchlist ?? false;

  return (
    <div className="group bg-bg-surface rounded-2xl border border-white/[0.06] hover:border-white/[0.14] overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-card flex-shrink-0">
        {poster ? (
          <img
            src={poster}
            alt={video.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film size={32} className="text-text-faint" />
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
          <button
            onClick={() => onPlay(video)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-semibold hover:bg-white/30 transition-all hover:scale-105"
          >
            <Play size={12} className="fill-white" /> Watch
          </button>
        </div>

        {/* Badges */}
        {video.rating && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/15 text-text-secondary font-medium">
              {video.rating}
            </span>
          </div>
        )}
        {video.duration && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/15 text-text-secondary">
            <Clock size={9} />
            {video.duration}m
          </div>
        )}

        {/* Watchlist button (appears on hover) */}
        <button
          onClick={() => onWatchlistToggle(video)}
          disabled={wlLoading === video.id}
          className={`absolute bottom-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center backdrop-blur-sm border transition-all disabled:opacity-50 opacity-0 group-hover:opacity-100 ${
            inWl
              ? "bg-accent/40 border-accent/50 text-accent-light"
              : "bg-black/50 border-white/20 text-white hover:bg-accent/30 hover:border-accent/40"
          }`}
        >
          {wlLoading === video.id ? (
            <Loader2 size={13} className="animate-spin" />
          ) : inWl ? (
            <BookmarkCheck size={13} />
          ) : (
            <BookmarkPlus size={13} />
          )}
        </button>
      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
          {video.title}
        </h3>
        <div className="flex items-center gap-1.5 flex-wrap mt-auto">
          {video.year && (
            <span className="text-text-secondary text-xs">{video.year}</span>
          )}
          {video.categories?.slice(0, 2).map((c) => (
            <span
              key={c}
              className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent-light"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Browse Grid Section
// ─────────────────────────────────────────────────────────────────
function BrowseSection({ searchQuery, onClearSearch }) {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [wlLoading, setWlLoading] = useState(null);
  const [playing, setPlaying] = useState(null);
  const PAGE_SIZE = 16;

  // Reset to page 0 when search changes
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await videoApi.getPublished(page, PAGE_SIZE, searchQuery);
      setVideos(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalItems(res.data.totalElements ?? 0);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleWatchlistToggle = async (video) => {
    const inWl = video._inWl ?? video.isInWatchlist ?? false;
    setWlLoading(video.id);
    setVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, _inWl: !inWl } : v)),
    );
    try {
      if (inWl) {
        await watchlistApi.removeFromWatchlist(video.id);
        toast.success("Removed from watchlist");
      } else {
        await watchlistApi.addToWatchlist(video.id);
        toast.success("Added to watchlist");
      }
    } catch {
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? { ...v, _inWl: inWl } : v)),
      );
      toast.error("Failed to update watchlist");
    } finally {
      setWlLoading(null);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-5 sm:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-7">
        <div className="flex-1">
          <h2 className="text-white font-black text-2xl tracking-tight mb-1">
            {searchQuery ? `Results for "${searchQuery}"` : "All Titles"}
          </h2>
          {!loading && (
            <p className="text-text-secondary text-sm">
              {totalItems} {totalItems === 1 ? "title" : "titles"} available
            </p>
          )}
        </div>
        {searchQuery && (
          <button
            onClick={onClearSearch}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-text-secondary hover:text-white text-sm transition-all self-start sm:self-auto"
          >
            <X size={13} /> Clear search
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg-surface rounded-2xl border border-white/[0.06] overflow-hidden animate-pulse"
            >
              <div className="aspect-[2/3] bg-white/[0.04]" />
              <div className="p-3.5 space-y-2">
                <div className="h-3.5 bg-white/[0.06] rounded w-3/4" />
                <div className="h-2.5 bg-white/[0.04] rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-white/[0.06] flex items-center justify-center mb-4">
            <Film size={28} className="text-text-faint" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">
            {searchQuery ? "No results found" : "No videos yet"}
          </h3>
          <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
            {searchQuery
              ? `No titles match "${searchQuery}". Try a different search.`
              : "Check back soon — new content is on the way."}
          </p>
          {searchQuery && (
            <button
              onClick={onClearSearch}
              className="mt-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent/15 border border-accent/25 text-accent-light text-sm hover:bg-accent/25 transition-all"
            >
              <X size={13} /> Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {videos.map((v) => (
            <VideoCard
              key={v.id}
              video={v}
              token={token}
              onPlay={setPlaying}
              onWatchlistToggle={handleWatchlistToggle}
              wlLoading={wlLoading}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-white hover:bg-white/[0.05] text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={15} /> Prev
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                  i === page
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-white hover:bg-white/[0.05] text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next <ChevronRight size={15} />
          </button>
        </div>
      )}

      {/* Card video modal */}
      {playing && (
        <VideoModal
          video={playing}
          token={token}
          onClose={() => setPlaying(null)}
        />
      )}
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main BrowsePage
// ─────────────────────────────────────────────────────────────────
export default function BrowsePage() {
  const { token } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [featured, setFeatured] = useState([]);
  const [featLoading, setFeatLoading] = useState(true);
  const [heroPlaying, setHeroPlaying] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingSearch, setPendingSearch] = useState("");

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    videoApi
      .getFeatured()
      .then((res) => setFeatured(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        // Featured fails silently — page still works without hero
        setFeatured([]);
      })
      .finally(() => setFeatLoading(false));
  }, []);

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    setSearchQuery(pendingSearch.trim());
  };

  const handleClearSearch = () => {
    setPendingSearch("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Keyframes injected once */}
      <style>{`
        .hero-slide-in {
          animation: heroSlideIn 0.7s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        .hero-slow-zoom {
          animation: heroSlowZoom 8s ease-out forwards;
        }
        .hero-content-in {
          animation: heroContentIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.15s both;
        }
        @keyframes heroSlideIn {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes heroSlowZoom {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }
        @keyframes heroContentIn {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Navbar */}
      <BrowseNavbar
        scrolled={scrolled}
        pendingSearch={pendingSearch}
        onSearchChange={setPendingSearch}
        onSearchSubmit={handleSearchSubmit}
      />

      {/* Hero — only shown when there is data */}
      {
        featLoading ? (
          <HeroSkeleton />
        ) : featured.length > 0 ? (
          <HeroCarousel
            videos={featured}
            token={token}
            onPlay={setHeroPlaying}
          />
        ) : (
          <div className="h-16" />
        ) /* spacer for navbar when no hero */
      }

      {/* Browse grid */}
      <BrowseSection
        searchQuery={searchQuery}
        onClearSearch={handleClearSearch}
      />

      {/* Hero video modal */}
      {heroPlaying && (
        <VideoModal
          video={heroPlaying}
          token={token}
          onClose={() => setHeroPlaying(null)}
        />
      )}
    </div>
  );
}
