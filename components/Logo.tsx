export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className="shrink-0">
      <defs>
        <linearGradient id="pulselogo" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#4F7CFF" />
          <stop offset="1" stopColor="#8B95FF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#pulselogo)" />
      <path d="M5 16.5H11L13.5 9.5L18 23L20.5 16.5H27" stroke="white" strokeWidth="2.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
