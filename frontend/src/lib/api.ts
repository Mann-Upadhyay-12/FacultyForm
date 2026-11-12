/**
 * Small fetch wrapper for the API gateway.
 * Attaches the session token and broadcasts an event when the server says the
 * session is no longer valid, so the app can send the user back to login.
 */
export const API_URL: string = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/+$/, '');

const TOKEN_KEY = 'juit_auth_token';
export const SESSION_ENDED_EVENT = 'auth:session-ended';

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* storage unavailable (private mode) — session lasts for this tab only */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignore */
    }
  }
};

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError('Unable to reach the server. Please check your connection and try again.', 0, 'NETWORK');
  }

  let body: { error?: string; code?: string } & Record<string, unknown> = {};
  try {
    body = await response.json();
  } catch {
    /* non-JSON response */
  }

  if (!response.ok) {
    if (response.status === 401 && token) {
      tokenStore.clear();
      window.dispatchEvent(new CustomEvent(SESSION_ENDED_EVENT, { detail: body.error }));
    }
    const fallback =
      response.status === 429
        ? 'Too many attempts. Please wait a few minutes and try again.'
        : response.status >= 500
          ? 'The server is having trouble right now. Please try again shortly.'
          : 'Something went wrong. Please try again.';
    throw new ApiError(body.error || fallback, response.status, body.code);
  }

  return body as T;
}
