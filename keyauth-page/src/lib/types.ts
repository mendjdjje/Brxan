/**
 * Gemeinsame Typen fuer die Auth-Domaene.
 * Werden von Mock- und HTTP-Client sowie dem AuthContext geteilt.
 */

export interface User {
  username: string;
}

export interface Session {
  token: string;
  user: User;
  /** Zeitpunkt der Anmeldung (ISO-String) */
  issuedAt: string;
  /** Aktuell eingeloeste Lizenz, falls vorhanden */
  license?: LicenseInfo;
}

export interface LicenseInfo {
  /** Normalisierter Schluessel im Format XXXX-XXXX-XXXX-XXXX */
  key: string;
  /** Produkt-/Plan-Bezeichnung */
  plan: string;
  /** Ablaufdatum (ISO-String) */
  expiresAt: string;
}

export type AuthMode = "login" | "signup" | "license";

/** Fehlercodes, die die UI gezielt behandeln kann. */
export type AuthErrorCode =
  | "invalid_credentials"
  | "username_taken"
  | "invalid_license"
  | "not_authenticated"
  | "network"
  | "unknown";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/** Anmeldedaten fuer Login und Registrierung. */
export interface Credentials {
  username: string;
  password: string;
}

/**
 * Vertrag, den jeder Auth-Client (Mock oder HTTP) erfuellen muss.
 * Erlaubt das transparente Umschalten zwischen Backend und Mock.
 */
export interface AuthClient {
  login(credentials: Credentials): Promise<Session>;
  signup(credentials: Credentials): Promise<Session>;
  redeemLicense(token: string, licenseKey: string): Promise<LicenseInfo>;
}
