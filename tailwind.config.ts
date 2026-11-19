import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2457D6",
          dark: "#173B96",
          light: "#EEF3FF",
        },
        background: "#F6F8FC",
        surface: "#FFFFFF",
        appText: "#172033",
        muted: "#667085",
        appBorder: "#E4E9F2",
        success: {
          DEFAULT: "#16845B",
          light: "#E8F5EF",
        },
        warning: {
          DEFAULT: "#B7791F",
          light: "#FDF5E6",
        },
        danger: {
          DEFAULT: "#C43D4B",
          light: "#FCECEE",
        },
        info: {
          DEFAULT: "#2878B8",
          light: "#EDF5FA",
        },
      },
      fontFamily: {
        sans: ["Inter", "Geist Sans", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
