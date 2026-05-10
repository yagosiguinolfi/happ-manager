import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { BentoCard } from "@/components/bento-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { useFinance, type CategoryType } from "@/lib/finance-store";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/categories")({
  component: CategoriesPage,
});

function CategoriesPage() {
  const { categories, addCategory, removeCategory } = useFinance();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<{ name: string; type: CategoryType; isFixed: boolean }>({
    name: "",
    type: "expense",
    isFixed: false,
  });

  const submit = () => {
    if (!form.name) return toast.error("Informe o nome");
    addCategory(form);
    toast.success("Categoria criada");
    setOpen(false);
    setForm({ name: "", type: "expense", isFixed: false });
  };

  const income = categories.filter((c) => c.type === "income");
  const expense = categories.filter((c) => c.type === "expense");

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Organização</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">Categorias</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-full"><Plus className="mr-2 h-4 w-4" /> Nova categoria</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nova categoria</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Saúde" />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.type} onValueChange={(v: CategoryType) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="expense">Despesa</SelectItem>
                    <SelectItem value="income">Receita</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <Label>Fixa (recorrente)</Label>
                  <p className="text-xs text-muted-foreground">Como aluguel, salário, assinaturas</p>
                </div>
                <Switch checked={form.isFixed} onCheckedChange={(v) => setForm({ ...form, isFixed: v })} />
              </div>
            </div>
            <DialogFooter><Button onClick={submit}>Criar</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <BentoCard>
          <h3 className="mb-4 font-display text-lg font-semibold text-success">Receitas</h3>
          <ul className="space-y-2">
            {income.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  {c.isFixed && <Badge variant="secondary">Fixa</Badge>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => { removeCategory(c.id); toast.success("Removida"); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </BentoCard>

        <BentoCard>
          <h3 className="mb-4 font-display text-lg font-semibold text-destructive">Despesas</h3>
          <ul className="space-y-2">
            {expense.map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{c.name}</span>
                  {c.isFixed && <Badge variant="secondary">Fixa</Badge>}
                </div>
                <Button size="icon" variant="ghost" onClick={() => { removeCategory(c.id); toast.success("Removida"); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </BentoCard>
      </div>
    </AppShell>
  );
}
