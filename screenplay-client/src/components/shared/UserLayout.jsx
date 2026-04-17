import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bookmark, ChevronDown, User, LogOut, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Logo from "./Logo";

export default function UserLayout({ children, onSearch, searchValue = "" }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const h = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target))
        setDropOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const initials =
    user?.fullName
      ?.split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Navbar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 h-14
        bg-bg-primary/75 backdrop-blur-xl border-b border-white/[0.06] shadow-nav"
      >
        <div className="max-w-7xl mx-auto px-5 h-full flex items-center gap-4">
          <Link to="/browse" className="flex-shrink-0">
            <Logo size="sm" />
          </Link>

          {/* Search */}
          {onSearch !== undefined && (
            <div className="flex-1 max-w-sm relative">
              <Search
                size={13}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-faint pointer-events-none"
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => onSearch(e.target.value)}
                placeholder="Search titles..."
                className="w-full pl-9 pr-8 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08]
                  text-white placeholder-text-faint text-sm
                  focus:outline-none focus:border-accent/40 focus:bg-white/[0.07] transition-all"
              />
              {searchValue && (
                <button
                  onClick={() => onSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-faint hover:text-white"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          <div className="ml-auto flex items-center gap-1">
            {/* Watchlist */}
            <Link
              to="/watchlist"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${
                  location.pathname === "/watchlist"
                    ? "text-accent-light bg-accent/10 border border-accent/20"
                    : "text-text-secondary hover:text-white hover:bg-white/[0.05]"
                }`}
            >
              <Bookmark size={15} />
              <span className="hidden sm:inline">Watchlist</span>
            </Link>

            {/* Profile dropdown */}
            <div className="relative" ref={dropRef}>
              <button
                onClick={() => setDropOpen((p) => !p)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all"
              >
                <div className="w-7 h-7 rounded-lg bg-accent/15 border border-accent/25 flex items-center justify-center">
                  <span className="text-accent-light text-xs font-bold">
                    {initials}
                  </span>
                </div>
                <span className="hidden sm:block text-white text-xs font-medium max-w-[90px] truncate">
                  {user?.fullName?.split(" ")[0]}
                </span>
                <ChevronDown
                  size={12}
                  className={`text-text-tertiary transition-transform ${dropOpen ? "rotate-180" : ""}`}
                />
              </button>

              {dropOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48
                  bg-bg-card/95 backdrop-blur-xl border border-white/[0.09] rounded-xl shadow-card
                  overflow-hidden animate-fade-in z-50"
                >
                  <div className="px-3 py-2.5 border-b border-white/[0.06]">
                    <p className="text-white text-xs font-semibold truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-text-faint text-[11px] truncate">
                      {user?.email}
                    </p>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2.5 text-text-secondary
                      hover:text-white hover:bg-white/[0.05] text-sm transition-all"
                  >
                    <User size={14} /> Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5
                      text-text-secondary hover:text-accent-light hover:bg-accent/[0.07] text-sm transition-all"
                  >
                    <LogOut size={14} /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="pt-14">{children}</main>
    </div>
  );
}
