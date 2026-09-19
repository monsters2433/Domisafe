export function Logo({ className = 'size-7' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path
        d="M16 3 5 7.2v8.3c0 6.8 4.6 12.1 11 13.5 6.4-1.4 11-6.7 11-13.5V7.2L16 3Z"
        fill="var(--accent)"
        fillOpacity="0.14"
        stroke="var(--accent)"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="m11.3 15.8 3.4 3.4 6.2-6.6" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
