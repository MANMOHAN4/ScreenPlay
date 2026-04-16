export default function Logo({ size = "md" }) {
  const box =
    size === "sm" ? "w-7 h-7" : size === "lg" ? "w-10 h-10" : "w-8 h-8";
  const txt =
    size === "sm" ? "text-base" : size === "lg" ? "text-xl" : "text-lg";
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`${box} rounded-xl bg-accent flex items-center justify-center flex-shrink-0 shadow-glow`}
      >
        <svg viewBox="0 0 32 32" fill="none" className="w-[55%] h-[55%]">
          <polygon points="8,6 8,26 28,16" fill="white" />
        </svg>
      </div>
      <span className={`font-black tracking-tight text-white ${txt}`}>
        Screen<span className="text-accent-light">Play</span>
      </span>
    </div>
  );
}
