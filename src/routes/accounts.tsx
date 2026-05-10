import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BentoCard } from "@/components/bento-card";
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
import { useFinance, formatBRL } from "@/lib/finance-store";
import { Plus, Trash2, Wallet } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/accounts")({
  component: AccountsPage,
});

function AccountsPage() {
  const { accounts, transactions, addAccount, removeAccount } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", balance: "" });

  const txCount = (id: string) => transactions.filter((t) => t.accountId === id).length;

  const submit = () => {
    if (!form.name) return toast.error("Informe o nome");
    addAccount({
      name: form.name,
      balance: parseFloat(form.balance.replace(",", ".") || "0"),
    });
    toast.success("Conta criada");
    setOpen(false);
    setForm({ name: "", balance: "" });
  };

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Suas contas</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Contas</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Nova conta</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova conta</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Conta Corrente" />
              </div>
              <div>
                <Label>Saldo inicial</Label>
                <Input value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0,00" />
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Criar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {accounts.map((a) => (
          <BentoCard key={a.id} className="flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Wallet className="h-5 w-5" />
              </div>
              <Button size="icon" variant="ghost" onClick={() => { removeAccount(a.id); toast.success("Conta removida"); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{a.name}</p>
              <p className={`mt-1 font-display text-2xl font-bold ${a.balance < 0 ? "text-destructive" : ""}`}>
                {formatBRL(a.balance)}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">{txCount(a.id)} transações</p>
            </div>
          </BentoCard>
        ))}
      </div>
    </AppShell>
  );
}
