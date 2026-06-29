"use client";

import { useEffect, useRef, useState } from "react";
import { PASS_THRESHOLD, TOTAL_QUESTIONS } from "@/lib/quiz/state";
import { StarMark } from "./Wordmark";

export interface SuccessFormData {
  firstName: string;
  lastName: string;
  email: string;
  zip: string;
  marketingConsent: boolean;
}

export interface SuccessSubmitResult {
  ok: boolean;
  message?: string;
}

export type CaptureVariant = "pass" | "giveup";

interface SuccessModalProps {
  open: boolean;
  /** Which message to show above the (identical) lead-capture form. */
  variant?: CaptureVariant;
  /**
   * Route-selected: when true (the /exam variant) the modal renders the
   * lead-capture form; when false (the /civics variant) it shows the congrats
   * banner and copy only, with a single dismiss button and no submission.
   */
  leadCapture?: boolean;
  onSubmit: (data: SuccessFormData) => Promise<SuccessSubmitResult> | SuccessSubmitResult;
  onClose: () => void;
}

const EMPTY: SuccessFormData = {
  firstName: "",
  lastName: "",
  email: "",
  zip: "",
  marketingConsent: true, // opt-in by default
};

// Lead-capture form shown either after a passing score ("pass") or when the
// user bails out early ("giveup"). The form itself is identical in both cases —
// only the banner + intro copy above it changes. onSubmit hands the collected
// fields to the parent, which is the single seam where a real submission can be
// wired in.
export default function SuccessModal({
  open,
  variant = "pass",
  leadCapture = true,
  onSubmit,
  onClose,
}: SuccessModalProps) {
  const [data, setData] = useState<SuccessFormData>(EMPTY);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Clear fields and hand control back to the parent.
  const close = () => {
    setData(EMPTY);
    setSubmitError(null);
    setIsSubmitting(false);
    onClose();
  };

  // Move focus into the dialog and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    firstFieldRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "Tab") {
        // Simple focus trap across the dialog's focusable controls.
        const nodes = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
        if (!nodes || nodes.length === 0) return;
        const list = Array.from(nodes);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // `close` is stable enough for this dialog's lifetime; only re-bind on open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const set = <K extends keyof SuccessFormData>(key: K, value: SuccessFormData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  // The no-form give-up case (/civics) points users to the Citizen Guide
  // program instead of capturing a lead — its own copy and CTA, no submission.
  const citizenGuide = !leadCapture && variant === "giveup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const result = await onSubmit(data);
      if (!result.ok) {
        setSubmitError(result.message ?? "We couldn&apos;t send your results. Please try again.");
        return;
      }
    } catch {
      setSubmitError("We couldn&apos;t send your results. Please try again.");
      return;
    } finally {
      setIsSubmitting(false);
    }

    setData(EMPTY);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-title"
      aria-describedby="success-desc"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close"
        onClick={close}
        className="absolute inset-0 cursor-default backdrop-blur-sm animate-fade-in"
        tabIndex={-1}
      />

      <div
        ref={dialogRef}
        className="animate-scale-in relative w-full max-w-lg rounded-3xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(2,0,73,0.45)]"
      >
        {/* Banner */}
        <div className="relative overflow-hidden rounded-t-3xl bg-[#293870] px-7 pt-7 pb-6 text-paper">
          <div className="absolute -right-6 -top-8 opacity-[0.28]">
            <StarMark className="h-36 w-36 text-[#0D3FF7]" />
          </div>
          <p className="font-ui text-xs font-semibold uppercase tracking-[0.22em] text-paper/80">
            {variant === "pass" ? "You passed" : "No worries"}
          </p>
          <h2
            id="success-title"
            className="mt-2 font-display text-3xl font-normal leading-tight"
          >
            {variant === "pass"
              ? "Congrats, you passed!"
              : "The citizenship test is tough."}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="px-7 py-6">
          <div id="success-desc" className="space-y-3 font-body text-[0.975rem] leading-relaxed text-ink-soft">
            {variant === "pass" ? (
              <p>
                You&apos;re as American as fireworks on the Fourth of July! You
                answered at least {PASS_THRESHOLD} out of {TOTAL_QUESTIONS}{" "}
                questions correctly—the score needed to pass the U.S. citizenship
                exam. Now share this quiz with family and friends to see if they
                have what it takes to pass the citizenship test—and take the
                opportunity to brag about your civics knowledge!
              </p>
            ) : citizenGuide ? (
              <p>
                You&apos;re not alone in feeling stumped. Most Americans born here
                could not pass this exam. Now imagine the pressure of testing with
                your future riding on the answers. Nobody should have to study
                alone. The Citizen Guide program virtually pairs a green card
                holder with a volunteer, and they study together, one question at
                a time. You might be surprised what you take away from it.
              </p>
            ) : (
              <p>
                {/* TODO: replace with final give-up copy */}
                No shame in stepping away—most people need a few rounds of
                practice before they&apos;re ready. Leave your details and
                we&apos;ll send you study tips and resources so you can pick up
                where you left off and pass it next time.
              </p>
            )}
            {!citizenGuide && (
              <p>
                Find out more about what it takes to earn American citizenship at{" "}
                <a
                  href="https://welcome.us/citizenship"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand underline underline-offset-2 hover:text-brand-deep"
                >
                  Welcome.US
                </a>
                .
              </p>
            )}
          </div>

          {leadCapture && (
          <>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              ref={firstFieldRef}
              id="firstName"
              label="First name"
              value={data.firstName}
              onChange={(v) => set("firstName", v)}
              autoComplete="given-name"
              required
            />
            <Field
              id="lastName"
              label="Last name"
              value={data.lastName}
              onChange={(v) => set("lastName", v)}
              autoComplete="family-name"
              required
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              id="email"
              label="Email"
              type="email"
              value={data.email}
              onChange={(v) => set("email", v)}
              autoComplete="email"
              required
            />
            <Field
              id="zip"
              label="ZIP code"
              inputMode="numeric"
              value={data.zip}
              onChange={(v) => set("zip", v)}
              autoComplete="postal-code"
              pattern="\d{5}(-\d{4})?"
              required
            />
          </div>

          <label className="mt-5 flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={data.marketingConsent}
              onChange={(e) => set("marketingConsent", e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-line text-brand accent-brand"
            />
            <span className="font-body text-sm leading-relaxed text-ink-soft">
              Yes, send me citizenship tips, resources, and occasional updates. You
              can unsubscribe at any time.
            </span>
          </label>

          {submitError && (
            <p
              aria-live="polite"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 font-ui text-sm text-red-700"
            >
              {submitError}
            </p>
          )}
          </>
          )}

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            {leadCapture ? (
              <>
                <button
                  type="button"
                  onClick={close}
                  disabled={isSubmitting}
                  className="rounded-full px-5 py-3 font-ui text-sm font-semibold text-ink-soft transition-colors hover:bg-paper-deep"
                >
                  Maybe later
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-full bg-[#FDB913] px-7 py-3 font-ui text-sm font-semibold text-[#020049] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
                >
                  {isSubmitting
                    ? "Sending..."
                    : variant === "pass"
                      ? "Join newsletter →"
                      : "Send me study tips →"}
                </button>
              </>
            ) : citizenGuide ? (
              <a
                href="https://welcome.us/citizenship"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="rounded-full bg-[#FDB913] px-7 py-3 font-ui text-sm font-semibold text-[#020049] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
              >
                Take the first step →
              </a>
            ) : (
              <button
                type="button"
                onClick={close}
                className="rounded-full bg-[#FDB913] px-7 py-3 font-ui text-sm font-semibold text-[#020049] shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#e5a50f] hover:shadow-[0_10px_30px_-6px_rgba(253,185,19,0.275),0_0_44px_-4px_rgba(253,185,19,0.225)] active:translate-y-0 active:scale-[0.98]"
              >
                Done
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  pattern?: string;
}

const Field = ({
  ref,
  id,
  label,
  value,
  onChange,
  type = "text",
  required,
  autoComplete,
  inputMode,
  pattern,
}: FieldProps & { ref?: React.Ref<HTMLInputElement> }) => (
  <div>
    <label
      htmlFor={id}
      className="font-ui text-xs font-semibold uppercase tracking-wider text-ink-faint"
    >
      {label}
    </label>
    <input
      ref={ref}
      id={id}
      name={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      autoComplete={autoComplete}
      inputMode={inputMode}
      pattern={pattern}
      className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3.5 py-2.5 font-body text-sm text-ink outline-none ring-brand/30 transition-shadow placeholder:text-ink-faint focus:border-brand focus:ring-2"
    />
  </div>
);
