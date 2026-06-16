/**
 * Mock-Auth-Client: simuliert ein Backend per localStorage.
 * Aktiv, wenn keine VITE_AUTH_API_BASE gesetzt ist — die Seite laeuft
 * dadurch sofort ohne echtes Backend.
 *
 * Hinweis: Die "Passwort-Hashes" hier sind bewusst nur eine Demo und
 * keine echte Kryptografie. Im Live-Modus uebernimmt das FastAPI-Backend
 * die sichere Passwortspeicherung.
 */

import {
  AuthError,
  type AuthClient,
  type Credentials,
  type LicenseInfo,
  type Session,
} from "./types";
import { isLicenseKeyValid } from "./validation";

const USERS_KEY = "keyauth.mock.users";
const LICENSES_KEY = "keyauth.mock.redeemedLicenses";

interface StoredUser {
  username: string;
  passwordHash: string;
}

/** Kuenstliche Latenz, damit Ladezustaende sichtbar werden. */
function delay(ms = 650): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Einfacher, deterministischer Demo-Hash (kein Sicherheitsmerkmal). */
function demoHash(input: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readRedeemed(): Record<string, string> {
  try {
    const raw = localStorage.getItem(LICENSES_KEY);
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

function writeRedeemed(map: Record<string, string>): void {
  localStorage.setItem(LICENSES_KEY, JSON.stringify(map));
}

function makeToken(username: string): string {
  const rnd = Math.random().toString(36).slice(2, 10);
  return `mock.${demoHash(username)}.${rnd}`;
}

function makeSession(username: string): Session {
  return {
    token: makeToken(username),
    user: { username },
    issuedAt: new Date().toISOString(),
  };
}

/**
 * Leitet Plan und Ablaufdatum deterministisch aus dem Schluessel ab,
 * damit derselbe Schluessel stets dasselbe Ergebnis liefert.
 */
function deriveLicense(key: string): LicenseInfo {
  const plans = ["Starter", "Pro", "Team", "Enterprise"];
  const seed = demoHash(key);
  const planIndex = parseInt(seed.slice(0, 2), 16) % plans.length;
  const days = 30 + (parseInt(seed.slice(2, 4), 16) % 12) * 30;
  const expires = new Date();
  expires.setDate(expires.getDate() + days);
  return {
    key,
    plan: plans[planIndex],
    expiresAt: expires.toISOString(),
  };
}

export const mockAuthClient: AuthClient = {
  async login({ username, password }: Credentials): Promise<Session> {
    await delay();
    const user = readUsers().find((u) => u.username === username.trim());
    if (!user || user.passwordHash !== demoHash(password)) {
      throw new AuthError(
        "invalid_credentials",
        "Benutzername oder Passwort ist falsch.",
      );
    }
    return makeSession(user.username);
  },

  async signup({ username, password }: Credentials): Promise<Session> {
    await delay();
    const name = username.trim();
    const users = readUsers();
    if (users.some((u) => u.username === name)) {
      throw new AuthError(
        "username_taken",
        "Dieser Benutzername ist bereits vergeben.",
      );
    }
    users.push({ username: name, passwordHash: demoHash(password) });
    writeUsers(users);
    return makeSession(name);
  },

  async redeemLicense(_token: string, licenseKey: string): Promise<LicenseInfo> {
    await delay(750);
    const key = licenseKey.trim().toUpperCase();
    if (!isLicenseKeyValid(key)) {
      throw new AuthError(
        "invalid_license",
        "Der Lizenzschlüssel ist ungültig.",
      );
    }
    // Demonstriert den Fehlerpfad: ein bereits eingeloester Schluessel
    // (anderer Nutzer/Token) kann nicht erneut verwendet werden.
    const redeemed = readRedeemed();
    if (redeemed[key] && redeemed[key] !== _token) {
      throw new AuthError(
        "invalid_license",
        "Dieser Lizenzschlüssel wurde bereits eingelöst.",
      );
    }
    redeemed[key] = _token;
    writeRedeemed(redeemed);
    return deriveLicense(key);
  },
};
