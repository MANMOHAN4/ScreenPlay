import { useState, useEffect, useCallback } from "react";
import { videoApi } from "../api/videoApi";
import { watchlistApi } from "../api/watchlistApi";

export function useVideos() {
  const [videos, setVideos] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeGenre, setActiveGenre] = useState("All");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await videoApi.getPublishedVideos(page, 20, search);
      setVideos(res.data.content || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setVideos([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  const fetchFeatured = useCallback(async () => {
    try {
      const res = await videoApi.getFeaturedVideos();
      setFeatured(res.data || []);
    } catch {
      setFeatured([]);
    }
  }, []);

  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await watchlistApi.getWatchlist(0, 100);
      setWatchlist((res.data.content || []).map((v) => v.id));
    } catch {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);
  useEffect(() => {
    fetchFeatured();
  }, [fetchFeatured]);
  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const toggleWatchlist = async (videoId, add) => {
    try {
      if (add) {
        await watchlistApi.addToWatchlist(videoId);
        setWatchlist((prev) => [...prev, videoId]);
      } else {
        await watchlistApi.removeFromWatchlist(videoId);
        setWatchlist((prev) => prev.filter((id) => id !== videoId));
      }
    } catch {}
  };

  const genres = [
    "All",
    ...new Set(videos.map((v) => v.genre).filter(Boolean)),
  ];

  const filteredVideos =
    activeGenre === "All"
      ? videos
      : videos.filter((v) => v.genre === activeGenre);

  return {
    videos: filteredVideos,
    featured,
    watchlist,
    loading,
    search,
    setSearch,
    activeGenre,
    setActiveGenre,
    genres,
    page,
    setPage,
    totalPages,
    toggleWatchlist,
    refetch: fetchVideos,
  };
}
