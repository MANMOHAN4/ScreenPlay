import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Film, Users, User, LogOut, Menu } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";

const NAV = [
  { path: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/admin/videos", icon: Film, label: "Videos" },
  { path: "/admin/users", icon: Users, label: "Users" },
  { path: "/admin/profile", icon: User, label: "Profile" },
];

function SidebarContent({ onNav }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const initials =
    user?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "A";
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex flex-col h-full py-5">
      <div className="px-5 mb-7">
        <Logo size="sm" />
      </div>
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={onNav}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${
                  active
                    ? "bg-accent/12 text-accent-light border border-accent/18"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.05]"
                }`}
            >
              <Icon size={16} className={active ? "text-accent-light" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-3 mt-4 pt-4 border-t border-white/[0.06] space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
            <span className="text-accent-light text-xs font-bold">
              {initials}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">
              {user?.fullName}
            </p>
            <p className="text-text-faint text-[10px]">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
            text-text-secondary hover:text-accent-light hover:bg-accent/[0.07] transition-all"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );
}

export default function AdminLayout({ children, title = "" }) {
  const [sideOpen, setSideOpen] = useState(false);

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:block w-56 flex-shrink-0 h-screen sticky top-0
        bg-bg-surface/60 backdrop-blur-md border-r border-white/[0.06]"
      >
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sideOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSideOpen(false)}
          />
          <aside className="relative w-56 h-full bg-bg-surface/95 backdrop-blur-xl border-r border-white/[0.07]">
            <SidebarContent onNav={() => setSideOpen(false)} />
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header
          className="sticky top-0 z-40 h-14 bg-bg-primary/75 backdrop-blur-xl
          border-b border-white/[0.06] shadow-nav px-5 flex items-center gap-4"
        >
          <button
            className="lg:hidden text-text-secondary hover:text-white transition-colors"
            onClick={() => setSideOpen(true)}
          >
            <Menu size={20} />
          </button>
          {title && (
            <h1 className="text-white font-semibold text-sm">{title}</h1>
          )}
        </header>
        <main className="flex-1 p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
