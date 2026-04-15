import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authApi } from "../../api/authApi";
import { useAuth } from "../../context/AuthContext";
import Logo from "../../components/shared/Logo";
import Spinner from "../../components/shared/Spinner";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await authApi.login(form.email, form.password);
      const { token, id, fullName, email, role } = res.data;
      login(token, { id, fullName, email, role });
      const dest = from || (role === "ADMIN" ? "/admin" : "/browse");
      navigate(dest, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message;
      if (err.response?.status === 403)
        setError("Please verify your email before signing in.");
      else if (err.response?.status === 401)
        setError("Invalid email or password.");
      else setError(msg || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-5">
      {/* Subtle background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96
        bg-accent/5 rounded-full blur-3xl pointer-events-none"
      />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7">
          <h1 className="text-white font-black text-xl mb-1">Welcome back</h1>
          <p className="text-text-secondary text-sm mb-7">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@example.com"
                autoFocus
                className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09]
                  text-white placeholder-text-faint text-sm
                  focus:outline-none focus:border-accent/45 focus:shadow-input transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-accent-light text-xs hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Your password"
                  className="w-full px-4 py-3 pr-11 rounded-xl bg-white/[0.05] border border-white/[0.09]
                    text-white placeholder-text-faint text-sm
                    focus:outline-none focus:border-accent/45 focus:shadow-input transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-faint hover:text-white transition-colors"
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
                <p className="text-accent-light text-sm">{error}</p>
                {error.includes("verify") && (
                  <Link
                    to="/resend-verification"
                    className="text-accent-light text-xs underline mt-1 block"
                  >
                    Resend verification email
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl mt-2
                bg-accent hover:bg-accent-hover text-white font-bold text-sm
                shadow-glow transition-all hover:scale-[1.01] active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <>
                  <Spinner size={15} /> Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-accent-light hover:text-white font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
