import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Trash2,
  ShieldCheck,
  ShieldOff,
  UserCheck,
  UserX,
  Users,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import AdminShell from "../../components/shared/AdminShell";
import { userApi } from "../../api/userApi";
import { useAuth } from "../../context/AuthContext";

// ── Confirm modal (generic) ─────────────────────────────────────
function ConfirmModal({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  message,
  confirmLabel,
  confirmStyle,
  onConfirm,
  onClose,
  loading,
}) {
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
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 border ${iconBg}`}
        >
          <Icon size={20} className={iconColor} />
        </div>
        <h3 className="text-white font-bold text-base mb-2">{title}</h3>
        <p className="text-text-secondary text-sm leading-relaxed mb-6">
          {message}
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
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
              text-white font-semibold text-sm transition-all disabled:opacity-40 ${confirmStyle}`}
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <Icon size={13} />
            )}
            {loading ? "Processing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Role badge ──────────────────────────────────────────────────
function RoleBadge({ role }) {
  return (
    <span
      className={`text-[10px] px-2.5 py-1 rounded-full font-semibold border ${
        role === "ADMIN"
          ? "bg-accent/15 border-accent/25 text-accent-light"
          : "bg-white/[0.05] border-white/[0.10] text-text-secondary"
      }`}
    >
      {role}
    </span>
  );
}

// ── Status dot ──────────────────────────────────────────────────
function StatusDot({ active }) {
  return (
    <span
      className={`flex items-center gap-1.5 text-xs font-medium ${
        active ? "text-green-400" : "text-red-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${active ? "bg-green-400" : "bg-red-400"}`}
      />
      {active ? "Active" : "Disabled"}
    </span>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [confirm, setConfirm] = useState(null); // { type, user }
  const [actionLoading, setActionLoading] = useState(false);
  const PAGE_SIZE = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userApi.getAllUsers(page, PAGE_SIZE, search);
      setUsers(res.data.content ?? []);
      setTotalPages(res.data.totalPages ?? 0);
      setTotalItems(res.data.totalElements ?? 0);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  };

  // ── Action handlers ─────────────────────────────────────────
  const executeAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const { type, user } = confirm;
      if (type === "delete") {
        await userApi.deleteUser(user.id);
        toast.success(`${user.fullName} deleted`);
      } else if (type === "toggle") {
        await userApi.toggleStatus(user.id);
        toast.success(
          user.active
            ? `${user.fullName} disabled`
            : `${user.fullName} enabled`,
        );
      } else if (type === "role") {
        const newRole = user.role === "ADMIN" ? "USER" : "ADMIN";
        await userApi.changeRole(user.id, newRole);
        toast.success(`Role changed to ${newRole}`);
      }
      setConfirm(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  };

  // ── Confirm modal config per type ───────────────────────────
  const CONFIRM_CONFIG = {
    delete: {
      icon: Trash2,
      iconBg: "bg-red-500/15 border-red-500/25",
      iconColor: "text-red-400",
      title: "Delete User",
      message: (u) => (
        <>
          Permanently delete{" "}
          <strong className="text-white">{u.fullName}</strong>? This action
          cannot be undone.
        </>
      ),
      confirmLabel: "Delete",
      confirmStyle: "bg-red-500/80 hover:bg-red-500",
    },
    toggle: {
      icon: (u) => (u?.active ? UserX : UserCheck),
      iconBg: (u) =>
        u?.active
          ? "bg-amber-500/15 border-amber-500/25"
          : "bg-green-500/15 border-green-500/25",
      iconColor: (u) => (u?.active ? "text-amber-400" : "text-green-400"),
      title: (u) => (u?.active ? "Disable User" : "Enable User"),
      message: (u) =>
        u?.active ? (
          <>
            Disable <strong className="text-white">{u?.fullName}</strong>? They
            will not be able to log in.
          </>
        ) : (
          <>
            Re-enable <strong className="text-white">{u?.fullName}</strong>?
            They will regain access.
          </>
        ),
      confirmLabel: (u) => (u?.active ? "Disable" : "Enable"),
      confirmStyle: (u) =>
        u?.active
          ? "bg-amber-500/80 hover:bg-amber-500"
          : "bg-green-500/80 hover:bg-green-500",
    },
    role: {
      icon: ShieldCheck,
      iconBg: "bg-accent/15 border-accent/25",
      iconColor: "text-accent-light",
      title: "Change Role",
      message: (u) => (
        <>
          Change <strong className="text-white">{u?.fullName}</strong>'s role
          from <strong className="text-white">{u?.role}</strong> to{" "}
          <strong className="text-white">
            {u?.role === "ADMIN" ? "USER" : "ADMIN"}
          </strong>
          ?
        </>
      ),
      confirmLabel: "Change Role",
      confirmStyle: "bg-accent hover:bg-accent/80",
    },
  };

  const getConfirmProps = (cfg, user) => ({
    icon: typeof cfg.icon === "function" ? cfg.icon(user) : cfg.icon,
    iconBg: typeof cfg.iconBg === "function" ? cfg.iconBg(user) : cfg.iconBg,
    iconColor:
      typeof cfg.iconColor === "function" ? cfg.iconColor(user) : cfg.iconColor,
    title: typeof cfg.title === "function" ? cfg.title(user) : cfg.title,
    message: cfg.message(user),
    confirmLabel:
      typeof cfg.confirmLabel === "function"
        ? cfg.confirmLabel(user)
        : cfg.confirmLabel,
    confirmStyle:
      typeof cfg.confirmStyle === "function"
        ? cfg.confirmStyle(user)
        : cfg.confirmStyle,
  });

  const fmtDate = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "—";

  return (
    <AdminShell>
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-7">
        <div className="flex-1">
          <h1 className="text-white font-black text-2xl tracking-tight mb-1">
            Users
          </h1>
          <p className="text-text-secondary text-sm">
            {totalItems} registered {totalItems === 1 ? "user" : "users"}
          </p>
        </div>
        <form onSubmit={handleSearch} className="relative">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2
            text-text-tertiary pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full sm:w-72 pl-9 pr-4 py-2.5 rounded-xl bg-bg-surface
              border border-white/[0.08] text-white placeholder:text-text-tertiary
              text-sm focus:outline-none focus:border-accent/40 transition-all"
          />
        </form>
      </div>

      {/* ── Table ───────────────────────────────────────────────── */}
      <div className="bg-bg-surface rounded-2xl border border-white/[0.07] overflow-hidden">
        {/* Column headers */}
        <div
          className="hidden md:grid
          grid-cols-[1fr_auto_auto_auto_auto]
          items-center gap-4 px-6 py-3 border-b border-white/[0.06]"
        >
          <span className="text-text-secondary text-xs uppercase tracking-wider">
            User
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-16">
            Role
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-20">
            Status
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-center w-28">
            Joined
          </span>
          <span className="text-text-secondary text-xs uppercase tracking-wider text-right w-28">
            Actions
          </span>
        </div>

        {loading ? (
          <div className="divide-y divide-white/[0.04]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-6 py-4 animate-pulse"
              >
                <div className="w-9 h-9 rounded-xl bg-white/[0.04] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 bg-white/[0.06] rounded-lg w-1/4" />
                  <div className="h-2.5 bg-white/[0.04] rounded-lg w-1/3" />
                </div>
                <div className="hidden md:flex gap-2">
                  <div className="h-7 w-14 bg-white/[0.04] rounded-full" />
                  <div className="h-7 w-16 bg-white/[0.04] rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl bg-bg-card border border-white/[0.06]
              flex items-center justify-center mb-4"
            >
              <Users size={24} className="text-text-faint" />
            </div>
            <p className="text-white font-semibold text-sm mb-1">
              {search ? "No users found" : "No users yet"}
            </p>
            <p className="text-text-secondary text-xs">
              {search
                ? `No results for "${search}"`
                : "Users will appear here after signing up"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.04]">
            {users.map((u) => {
              const initials = u.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase();
              const isMe = u.email === me?.email;
              return (
                <div
                  key={u.id}
                  className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto_auto]
                    items-center gap-3 md:gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Avatar + name/email */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                        u.role === "ADMIN"
                          ? "bg-accent/20 border-accent/30"
                          : "bg-white/[0.05] border-white/[0.10]"
                      }`}
                    >
                      <span
                        className={`font-bold text-xs ${
                          u.role === "ADMIN"
                            ? "text-accent-light"
                            : "text-text-secondary"
                        }`}
                      >
                        {initials}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white text-sm font-semibold truncate">
                          {u.fullName}
                        </p>
                        {isMe && (
                          <span
                            className="text-[9px] px-1.5 py-px rounded-full bg-accent/20
                            border border-accent/30 text-accent-light font-semibold flex-shrink-0"
                          >
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-text-secondary text-xs truncate">
                        {u.email}
                      </p>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="hidden md:flex justify-center w-16">
                    <RoleBadge role={u.role} />
                  </div>

                  {/* Status */}
                  <div className="hidden md:flex justify-center w-20">
                    <StatusDot active={u.active} />
                  </div>

                  {/* Joined */}
                  <div className="hidden md:block w-28 text-center">
                    <span className="text-text-secondary text-xs tabular-nums">
                      {fmtDate(u.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 justify-end md:w-28">
                    {/* Toggle status */}
                    <button
                      onClick={() => setConfirm({ type: "toggle", user: u })}
                      disabled={isMe}
                      title={u.active ? "Disable user" : "Enable user"}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center
                        border border-transparent transition-all disabled:opacity-30 disabled:cursor-not-allowed ${
                          u.active
                            ? "text-text-secondary hover:text-amber-400 hover:bg-amber-500/[0.08] hover:border-amber-500/20"
                            : "text-text-secondary hover:text-green-400 hover:bg-green-500/[0.08] hover:border-green-500/20"
                        }`}
                    >
                      {u.active ? <UserX size={14} /> : <UserCheck size={14} />}
                    </button>

                    {/* Toggle role */}
                    <button
                      onClick={() => setConfirm({ type: "role", user: u })}
                      disabled={isMe}
                      title={
                        u.role === "ADMIN"
                          ? "Demote to User"
                          : "Promote to Admin"
                      }
                      className="w-8 h-8 rounded-xl flex items-center justify-center
                        text-text-secondary hover:text-accent-light hover:bg-accent/10
                        border border-transparent hover:border-accent/20
                        transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {u.role === "ADMIN" ? (
                        <ShieldOff size={14} />
                      ) : (
                        <ShieldCheck size={14} />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setConfirm({ type: "delete", user: u })}
                      disabled={isMe}
                      title="Delete user"
                      className="w-8 h-8 rounded-xl flex items-center justify-center
                        text-text-secondary hover:text-red-400 hover:bg-red-500/[0.08]
                        border border-transparent hover:border-red-500/20
                        transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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

      {/* ── Pagination ──────────────────────────────────────────── */}
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

      {/* ── Confirm modal ───────────────────────────────────────── */}
      {confirm &&
        (() => {
          const cfg = CONFIRM_CONFIG[confirm.type];
          const props = getConfirmProps(cfg, confirm.user);
          return (
            <ConfirmModal
              {...props}
              onConfirm={executeAction}
              onClose={() => setConfirm(null)}
              loading={actionLoading}
            />
          );
        })()}
    </AdminShell>
  );
}
