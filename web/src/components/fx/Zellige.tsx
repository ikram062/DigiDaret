/** Eight-point-star tile pattern (the Moroccan zellige motif) as an SVG overlay. */
export function Zellige({
  className,
  id = "zellige",
}: {
  className?: string
  id?: string
}) {
  return (
    <svg className={className} width="100%" height="100%" aria-hidden>
      <defs>
        <pattern id={id} width="88" height="88" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="22" y="22" width="44" height="44" />
            <rect x="22" y="22" width="44" height="44" transform="rotate(45 44 44)" />
            <circle cx="44" cy="44" r="6" />
            <path d="M0 0 L22 22 M88 0 L66 22 M0 88 L22 66 M88 88 L66 66" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}

export function Logo({ className = "size-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden>
      <rect x="3" y="8" width="26" height="19" rx="5" stroke="#19a58a" strokeWidth="2" />
      <path
        d="M7 8 L21 4 a2 2 0 0 1 2.5 1.7 L23.5 8"
        stroke="#19a58a"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 17.5a4 4 0 1 1-1.2-2.8M19.2 12.8v2.4h-2.4"
        stroke="#f2a93b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
