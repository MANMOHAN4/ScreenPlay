import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-6">
      <div className="max-w-sm w-full text-center">
        <p
          className="text-8xl font-black text-white/5 mb-6 select-none"
          style={{ letterSpacing: "-0.05em" }}
        >
          404
        </p>
        <h2 className="text-white font-bold text-xl mb-2 -mt-12">
          Page not found
        </h2>
        <p className="text-text-secondary text-sm mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost">
            <ArrowLeft size={14} /> Go Back
          </button>
          <button onClick={() => navigate("/")} className="btn-primary">
            <Home size={14} /> Home
          </button>
        </div>
      </div>
    </div>
  );
}
