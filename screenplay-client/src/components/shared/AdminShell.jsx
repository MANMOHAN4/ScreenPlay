import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Film,
  Users,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { label: "Dashboard", to: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Videos", to: "/admin/videos", icon: Film },
  { label: "Users", to: "/admin/users", icon: Users },
  { label: "Profile", to: "/admin/profile", icon: UserCircle },
];

export default function AdminShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    : "A";

  const isActive = (item) =>
    item.exact
      ? location.pathname === item.to
      : location.pathname.startsWith(item.to);

  const SidebarInner = ({ onClose }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={`flex items-center h-16 px-4 border-b border-white/[0.06] flex-shrink-0 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        {!collapsed && (
          <Link
            to="/admin"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
              <svg width="11" height="11" viewBox="0 0 32 32" fill="none">
                <polygon points="8,6 8,26 28,16" fill="white" />
              </svg>
            </div>
            <span className="text-white font-black text-base tracking-tight">
              Screen<span className="text-accent-light">Play</span>
            </span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center">
            <svg width="11" height="11" viewBox="0 0 32 32" fill="none">
              <polygon points="8,6 8,26 28,16" fill="white" />
            </svg>
          </div>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="hidden lg:flex w-6 h-6 rounded-md items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.06] transition-all flex-shrink-0"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="px-4 py-2.5 border-b border-white/[0.06]">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-light/70 px-2 py-1 rounded-md bg-accent/10 border border-accent/15">
            Admin Panel
          </span>
        </div>
      )}

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {NAV.map(({ label, to, icon: Icon, exact }) => {
          const active = exact
            ? location.pathname === to
            : location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                collapsed ? "justify-center" : ""
              } ${
                active
                  ? "bg-accent/15 text-accent-light border border-accent/20"
                  : "text-text-secondary hover:text-white hover:bg-white/[0.05] border border-transparent"
              }`}
            >
              <Icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{label}</span>
                  {active && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-light flex-shrink-0" />
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 border-t border-white/[0.06] flex-shrink-0 flex flex-col gap-1">
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03]">
            <div className="w-6 h-6 rounded-md bg-accent/20 border border-accent/30 flex items-center justify-center flex-shrink-0">
              <span className="text-accent-light font-bold text-[10px]">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">
                {user?.fullName}
              </p>
              <p className="text-text-secondary text-[10px]">Administrator</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          title={collapsed ? "Sign Out" : undefined}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all ${collapsed ? "justify-center" : ""}`}
        >
          <LogOut size={15} className="flex-shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* ── Desktop sidebar ──────────────────────────────────────── */}
      <aside
        className={`hidden lg:block fixed top-0 left-0 h-full bg-bg-surface border-r border-white/[0.06] z-40 transition-all duration-300 ${collapsed ? "w-[68px]" : "w-60"}`}
      >
        <SidebarInner onClose={() => {}} />
      </aside>

      {/* ── Mobile overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-60 bg-bg-surface border-r border-white/[0.06] z-10">
            <SidebarInner onClose={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────── */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${collapsed ? "lg:ml-[68px]" : "lg:ml-60"}`}
      >
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 h-14 px-4 bg-bg-surface/80 backdrop-blur-sm border-b border-white/[0.06] sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-text-secondary hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <Menu size={18} />
          </button>
          <span className="text-white font-black text-sm tracking-tight">
            Screen<span className="text-accent-light">Play</span>
            <span className="text-text-secondary font-normal ml-1.5 text-xs">
              Admin
            </span>
          </span>
        </div>

        <main className="flex-1 p-5 sm:p-7">{children}</main>
      </div>
    </div>
  );
}
