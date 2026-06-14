import type { Config } from "tailwindcss"
export default {
  content: ["./app/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: { extend: { colors: { ink: "#0b0e14", panel: "#121722", line: "#1e2633", accent: "#4F7CFF", glow: "#8B95FF" } } },
  plugins: [],
} satisfies Config
