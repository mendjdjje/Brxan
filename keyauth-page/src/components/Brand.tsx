/**
 * KeyAuth-Wortmarke mit Inline-SVG-Logo (Schluessel/Schild-Motiv).
 */

import "./Brand.css";

const APP_NAME = import.meta.env.VITE_APP_NAME?.trim() || "KeyAuth";

interface BrandProps {
  /** Groesse des Logos in Pixeln (Hoehe). */
  size?: number;
  /** Wortmarke ausblenden (nur Icon). */
  iconOnly?: boolean;
}

export function Brand({ size = 36, iconOnly = false }: BrandProps) {
  return (
    <div className="brand">
      <svg
        className="brand__mark"
        width={size}
        height={size}
        viewBox="0 0 32 32"
        role="img"
        aria-label={`${APP_NAME} Logo`}
      >
        <defs>
          <linearGradient id="brandGrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--accent-cyan)" />
            <stop offset="1" stopColor="var(--accent-violet)" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="2"
          width="28"
          height="28"
          rx="8"
          fill="rgba(10,16,32,0.85)"
          stroke="url(#brandGrad)"
          strokeWidth="1.5"
        />
        <path
          d="M20.5 9.5a4.5 4.5 0 0 0-4.37 5.6L9 22.23V25h2.77l.77-.77.77.77H16v-2l1.5-1.5 1.1.28A4.5 4.5 0 1 0 20.5 9.5Zm1.25 4.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z"
          fill="url(#brandGrad)"
        />
      </svg>
      {!iconOnly && (
        <span className="brand__word">
          Key<span className="brand__word-accent">Auth</span>
        </span>
      )}
    </div>
  );
}
