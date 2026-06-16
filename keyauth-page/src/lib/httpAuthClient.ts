/**
 * HTTP-Auth-Client gegen ein echtes Backend.
 * Aktiv, sobald VITE_AUTH_API_BASE gesetzt ist.
 *
 * Kompatibel zum vorhandenen FastAPI-Schema:
 *   POST {base}/api/auth/signup  { username, password } -> { token, username }
 *   POST {base}/api/auth/login   { username, password } -> { token, username }
 *   409 = Benutzername vergeben, 401 = ungueltige Anmeldedaten.
 */

import {
  AuthError,
  type AuthClient,
  type Credentials,
  type LicenseInfo,
  type Session,
} from "./types";
import { isLicenseKeyValid } from "./validation";

interface AuthResponse {
  token: string;
  username: string;
}

function createHttpAuthClient(baseUrl: string): AuthClient {
  const base = baseUrl.replace(/\/+$/, "");

  async function authRequest(
    path: string,
    credentials: Credentials,
  ): Promise<Session> {
    let res: Response;
    try {
      res = await fetch(`${base}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: credentials.username.trim(),
          password: credentials.password,
        }),
      });
    } catch {
      throw new AuthError(
        "network",
        "Verbindung zum Server fehlgeschlagen. Bitte später erneut versuchen.",
      );
    }

    if (!res.ok) {
      if (res.status === 409) {
        throw new AuthError(
          "username_taken",
          "Dieser Benutzername ist bereits vergeben.",
        );
      }
      if (res.status === 401) {
        throw new AuthError(
          "invalid_credentials",
          "Benutzername oder Passwort ist falsch.",
        );
      }
      throw new AuthError(
        "unknown",
        `Unerwarteter Serverfehler (${res.status}).`,
      );
    }

    const data = (await res.json()) as AuthResponse;
    return {
      token: data.token,
      user: { username: data.username },
      issuedAt: new Date().toISOString(),
    };
  }

  return {
    login(credentials) {
      return authRequest("/api/auth/login", credentials);
    },
    signup(credentials) {
      return authRequest("/api/auth/signup", credentials);
    },
    async redeemLicense(_token, licenseKey): Promise<LicenseInfo> {
      // Das aktuelle Backend stellt (noch) keinen Lizenz-Endpunkt bereit.
      // Wir validieren clientseitig das Format und liefern eine klare
      // Fehlermeldung, falls ungueltig — der Endpunkt kann hier ergaenzt
      // werden, sobald das Backend ihn anbietet.
      if (!isLicenseKeyValid(licenseKey)) {
        throw new AuthError(
          "invalid_license",
          "Der Lizenzschlüssel ist ungültig.",
        );
      }
      throw new AuthError(
        "invalid_license",
        "Lizenz-Einlösung ist im Live-Modus noch nicht verfügbar.",
      );
    },
  };
}

export { createHttpAuthClient };
