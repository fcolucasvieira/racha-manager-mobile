import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Handshake, ListOrdered, Minus, Plus, Trophy, Users } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api, notifyError, type PlayerDTO, type TeamDTO } from "@/lib/api";

export const Route = createFileRoute("/sessoes/$sessionId")({
  head: () => ({
    meta: [
      { title: "Sessão ativa | Racha Manager" },
      {
        name: "description",
        content:
          "Gerencie a fila de espera, monte os times e finalize as partidas da sessão de racha em andamento.",
      },
      { property: "og:title", content: "Sessão ativa | Racha Manager" },
      {
        property: "og:description",
        content: "Fila de espera, times em quadra e resultado das partidas do racha.",
      },
    ],
  }),
  component: SessionDetail,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-muted-foreground">
      {error.message}
    </div>
  ),
});

function SessionDetail() {
  const { sessionId } = Route.useParams();
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const sessionQuery = useQuery({
    queryKey: ["session", sessionId],
    queryFn: () => api.getSession(sessionId),
    retry: false,
  });

  const playersQuery = useQuery({
    queryKey: ["players"],
    queryFn: () => api.listPlayers(0, 100),
    retry: false,
    enabled: showAdd,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["session", sessionId] });

  const addPlayer = useMutation({
    mutationFn: (playerId: string) => api.addPlayerToSession(sessionId, playerId),
    onSuccess: () => {
      toast.success("Jogador adicionado à sessão.");
      void refresh();
    },
    onError: notifyError,
  });

  const removePlayer = useMutation({
    mutationFn: (playerId: string) => api.removePlayerFromSession(sessionId, playerId),
    onSuccess: () => {
      toast.success("Jogador removido da sessão.");
      void refresh();
    },
    onError: notifyError,
  });

  const finishMatch = useMutation({
    mutationFn: (input: { resultType: "WINNER" | "DRAW"; winnerTeamNumber?: number }) =>
      api.finishMatch(sessionId, input.resultType, input.winnerTeamNumber),
    onSuccess: (_data, input) => {
      toast.success(
        input.resultType === "DRAW" ? "Empate registrado!" : `Time ${input.winnerTeamNumber} venceu!`,
        { description: "Fila atualizada automaticamente." },
      );
      void refresh();
    },
    onError: notifyError,
  });

  const session = sessionQuery.data;
  const active = session?.activePlayers ?? [];
  const inMatch = new Set<string>();
  session?.currentMatch?.teamA?.players?.forEach((p) => inMatch.add(p.id));
  session?.currentMatch?.teamB?.players?.forEach((p) => inMatch.add(p.id));
  const availablePlayers = (playersQuery.data?.content ?? []).filter(
    (p) => !active.some((a) => a.id === p.id),
  );

  return (
    <AppShell
      title="Sessão de racha"
      subtitle={`ID ${sessionId.slice(0, 8)} • ${session?.started ? "Em andamento" : "Aguardando 8 jogadores"}`}
      action={
        <Button
          size="icon"
          className="rounded-full shadow-glow"
          onClick={() => setShowAdd((v) => !v)}
        >
          {showAdd ? <Minus className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          <span className="sr-only">Adicionar jogador</span>
        </Button>
      }
    >
      {sessionQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      ) : sessionQuery.isError ? (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
          Não foi possível carregar essa sessão. Verifique se ela ainda existe na API.
        </p>
      ) : (
        <>
          {showAdd && (
            <section className="mb-5 rounded-3xl border border-secondary/40 bg-card p-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-secondary">
                Adicionar jogadores
              </h2>
              <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
                {playersQuery.isPending ? (
                  <Skeleton className="h-12 rounded-xl" />
                ) : availablePlayers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Todos os jogadores cadastrados já estão nesta sessão.
                  </p>
                ) : (
                  availablePlayers.map((player) => (
                    <button
                      key={player.id}
                      onClick={() => addPlayer.mutate(player.id)}
                      disabled={addPlayer.isPending}
                      className="tap-scale flex w-full items-center justify-between rounded-xl border border-border bg-muted/40 px-4 py-3 text-left text-sm font-medium"
                    >
                      <span className="truncate">{player.name}</span>
                      <Plus className="h-4 w-4 shrink-0 text-primary" />
                    </button>
                  ))
                )}
              </div>
            </section>
          )}

          <section className="shadow-card rounded-3xl border border-border bg-card p-4">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <h2 className="truncate text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Partida atual
              </h2>
              <Badge className="shrink-0 bg-primary/15 text-primary">
                {session?.started ? "Ao vivo" : "Sem partida"}
              </Badge>
            </div>

            {session?.currentMatch?.teamA && session?.currentMatch?.teamB ? (
              <>
                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                  <TeamColumn team={session.currentMatch.teamA} tone="primary" />
                  <span className="mt-6 text-xs font-bold uppercase text-muted-foreground">vs</span>
                  <TeamColumn team={session.currentMatch.teamB} tone="secondary" />
                </div>
                <div className="mt-5 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      className="rounded-xl"
                      disabled={finishMatch.isPending}
                      onClick={() =>
                        finishMatch.mutate({
                          resultType: "WINNER",
                          winnerTeamNumber: session.currentMatch?.teamA?.number,
                        })
                      }
                    >
                      <Trophy className="mr-1 h-4 w-4" />
                      Time {session.currentMatch.teamA.number}
                    </Button>
                    <Button
                      variant="secondary"
                      className="rounded-xl"
                      disabled={finishMatch.isPending}
                      onClick={() =>
                        finishMatch.mutate({
                          resultType: "WINNER",
                          winnerTeamNumber: session.currentMatch?.teamB?.number,
                        })
                      }
                    >
                      <Trophy className="mr-1 h-4 w-4" />
                      Time {session.currentMatch.teamB.number}
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl"
                    disabled={finishMatch.isPending}
                    onClick={() => finishMatch.mutate({ resultType: "DRAW" })}
                  >
                    <Handshake className="mr-1 h-4 w-4" />
                    Registrar empate
                  </Button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                A partida começa automaticamente quando o oitavo jogador entrar na sessão.
              </p>
            )}
          </section>

          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <ListOrdered className="h-4 w-4 text-secondary" />
              Fila de espera
            </h2>
            {(session?.queue ?? []).length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
                Nenhum time aguardando na fila.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {session!.queue.map((team, index) => (
                  <li
                    key={team.number}
                    className="shadow-card rounded-2xl border border-border bg-card p-4"
                  >
                    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                      <p className="truncate text-sm font-semibold">Time {team.number}</p>
                      <Badge className="shrink-0 bg-secondary/15 text-secondary">
                        {index + 1}º na fila
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {team.players.map((p) => p.name).join(" • ") || "Sem jogadores"}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="mt-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              <Users className="h-4 w-4 text-primary" />
              Jogadores na sessão ({active.length})
            </h2>
            {active.length === 0 ? (
              <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 p-4 text-sm text-muted-foreground">
                Adicione jogadores para iniciar o racha.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {active.map((player: PlayerDTO) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 pl-4"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {player.name}
                    </span>
                    {inMatch.has(player.id) ? (
                      <Badge className="shrink-0 bg-primary/15 text-primary">Em quadra</Badge>
                    ) : null}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      disabled={removePlayer.isPending}
                      onClick={() => removePlayer.mutate(player.id)}
                    >
                      <Minus className="h-4 w-4" />
                      <span className="sr-only">Remover {player.name}</span>
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </AppShell>
  );
}

function TeamColumn({ team, tone }: { team: TeamDTO; tone: "primary" | "secondary" }) {
  return (
    <div
      className={`rounded-2xl border p-3 ${
        tone === "primary"
          ? "border-primary/40 bg-primary/10"
          : "border-secondary/40 bg-secondary/10"
      }`}
    >
      <p
        className={`text-xs font-bold uppercase tracking-wide ${
          tone === "primary" ? "text-primary" : "text-secondary"
        }`}
      >
        Time {team.number}
      </p>
      <ul className="mt-2 space-y-1">
        {team.players.map((p) => (
          <li key={p.id} className="truncate text-xs text-muted-foreground">
            {p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
