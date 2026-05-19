import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BentoCard } from "@/components/bento-card";
import { useCurrentUser, useUsers, createUser, updateUser, removeUser, resetPassword } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, ShieldCheck, ShieldOff, KeyRound } from "lucide-react";

export const Route = createFileRoute("/users")({
  component: UsersPage,
  head: () => ({
    meta: [
      { title: "Usuários — Finanças" },
      { name: "description", content: "Gestão de usuários do sistema." },
    ],
  }),
});

function UsersPage() {
  const user = useCurrentUser();
  const users = useUsers();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pwOpenFor, setPwOpenFor] = useState<string | null>(null);
  const [newPw, setNewPw] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    admin: false,
  });

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
    else if (user !== undefined && !user.admin) navigate({ to: "/" });
  }, [user, navigate]);

  if (user === undefined) return null;
  if (!user || !user.admin) return null;

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        admin: form.admin,
      });
      toast.success("Usuário criado");
      setOpen(false);
      setForm({ name: "", email: "", password: "", admin: false });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro");
    }
  };

  const totalAdmins = users.filter((u) => u.admin).length;
  const totalActive = users.filter((u) => u.active).length;

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Administração</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            Gestão de usuários
          </h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4" /> Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cadastrar novo usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="n">Nome</Label>
                <Input id="n" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} maxLength={80} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="e">E-mail</Label>
                <Input id="e" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required maxLength={120} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="p">Senha</Label>
                  <Input id="p" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
                </div>
                <div className="space-y-2">
                  <Label>Perfil</Label>
                  <Select value={form.admin ? "true" : "false"} onValueChange={(v: string) => setForm({ ...form, admin: v === "true" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Usuário</SelectItem>
                      <SelectItem value="true">Administrador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Criar</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-6">
        <BentoCard className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Total de usuários</p>
          <p className="mt-1 font-display text-3xl font-semibold">{users.length}</p>
        </BentoCard>
        <BentoCard className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Ativos</p>
          <p className="mt-1 font-display text-3xl font-semibold text-success">{totalActive}</p>
        </BentoCard>
        <BentoCard className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Administradores</p>
          <p className="mt-1 font-display text-3xl font-semibold text-primary">{totalAdmins}</p>
        </BentoCard>

        <BentoCard className="md:col-span-6 p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Nome</th>
                  <th className="text-left font-medium px-5 py-3">E-mail</th>
                  <th className="text-left font-medium px-5 py-3">Perfil</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === user.id;
                  return (
                    <tr key={u.id} className="border-t border-border">
                      <td className="px-5 py-3 font-medium">{u.name}{isSelf && <span className="ml-2 text-xs text-muted-foreground">(você)</span>}</td>
                      <td className="px-5 py-3 text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-3">
                        <Select
                          value={u.admin ? "true" : "false"}
                          onValueChange={async (v: string) => {
                            try {
                              await updateUser(u.id, { admin: v === "true" });
                              toast.success("Perfil atualizado");
                            } catch (err) {
                              toast.error(err instanceof Error ? err.message : "Erro");
                            }
                          }}
                          disabled={isSelf}
                        >
                          <SelectTrigger className="h-8 w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="false">Usuário</SelectItem>
                            <SelectItem value="true">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant={u.active ? "default" : "secondary"}>
                          {u.active ? "Ativo" : "Desativado"}
                        </Badge>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={u.active ? "Desativar" : "Ativar"}
                            disabled={isSelf}
                            onClick={async () => {
                              try {
                                await updateUser(u.id, { active: !u.active });
                                toast.success(u.active ? "Usuário desativado" : "Usuário ativado");
                              } catch (err) {
                                toast.error(err instanceof Error ? err.message : "Erro");
                              }
                            }}
                          >
                            {u.active ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                          </Button>
                          <Dialog open={pwOpenFor === u.id} onOpenChange={(o) => { setPwOpenFor(o ? u.id : null); setNewPw(""); }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" title="Redefinir senha">
                                <KeyRound className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Redefinir senha de {u.name}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <Label htmlFor={`pw-${u.id}`}>Nova senha</Label>
                                <Input id={`pw-${u.id}`} type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} minLength={6} />
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={async () => {
                                    if (newPw.length < 6) return toast.error("Mínimo 6 caracteres");
                                    try {
                                      await resetPassword(u.id, newPw);
                                      toast.success("Senha redefinida");
                                      setPwOpenFor(null);
                                      setNewPw("");
                                    } catch (err) {
                                      toast.error(err instanceof Error ? err.message : "Erro");
                                    }
                                  }}
                                >
                                  Salvar
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Remover"
                            disabled={isSelf}
                            onClick={async () => {
                              if (confirm(`Remover ${u.name}?`)) {
                                try {
                                  await removeUser(u.id);
                                  toast.success("Usuário removido");
                                } catch (err) {
                                  toast.error(err instanceof Error ? err.message : "Erro");
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </BentoCard>
      </div>
    </AppShell>
  );
}
