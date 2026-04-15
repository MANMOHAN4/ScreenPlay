import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Bookmark,
  Trash2,
  Play,
  Clock,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import UserShell from "../../components/shared/UserShell";
import { watchlistApi } from "../../api/watchlistApi";
import { imageUrl, videoUrl } from "../../api/fileApi";
import { useAuth } from "../../context/AuthContext";

// ── Skeleton card ────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-bg-surface rounded-2xl border border-white/[0.06] overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-white/[0.04]" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-white/[0.06] rounded-lg w-3/4" />
        <div className="h-3 bg-white/[0.04] rounded-lg w-1/2" />
        <div className="h-8 bg-white/[0.04] rounded-xl mt-3" />
      </div>
    </div>
  );
}

// ── Video Player Modal ────────────────────────────────────────────
function VideoModal({ video, token, onClose }) {
  useEffect(() => {
    const fn = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      <div
        className="relative w-full max-w-4xl bg-bg-surface rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-base leading-tight">
              {video.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text-secondary text-xs">{video.year}</span>
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
                  <div className="flex items-center gap-1 text-text-secondary text-xs">
                    <Clock size={10} />
                    {video.duration}m
                  </div>
                </>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video player */}
        <div className="bg-black">
          <video
            src={videoUrl(video.src, token)}
            poster={imageUrl(video.poster, token)}
            controls
            autoPlay
            className="w-full max-h-[65vh]"
          />
        </div>

        {/* Description */}
        {video.description && (
          <div className="px-5 py-4">
            <p className="text-text-secondary text-sm leading-relaxed line-clamp-3">
              {video.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Video Card ────────────────────────────────────────────────────
function VideoCard({ video, token, onRemove, onPlay, removing }) {
  const [imgError, setImgError] = useState(false);
  const poster = !imgError ? imageUrl(video.poster, token) : null;

  return (
    <div className="group bg-bg-surface rounded-2xl border border-white/[0.06] hover:border-white/[0.12] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl flex flex-col">
      {/* Poster */}
      <div className="relative aspect-[2/3] overflow-hidden bg-bg-card flex-shrink-0">
        {poster ? (
          <img
            src={poster}
            alt={video.title}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bookmark size={32} className="text-text-faint" />
          </div>
        )}
        {/* Hover overlay with play button */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onPlay(video)}
            className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center hover:bg-white/30 hover:scale-110 transition-all"
          >
            <Play size={20} className="text-white fill-white ml-0.5" />
          </button>
        </div>
        {/* Rating badge */}
        {video.rating && (
          <div className="absolute top-3 left-3">
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/15 text-text-secondary font-medium">
              {video.rating}
            </span>
          </div>
        )}
        {/* Duration badge */}
        {video.duration && (
          <div className="absolute top-3 right-3 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/15 text-text-secondary">
            <Clock size={9} />
            {video.duration}m
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 mb-1.5">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
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

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => onPlay(video)}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-accent hover:bg-accent/80 text-white text-xs font-semibold transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play size={12} className="fill-white" /> Watch
          </button>
          <button
            onClick={() => onRemove(video.id)}
            disabled={removing === video.id}
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08] text-text-secondary hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/[0.06] transition-all disabled:opacity-40"
          >
            {removing === video.id ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function WatchlistPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [removing, setRemoving] = useState(null);
  const [playing, setPlaying] = useState(null);
  const PAGE_SIZE = 12;

  const fetchWatchlist = useCallback(async () => {
    setLoading(true);
    try {
      const res = await watchlistApi.getWatchlist(page, PAGE_SIZE, search);
      setVideos(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalItems(res.data.totalElements ?? 0);
    } catch {
      toast.error("Failed to load watchlist");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleRemove = async (videoId) => {
    setRemoving(videoId);
    try {
      await watchlistApi.removeFromWatchlist(videoId);
      toast.success("Removed from watchlist");
      fetchWatchlist();
    } catch {
      toast.error("Failed to remove");
    } finally {
      setRemoving(null);
    }
  };

  return (
    <UserShell>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Page Header ──────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center">
                <Bookmark size={16} className="text-accent-light" />
              </div>
              <h1 className="text-white font-black text-2xl tracking-tight">
                My Watchlist
              </h1>
            </div>
            {!loading && (
              <p className="text-text-secondary text-sm">
                {totalItems} {totalItems === 1 ? "title" : "titles"} saved
              </p>
            )}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search watchlist…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2.5 rounded-xl bg-bg-surface border border-white/[0.08] text-white placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/40 transition-all"
            />
          </form>
        </div>

        {/* ── Grid ─────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-white/[0.06] flex items-center justify-center mb-4">
              <Bookmark size={28} className="text-text-faint" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">
              {search ? "No results found" : "Your watchlist is empty"}
            </h3>
            <p className="text-text-secondary text-sm max-w-xs leading-relaxed">
              {search
                ? `No titles match "${search}". Try a different search.`
                : "Browse movies and series and save them here to watch later."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {videos.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                token={token}
                onRemove={handleRemove}
                onPlay={setPlaying}
                removing={removing}
              />
            ))}
          </div>
        )}

        {/* ── Pagination ───────────────────────────────────────── */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-white hover:bg-white/[0.05] text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} /> Previous
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
                const pg = totalPages <= 7 ? i : i; // simplified
                const isActive = pg === page;
                return (
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
                );
              })}
            </div>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary hover:text-white hover:bg-white/[0.05] text-sm transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* ── Video Player Modal ────────────────────────────────── */}
      {playing && (
        <VideoModal
          video={playing}
          token={token}
          onClose={() => setPlaying(null)}
        />
      )}
    </UserShell>
  );
}
