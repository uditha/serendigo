/** Small island / drop mark in brand amber — avoids system emoji coloring (e.g. green palm). */
export default function BrandMark({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="inline-block align-[-0.15em] shrink-0"
      style={{ color: 'var(--sg-primary)' }}
    >
      <path
        d="M12 2c3.2 0 5.8 2.2 6.8 5.2 1 3-.2 6.3-2.5 8.5L12 22l-4.3-6.3C5.4 13.5 4.2 10.2 5.2 7.2 6.2 4.2 8.8 2 12 2z"
        fill="currentColor"
      />
      <path
        d="M12 8.5v6"
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
