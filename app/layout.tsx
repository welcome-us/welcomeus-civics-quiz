import type { Metadata } from "next";
import { bookman, tiempos, neueHaas, manrope } from "./fonts";
import BackgroundGlow from "./components/BackgroundGlow";
import "./globals.css";

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
      <body className="min-h-full">
        <BackgroundGlow />
        {children}
      </body>
    </html>
  );
}
