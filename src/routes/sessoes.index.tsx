import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { api, notifyError } from "@/lib/api";
import { forgetSession, readSessions, saveSession, type StoredSession } from "@/lib/session-history";

export const Route = createFileRoute("/sessoes/")({
  head: () => ({
    meta: [
      { title: "Sessões de Racha | Racha Manager" },
      {
        name: "description",
        content: "Crie uma nova sessão de racha e retome o acompanhamento das partidas em andamento.",
      },
      { property: "og:title", content: "Sessões de Racha | Racha Manager" },
      {
        property: "og:description",
        content: "Abra um racha, gerencie a fila e acompanhe as partidas em tempo real.",
      },
    ],
  }),
  component: SessionsPage,
});

function SessionsPage() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    setSessions(readSessions());
  }, []);

  const createSession = useMutation({
    mutationFn: () => api.createSession(),
    onSuccess: (data) => {
      const stored: StoredSession = {
        id: data.id,
        label: `Racha de ${new Date().toLocaleDateString("pt-BR")}`,
        createdAt: new Date().toISOString(),
      };
      saveSession(stored);
      setSessions(readSessions());
      toast.success("Sessão criada!", { description: "Adicione jogadores para começar." });
      void navigate({ to: "/sessoes/$sessionId", params: { sessionId: data.id } });
    },
    onError: notifyError,
  });

  return (
    <AppShell
      title="Sessões"
      subtitle="Rachas criados neste dispositivo"
      action={
        <Button
          size="icon"
          className="rounded-full shadow-glow"
          onClick={() => createSession.mutate()}
          disabled={createSession.isPending}
        >
          <Plus className="h-5 w-5" />
          <span className="sr-only">Nova sessão</span>
        </Button>
      }
    >
      <Button
        className="h-12 w-full rounded-2xl text-base font-semibold"
        onClick={() => createSession.mutate()}
        disabled={createSession.isPending}
      >
        {createSession.isPending ? "Criando sessão..." : "Criar nova sessão de racha"}
      </Button>

      <div className="mt-6 space-y-3">
        {sessions.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            Nenhuma sessão salva. Crie uma sessão para gerenciar times e fila de espera.
          </p>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className="shadow-card flex items-center gap-2 rounded-2xl border border-border bg-card p-2 pl-4"
            >
              <Link
                to="/sessoes/$sessionId"
                params={{ sessionId: session.id }}
                className="tap-scale flex min-w-0 flex-1 items-center gap-3 py-2"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-secondary/15">
                  <CalendarClock className="h-5 w-5 text-secondary" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{session.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {new Date(session.createdAt).toLocaleString("pt-BR")}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => {
                  forgetSession(session.id);
                  setSessions(readSessions());
                  toast.success("Sessão removida da lista local.");
                }}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Remover da lista</span>
              </Button>
            </div>
          ))
        )}
      </div>
    </AppShell>
  );
}
