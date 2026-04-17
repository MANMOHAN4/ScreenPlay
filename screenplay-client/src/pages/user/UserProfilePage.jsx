import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import UserShell from "../../components/shared/UserShell";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";

// ── Input component ───────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls = `w-full px-4 py-3 rounded-xl bg-bg-card border border-white/[0.08] text-white
  placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/50 transition-all`;

export default function UserProfilePage() {
  const { user } = useAuth();

  // Change password state
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [showPw, setShowPw] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  const handlePwChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirm) {
      setPwError("Passwords do not match");
      return;
    }
    setPwLoading(true);
    try {
      await authApi.changePassword(pwForm.currentPassword, pwForm.newPassword);
      setPwSuccess(true);
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password updated");
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err.response?.data?.message || "Failed to update password");
    } finally {
      setPwLoading(false);
    }
  };

  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U";

  return (
    <UserShell>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* ── Page title ──────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-white font-black text-2xl tracking-tight mb-1">
            My Profile
          </h1>
          <p className="text-text-secondary text-sm">
            View your account details and change your password.
          </p>
        </div>

        {/* ── Profile card ────────────────────────────────────── */}
        <div className="bg-bg-surface border border-white/[0.07] rounded-2xl overflow-hidden mb-6">
          {/* Avatar banner */}
          <div className="relative h-24 bg-gradient-to-br from-accent/20 via-accent/5 to-transparent">
            <div className="absolute bottom-0 left-6 translate-y-1/2">
              <div className="w-16 h-16 rounded-2xl bg-accent/25 border-4 border-bg-surface flex items-center justify-center">
                <span className="text-accent-light font-black text-xl">
                  {initials}
                </span>
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="px-6 pt-12 pb-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h2 className="text-white font-bold text-lg leading-tight">
                  {user?.fullName}
                </h2>
                <p className="text-text-secondary text-sm">{user?.email}</p>
              </div>
              <span
                className={`text-xs px-3 py-1 rounded-full font-semibold flex-shrink-0 ${
                  user?.role === "ADMIN"
                    ? "bg-accent/15 border border-accent/25 text-accent-light"
                    : "bg-white/[0.06] border border-white/[0.10] text-text-secondary"
                }`}
              >
                {user?.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Mail, label: "Email", value: user?.email },
                { icon: Shield, label: "Role", value: user?.role },
                { icon: Calendar, label: "Joined", value: joinedDate || "—" },
              ].map(({ icon: Icon, label, value }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 p-3 rounded-xl bg-bg-card border border-white/[0.05]"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/15 flex items-center justify-center flex-shrink-0">
                    <Icon size={14} className="text-accent-light" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-text-secondary text-[10px] uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-white text-xs font-medium truncate">
                      {value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Change password ──────────────────────────────────── */}
        <div className="bg-bg-surface border border-white/[0.07] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center">
              <Lock size={15} className="text-text-secondary" />
            </div>
            <div>
              <h3 className="text-white font-bold text-base">
                Change Password
              </h3>
              <p className="text-text-secondary text-xs">
                Keep your account secure
              </p>
            </div>
          </div>

          <form onSubmit={handlePwChange} className="flex flex-col gap-4">
            {/* Current password */}
            <Field label="Current Password">
              <div className="relative">
                <input
                  type={showPw.current ? "text" : "password"}
                  value={pwForm.currentPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({
                      ...p,
                      currentPassword: e.target.value,
                    }))
                  }
                  placeholder="Your current password"
                  className={`${inputCls} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((p) => ({ ...p, current: !p.current }))
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors"
                >
                  {showPw.current ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {/* New password */}
            <Field label="New Password">
              <div className="relative">
                <input
                  type={showPw.next ? "text" : "password"}
                  value={pwForm.newPassword}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  placeholder="Min. 6 characters"
                  className={`${inputCls} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => ({ ...p, next: !p.next }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors"
                >
                  {showPw.next ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {/* Confirm password */}
            <Field label="Confirm New Password">
              <div className="relative">
                <input
                  type={showPw.confirm ? "text" : "password"}
                  value={pwForm.confirm}
                  onChange={(e) =>
                    setPwForm((p) => ({ ...p, confirm: e.target.value }))
                  }
                  placeholder="Repeat new password"
                  className={`${inputCls} pr-11`}
                  required
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPw((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-white transition-colors"
                >
                  {showPw.confirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </Field>

            {/* Error */}
            {pwError && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 text-sm">{pwError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={pwLoading || pwSuccess}
              className="flex items-center justify-center gap-2 py-3 rounded-xl bg-accent hover:bg-accent/80 text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-95"
            >
              {pwLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Updating…
                </>
              ) : pwSuccess ? (
                <>
                  <Check size={14} /> Password Updated
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </UserShell>
  );
}
