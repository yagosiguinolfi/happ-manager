import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  Wallet,
  PiggyBank,
  Users,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";

const baseNav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transações", icon: ArrowLeftRight },
  { to: "/accounts", label: "Contas", icon: Wallet },
  { to: "/categories", label: "Categorias", icon: Tags },
  { to: "/reservations", label: "Reservas", icon: PiggyBank },
] as const;

const adminNav = [{ to: "/users", label: "Usuários", icon: Users }] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (!user) return null;

  const nav = user.role === "admin" ? [...baseNav, ...adminNav] : baseNav;

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-2 border-r border-border bg-sidebar p-6 md:flex">
          <Link to="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display font-bold">
              F
            </div>
            <div>
              <div className="font-display text-base font-semibold leading-tight">Finanças</div>
              <div className="text-xs text-muted-foreground">Gerenciador pessoal</div>
            </div>
          </Link>
          <nav className="flex flex-col gap-1">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active
                      ? "bg-primary text-primary-foreground shadow-[var(--shadow-soft)]"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-elevated p-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-display text-sm font-semibold">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.role === "admin" ? "Administrador" : "Usuário"}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  logout();
                  navigate({ to: "/login" });
                }}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </aside>

        <main className="flex-1 px-5 py-6 md:px-10 md:py-10">
          <div className="md:hidden mb-6 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-display text-xs font-semibold">
                {initials}
              </div>
              <span className="text-sm font-medium">{user.name}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="md:hidden mb-6 flex gap-2 overflow-x-auto pb-2">
            {nav.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium ${active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
