import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fallingStars1: {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translate(-200px, 200px) rotate(-45deg)", opacity: "0" }
        },
        fallingStars2: {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translate(-200px, 200px) rotate(-45deg)", opacity: "0" }
        },
        fallingStars3: {
          "0%": { transform: "translate(0, 0) rotate(0deg)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translate(-200px, 200px) rotate(-45deg)", opacity: "0" }
        },
        fallingStarsVertical1: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(200px)", opacity: "0" }
        },
        fallingStarsVertical2: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(200px)", opacity: "0" }
        },
        fallingStarsVertical3: {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(200px)", opacity: "0" }
        },
        fallingStarsSpiral1: {
          "0%": { transform: "rotate(0deg) translateX(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "rotate(360deg) translateX(100px)", opacity: "0" }
        },
        fallingStarsSpiral2: {
          "0%": { transform: "rotate(0deg) translateX(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "rotate(360deg) translateX(100px)", opacity: "0" }
        },
        fallingStarsSpiral3: {
          "0%": { transform: "rotate(0deg) translateX(0)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "rotate(360deg) translateX(100px)", opacity: "0" }
        },
        fallingStarsZigzag1: {
          "0%": { transform: "translate(0, 0)", opacity: "0" },
          "25%": { transform: "translate(20px, 50px)", opacity: "1" },
          "50%": { transform: "translate(-20px, 100px)", opacity: "1" },
          "75%": { transform: "translate(20px, 150px)", opacity: "1" },
          "100%": { transform: "translate(-20px, 200px)", opacity: "0" }
        },
        fallingStarsZigzag2: {
          "0%": { transform: "translate(0, 0)", opacity: "0" },
          "25%": { transform: "translate(-20px, 50px)", opacity: "1" },
          "50%": { transform: "translate(20px, 100px)", opacity: "1" },
          "75%": { transform: "translate(-20px, 150px)", opacity: "1" },
          "100%": { transform: "translate(20px, 200px)", opacity: "0" }
        },
        fallingStarsZigzag3: {
          "0%": { transform: "translate(0, 0)", opacity: "0" },
          "25%": { transform: "translate(20px, 50px)", opacity: "1" },
          "50%": { transform: "translate(-20px, 100px)", opacity: "1" },
          "75%": { transform: "translate(20px, 150px)", opacity: "1" },
          "100%": { transform: "translate(-20px, 200px)", opacity: "0" }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fallingStars1": "fallingStars1 3s ease-in-out infinite",
        "fallingStars2": "fallingStars2 4s ease-in-out infinite 1s",
        "fallingStars3": "fallingStars3 5s ease-in-out infinite 2s",
        "fallingStarsVertical1": "fallingStarsVertical1 3s ease-in-out infinite",
        "fallingStarsVertical2": "fallingStarsVertical2 4s ease-in-out infinite 1s",
        "fallingStarsVertical3": "fallingStarsVertical3 5s ease-in-out infinite 2s",
        "fallingStarsSpiral1": "fallingStarsSpiral1 4s ease-in-out infinite",
        "fallingStarsSpiral2": "fallingStarsSpiral2 5s ease-in-out infinite 1s",
        "fallingStarsSpiral3": "fallingStarsSpiral3 6s ease-in-out infinite 2s",
        "fallingStarsZigzag1": "fallingStarsZigzag1 5s ease-in-out infinite",
        "fallingStarsZigzag2": "fallingStarsZigzag2 6s ease-in-out infinite 1s",
        "fallingStarsZigzag3": "fallingStarsZigzag3 7s ease-in-out infinite 2s"
      }
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

export default config;
