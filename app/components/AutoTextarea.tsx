"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

interface AutoTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Smallest height in pixels before the field grows. */
  minHeight?: number;
  /** Cap before the field scrolls instead of growing. */
  maxHeight?: number;
}

/**
 * A textarea that scales its height to fit its content — the "scaling long
 * text field". Grows from `minHeight` up to `maxHeight`, then scrolls.
 */
const AutoTextarea = forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  function AutoTextarea(
    { minHeight = 92, maxHeight = 320, value, onChange, className = "", ...rest },
    ref,
  ) {
    const innerRef = useRef<HTMLTextAreaElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLTextAreaElement);

    const resize = useCallback(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = "auto";
      const next = Math.min(Math.max(el.scrollHeight, minHeight), maxHeight);
      el.style.height = `${next}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
    }, [minHeight, maxHeight]);

    // Re-fit whenever the controlled value changes (typing, reset, etc.).
    useEffect(() => {
      resize();
    }, [value, resize]);

    return (
      <textarea
        ref={innerRef}
        value={value}
        onChange={(e) => {
          onChange?.(e);
          resize();
        }}
        rows={2}
        className={className}
        style={{ minHeight }}
        {...rest}
      />
    );
  },
);

export default AutoTextarea;
