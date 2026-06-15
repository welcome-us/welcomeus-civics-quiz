"use client";

import { useEffect } from "react";

/**
 * Makes the warm gold background glow trail the cursor. We don't snap the glow
 * to the pointer — we ease toward it each frame so it drifts behind with a soft
 * lag, and settle back to the CSS resting position when the pointer leaves.
 * Renders nothing; it only drives the --glow-x / --glow-y custom properties.
 */
export default function BackgroundGlow() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const { style } = document.body;
    // Resting position, kept in sync with the defaults in globals.css.
    const restX = 82;
    const restY = -8;
    let curX = restX;
    let curY = restY;
    let tgtX = restX;
    let tgtY = restY;
    let raf = 0;
    let running = false;

    const tick = () => {
      // Ease toward the target — lower factor = longer, lazier trail.
      curX += (tgtX - curX) * 0.08;
      curY += (tgtY - curY) * 0.08;
      style.setProperty("--glow-x", `${curX.toFixed(2)}%`);
      style.setProperty("--glow-y", `${curY.toFixed(2)}%`);

      if (Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05) {
        raf = requestAnimationFrame(tick);
      } else {
        running = false;
      }
    };

    const start = () => {
      if (!running) {
        running = true;
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      tgtX = (e.clientX / window.innerWidth) * 100;
      tgtY = (e.clientY / window.innerHeight) * 100;
      start();
    };

    const onLeave = () => {
      tgtX = restX;
      tgtY = restY;
      start();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
