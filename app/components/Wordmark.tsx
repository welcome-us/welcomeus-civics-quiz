/** Welcome.US-flavoured wordmark + a small civic star motif. */
export function StarMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none">
      <path
        d="M12 1.6l2.74 6.3 6.84.57-5.2 4.49 1.57 6.68L12 16.7l-5.95 3.54 1.57-6.68-5.2-4.49 6.84-.57L12 1.6z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Wordmark() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-paper shadow-sm">
        <StarMark className="h-4 w-4" />
      </span>
      <span className="font-sans text-[1.05rem] font-extrabold tracking-tight text-ink">
        Welcome<span className="text-accent">.US</span>
        <span className="ml-1.5 font-medium text-ink-faint">Civics</span>
      </span>
    </div>
  );
}
