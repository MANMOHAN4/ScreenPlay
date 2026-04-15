import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, Check, X } from "lucide-react";
import { authApi } from "../../api/authApi";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [status, setStatus] = useState("loading"); // loading | success | error

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }
    authApi
      .verifyEmail(token)
      .then(() => {
        setStatus("success");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <nav className="px-8 md:px-16 py-5">
        <button
          onClick={() => navigate("/")}
          className="text-xl font-bold tracking-tight"
        >
          Screen<span className="brand-gradient">PLAY</span>
        </button>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-bg-surface rounded-2xl border border-white/[0.06] p-10 text-center">
          {status === "loading" && (
            <>
              <Loader2
                size={40}
                className="text-accent animate-spin mx-auto mb-5"
              />
              <h2 className="text-xl font-bold text-white mb-2">
                Verifying your email...
              </h2>
              <p className="text-text-secondary text-sm">
                Please wait a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-5">
                <Check size={30} className="text-accent-light" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Email Verified!
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-2">
                Your account is now active. Redirecting to sign in...
              </p>
              <div className="w-full bg-bg-card rounded-full h-1 mt-4 overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full animate-[progress_3s_linear_forwards]"
                  style={{
                    animation: "width 3s linear forwards",
                    width: "100%",
                  }}
                />
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-5">
                <X size={30} className="text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-3">
                Verification Failed
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-6">
                This link is invalid or has already expired. Please request a
                new verification email.
              </p>
              <Link
                to="/resend-verification"
                className="btn-primary inline-flex mx-auto"
              >
                Resend Verification Email
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
