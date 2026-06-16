/**
 * Auswahl des aktiven Auth-Clients.
 *
 * - VITE_AUTH_API_BASE leer  -> Mock-Client (localStorage, kein Backend).
 * - VITE_AUTH_API_BASE gesetzt -> HTTP-Client gegen das echte Backend.
 *
 * Die UI kennt nur das AuthClient-Interface und bleibt vom Modus entkoppelt.
 */

import { createHttpAuthClient } from "./httpAuthClient";
import { mockAuthClient } from "./mockAuthClient";
import type { AuthClient } from "./types";

const apiBase = import.meta.env.VITE_AUTH_API_BASE?.trim();

export const isMockMode = !apiBase;

export const authClient: AuthClient = isMockMode
  ? mockAuthClient
  : createHttpAuthClient(apiBase);
