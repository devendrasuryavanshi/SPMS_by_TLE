import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  darkMode: "class",
  content: [
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
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
      boxShadow: {
        input: `0px 2px 3px -1px rgba(0,0,0,0.1), 0px 1px 0px 0px rgba(25,28,33,0.02), 0px 0px 0px 1px rgba(25,28,33,0.08)`,
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        // SPMS Light Theme Colors
        primary: {
          DEFAULT: "#6366F1", // Electric Indigo
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#6B7280", // Cool Gray
          foreground: "#FFFFFF",
        },
        tertiary: {
          DEFAULT: "#10B981", // Emerald Glow
          foreground: "#FFFFFF",
        },
        background: "#FDFDFD", // Snow White
        surface: "#FFFFFF", // Cloud White
        "text-primary": "#111827", // Onyx Black
        accent: {
          DEFAULT: "#3B82F6", // Soft Blue
          foreground: "#FFFFFF",
        },

        // Dark theme variants
        "primary-dark": {
          DEFAULT: "#3B82F6", // Cobalt Blue
          foreground: "#0F0F0F", // Jet Black
        },
        "secondary-dark": {
          DEFAULT: "#64748B", // Steel Gray
          foreground: "#0F0F0F",
        },
        "tertiary-dark": {
          DEFAULT: "#60A5FA", // Sky Neon Blue
          foreground: "#0F0F0F",
        },
        "background-dark": "#0B0D0F", // Stealth Black
        "surface-dark": "#181A20", // Raven Black
        "text-primary-dark": "#E5E7EB", // Pale Gray
        "accent-dark": {
          DEFAULT: "#6366F1", // Indigo Glow (Bluish Accent)
          foreground: "#0F0F0F",
        },

        // Shadcn/ui compatible colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        foreground: "hsl(var(--foreground))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    addVariablesForColors,
    tailwindcssAnimate,
    nextui({
      prefix: "nextui",
      addCommonColors: false,
      defaultTheme: "light",
      defaultExtendTheme: "light",
      layout: {},
      themes: {
        light: {
          layout: {},
          colors: {
            primary: {
              DEFAULT: "#6366F1",
              foreground: "#FFFFFF",
            },
            secondary: {
              DEFAULT: "#6B7280",
              foreground: "#FFFFFF",
            },
            success: {
              DEFAULT: "#10B981",
              foreground: "#FFFFFF",
            },
            background: "#F9FAFB",
            foreground: "#111827",
            content1: "#FFFFFF",
          },
        },
        dark: {
          layout: {},
          colors: {
            primary: {
              DEFAULT: "#60A5FA",
              foreground: "#0F172A",
            },
            secondary: {
              DEFAULT: "#94A3B8",
              foreground: "#0F172A",
            },
            success: {
              DEFAULT: "#22C55E",
              foreground: "#0F172A",
            },
            background: "#0F172A",
            foreground: "#F1F5F9",
            content1: "#1E293B",
          },
        },
      },
    }),
  ],
} satisfies Config

function addVariablesForColors({ addBase, theme }: any) {
  let allColors = flattenColorPalette(theme("colors"));
  let newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}

export default config;