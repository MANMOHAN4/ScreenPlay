import { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, Check, X, ArrowLeft, Lock } from "lucide-react";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [show, setShow] = useState({ password: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const passwordMatch =
    form.password &&
    form.confirmPassword &&
    form.password === form.confirmPassword;
  const passwordMismatch =
    form.confirmPassword && form.password !== form.confirmPassword;
  const isValid = form.password.length >= 6 && passwordMatch;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid || !token) return;
    setLoading(true);
    setError("");
    try {
      await authApi.resetPassword(token, form.password);
      setDone(true);
      toast.success("Password reset successfully!");
      setTimeout(() => navigate("/login"), 2500);
    } catch {
      setError(
        "This reset link is invalid or has expired. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
            <X size={24} className="text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            Invalid Reset Link
          </h2>
          <p className="text-text-secondary text-sm mb-6">
            This link is missing required information.
          </p>
          <Link to="/forgot-password" className="btn-primary inline-flex">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="flex items-center justify-between px-8 md:px-16 py-5">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold tracking-tight"
        >
          Screen<span className="brand-gradient">PLAY</span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-bg-surface rounded-2xl border border-white/[0.06] p-8 md:p-10">
          {!done ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
                <Lock size={22} className="text-accent-light" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 tracking-heading">
                Reset Password
              </h1>
              <p className="text-text-secondary text-sm mb-8">
                Enter your new password below.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {/* New Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.password ? "text" : "password"}
                      value={form.password}
                      onChange={(e) =>
                        setForm({ ...form, password: e.target.value })
                      }
                      placeholder="Min. 6 characters"
                      className="w-full px-4 py-3 pr-11 rounded-xl bg-bg-card border border-white/10 text-white placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/60 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShow({ ...show, password: !show.password })
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                    >
                      {show.password ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {form.password.length > 0 && form.password.length < 6 && (
                    <p className="text-red-400 text-xs">
                      Password must be at least 6 characters
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-2">
                  <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={show.confirm ? "text" : "password"}
                      value={form.confirmPassword}
                      onChange={(e) =>
                        setForm({ ...form, confirmPassword: e.target.value })
                      }
                      placeholder="Repeat new password"
                      className={`w-full px-4 py-3 pr-11 rounded-xl bg-bg-card border text-white placeholder:text-text-tertiary text-sm focus:outline-none transition-all ${
                        passwordMismatch
                          ? "border-red-500/50"
                          : passwordMatch
                            ? "border-accent/60"
                            : "border-white/10 focus:border-accent/60"
                      }`}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                      {form.confirmPassword &&
                        (passwordMatch ? (
                          <Check size={14} className="text-accent-light" />
                        ) : (
                          <X size={14} className="text-red-400" />
                        ))}
                      <button
                        type="button"
                        onClick={() =>
                          setShow({ ...show, confirm: !show.confirm })
                        }
                        className="text-text-tertiary hover:text-text-secondary transition-colors ml-1"
                      >
                        {show.confirm ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  {passwordMismatch && (
                    <p className="text-red-400 text-xs">
                      Passwords do not match
                    </p>
                  )}
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-red-400 text-sm leading-relaxed">
                      {error}
                    </p>
                    <Link
                      to="/forgot-password"
                      className="text-accent-light text-sm mt-2 inline-block hover:text-accent transition-colors"
                    >
                      Request new reset link →
                    </Link>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!isValid || loading}
                  className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none mt-1"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <Check size={26} className="text-accent-light" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Password Reset!
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed">
                Your password has been updated successfully. Redirecting you to
                sign in...
              </p>
            </div>
          )}

          {!done && (
            <div className="mt-6 pt-6 border-t border-white/[0.06]">
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 text-text-secondary text-sm hover:text-white transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
