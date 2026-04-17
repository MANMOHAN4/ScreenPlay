import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";

// ── Public Pages ──────────────────────────────────────────────────
import LandingPage from "./pages/public/LandingPage";
import LoginPage from "./pages/public/LoginPage";
import SignupPage from "./pages/public/SignupPage";
import VerifyEmailPage from "./pages/public/VerifyEmailPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";
import ResendVerificationPage from "./pages/public/ResendVerificationPage";

// ── User Pages ────────────────────────────────────────────────────
import BrowsePage from "./pages/user/BrowsePage";
import WatchlistPage from "./pages/user/WatchlistPage";
import UserProfilePage from "./pages/user/UserProfilePage";

// ── Admin Pages ───────────────────────────────────────────────────
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminVideosPage from "./pages/admin/AdminVideosPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminProfilePage from "./pages/admin/AdminProfilePage";

// ─────────────────────────────────────────────────────────────────
// Auth Loader
// ─────────────────────────────────────────────────────────────────
function AuthLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-accent/20 border border-accent/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <polygon points="8,6 8,26 28,16" fill="#4f98a3" />
            </svg>
          </div>
          <div className="absolute -inset-1 rounded-[14px] border-2 border-transparent border-t-accent/50 animate-spin" />
        </div>
        <p className="text-text-secondary text-sm">Loading ScreenPlay...</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Route Guards
// ─────────────────────────────────────────────────────────────────
function RequireAuth({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoader />;
  if (!token)
    return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function RequireAdmin({ children }) {
  const { token, user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <AuthLoader />;
  if (!token)
    return <Navigate to="/login" state={{ from: location }} replace />;
  if (user?.role !== "ADMIN") return <Navigate to="/browse" replace />;
  return children;
}

// Guests only — logged-in users are redirected away
function RequireGuest({ children }) {
  const { token, user, loading } = useAuth();
  if (loading) return <AuthLoader />;
  if (token) {
    const dest = user?.role === "ADMIN" ? "/admin" : "/browse";
    return <Navigate to={dest} replace />;
  }
  return children;
}

// ─────────────────────────────────────────────────────────────────
// 404 Page
// ─────────────────────────────────────────────────────────────────
function NotFoundPage() {
  const { token, user } = useAuth();
  const homePath = token
    ? user?.role === "ADMIN"
      ? "/admin"
      : "/browse"
    : "/";

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
              <polygon points="8,6 8,26 28,16" fill="white" />
            </svg>
          </div>
          <span className="text-white font-black text-xl tracking-tight">
            ScreenPLAY
          </span>
        </div>
        <p className="text-accent-light font-black text-7xl mb-4 tabular-nums leading-none">
          404
        </p>
        <h1 className="text-white font-bold text-xl mb-3">Page not found</h1>
        <p className="text-text-secondary text-sm leading-relaxed mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a
          href={homePath}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent/80 text-white font-semibold text-sm transition-all hover:scale-[1.02]"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────
// Toaster Config
// ─────────────────────────────────────────────────────────────────
const toastConfig = {
  position: "top-right",
  toastOptions: {
    duration: 3000,
    style: {
      background: "#1c1b19",
      color: "#cdccca",
      border: "1px solid rgba(255,255,255,0.08)",
      borderRadius: "12px",
      fontSize: "13px",
      fontFamily: "inherit",
      padding: "10px 14px",
      boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
      maxWidth: "360px",
    },
    success: {
      duration: 2500,
      iconTheme: { primary: "#4f98a3", secondary: "#1c1b19" },
    },
    error: {
      duration: 4000,
      iconTheme: { primary: "#d163a7", secondary: "#1c1b19" },
    },
    loading: {
      iconTheme: { primary: "#4f98a3", secondary: "#1c1b19" },
    },
  },
};

// ─────────────────────────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────────────────────────
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public: guests only (logged-in users redirected away) ── */}
      <Route
        path="/"
        element={
          <RequireGuest>
            <LandingPage />
          </RequireGuest>
        }
      />
      <Route
        path="/login"
        element={
          <RequireGuest>
            <LoginPage />
          </RequireGuest>
        }
      />
      <Route
        path="/signup"
        element={
          <RequireGuest>
            <SignupPage />
          </RequireGuest>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RequireGuest>
            <ForgotPasswordPage />
          </RequireGuest>
        }
      />

      {/* ── Public: open to everyone (token links from email) ──────
           These must NOT be wrapped in RequireGuest — a logged-in
           user could also click a verify/reset link from their email. */}
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/resend-verification" element={<ResendVerificationPage />} />

      {/* ── User ───────────────────────────────────────────────── */}
      <Route
        path="/browse"
        element={
          <RequireAuth>
            <BrowsePage />
          </RequireAuth>
        }
      />
      <Route
        path="/watchlist"
        element={
          <RequireAuth>
            <WatchlistPage />
          </RequireAuth>
        }
      />
      <Route
        path="/profile"
        element={
          <RequireAuth>
            <UserProfilePage />
          </RequireAuth>
        }
      />

      {/* ── Admin ──────────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminDashboardPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/videos"
        element={
          <RequireAdmin>
            <AdminVideosPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/users"
        element={
          <RequireAdmin>
            <AdminUsersPage />
          </RequireAdmin>
        }
      />
      <Route
        path="/admin/profile"
        element={
          <RequireAdmin>
            <AdminProfilePage />
          </RequireAdmin>
        }
      />

      {/* ── Fallbacks ──────────────────────────────────────────── */}
      <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// ─────────────────────────────────────────────────────────────────
// Root
// ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster {...toastConfig} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
