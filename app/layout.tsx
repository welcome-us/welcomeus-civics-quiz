import type { Metadata } from "next";
import { bookman, tiempos, neueHaas, manrope } from "./fonts";
import BackgroundGlow from "./components/BackgroundGlow";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";

// GTM container ID (looks like "GTM-XXXXXXX"). Read from the env var so the tag
// only loads when configured — local/dev builds stay tag-free until you opt in.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

export const metadata: Metadata = {
  title: "Civics Practice — Welcome.US",
  description:
    "Practice for the U.S. naturalization civics test. 20 questions, 12 to pass — type your answers in your own words.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bookman.variable} ${tiempos.variable} ${neueHaas.variable} ${manrope.variable} h-full antialiased`}
    >
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      <body className="min-h-full">
        <BackgroundGlow />
        {children}
      </body>
    </html>
  );
}
