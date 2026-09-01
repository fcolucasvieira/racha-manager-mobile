import { Link } from "@tanstack/react-router";
import { Home, Users, Trophy, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

const navItems: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/", label: "Início", icon: Home },
  { to: "/jogadores", label: "Jogadores", icon: Users },
  { to: "/sessoes", label: "Rachas", icon: Trophy },
];

export function AppShell({ title, subtitle, action, children }: Props) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/85 px-5 pb-4 pt-6 backdrop-blur-xl">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold uppercase tracking-wide">{title}</h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
          {action}
        </div>
      </header>

      <main className="flex-1 px-5 pb-28 pt-5">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto w-full max-w-md border-t border-border/70 bg-background/95 px-4 pb-5 pt-2 backdrop-blur-xl">
        <ul className="flex items-center justify-between">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <Link
                to={to}
                activeOptions={{ exact: to === "/" }}
                activeProps={{ "data-active": "true" }}
                className="tap-scale group flex flex-col items-center gap-1 rounded-xl py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground data-[active=true]:text-primary"
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
