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
import { useFinance, formatBRL, formatDate } from "@/lib/finance-store";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reservations")({
  component: ReservationsPage,
});

function ReservationsPage() {
  const { reservations, accounts, categories, addReservation, removeReservation } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    accountId: accounts[0]?.id ?? "",
    categoryId: categories[0]?.id ?? "",
  });

  const submit = () => {
    const value = parseFloat(form.amount.replace(",", "."));
    if (!value) return toast.error("Informe um valor");
    addReservation({
      accountId: form.accountId,
      categoryId: form.categoryId,
      amount: value,
      frequency: null,
      reservedAt: new Date().toISOString(),
      description: form.description || undefined,
    });
    toast.success("Reserva criada");
    setOpen(false);
    setForm({ ...form, description: "", amount: "" });
  };

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";
  const total = reservations.reduce((s, r) => s + r.amount, 0);

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Planejamento</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Reservas</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Nova reserva</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova reserva</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Descrição</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Ex: Viagem fim de ano" />
              </div>
              <div>
                <Label>Valor</Label>
                <Input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0,00" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Conta</Label>
                  <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {accounts.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Criar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <BentoCard className="mb-5 bg-[var(--gradient-primary)] text-primary-foreground border-0">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-80">Total reservado</p>
            <p className="mt-1 font-display text-3xl font-bold">{formatBRL(total)}</p>
          </div>
          <PiggyBank className="h-10 w-10 opacity-80" />
        </div>
      </BentoCard>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {reservations.map((r) => (
          <BentoCard key={r.id} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{r.description ?? catName(r.categoryId)}</p>
              <p className="text-xs text-muted-foreground">
                {catName(r.categoryId)} · {accName(r.accountId)} · {formatDate(r.reservedAt)}
              </p>
              <p className="mt-2 font-display text-xl font-semibold text-primary">{formatBRL(r.amount)}</p>
            </div>
            <Button size="icon" variant="ghost" onClick={() => { removeReservation(r.id); toast.success("Removida"); }}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </BentoCard>
        ))}
        {reservations.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma reserva ainda.</p>
        )}
      </div>
    </AppShell>
  );
}
