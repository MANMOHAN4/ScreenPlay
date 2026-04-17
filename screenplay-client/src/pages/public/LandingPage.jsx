import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Zap,
  Monitor,
  Smartphone,
  Tv,
  Check,
  ArrowRight,
  Clock,
  TrendingUp,
  Film,
  Users,
  Globe,
} from "lucide-react";
import Logo from "../../components/shared/Logo";

const SLIDES = [
  {
    id: 1,
    title: "Interstellar",
    year: 2014,
    rating: "PG-13",
    score: "8.7",
    duration: "2h 49m",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    desc: "A team of explorers travel through a wormhole in space to ensure humanity's survival.",
    bg: "https://picsum.photos/seed/cosmos-nebula/1920/1080",
  },
  {
    id: 2,
    title: "The Dark Knight",
    year: 2008,
    rating: "PG-13",
    score: "9.0",
    duration: "2h 32m",
    genres: ["Action", "Crime", "Drama"],
    desc: "When the Joker wreaks chaos on Gotham, Batman faces his greatest psychological test.",
    bg: "https://picsum.photos/seed/city-dark-night/1920/1080",
  },
  {
    id: 3,
    title: "Dune: Part Two",
    year: 2024,
    rating: "PG-13",
    score: "8.5",
    duration: "2h 46m",
    genres: ["Sci-Fi", "Epic", "Action"],
    desc: "Paul Atreides unites with the Fremen on a warpath of revenge against the conspirators.",
    bg: "https://picsum.photos/seed/desert-sand-dune/1920/1080",
  },
  {
    id: 4,
    title: "Oppenheimer",
    year: 2023,
    rating: "R",
    score: "8.9",
    duration: "3h 0m",
    genres: ["Biography", "Drama", "History"],
    desc: "The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.",
    bg: "https://picsum.photos/seed/fire-explosion-light/1920/1080",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Instant HD Streaming",
    desc: "Adaptive bitrate for the sharpest picture your connection supports.",
  },
  {
    icon: Shield,
    title: "Secure Accounts",
    desc: "JWT-protected sessions with email verification and role-based access.",
  },
  {
    icon: Monitor,
    title: "Any Device",
    desc: "Watch on your TV, laptop, tablet, or phone. Your watchlist syncs everywhere.",
  },
  {
    icon: Film,
    title: "Curated Library",
    desc: "Hand-picked titles across every genre, updated regularly.",
  },
];

const STATS = [
  { value: "500+", label: "Titles", icon: Film },
  { value: "50K+", label: "Viewers", icon: Users },
  { value: "4K", label: "Ultra HD", icon: Monitor },
  { value: "24/7", label: "Always On", icon: Globe },
];

