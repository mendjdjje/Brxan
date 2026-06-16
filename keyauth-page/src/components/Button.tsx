/**
 * Primaerer Aktions-Button mit Lade-Spinner und Erfolgs-Haekchen.
 */

import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  success?: boolean;
  variant?: "primary" | "ghost";
  fullWidth?: boolean;
}

export function Button({
  children,
  loading = false,
  success = false,
  variant = "primary",
  fullWidth = false,
  disabled,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    "btn",
    `btn--${variant}`,
    fullWidth ? "btn--full" : "",
    loading ? "btn--loading" : "",
    success ? "btn--success" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={classes}
      disabled={disabled || loading || success}
      aria-busy={loading}
      {...rest}
    >
      <span className="btn__label">{children}</span>
      {loading && <span className="btn__spinner" aria-hidden="true" />}
      {success && (
        <svg
          className="btn__check"
          viewBox="0 0 24 24"
          aria-hidden="true"
          width="20"
          height="20"
        >
          <path
            d="M5 13l4 4L19 7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
