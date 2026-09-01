import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CalendarClock, ChevronRight, Plus, Trophy, Users } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { api } from "@/lib/api";
import { readSessions, type StoredSession } from "@/lib/session-history";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Racha Manager — Organize seu futebol amador" },
      {
        name: "description",
        content:
          "Monte times equilibrados, controle a fila de espera e acompanhe as partidas do seu racha direto do celular.",
      },
      { property: "og:title", content: "Racha Manager — Organize seu futebol amador" },
      {
        property: "og:description",
        content: "Times equilibrados, fila de espera e placar do racha na palma da mão.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const [sessions, setSessions] = useState<StoredSession[]>([]);

  useEffect(() => {
    setSessions(readSessions());
  }, []);

  const { data: players } = useQuery({
    queryKey: ["players", "count"],
    queryFn: () => api.listPlayers(0, 1),
    retry: false,
  });

  return (
    <AppShell title="Racha Manager" subtitle="Seu racha, organizado de ponta a ponta">
      <section className="gradient-primary shadow-glow relative overflow-hidden rounded-3xl p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/80">
          Bora jogar
        </p>
        <h2 className="mt-1 text-3xl font-bold uppercase text-primary-foreground">
          Comece um racha
        </h2>
        <p className="mt-2 max-w-[15rem] text-sm text-primary-foreground/85">
          A partir de 8 jogadores os times são montados e a fila começa a girar.
        </p>
        <Link
          to="/sessoes"
          className="tap-scale mt-4 inline-flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-sm font-semibold text-foreground"
        >
          <Plus className="h-4 w-4 text-primary" />
          Nova sessão
        </Link>
      </section>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <ShortcutCard
          to="/jogadores"
          icon={<Users className="h-5 w-5 text-secondary" />}
          label="Jogadores"
          value={players ? `${players.totalElements} cadastrados` : "Gerenciar plantel"}
        />
        <ShortcutCard
          to="/sessoes"
          icon={<Trophy className="h-5 w-5 text-primary" />}
          label="Sessões"
          value={sessions.length > 0 ? `${sessions.length} no histórico` : "Criar e acompanhar"}
        />
      </div>

      <section className="mt-7">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Sessões recentes
        </h3>
        {sessions.length === 0 ? (
          <p className="mt-3 rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            Nenhuma sessão ainda. Crie a primeira e ela aparece aqui para acesso rápido.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {sessions.slice(0, 4).map((session) => (
              <li key={session.id}>
                <Link
                  to="/sessoes/$sessionId"
                  params={{ sessionId: session.id }}
                  className="tap-scale shadow-card flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/60"
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </AppShell>
  );
}

function ShortcutCard({
  to,
  icon,
  label,
  value,
}: {
  to: "/jogadores" | "/sessoes";
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      to={to}
      className="tap-scale shadow-card flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/60"
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted">{icon}</span>
      <span>
        <span className="block text-base font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{value}</span>
      </span>
    </Link>
  );
}
