import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        sm: "1.5rem",
        lg: "2rem",
      },
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground, var(--foreground))",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        navy: {
          DEFAULT: "#090E17", // Deeper, more obsidian navy for Apple dark mode feel
          soft: "#131C2A",
        },
        teal: {
          DEFAULT: "#0E635C", // More sophisticated emerald/sage
          hover: "#0B4F4A",
          light: "#EAF2F1",
        },
        gold: {
          DEFAULT: "#C5A059", // Champagne gold
          light: "#FDFBF7",
        },
        cream: "#FBFBF9", // Cleaner, airy warm white (Luxe)
        ink: {
          DEFAULT: "#111827",
          secondary: "#4B5563",
          muted: "#9CA3AF",
        },
        line: {
          DEFAULT: "#E5E7EB",
          strong: "#D1D5DB",
        },
        surface: "#F3F4F6",
        success: { DEFAULT: "#059669", bg: "#ECFDF5" },
        danger: { DEFAULT: "#DC2626", bg: "#FEF2F2" },
        warn: { DEFAULT: "#D97706", bg: "#FFFBEB" },
        info: { DEFAULT: "#2563EB", bg: "#EFF6FF" },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      fontSize: {
        display: ["clamp(2.5rem, 6vw, 4rem)", { lineHeight: "1.05", letterSpacing: "-0.03em", fontWeight: "500" }], // More elegant thin display
        h1: ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "600" }],
        h2: ["1.75rem", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "600" }],
        h3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        h4: ["1rem", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["1.0625rem", { lineHeight: "1.6", letterSpacing: "-0.01em" }],
        body: ["0.9375rem", { lineHeight: "1.6", letterSpacing: "-0.005em" }],
        caption: ["0.8125rem", { lineHeight: "1.5" }],
        label: ["0.6875rem", { lineHeight: "1.4", letterSpacing: "0.1em", fontWeight: "600" }],
        price: ["1.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "500" }],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",  // Apple squircle standard
        "2xl": "32px",
        pill: "9999px",
      },
      boxShadow: {
        card: "0 8px 30px rgba(0,0,0,0.04)",
        hover: "0 20px 40px rgba(0,0,0,0.06)",
        modal: "0 24px 64px rgba(0,0,0,0.1)",
        nav: "0 1px 0 rgba(0,0,0,0.04)",
      },
      spacing: {
        section: "112px", // Extreme whitespace for Luxe feel
      },
      transitionTimingFunction: {
        DEFAULT: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        premium: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        DEFAULT: "400ms",
      },
      animation: {
        "fade-up": "fade-up 800ms cubic-bezier(0.22, 0.61, 0.36, 1) both",
        "fade-in": "fade-in 500ms ease both",
        "marquee": "marquee 50s linear infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "marquee": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
