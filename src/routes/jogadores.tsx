import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Search, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, notifyError } from "@/lib/api";

export const Route = createFileRoute("/jogadores")({
  head: () => ({
    meta: [
      { title: "Jogadores | Racha Manager" },
      {
        name: "description",
        content: "Cadastre e gerencie os jogadores disponíveis para os rachas da sua turma.",
      },
      { property: "og:title", content: "Jogadores | Racha Manager" },
      {
        property: "og:description",
        content: "Cadastro rápido de jogadores para montar os times do racha.",
      },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");

  const { data, isPending, isError } = useQuery({
    queryKey: ["players"],
    queryFn: () => api.listPlayers(0, 100),
    retry: false,
  });

  const createPlayer = useMutation({
    mutationFn: (playerName: string) => api.createPlayer(playerName),
    onSuccess: () => {
      toast.success("Jogador cadastrado!", { description: `${name.trim()} entrou no plantel.` });
      setName("");
      setOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["players"] });
    },
    onError: notifyError,
  });

  const players = (data?.content ?? []).filter((p) =>
    p.name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <AppShell
      title="Jogadores"
      subtitle={data ? `${data.totalElements} no plantel` : "Plantel do racha"}
      action={
        <Button size="icon" className="rounded-full shadow-glow" onClick={() => setOpen(true)}>
          <Plus className="h-5 w-5" />
          <span className="sr-only">Novo jogador</span>
        </Button>
      }
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar jogador"
          className="h-11 rounded-2xl bg-card pl-9"
        />
      </div>

      <div className="mt-4 space-y-3">
        {isPending ? (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-2xl" />)
        ) : isError ? (
          <p className="rounded-2xl border border-destructive/40 bg-destructive/10 p-4 text-sm">
            Não foi possível carregar os jogadores da API.
          </p>
        ) : players.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/60 p-5 text-sm text-muted-foreground">
            Nenhum jogador encontrado. Toque no + para cadastrar.
          </p>
        ) : (
          players.map((player) => (
            <div
              key={player.id}
              className="shadow-card flex items-center gap-3 rounded-2xl border border-border bg-card p-4"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                {player.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{player.name}</p>
                <p className="truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                  ID {player.id.slice(0, 8)}
                </p>
              </div>
              <UserRound className="h-4 w-4 shrink-0 text-secondary" />
            </div>
          ))
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[22rem] rounded-3xl border-border bg-card">
          <DialogHeader>
            <DialogTitle>Novo jogador</DialogTitle>
            <DialogDescription>Cadastre quem vai entrar na fila do racha.</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = name.trim();
              if (trimmed.length === 0) {
                toast.error("Informe o nome do jogador.");
                return;
              }
              createPlayer.mutate(trimmed);
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="player-name">Nome</Label>
              <Input
                id="player-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex.: Lucas Vieira"
                className="h-11 rounded-xl"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit" className="w-full rounded-xl" disabled={createPlayer.isPending}>
                {createPlayer.isPending ? "Cadastrando..." : "Cadastrar jogador"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
