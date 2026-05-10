import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BentoCard } from "@/components/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useFinance, formatBRL, formatDate } from "@/lib/finance-store";
import { Plus, Trash2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/transactions")({
  component: TransactionsPage,
});

function TransactionsPage() {
  const {
    transactions,
    accounts,
    categories,
    addTransaction,
    removeTransaction,
  } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    type: "expense" as "income" | "expense",
    accountId: accounts[0]?.id ?? "",
    categoryId: categories.find((c) => c.type === "expense")?.id ?? "",
    frequency: "none",
  });

  const sorted = [...transactions].sort((a, b) =>
    b.occurredAt.localeCompare(a.occurredAt),
  );
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  const submit = () => {
    const value = parseFloat(form.amount.replace(",", "."));
    if (!value || !form.accountId || !form.categoryId) {
      toast.error("Preencha valor, conta e categoria");
      return;
    }
    addTransaction({
      accountId: form.accountId,
      categoryId: form.categoryId,
      amount: form.type === "expense" ? -Math.abs(value) : Math.abs(value),
      frequency: form.frequency === "none" ? null : (form.frequency as never),
      occurredAt: new Date().toISOString(),
      description: form.description || undefined,
    });
    toast.success("Transação adicionada");
    setOpen(false);
    setForm({ ...form, description: "", amount: "" });
  };

  const filteredCats = categories.filter((c) => c.type === form.type);

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Movimentações</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Transações
          </h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full">
              <Plus className="mr-2 h-4 w-4" /> Nova transação
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova transação</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Descrição</Label>
                <Input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ex: Mercado da semana"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Valor</Label>
                  <Input
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="0,00"
                  />
                </div>
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v: "income" | "expense") => {
                      const firstCat = categories.find((c) => c.type === v)?.id ?? "";
                      setForm({ ...form, type: v, categoryId: firstCat });
                    }}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="expense">Despesa</SelectItem>
                      <SelectItem value="income">Receita</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Conta</Label>
                  <Select
                    value={form.accountId}
                    onValueChange={(v) => setForm({ ...form, accountId: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => (
                        <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select
                    value={form.categoryId}
                    onValueChange={(v) => setForm({ ...form, categoryId: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {filteredCats.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Frequência</Label>
                <Select
                  value={form.frequency}
                  onValueChange={(v) => setForm({ ...form, frequency: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Única</SelectItem>
                    <SelectItem value="daily">Diária</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={submit}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <BentoCard className="p-0 overflow-hidden">
        <div className="divide-y divide-border">
          {sorted.map((t) => (
            <div key={t.id} className="flex items-center gap-4 p-5 hover:bg-muted/40 transition-colors">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  t.amount > 0
                    ? "bg-[oklch(0.65_0.16_155/0.12)] text-success"
                    : "bg-[oklch(0.6_0.21_25/0.12)] text-destructive"
                }`}
              >
                {t.amount > 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium">
                  {t.description ?? catName(t.categoryId)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {catName(t.categoryId)} · {accName(t.accountId)} · {formatDate(t.occurredAt)}
                </p>
              </div>
              {t.frequency && (
                <Badge variant="secondary" className="hidden sm:inline-flex">
                  {t.frequency}
                </Badge>
              )}
              <p
                className={`font-display text-sm font-semibold tabular-nums ${
                  t.amount > 0 ? "text-success" : "text-destructive"
                }`}
              >
                {formatBRL(t.amount)}
              </p>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                  removeTransaction(t.id);
                  toast.success("Transação removida");
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          {sorted.length === 0 && (
            <p className="p-10 text-center text-sm text-muted-foreground">
              Nenhuma transação ainda.
            </p>
          )}
        </div>
      </BentoCard>
    </AppShell>
  );
}