function Navbar({ scrolled }) {
  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 h-14 transition-all duration-500
      ${scrolled ? "bg-bg-primary/90 backdrop-blur-xl border-b border-white/[0.06] shadow-nav" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-5 h-full flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2">
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl text-text-secondary hover:text-white text-sm font-medium transition-all"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm
              font-semibold shadow-glow transition-all hover:scale-[1.02] active:scale-95"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState(null);
  const [anim, setAnim] = useState(false);
  const [paused, setPaused] = useState(false);
  const timer = useRef(null);

  const go = useCallback(
    (idx) => {
      if (anim) return;
      setPrev(active);
      setActive(idx);
      setAnim(true);
      setTimeout(() => {
        setPrev(null);
        setAnim(false);
      }, 650);
    },
    [anim, active],
  );

  const next = useCallback(
    () => go((active + 1) % SLIDES.length),
    [active, go],
  );
  const back = useCallback(
    () => go((active - 1 + SLIDES.length) % SLIDES.length),
    [active, go],
  );

  useEffect(() => {
    if (paused) return;
    timer.current = setTimeout(next, 6000);
    return () => clearTimeout(timer.current);
  }, [active, paused, next]);

  const s = SLIDES[active];

  return (
    <div
      className="relative w-full h-screen min-h-[600px] overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background */}
      <div
        key={active}
        className="absolute inset-0"
        style={{ animation: "slideIn .65s cubic-bezier(.16,1,.3,1) both" }}
      >
        <img
          src={s.bg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40" />
        {/* Subtle red tint */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            background:
              "radial-gradient(ellipse at 65% 50%, #e11d48 0%, transparent 60%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-5 flex flex-col justify-end pb-24">
        <div key={`c-${active}`} className="max-w-xl animate-fade-up">
          {/* Badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.10]
              backdrop-blur-sm border border-white/[0.14] text-white text-xs font-semibold"
            >
              <TrendingUp size={11} className="text-accent-light" /> Trending
              Now
            </span>
            <span
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-black/40
              backdrop-blur-sm border border-white/[0.09] text-xs"
            >
              <Star size={10} className="text-yellow-400 fill-yellow-400" />
              <span className="text-white font-bold ml-0.5">{s.score}</span>
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-white font-black leading-none mb-3 tracking-tight"
            style={{ fontSize: "clamp(2.4rem,5.5vw,5rem)" }}
          >
            {s.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm">
            <span className="text-text-secondary">{s.year}</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="border border-white/20 text-text-secondary text-[11px] px-1.5 py-px rounded">
              {s.rating}
            </span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="text-text-secondary flex items-center gap-1">
              <Clock size={11} />
              {s.duration}
            </span>
            {s.genres.map((g) => (
              <span
                key={g}
                className="text-[11px] px-2 py-0.5 rounded-full bg-accent/15
                border border-accent/25 text-accent-light font-medium"
              >
                {g}
              </span>
            ))}
          </div>

          <p className="text-text-secondary text-sm leading-relaxed mb-7 max-w-md">
            {s.desc}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover
                text-white font-bold text-sm shadow-glow transition-all hover:scale-[1.02] active:scale-95"
            >
              <Play size={15} className="fill-white" /> Start Watching
            </Link>
            <Link
              to="/signup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.09] hover:bg-white/[0.14]
                backdrop-blur-sm border border-white/[0.15] text-white font-semibold text-sm transition-all hover:scale-[1.02]"
            >
              Join Free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="relative overflow-hidden rounded-full transition-all duration-300"
            style={{
              width: i === active ? 28 : 8,
              height: 8,
              background: i === active ? "#e11d48" : "rgba(255,255,255,0.22)",
            }}
          >
            {i === active && !paused && (
              <span
                className="absolute inset-0 rounded-full bg-white/40 origin-left"
                style={{ animation: "progress 6s linear forwards" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Arrows */}
      <button
        onClick={back}
        aria-label="Previous"
        className="absolute left-4 sm:left-7 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
          bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/[0.14]
          flex items-center justify-center text-white transition-all hover:scale-105"
      >
        <ChevronLeft size={19} />
      </button>
      <button
        onClick={next}
        aria-label="Next"
        className="absolute right-4 sm:right-7 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl
          bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/[0.14]
          flex items-center justify-center text-white transition-all hover:scale-105"
      >
        <ChevronRight size={19} />
      </button>

      {/* Counter */}
      <div className="absolute top-20 right-6 text-white/35 text-xs font-mono tabular-nums">
        {String(active + 1).padStart(2, "0")} /{" "}
        {String(SLIDES.length).padStart(2, "0")}
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 inset-x-0 h-28 bg-gradient-to-t from-bg-primary to-transparent pointer-events-none" />

      <style>{`@keyframes progress{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
    </div>
  );
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar scrolled={scrolled} />
      <Hero />

      {/* Stats bar */}
      <div className="relative z-10 -mt-6 max-w-4xl mx-auto px-5 mb-24">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-white/[0.04] rounded-2xl overflow-hidden border border-white/[0.06]">
          {STATS.map(({ value, label, icon: Icon }, i) => (
            <div
              key={i}
              className="bg-bg-card/90 backdrop-blur-sm px-6 py-5 flex flex-col items-center gap-2 text-center"
            >
              <div className="w-8 h-8 rounded-xl bg-accent/10 border border-accent/18 flex items-center justify-center">
                <Icon size={15} className="text-accent-light" />
              </div>
              <p className="text-white font-black text-xl tabular-nums leading-none">
                {value}
              </p>
              <p className="text-text-tertiary text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-5 mb-24">
        <div className="text-center mb-12">
          <p className="text-accent-light text-xs font-semibold uppercase tracking-widest mb-3">
            Why ScreenPlay
          </p>
          <h2 className="text-white font-black text-2xl sm:text-3xl tracking-tight mb-3">
            Everything You Need to Watch
          </h2>
          <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Built for film lovers. Designed for every screen. Powered by great
            cinema.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={i}
              className="bg-white/[0.03] backdrop-blur-md border border-white/[0.07]
              rounded-2xl p-6 hover:border-accent/20 hover:bg-white/[0.05]
              transition-all duration-300 hover:-translate-y-1 group"
            >
              <div
                className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/18
                flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-all"
              >
                <Icon size={16} className="text-accent-light" />
              </div>
              <h3 className="text-white font-bold text-sm mb-2">{title}</h3>
              <p className="text-text-secondary text-xs leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 mb-24">
        <div className="relative rounded-3xl overflow-hidden text-center py-16 px-8 border border-accent/15">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-bg-surface to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <div className="relative">
            <p className="text-accent-light text-xs font-semibold uppercase tracking-widest mb-4">
              Free to Start
            </p>
            <h2 className="text-white font-black text-3xl sm:text-5xl tracking-tight mb-4">
              Ready to Watch?
            </h2>
            <p className="text-text-secondary text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Join thousands of viewers streaming their favourite movies and
              shows on ScreenPlay.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-5 mb-10">
              {[
                "No credit card required",
                "Cancel anytime",
                "All devices supported",
              ].map((p) => (
                <div
                  key={p}
                  className="flex items-center gap-2 text-text-secondary text-sm"
                >
                  <Check
                    size={13}
                    className="text-accent-light flex-shrink-0"
                  />
                  {p}
                </div>
              ))}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/signup"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-accent
                  hover:bg-accent-hover text-white font-bold text-sm shadow-glow-lg
                  transition-all hover:scale-[1.02] active:scale-95"
              >
                <Play size={15} className="fill-white" /> Create Free Account
              </Link>
              <Link
                to="/login"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl
                  border border-white/[0.14] bg-white/[0.04] hover:bg-white/[0.08]
                  text-white font-semibold text-sm transition-all"
              >
                Sign In <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/[0.05] bg-bg-surface/40">
        <div className="max-w-7xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-faint text-xs">
            © {new Date().getFullYear()} ScreenPlay. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
