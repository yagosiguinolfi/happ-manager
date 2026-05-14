import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Wallet } from "lucide-react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({
    meta: [
      { title: "Entrar — Finanças" },
      { name: "description", content: "Acesse sua conta para gerenciar suas finanças." },
    ],
  }),
});

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/" });
  }, [user, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bem-vindo de volta!");
      navigate({ to: "/" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-background">
      <div className="hidden md:flex flex-col justify-between p-12 text-primary-foreground bg-[var(--gradient-primary)]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 font-display font-bold">
            F
          </div>
          <span className="font-display text-lg font-semibold">Finanças</span>
        </div>
        <div>
          <h1 className="font-display text-4xl font-bold leading-tight">
            Controle total das suas finanças, em um só lugar.
          </h1>
          <p className="mt-4 text-white/80 max-w-md">
            Visualize contas, transações, categorias e reservas em um dashboard moderno e claro.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Wallet className="h-4 w-4" /> Demo com dados locais
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <h2 className="font-display text-3xl font-semibold tracking-tight">Entrar</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Use suas credenciais para acessar o painel.
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground text-center">
            Não tem conta?{" "}
            <Link to="/signup" className="font-medium text-primary hover:underline">
              Criar conta
            </Link>
          </p>

          <div className="mt-8 rounded-xl border border-border bg-surface-elevated p-4 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Contas demo</p>
            <p className="mt-1">admin@demo.com / admin123 (admin)</p>
            <p>maria@demo.com / 123456 (user)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
