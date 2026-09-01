import { toast } from "sonner";

export const API_BASE_URL =
  (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "http://localhost:8080";

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
};

export type PlayerDTO = { id: string; name: string };
export type TeamDTO = { number: number; players: PlayerDTO[] };
export type MatchDTO = { teamA?: TeamDTO | null; teamB?: TeamDTO | null };
export type SessionDTO = {
  id: string;
  started: boolean;
  activePlayers: PlayerDTO[];
  currentMatch?: MatchDTO | null;
  queue: TeamDTO[];
};
export type PagePlayerDTO = {
  content: PlayerDTO[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  empty: boolean;
};

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

function messageForStatus(status: number, fallback?: string) {
  if (fallback && fallback.trim().length > 0) return fallback;
  if (status === 400) return "Dados inválidos. Revise as informações e tente novamente.";
  if (status === 404) return "Não encontramos esse registro.";
  if (status === 409) return "Essa ação conflita com o estado atual do racha.";
  if (status >= 500) return "O servidor falhou ao processar. Tente novamente em instantes.";
  return "Não foi possível concluir a operação.";
}

async function request<T>(
  path: string,
  init?: RequestInit & { body?: unknown },
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(init?.body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
      ...(init?.body !== undefined ? { body: JSON.stringify(init.body) } : {}),
    });
  } catch {
    throw new ApiError(0, "Sem conexão com a API do Racha Manager.");
  }

  const raw = await res.text();
  let parsed: unknown = undefined;
  if (raw) {
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = undefined;
    }
  }
  const envelope = (parsed ?? {}) as Partial<ApiResponse<T>> & { error?: string };

  if (!res.ok) {
    throw new ApiError(res.status, messageForStatus(res.status, envelope.message ?? envelope.error));
  }
  return envelope.data as T;
}

export const api = {
  listPlayers: (page = 0, size = 50) =>
    request<PagePlayerDTO>(`/players?page=${page}&size=${size}&sort=name,asc`),
  createPlayer: (name: string) =>
    request<{ id: string }>(`/players`, { method: "POST", body: { name } }),
  createSession: () => request<{ id: string }>(`/sessions`, { method: "POST" }),
  getSession: (sessionId: string) => request<SessionDTO>(`/sessions/${sessionId}`),
  addPlayerToSession: (sessionId: string, playerId: string) =>
    request<TeamDTO[]>(`/sessions/${sessionId}/players/${playerId}`, { method: "POST" }),
  removePlayerFromSession: (sessionId: string, playerId: string) =>
    request<TeamDTO[]>(`/sessions/${sessionId}/players/${playerId}`, { method: "DELETE" }),
  finishMatch: (sessionId: string, resultType: "WINNER" | "DRAW", winnerTeamNumber?: number) =>
    request<void>(`/sessions/${sessionId}/finish-match`, {
      method: "POST",
      body: { resultType, winnerTeamNumber: resultType === "DRAW" ? null : winnerTeamNumber },
    }),
};

export function notifyError(error: unknown) {
  const message =
    error instanceof ApiError ? error.message : "Algo deu errado. Tente novamente.";
  const status = error instanceof ApiError ? error.status : undefined;
  toast.error(message, {
    description: status && status > 0 ? `Erro HTTP ${status}` : undefined,
  });
}
