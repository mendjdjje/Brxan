/**
 * Geteilte Eingabevalidierung fuer Login, Registrierung und Lizenz.
 * Eine einzige Quelle der Wahrheit — von allen Formularen wiederverwendet.
 *
 * Die Grenzen fuer Benutzername/Passwort entsprechen dem FastAPI-Backend
 * (username 2..32, password 4..128), damit Mock- und Live-Modus konsistent sind.
 */

export const USERNAME_MIN = 2;
export const USERNAME_MAX = 32;
export const PASSWORD_MIN = 4;
export const PASSWORD_MAX = 128;

/** Erlaubt Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich. */
const USERNAME_PATTERN = /^[a-zA-Z0-9._-]+$/;

/** Lizenzformat: vier Vierergruppen aus A-Z und 0-9, per Bindestrich getrennt. */
const LICENSE_PATTERN = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
const LICENSE_BLOCKS = 4;
const LICENSE_BLOCK_LEN = 4;

/**
 * Liefert eine Fehlermeldung (deutsch) oder `null`, wenn gueltig.
 */
export function validateUsername(value: string): string | null {
  const v = value.trim();
  if (v.length === 0) return "Bitte gib einen Benutzernamen ein.";
  if (v.length < USERNAME_MIN)
    return `Mindestens ${USERNAME_MIN} Zeichen erforderlich.`;
  if (v.length > USERNAME_MAX)
    return `Höchstens ${USERNAME_MAX} Zeichen erlaubt.`;
  if (!USERNAME_PATTERN.test(v))
    return "Nur Buchstaben, Ziffern, Punkt, Unterstrich und Bindestrich.";
  return null;
}

export function validatePassword(value: string): string | null {
  if (value.length === 0) return "Bitte gib ein Passwort ein.";
  if (value.length < PASSWORD_MIN)
    return `Mindestens ${PASSWORD_MIN} Zeichen erforderlich.`;
  if (value.length > PASSWORD_MAX)
    return `Höchstens ${PASSWORD_MAX} Zeichen erlaubt.`;
  return null;
}

export function validatePasswordConfirm(
  password: string,
  confirm: string,
): string | null {
  if (confirm.length === 0) return "Bitte bestätige dein Passwort.";
  if (password !== confirm) return "Die Passwörter stimmen nicht überein.";
  return null;
}

export interface PasswordStrength {
  /** Punktzahl 0..4 */
  score: 0 | 1 | 2 | 3 | 4;
  /** Bezeichnung der Stufe (deutsch) */
  label: string;
}

/**
 * Heuristische Passwortstaerke: Laenge plus Zeichenklassen.
 * Bewusst leichtgewichtig (keine externe Abhaengigkeit).
 */
export function scorePassword(password: string): PasswordStrength {
  const labels = ["Sehr schwach", "Schwach", "Mittel", "Stark", "Sehr stark"];
  if (password.length === 0) return { score: 0, label: labels[0] };

  let points = 0;
  if (password.length >= 8) points += 1;
  if (password.length >= 12) points += 1;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/].filter((re) =>
    re.test(password),
  ).length;
  if (classes >= 2) points += 1;
  if (classes >= 3) points += 1;

  const score = Math.min(4, points) as PasswordStrength["score"];
  return { score, label: labels[score] };
}

/**
 * Normalisiert Roh-Eingaben zu Grossbuchstaben + Bindestrich-Gruppen.
 * Beispiel: "abcd1234efgh5678" -> "ABCD-1234-EFGH-5678".
 */
export function formatLicenseKey(raw: string): string {
  const cleaned = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, LICENSE_BLOCKS * LICENSE_BLOCK_LEN);
  const blocks: string[] = [];
  for (let i = 0; i < cleaned.length; i += LICENSE_BLOCK_LEN) {
    blocks.push(cleaned.slice(i, i + LICENSE_BLOCK_LEN));
  }
  return blocks.join("-");
}

export function validateLicenseKey(value: string): string | null {
  const v = value.trim().toUpperCase();
  if (v.length === 0) return "Bitte gib einen Lizenzschlüssel ein.";
  if (!LICENSE_PATTERN.test(v))
    return "Format: XXXX-XXXX-XXXX-XXXX (Buchstaben und Ziffern).";
  return null;
}

export function isLicenseKeyValid(value: string): boolean {
  return validateLicenseKey(value) === null;
}
