"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { InterstitialMessage } from "@/lib/quiz/interstitials";
import { TOTAL_QUESTIONS } from "@/lib/quiz/state";
import InterstitialGlyph from "./InterstitialGlyphs";
import { StarMark } from "./Wordmark";

interface InterstitialCardProps {
  message: InterstitialMessage;
  /** 1-based number of the question waiting on the other side of the break. */
  nextQuestionNumber: number;
  /** Skip the break and go straight to that question. */
  onSkip: () => void;
}

/**
 * A between-questions breather: one welcoming message or study tip, shown on a
 * dark canvas so the pause reads as a deliberate change of pace rather than
 * another quiz screen. Purely optional — the button (or Enter / Escape) drops
 * the user back into the quiz.
 *
 * Mounting flips the whole page to night mode by setting data-theme on <html>;
 * unmounting restores the daylight palette. Doing it at the root (instead of
 * theming this card alone) means the background, glow, and header flip too.
 */
export default function InterstitialCard({
  message,
  nextQuestionNumber,
  onSkip,
}: InterstitialCardProps) {
  const skipRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = "dark";
    return () => {
      delete root.dataset.theme;
    };
  }, []);

  useEffect(() => {
    skipRef.current?.focus();
  }, []);

  // Escape is the universal "let me out" — same destination as the button.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onSkip();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onSkip]);

  return (
    <div className="animate-float-up w-full">
      <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(0,0,0,0.75)]">
        <Artwork message={message} />

        <div className="px-6 py-7 text-center sm:px-10 sm:py-9">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-paper-deep px-3.5 py-1 font-ui text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-ink-soft">
            <StarMark className="h-3 w-3 text-gold" />
            {message.eyebrow}
          </span>

          <h2 className="mx-auto mt-5 max-w-xl text-balance font-display text-[1.6rem] font-normal leading-snug text-ink sm:text-[2rem]">
            {message.headline}
          </h2>

          <p className="mx-auto mt-4 max-w-lg text-pretty font-body text-[1.02rem] leading-relaxed text-ink-soft">
            {message.body}
          </p>

          {message.link && (
            <a
              href={message.link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block font-ui text-sm font-semibold text-gold underline underline-offset-4 transition-opacity hover:opacity-80"
            >
              {message.link.label} →
            </a>
          )}

          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              ref={skipRef}
              type="button"
              onClick={onSkip}
              className="inline-flex items-center gap-2 rounded-full bg-[#FDB913] px-8 py-3.5 font-ui text-sm font-semibold text-[#020049] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
            >
              Skip to question {Math.min(nextQuestionNumber, TOTAL_QUESTIONS)} →
            </button>
            <p className="font-muted text-xs text-ink-faint">
              Press{" "}
              <kbd className="rounded border border-line bg-paper-deep px-1.5 py-0.5 font-ui text-[0.7rem] font-semibold text-ink-soft">
                Enter
              </kbd>{" "}
              or{" "}
              <kbd className="rounded border border-line bg-paper-deep px-1.5 py-0.5 font-ui text-[0.7rem] font-semibold text-ink-soft">
                Esc
              </kbd>{" "}
              to keep going
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * The art slot: a lit backdrop with the message's Welcome.US illustration
 * standing in it. A message can override the whole slot with its own artwork by
 * setting `image` — otherwise it gets the glow, a faint star field, and its
 * glyph.
 */
function Artwork({ message }: { message: InterstitialMessage }) {
  if (message.image) {
    return (
      <div className="relative aspect-[16/7] w-full bg-paper-deep">
        <Image
          src={message.image.src}
          alt={message.image.alt}
          width={message.image.width}
          height={message.image.height}
          className="h-full w-full object-cover"
          priority={false}
        />
      </div>
    );
  }

  return (
    <div
      className="relative grid aspect-[16/7] w-full place-items-center overflow-hidden bg-[radial-gradient(70%_130%_at_50%_0%,rgba(253,185,19,0.22),transparent_70%),radial-gradient(60%_120%_at_15%_100%,rgba(26,56,171,0.45),transparent_70%)] bg-paper-deep"
      aria-hidden="true"
    >
      {/* Decorative star field — faint texture behind the illustration. */}
      <StarMark className="absolute -left-4 top-4 h-16 w-16 text-gold/10" />
      <StarMark className="absolute right-6 top-8 h-8 w-8 text-gold/15" />
      <StarMark className="absolute bottom-3 right-24 h-5 w-5 text-gold/10" />

      {/* The illustrations carry their own brand colors, so they stand on the
          glow unframed rather than in a tinted chip. */}
      <InterstitialGlyph
        name={message.icon}
        className="animate-pop h-20 w-auto drop-shadow-[0_12px_30px_rgba(0,0,0,0.45)] sm:h-28"
      />
    </div>
  );
}
