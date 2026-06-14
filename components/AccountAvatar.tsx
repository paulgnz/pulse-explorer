// Deterministic gradient avatar for an account, with the Pulse mark overlaid.
function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export default function AccountAvatar({ name, size = 56 }: { name: string; size?: number }) {
  const h = hash(name);
  const a = h % 360;
  const b = (h >> 3) % 360;
  return (
    <span
      className="inline-flex items-center justify-center rounded-full shrink-0 ring-1 ring-white/15"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${a} 70% 55%), hsl(${b} 70% 45%))`,
      }}
    >
      <svg width={size * 0.5} height={size * 0.5} viewBox="0 0 32 32" fill="none" aria-hidden>
        <path d="M5 16.5H11L13.5 9.5L18 23L20.5 16.5H27" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
