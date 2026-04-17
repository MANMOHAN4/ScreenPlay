import { useState, useEffect, useCallback, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Film,
  Upload,
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminShell from "../../components/shared/AdminShell";
import { videoApi } from "../../api/videoApi";
import { fileApi, imageUrl } from "../../api/fileApi";
import { useAuth } from "../../context/AuthContext";

const RATINGS = [
  "G",
  "PG",
  "PG-13",
  "R",
  "NC-17",
  "TV-G",
  "TV-PG",
  "TV-14",
  "TV-MA",
];
const EMPTY_FORM = {
  title: "",
  description: "",
  year: "",
  rating: "",
  duration: "",
  src: "",
  poster: "",
  published: false,
  categories: [],
};
const inputCls = `w-full px-3.5 py-2.5 rounded-xl bg-bg-card border border-white/[0.08] text-white
  placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/50 transition-all`;

// ── Category tag input ─────────────────────────────────────────────
function CategoryInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (t && !value.includes(t)) onChange([...value, t]);
    setInput("");
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  return (
    <div
      className="flex flex-wrap gap-1.5 px-3 py-2.5 rounded-xl bg-bg-card border border-white/[0.08]
      min-h-[44px] items-center focus-within:border-accent/50 transition-all"
    >
      {value.map((cat, i) => (
        <span
          key={i}
          className="flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full
          bg-accent/15 border border-accent/25 text-accent-light text-xs font-medium"
        >
          {cat}
          <button
            type="button"
            onClick={() => remove(i)}
            className="hover:text-white transition-colors"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={value.length === 0 ? "Type category, press Enter…" : ""}
        className="flex-1 min-w-[120px] bg-transparent text-white text-sm
          placeholder:text-text-tertiary outline-none"
      />
    </div>
  );
}

// ── File upload field ──────────────────────────────────────────────
function UploadField({ label, type, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [filename, setFilename] = useState("");
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fn = type === "video" ? fileApi.uploadVideo : fileApi.uploadImage;
      const res = await fn(file);
      onChange(res.data.uuid);
      setFilename(file.name);
      toast.success(`${type === "video" ? "Video" : "Image"} uploaded`);
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
        {label}{" "}
        <span className="normal-case text-text-faint">(UUID or upload)</span>
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${type} UUID…`}
          className={`${inputCls} flex-1`}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.05] border
            border-white/[0.08] hover:bg-white/[0.09] text-text-secondary hover:text-white
            text-xs transition-all disabled:opacity-40 flex-shrink-0 whitespace-nowrap"
        >
          {uploading ? (
            <Loader2 size={13} className="animate-spin" />
          ) : (
            <Upload size={13} />
          )}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={type === "video" ? "video/*" : "image/*"}
          onChange={handleFile}
          className="hidden"
        />
      </div>
      {filename && (
        <p className="text-green-400 text-xs flex items-center gap-1">
          <Check size={11} /> {filename}
        </p>
      )}
    </div>
  );
}

// ── Video form modal ───────────────────────────────────────────────
function VideoFormModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(
    initial
      ? {
          title: initial.title ?? "",
          description: initial.description ?? "",
          year: initial.year ?? "",
          rating: initial.rating ?? "",
          duration: initial.duration ?? "",
          src: initial.src ?? "",
          poster: initial.poster ?? "",
          published: initial.published ?? false,
          categories: initial.categories ?? [],
        }
      : EMPTY_FORM,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isEdit = !!initial;

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setLoading(true);
    try {
      await onSave({
        ...form,
        year: form.year ? Number(form.year) : null,
        duration: form.duration ? Number(form.duration) : null,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to save. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Close on Escape
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative w-full max-w-2xl bg-bg-surface border border-white/[0.08] rounded-2xl
          shadow-2xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl bg-accent/15 border border-accent/25
              flex items-center justify-center"
            >
              <Film size={15} className="text-accent-light" />
            </div>
            <h2 className="text-white font-bold text-base">
              {isEdit ? "Edit Video" : "Add New Video"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-text-secondary
              hover:text-white hover:bg-white/[0.08] transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-4">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Movie or series title"
              className={inputCls}
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief synopsis…"
              rows={3}
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Year · Rating · Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                Year
              </label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => set("year", e.target.value)}
                placeholder="2024"
                min="1900"
                max="2100"
                className={inputCls}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                Rating
              </label>
              <select
                value={form.rating}
                onChange={(e) => set("rating", e.target.value)}
                className={`${inputCls} appearance-none cursor-pointer`}
              >
                <option value="">Select…</option>
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                Duration (min)
              </label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
                placeholder="120"
                min="1"
                className={inputCls}
              />
            </div>
          </div>

          {/* Video upload */}
          <UploadField
            label="Video File"
            type="video"
            value={form.src}
            onChange={(v) => set("src", v)}
          />

          {/* Image upload */}
          <UploadField
            label="Poster Image"
            type="image"
            value={form.poster}
            onChange={(v) => set("poster", v)}
          />

          {/* Categories */}
          <div className="flex flex-col gap-1.5">
            <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
              Categories
            </label>
            <CategoryInput
              value={form.categories}
              onChange={(v) => set("categories", v)}
            />
            <p className="text-text-faint text-[10px]">
              Press Enter or comma to add a tag
            </p>
          </div>

          {/* Published toggle */}
          <label
            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-bg-card
            border border-white/[0.06] cursor-pointer hover:bg-white/[0.03] transition-all select-none"
          >
            <div
              className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0
              ${form.published ? "bg-accent" : "bg-white/20"}`}
            >
              <div
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                ${form.published ? "translate-x-4" : "translate-x-0.5"}`}
              />
            </div>
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => set("published", e.target.checked)}
              className="sr-only"
            />
            <span className="text-white text-sm font-medium flex-1">
              {form.published ? "Published" : "Draft"}
            </span>
            <span className="text-text-secondary text-xs">
              {form.published ? "Visible to all users" : "Hidden from users"}
            </span>
          </label>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-end gap-3 px-6 py-4
          border-t border-white/[0.06] flex-shrink-0"
        >
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary
              hover:text-white hover:bg-white/[0.05] text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent/80
              text-white font-semibold text-sm transition-all disabled:opacity-40
              hover:scale-[1.01] active:scale-95"
          >
            {loading ? (
              <>
                <Loader2 size={13} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Check size={13} /> {isEdit ? "Save Changes" : "Add Video"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete confirm modal ───────────────────────────────────────────
function DeleteModal({ video, onConfirm, onClose, loading }) {
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
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div
        className="relative w-full max-w-sm bg-bg-surface border border-white/[0.08]
        rounded-2xl shadow-2xl p-6 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/25
          flex items-center justify-center mx-auto mb-4"
        >
          <Trash2 size={20} className="text-red-400" />
        </div>
        <h3 className="text-white font-bold text-base mb-2">Delete Video?</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          <span className="text-white font-semibold">"{video.title}"</span> will
          be permanently deleted. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/[0.08] text-text-secondary
              hover:text-white hover:bg-white/[0.05] text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-red-500/80 hover:bg-red-500 text-white font-semibold text-sm
              transition-all disabled:opacity-40"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Trash2 size={13} />
            )}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────
export default function AdminVideosPage() {
  const { token } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [modal, setModal] = useState(null); // null | 'add' | video obj
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [delLoading, setDelLoading] = useState(false);
  const [toggling, setToggling] = useState(null);
  const PAGE_SIZE = 10;

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await videoApi.getAdminVideos(page, PAGE_SIZE, search);
      setVideos(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalItems(res.data.totalElements ?? 0);
    } catch {
      toast.error("Failed to load videos");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  const handleSave = async (payload) => {
    if (modal === "add") {
      await videoApi.createVideo(payload);
      toast.success("Video added successfully");
    } else {
      await videoApi.updateVideo(modal.id, payload);
      toast.success("Video updated");
    }
    setModal(null);
    fetchVideos();
  };

  const handleDelete = async () => {
    setDelLoading(true);
    try {
      await videoApi.deleteVideo(deleteTarget.id);
      toast.success("Video deleted");
      setDeleteTarget(null);
      fetchVideos();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDelLoading(false);
    }
  };

  const handleToggle = async (video) => {
    setToggling(video.id);
    try {
      await videoApi.togglePublish(video.id, !video.published);
      toast.success(video.published ? "Set to Draft" : "Published");
      setVideos((prev) =>
        prev.map((v) =>
          v.id === video.id ? { ...v, published: !v.published } : v,
        ),
      );
    } catch {
      toast.error("Failed to update publish status");
    } finally {
      setToggling(null);
    }
  };

  return (
    <AdminShell>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-7">
        <div className="flex-1">
          <h1 className="text-white font-black text-2xl tracking-tight mb-1">
            Videos
          </h1>
          <p className="text-text-secondary text-sm">
            {totalItems} {totalItems === 1 ? "video" : "videos"} in library
          </p>
        </div>
        <button
          onClick={() => setModal("add")}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent/80
            text-white font-semibold text-sm transition-all hover:scale-[1.02] active:scale-95"
        >
          <Plus size={16} /> Add Video
        </button>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────── */}
      <form onSubmit={handleSearch} className="relative mb-5">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2
          text-text-tertiary pointer-events-none"
        />
        <input
          type="text"
          placeholder="Search videos by title…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full sm:w-80 pl-9 pr-4 py-2.5 rounded-xl bg-bg-surface
            border border-white/[0.08] text-white placeholder:text-text-tertiary
            text-sm focus:outline-none focus:border-accent/40 transition-all"
        />
      </form>

      {/* ── Table ──────────────────────────────────────────────── */}
      <div className="bg-bg-surface rounded-2xl border border-white/[0.07] overflow-hidden">
        {/* Table header */}
        <div
          className="hidden sm:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center
          gap-4 px-5 py-3 border-b border-white/[0.06]"
        >
          <span className="text-text-secondary text-xs uppercase tracking-wider w-10">
            Poster
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider">
            Title
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-12">
            Year
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-16">
            Duration
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-24">
            Status
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-right w-24">
            Actions
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 animate-pulse"
              >
                <div className="w-10 h-14 rounded-lg bg-white/[0.04] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/[0.06] rounded-lg w-1/3" />
                  <div className="h-2.5 bg-white/[0.04] rounded-lg w-1/5" />
                </div>
                <div className="hidden sm:flex gap-2">
                  <div className="h-7 w-16 bg-white/[0.04] rounded-lg" />
                  <div className="h-7 w-7 bg-white/[0.04] rounded-lg" />
                  <div className="h-7 w-7 bg-white/[0.04] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl bg-bg-card border border-white/[0.06]
              flex items-center justify-center mb-4"
            >
              <Film size={24} className="text-text-faint" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">
              {search ? "No videos found" : "No videos yet"}
            </p>
            <p className="text-text-secondary text-xs">
              {search
                ? `No results for "${search}"`
                : 'Click "Add Video" to get started'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {videos.map((video) => {
              const poster = imageUrl(video.poster, token);
              return (
                <div
                  key={video.id}
                  className="grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto_auto_auto]
                    items-center gap-3 sm:gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Poster thumbnail */}
                  <div
                    className="hidden sm:block w-10 h-14 rounded-lg bg-bg-card
                    border border-white/[0.06] overflow-hidden flex-shrink-0"
                  >
                    {poster ? (
                      <img
                        src={poster}
                        alt={video.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Film size={14} className="text-text-faint" />
                      </div>
                    )}
                  </div>

                  {/* Title + meta */}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">
                      {video.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      {video.rating && (
                        <span
                          className="text-[10px] px-1.5 py-px rounded border
                          border-white/15 text-text-secondary"
                        >
                          {video.rating}
                        </span>
                      )}
                      {video.categories?.slice(0, 2).map((c) => (
                        <span
                          key={c}
                          className="text-[10px] px-2 py-px rounded-full
                          bg-accent/10 border border-accent/20 text-accent-light"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Year */}
                  <span className="hidden sm:block text-text-secondary text-xs text-center w-12 tabular-nums">
                    {video.year ?? "—"}
                  </span>

                  {/* Duration */}
                  <span className="hidden sm:block text-text-secondary text-xs text-center w-16 tabular-nums">
                    {video.duration ? `${video.duration}m` : "—"}
                  </span>

                  {/* Status toggle */}
                  <div className="hidden sm:flex justify-center w-24">
                    <button
                      onClick={() => handleToggle(video)}
                      disabled={toggling === video.id}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                        font-medium transition-all disabled:opacity-50 border ${
                          video.published
                            ? "bg-green-500/10 border-green-500/20 text-green-400 hover:bg-green-500/20"
                            : "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                        }`}
                    >
                      {toggling === video.id ? (
                        <Loader2 size={11} className="animate-spin" />
                      ) : video.published ? (
                        <Eye size={11} />
                      ) : (
                        <EyeOff size={11} />
                      )}
                      {video.published ? "Live" : "Draft"}
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end sm:w-24">
                    <button
                      onClick={() => setModal(video)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center
                        text-text-secondary hover:text-accent-light hover:bg-accent/10
                        border border-transparent hover:border-accent/20 transition-all"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(video)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center
                        text-text-secondary hover:text-red-400 hover:bg-red-500/[0.08]
                        border border-transparent hover:border-red-500/20 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Pagination ─────────────────────────────────────────── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between mt-5">
          <p className="text-text-secondary text-xs hidden sm:block">
            Page {page + 1} of {totalPages} · {totalItems} total
          </p>
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 0}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08]
                text-text-secondary hover:text-white hover:bg-white/[0.05] text-xs transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-xl text-xs font-medium transition-all ${
                  i === page
                    ? "bg-accent text-white"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/[0.08]
                text-text-secondary hover:text-white hover:bg-white/[0.05] text-xs transition-all
                disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ── Modals ─────────────────────────────────────────────── */}
      {(modal === "add" || (modal && modal !== "add")) && (
        <VideoFormModal
          initial={modal === "add" ? null : modal}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
      {deleteTarget && (
        <DeleteModal
          video={deleteTarget}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
          loading={delLoading}
        />
      )}
    </AdminShell>
  );
}
