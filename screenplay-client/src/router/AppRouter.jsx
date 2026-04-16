import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Auth pages
import LandingPage from "../pages/auth/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import VerifyEmailPage from "../pages/auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import ResendVerificationPage from "../pages/auth/ResendVerificationPage";

// User pages
import BrowsePage from "../pages/user/BrowsePage";
import WatchlistPage from "../pages/user/WatchlistPage";
import UserProfilePage from "../pages/user/UserProfilePage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminVideosPage from "../pages/admin/AdminVideosPage";
import AdminUsersPage from "../pages/admin/AdminUsersPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";

// Route guards
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <AppLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/browse" replace />;
  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin" : "/browse"} replace />;
  }
  return children;
}

function AppLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-accent-mid border-t-transparent rounded-full animate-spin" />
        <p className="text-text-secondary text-sm">Loading ScreenPLAY...</p>
      </div>
    </div>
  );
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <LandingPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicOnlyRoute>
              <SignupPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPasswordPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/resend-verification"
          element={<ResendVerificationPage />}
        />

        {/* User protected routes */}
        <Route
          path="/browse"
          element={
            <ProtectedRoute>
              <BrowsePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <ProtectedRoute>
              <WatchlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin protected routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/videos"
          element={
            <AdminRoute>
              <AdminVideosPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsersPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/profile"
          element={
            <AdminRoute>
              <AdminProfilePage />
            </AdminRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
