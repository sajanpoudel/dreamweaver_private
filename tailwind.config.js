/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
        dream: {
          soft: "#F0E6FF",  // Soft lavender
          mist: "#E6F0FF",  // Misty blue
          glow: "#FFE6F0",  // Rosy glow
          ethereal: "#F0FFE6", // Ethereal green
          mystic: "#E6F0F0",  // Mystic teal
          accent: "#FFB6C1",  // Light pink
          highlight: "#87CEEB", // Sky blue
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          soft: "#9F7AEA",    // Soft purple
          vivid: "#805AD5",   // Vivid purple
          deep: "#6B46C1",    // Deep purple
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          rose: "#FDA4AF",    // Rose pink
          coral: "#F87171",   // Coral
          peach: "#FCA5A5",   // Peach
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
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "dream-float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "dream-glow": {
          "0%, 100%": { boxShadow: "0 0 10px rgba(159, 122, 234, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(159, 122, 234, 0.6)" },
        },
        fallingStars1: {
          '0%': { transform: 'translate(0, 0) rotate(-45deg) scale(0)', opacity: 0 },
          '50%': { transform: 'translate(-60px, 60px) rotate(-45deg) scale(1)', opacity: 1 },
          '100%': { transform: 'translate(-120px, 120px) rotate(-45deg) scale(0)', opacity: 0 }
        },
        fallingStarsVertical1: {
          '0%': { transform: 'translateY(0) scale(0)', opacity: 0 },
          '50%': { transform: 'translateY(60px) scale(1)', opacity: 1 },
          '100%': { transform: 'translateY(120px) scale(0)', opacity: 0 }
        },
        fallingStarsSpiral1: {
          '0%': { transform: 'rotate(0deg) translate(0) scale(0)', opacity: 0 },
          '50%': { transform: 'rotate(180deg) translate(40px) scale(1)', opacity: 1 },
          '100%': { transform: 'rotate(360deg) translate(80px) scale(0)', opacity: 0 }
        },
        fallingStarsZigzag1: {
          '0%': { transform: 'translate(0, 0) scale(0)', opacity: 0 },
          '25%': { transform: 'translate(40px, 30px) scale(1)', opacity: 1 },
          '50%': { transform: 'translate(0px, 60px) scale(1)', opacity: 1 },
          '75%': { transform: 'translate(-40px, 90px) scale(1)', opacity: 1 },
          '100%': { transform: 'translate(0, 120px) scale(0)', opacity: 0 }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "dream-float": "dream-float 6s ease-in-out infinite",
        "dream-glow": "dream-glow 4s ease-in-out infinite",
        fallingStars1: 'fallingStars1 5s ease-in-out infinite',
        fallingStars2: 'fallingStars1 7s ease-in-out infinite 2s',
        fallingStars3: 'fallingStars1 6s ease-in-out infinite 3s',
        fallingStarsVertical1: 'fallingStarsVertical1 5s ease-in-out infinite',
        fallingStarsVertical2: 'fallingStarsVertical1 7s ease-in-out infinite 2s',
        fallingStarsVertical3: 'fallingStarsVertical1 6s ease-in-out infinite 3s',
        fallingStarsSpiral1: 'fallingStarsSpiral1 8s ease-in-out infinite',
        fallingStarsSpiral2: 'fallingStarsSpiral1 10s ease-in-out infinite 3s',
        fallingStarsSpiral3: 'fallingStarsSpiral1 9s ease-in-out infinite 5s',
        fallingStarsZigzag1: 'fallingStarsZigzag1 6s ease-in-out infinite',
        fallingStarsZigzag2: 'fallingStarsZigzag1 8s ease-in-out infinite 2s',
        fallingStarsZigzag3: 'fallingStarsZigzag1 7s ease-in-out infinite 4s',
      },
      backgroundImage: {
        'dream-gradient': 'linear-gradient(to right, var(--dream-gradient-start), var(--dream-gradient-end))',
        'dream-pattern': "url('/dream-pattern.svg')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 