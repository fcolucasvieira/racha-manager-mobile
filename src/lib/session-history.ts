const KEY = "racha-manager:sessions";

export type StoredSession = {
  id: string;
  label: string;
  createdAt: string;
};

export function readSessions(): StoredSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredSession[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSession(session: StoredSession) {
  if (typeof window === "undefined") return;
  const next = [session, ...readSessions().filter((s) => s.id !== session.id)].slice(0, 20);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}

export function forgetSession(id: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(readSessions().filter((s) => s.id !== id)));
}
