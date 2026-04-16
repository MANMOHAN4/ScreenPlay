import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Film,
  Bookmark,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const NAV = [
  { label: "Browse", to: "/browse", icon: Film },
  { label: "Watchlist", to: "/watchlist", icon: Bookmark },
];

export default function UserShell({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const fn = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
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
    <div className="min-h-screen bg-bg-primary">
      {/* ── Navbar (always frosted — no hero beneath) ────────── */}
      <header
        className="fixed top-0 inset-x-0 z-50 h-16
        bg-bg-primary/95 backdrop-blur-md border-b border-white/[0.06] shadow-lg"
      >
        <div
          className="max-w-7xl mx-auto px-5 sm:px-8 h-full
          flex items-center justify-between gap-4"
        >
          {/* Logo */}
          <Link to="/browse" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 32 32" fill="none">
                <polygon points="8,6 8,26 28,16" fill="white" />
              </svg>
            </div>
            <span className="hidden sm:block text-white font-black text-lg tracking-tight">
              Screen<span className="text-accent-light">Play</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(({ label, to, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm
                    font-medium transition-all ${
                      active
                        ? "bg-accent/15 text-accent-light border border-accent/20"
                        : "text-text-secondary hover:text-white hover:bg-white/[0.05] border border-transparent"
                    }`}
                >
                  <Icon size={15} />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right: profile dropdown + mobile toggle */}
          <div className="flex items-center gap-2">
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((p) => !p)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-xl
                  border border-transparent hover:bg-white/[0.06] hover:border-white/[0.08]
                  transition-all"
              >
                <div
                  className="w-7 h-7 rounded-lg bg-accent/20 border border-accent/30
                  flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-accent-light font-bold text-xs">
                    {initials}
                  </span>
                </div>
                <span
                  className="hidden md:block text-white text-sm font-medium
                  max-w-[100px] truncate"
                >
                  {user?.fullName?.split(" ")[0]}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-text-secondary flex-shrink-0
                  transition-transform ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-bg-surface/95
                  backdrop-blur-md border border-white/[0.08] rounded-2xl shadow-2xl
                  overflow-hidden py-1.5 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-white/[0.06]">
                    <p className="text-white text-sm font-semibold truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-text-secondary text-xs truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm
                      text-text-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <User size={14} /> My Profile
                  </Link>
                  <Link
                    to="/watchlist"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm
                      text-text-secondary hover:text-white hover:bg-white/[0.04] transition-all"
                  >
                    <Bookmark size={14} /> My Watchlist
                  </Link>
                  <div className="border-t border-white/[0.06] mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm
                        text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="sm:hidden w-9 h-9 rounded-xl flex items-center justify-center
                text-text-secondary hover:text-white hover:bg-white/[0.06] transition-all"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div
            className="sm:hidden border-t border-white/[0.06] bg-bg-primary/98
            backdrop-blur-md px-4 py-2 flex flex-col gap-1"
          >
            {NAV.map(({ label, to, icon: Icon }) => {
              const active = location.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                    font-medium transition-all ${
                      active
                        ? "bg-accent/15 text-accent-light"
                        : "text-text-secondary hover:text-white hover:bg-white/[0.05]"
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              );
            })}
            <div className="border-t border-white/[0.06] mt-1 pt-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                  text-red-400 hover:text-red-300 hover:bg-red-500/[0.06] transition-all"
              >
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="pt-16">{children}</main>
    </div>
  );
}
