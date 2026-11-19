"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type UITheme =
  | "minimalism"
  | "glassmorphism"
  | "neumorphism"
  | "neo-brutalism"
  | "claymorphism"
  | "bento"
  | "cyberpunk"
  | "retro-windows"
  | "swiss"
  | "skeuomorphism";

export interface ThemeOption {
  id: UITheme;
  name: string;
  subtitle: string;
  description: string;
  badge: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "minimalism",
    name: "Minimalism",
    subtitle: "Minimalis standar",
    description: "Desain akademik bersih, garis rapi, dan kontras terukur.",
    badge: "Standar",
  },
  {
    id: "glassmorphism",
    name: "Glassmorphism",
    subtitle: "Bening-bening kaya kaca",
    description: "Efek frosted-glass transparan, backdrop blur, dan gradien lembut.",
    badge: "Frosted Glass",
  },
  {
    id: "neumorphism",
    name: "Neumorphism",
    subtitle: "Komponen timbul seperti 3D",
    description: "Bayangan ganda lembut menciptakan efek material timbul halus.",
    badge: "Soft 3D",
  },
  {
    id: "neo-brutalism",
    name: "Neo-brutalism",
    subtitle: "Warna berani dan solid (nyentrik)",
    description: "Garis hitam tebal, bayangan tegas tanpa blur, dan aksen cerah.",
    badge: "High Contrast",
  },
  {
    id: "claymorphism",
    name: "Claymorphism",
    subtitle: "Empuk kaya mainan clay",
    description: "Sudut ekstra membulat, bayangan 3D menggembung, dan tekstur empuk.",
    badge: "Playful 3D",
  },
  {
    id: "bento",
    name: "Bento Grid",
    subtitle: "Kotak-kotak rapi",
    description: "Layout modular kompartemen ala Apple Bento dengan visual terpartisi rapi.",
    badge: "Modular",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk neon",
    subtitle: "Futuristik, nyala-nyala",
    description: "Palet gelap pekat dengan pendaran neon cyan dan magenta futuristik.",
    badge: "Neon Glow",
  },
  {
    id: "retro-windows",
    name: "Retro windows",
    subtitle: "Era 90an",
    description: "Tampilan nostalgia Windows 95/98 dengan bevel timbul dan desktop klasik.",
    badge: "Windows 98",
  },
  {
    id: "swiss",
    name: "Swiss Editorial",
    subtitle: "Font rapi & grid tegas",
    description: "Gaya tipografi internasional dengan grid geometris presisi dan estetika editorial.",
    badge: "Editorial",
  },
  {
    id: "skeuomorphism",
    name: "Skeuomorphism",
    subtitle: "Kaya benda nyata",
    description: "Gradien taktil, tekstur kedalaman nyata, dan tombol realistis timbul.",
    badge: "Tactile",
  },
];

interface ThemeContextType {
  theme: UITheme;
  setTheme: (theme: UITheme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "minimalism",
  setTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<UITheme>("minimalism");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eduflow_ui_theme") as UITheme;
      if (saved && THEME_OPTIONS.some((o) => o.id === saved)) {
        setThemeState(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else {
        document.documentElement.setAttribute("data-theme", "minimalism");
      }
    } catch {
      // Fallback
    }
  }, []);

  const setTheme = (newTheme: UITheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("eduflow_ui_theme", newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {
      // Ignored
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
