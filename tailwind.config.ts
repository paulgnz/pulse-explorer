import type { Config } from "tailwindcss"
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { navy: v("navy"), ink: v("ink"), primary: v("primary"), accent: v("accent"), glow: v("glow"), success: v("success"), warn: v("warn"), danger: v("danger"), line: "rgb(255 255 255 / 0.08)" },
    backgroundImage: { brand: "linear-gradient(135deg, rgb(var(--accent)), rgb(var(--glow)))" },
  } },
  plugins: [],
} satisfies Config
