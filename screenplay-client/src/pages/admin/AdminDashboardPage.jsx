import { useState, useEffect } from "react";
import {
  Film,
  Eye,
  EyeOff,
  Clock,
  Users,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AdminShell from "../../components/shared/AdminShell";
import { videoApi } from "../../api/videoApi";
import { userApi } from "../../api/userApi";
import { imageUrl } from "../../api/fileApi";
import { useAuth } from "../../context/AuthContext";

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = "text-accent-light",
  bg = "bg-accent/10 border-accent/20",
  loading,
}) {
  return (
    <div className="bg-bg-surface rounded-2xl border border-white/[0.07] p-5 flex items-center gap-4">
      <div
        className={`w-11 h-11 rounded-xl border flex items-center justify-center flex-shrink-0 ${bg}`}
      >
        <Icon size={20} className={color} />
      </div>
      <div className="min-w-0">
        <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
          {label}
        </p>
        {loading ? (
          <div className="h-6 w-16 bg-white/[0.06] rounded-lg animate-pulse" />
        ) : (
          <p className="text-white font-black text-2xl tabular-nums leading-none">
            {value}
          </p>
        )}
        {sub && !loading && (
          <p className="text-text-secondary text-xs mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { token } = useAuth();
  console.log("Admin token:", token); // should NOT be null

  const [stats, setStats] = useState(null);
  const [recentVideos, setRecentVideos] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingVids, setLoadingVids] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    videoApi
      .getAdminStats()
      .then((r) => setStats(r.data))
      .catch(() => toast.error("Failed to load stats"))
      .finally(() => setLoadingStats(false));

    videoApi
      .getAdminVideos(0, 5)
      .then((r) => setRecentVideos(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoadingVids(false));

    userApi
      .getAllUsers(0, 5)
      .then((r) => setRecentUsers(r.data.content ?? []))
      .catch(() => {})
      .finally(() => setLoadingUsers(false));
  }, []);

  const fmtDuration = (mins) => {
    if (!mins) return "—";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const unpublished = stats ? stats.totalVideos - stats.publishedVideos : 0;

  return (
    <AdminShell>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-white font-black text-2xl tracking-tight mb-1">
          Dashboard
        </h1>
        <p className="text-text-secondary text-sm">
          Welcome back! Here's an overview of your platform.
        </p>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Film}
          label="Total Videos"
          loading={loadingStats}
          value={stats?.totalVideos ?? 0}
        />
        <StatCard
          icon={Eye}
          label="Published"
          loading={loadingStats}
          value={stats?.publishedVideos ?? 0}
          color="text-green-400"
          bg="bg-green-500/10 border-green-500/20"
        />
        <StatCard
          icon={EyeOff}
          label="Unpublished"
          loading={loadingStats}
          value={unpublished}
          color="text-amber-400"
          bg="bg-amber-500/10 border-amber-500/20"
        />
        <StatCard
          icon={Clock}
          label="Total Duration"
          loading={loadingStats}
          value={fmtDuration(stats?.totalDuration)}
          color="text-purple-400"
          bg="bg-purple-500/10 border-purple-500/20"
        />
      </div>

      {/* ── Recent content ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Videos */}
        <div className="bg-bg-surface rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Film size={16} className="text-accent-light" />
              <h2 className="text-white font-bold text-sm">Recent Videos</h2>
            </div>
            <Link
              to="/admin/videos"
              className="flex items-center gap-1 text-accent-light hover:text-white text-xs transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loadingVids ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 animate-pulse"
                >
                  <div className="w-9 h-12 rounded-lg bg-white/[0.04] flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/[0.06] rounded w-2/3" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
                  </div>
                </div>
              ))
            ) : recentVideos.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">
                No videos yet
              </p>
            ) : (
              recentVideos.map((v) => {
                const poster = imageUrl(v.poster, token);
                return (
                  <div
                    key={v.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-9 h-12 rounded-lg bg-bg-card border border-white/[0.06] flex-shrink-0 overflow-hidden">
                      {poster ? (
                        <img
                          src={poster}
                          alt={v.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={14} className="text-text-faint" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {v.title}
                      </p>
                      <p className="text-text-secondary text-[10px]">
                        {v.year} · {v.duration}m
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                        v.published
                          ? "bg-green-500/15 text-green-400 border border-green-500/20"
                          : "bg-amber-500/15 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {v.published ? "Published" : "Draft"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-bg-surface rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <Users size={16} className="text-accent-light" />
              <h2 className="text-white font-bold text-sm">Recent Users</h2>
            </div>
            <Link
              to="/admin/users"
              className="flex items-center gap-1 text-accent-light hover:text-white text-xs transition-colors"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {loadingUsers ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 px-5 py-3 animate-pulse"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-white/[0.06] rounded w-1/2" />
                    <div className="h-2.5 bg-white/[0.04] rounded w-2/3" />
                  </div>
                </div>
              ))
            ) : recentUsers.length === 0 ? (
              <p className="text-text-secondary text-sm text-center py-8">
                No users yet
              </p>
            ) : (
              recentUsers.map((u) => {
                const initials = u.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                return (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 px-5 py-3 hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-accent-light font-bold text-xs">
                        {initials}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-medium truncate">
                        {u.fullName}
                      </p>
                      <p className="text-text-secondary text-[10px] truncate">
                        {u.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          u.role === "ADMIN"
                            ? "bg-accent/15 text-accent-light border border-accent/20"
                            : "bg-white/[0.05] text-text-secondary border border-white/[0.08]"
                        }`}
                      >
                        {u.role}
                      </span>
                      <span
                        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${u.active ? "bg-green-400" : "bg-red-400"}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
