import { useState } from "react";
import { Heart, Play, Star } from "lucide-react";
import { fileApi } from "../../api/fileApi";

export default function VideoCard({
  video,
  onWatchlistToggle,
  isInWatchlist = false,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);
  const [wishlistActive, setWishlistActive] = useState(isInWatchlist);

  const handleWatchlist = (e) => {
    e.stopPropagation();
    setWishlistActive(!wishlistActive);
    onWatchlistToggle?.(video.id, !wishlistActive);
  };

  const imageUrl = video.thumbnailUuid
    ? fileApi.getImageUrl(video.thumbnailUuid)
    : `https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&q=80`;

  return (
    <div
      className="relative rounded-xl overflow-hidden cursor-pointer group flex-shrink-0"
      style={{ aspectRatio: "2/3", width: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(video)}
    >
      {/* Poster */}
      <img
        src={imageUrl}
        alt={video.title}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
        onError={(e) => {
          e.target.src = `https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80`;
        }}
      />

      {/* Gradient overlay */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        style={{
          background:
            "linear-gradient(to top, rgba(15,17,23,0.95) 0%, rgba(15,17,23,0.4) 60%, transparent 100%)",
        }}
      />

      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
        {video.genre && (
          <span className="bg-bg-primary/70 backdrop-blur-sm text-text-secondary text-[10px] px-2 py-0.5 rounded-full border border-white/10">
            {video.genre}
          </span>
        )}
        <button
          onClick={handleWatchlist}
          className={`w-7 h-7 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
            wishlistActive
              ? "bg-accent text-white"
              : "bg-bg-primary/60 text-text-secondary hover:text-white hover:bg-bg-primary/80"
          }`}
        >
          <Heart size={13} className={wishlistActive ? "fill-white" : ""} />
        </button>
      </div>

      {/* Bottom hover info */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${hovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
      >
        <div className="flex items-center gap-1.5 mb-1">
          {video.rating && (
            <div className="flex items-center gap-0.5">
              <Star size={10} className="text-amber-rating fill-amber-rating" />
              <span className="text-amber-rating text-[10px] font-bold">
                {video.rating}
              </span>
            </div>
          )}
        </div>
        <p className="text-white text-xs font-semibold leading-tight line-clamp-1">
          {video.title}
        </p>
        <p className="text-text-secondary text-[10px] mt-0.5 line-clamp-1">
          {video.releaseYear}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick?.(video);
            }}
            className="flex items-center gap-1 bg-white text-bg-primary text-[11px] font-semibold px-3 py-1.5 rounded-full hover:bg-white/90 transition-all"
          >
            <Play size={10} className="fill-bg-primary" />
            Play
          </button>
        </div>
      </div>
    </div>
  );
}
