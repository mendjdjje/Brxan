/**
 * Wiederverwendbares Eingabefeld: Label, optionales Icon, Inline-Fehler
 * und (fuer Passwoerter) ein Sichtbarkeits-Umschalter.
 */

import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "./Field.css";

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  /** Fehlertext; aktiviert den Fehlerzustand, wenn gesetzt. */
  error?: string | null;
  /** Icon links im Feld. */
  icon?: ReactNode;
  /** Hinweistext unter dem Feld (wenn kein Fehler vorliegt). */
  hint?: string;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, icon, hint, type = "text", className, ...rest },
  ref,
) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const [revealed, setRevealed] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword && revealed ? "text" : type;
  const describedBy = error ? errorId : hint ? hintId : undefined;

  return (
    <div className={`field ${error ? "field--error" : ""} ${className ?? ""}`}>
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        {icon && (
          <span className="field__icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={inputType}
          className={`field__input ${icon ? "field__input--with-icon" : ""}`}
          aria-invalid={error ? true : undefined}
          {...(describedBy ? { "aria-describedby": describedBy } : {})}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setRevealed((v) => !v)}
            aria-label={revealed ? "Passwort verbergen" : "Passwort anzeigen"}
            aria-pressed={revealed}
            tabIndex={0}
          >
            {revealed ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {error ? (
        <p className="field__message field__message--error" id={errorId} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field__message" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
});

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.2 4.2M9.9 5.2A9.5 9.5 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.5 7.5A17 17 0 0 0 2 12s3.5 7 10 7a9.6 9.6 0 0 0 3.4-.6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
