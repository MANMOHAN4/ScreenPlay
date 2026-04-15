import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { authApi } from "../../api/authApi";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
      toast.success("Reset link sent to your email!");
    } catch (err) {
      const msg = err.response?.data?.message || "";
      if (
        msg.toLowerCase().includes("not found") ||
        err.response?.status === 404
      ) {
        setError("No account found with this email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
          {!sent ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-accent/15 flex items-center justify-center mb-6">
                <Mail size={22} className="text-accent-light" />
              </div>

              <h1 className="text-2xl font-bold text-white mb-2 tracking-heading">
                Forgot Password?
              </h1>
              <p className="text-text-secondary text-sm mb-8 leading-relaxed">
                Enter your registered email and we will send you a link to reset
                your password.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-text-secondary text-xs font-medium uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="you@example.com"
                    autoFocus
                    className="w-full px-4 py-3 rounded-xl bg-bg-card border border-white/10 text-white placeholder:text-text-tertiary text-sm focus:outline-none focus:border-accent/60 transition-all"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email.trim() || loading}
                  className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none mt-1"
                >
                  {loading && <Loader2 size={15} className="animate-spin" />}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <Mail size={26} className="text-accent-light" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Check your inbox
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                We sent a password reset link to{" "}
                <span className="text-white font-medium">{email}</span>. The
                link expires in 15 minutes.
              </p>
              <p className="text-text-tertiary text-xs mb-6">
                Did not receive it? Check your spam folder or
                <button
                  onClick={() => setSent(false)}
                  className="text-accent-light hover:text-accent ml-1 transition-colors"
                >
                  try again
                </button>
              </p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-white/[0.06]">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-text-secondary text-sm hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
