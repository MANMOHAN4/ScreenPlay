import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Mail } from "lucide-react";
import { authApi } from "../../api/authApi";
import Logo from "../../components/shared/Logo";
import Spinner from "../../components/shared/Spinner";

export default function SignupPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [sentTo, setSentTo] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.password) {
      setError("All fields are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await authApi.register(form);
      setSentTo(form.email);
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent)
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-5">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative w-full max-w-sm text-center animate-fade-up">
          <div
            className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20
          flex items-center justify-center mx-auto mb-6"
          >
            <Mail size={26} className="text-accent-light" />
          </div>
          <h1 className="text-white font-black text-2xl mb-2">
            Check your inbox
          </h1>
          <p className="text-text-secondary text-sm leading-relaxed mb-1">
            We sent a verification link to
          </p>
          <p className="text-accent-light font-semibold text-sm mb-6">
            {sentTo}
          </p>
          <p className="text-text-tertiary text-xs leading-relaxed mb-8">
            Click the link in the email to activate your account. If you don't
            see it, check your spam folder.
          </p>
          <div className="space-y-3">
            <Link
              to="/resend-verification"
              className="block w-full py-2.5 rounded-xl border border-white/[0.09]
              text-text-secondary hover:text-white hover:border-white/[0.18] text-sm text-center transition-all"
            >
              Resend email
            </Link>
            <Link
              to="/login"
              className="block w-full py-2.5 rounded-xl bg-accent hover:bg-accent-hover
              text-white text-sm font-semibold text-center shadow-glow transition-all"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-5">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>

        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-7">
          <h1 className="text-white font-black text-xl mb-1">Create account</h1>
          <p className="text-text-secondary text-sm mb-7">
            Start streaming today
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              {
                key: "fullName",
                label: "Full Name",
                type: "text",
                placeholder: "John Doe",
              },
              {
                key: "email",
                label: "Email",
                type: "email",
                placeholder: "you@example.com",
              },
            ].map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key]}
                  onChange={set(key)}
                  placeholder={placeholder}
                  className="w-full px-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.09]
                    text-white placeholder-text-faint text-sm
                    focus:outline-none focus:border-accent/45 focus:shadow-input transition-all"
                />
              </div>
            ))}

            <div className="space-y-1.5">
              <label className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="Min. 6 characters"
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

            {error && (
              <div className="rounded-xl bg-accent/10 border border-accent/20 px-4 py-3">
                <p className="text-accent-light text-sm">{error}</p>
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
                  <Spinner size={15} /> Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-text-secondary text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-accent-light hover:text-white font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
