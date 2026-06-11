import { Manrope } from "next/font/google";
import localFont from "next/font/local";

// Brand typography (see branding guide):
//   Headlines / question text → Bookman JF Pro (serif, fallback Georgia)
//   Body copy                 → Tiempos Text (serif)
//   Buttons & bold UI labels  → Neue Haas Grotesk (sans)
//   Muted / secondary UI text → Manrope (sans)

// Headlines & question text. Only Regular + Italic were licensed/dropped, so
// bold headings fall back to faux-bold until a bold weight is added.
export const bookman = localFont({
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
  src: [
    { path: "./fonts/Bookman JF Pro/BookmanJFPro-Regular.otf", weight: "400", style: "normal" },
    { path: "./fonts/Bookman JF Pro/BookmanJFPro-Italic.otf", weight: "400", style: "italic" },
  ],
});

// Body copy.
export const tiempos = localFont({
  variable: "--font-body",
  display: "swap",
  fallback: ["Georgia", "serif"],
  adjustFontFallback: "Times New Roman",
  src: [
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-regular-italic.woff2", weight: "400", style: "italic" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-medium-italic.woff2", weight: "500", style: "italic" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-semibold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-semibold-italic.woff2", weight: "600", style: "italic" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-bold.woff2", weight: "700", style: "normal" },
    { path: "./fonts/Tiempos/WOFF2/tiempos-text-bold-italic.woff2", weight: "700", style: "italic" },
  ],
});

// Buttons & bold UI labels.
export const neueHaas = localFont({
  variable: "--font-ui",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
  src: [
    { path: "./fonts/Neue Haas Grotesk/NHaasGroteskTXPro-55Rg.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Neue Haas Grotesk/NHaasGroteskTXPro-65Md.ttf", weight: "500", style: "normal" },
    { path: "./fonts/Neue Haas Grotesk/NHaasGroteskTXPro-75Bd.ttf", weight: "700", style: "normal" },
  ],
});

// Muted / secondary UI text. Not dropped locally — pulled from Google Fonts.
export const manrope = Manrope({
  variable: "--font-muted",
  subsets: ["latin"],
  display: "swap",
});
