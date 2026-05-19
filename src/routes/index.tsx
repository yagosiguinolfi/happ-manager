import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { BentoCard } from "@/components/bento-card";
import { useFinance, formatBRL, formatDate } from "@/lib/finance-store";
import {
  ArrowDownRight,
  ArrowUpRight,
  TrendingUp,
  Wallet,
  PiggyBank,
} from "lucide-react";
import { useEffect } from "react";
import apiClient from "@/lib/api-client";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const { accounts, transactions, categories, reservations } = useFinance();

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const income = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const expenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const reservedTotal = reservations.reduce((s, r) => s + r.amount, 0);

  // Group expenses by category
  const byCategory = categories
    .filter((c) => c.type === "expense")
    .map((c) => ({
      name: c.name,
      total: transactions
        .filter((t) => t.categoryId === c.id && t.amount < 0)
        .reduce((s, t) => s + Math.abs(t.amount), 0),
    }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  const maxCat = byCategory[0]?.total ?? 1;

  const recent = [...transactions]
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .slice(0, 6);

  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";
  const accName = (id: string) => accounts.find((a) => a.id === id)?.name ?? "—";

  useEffect(() => {
    apiClient.get("/health").catch((err) => {
      console.error("API health check failed:", err);
    });
  }, []);

  return (
    <AppShell>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Olá novamente</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            Visão geral
          </h1>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Patrimônio total
          </p>
          <p className="font-display text-3xl font-bold text-primary">
            {formatBRL(totalBalance)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-6 md:auto-rows-[minmax(140px,auto)]">
        {/* Saldo total — destaque */}
        <BentoCard className="md:col-span-3 md:row-span-2 flex flex-col justify-between bg-[var(--gradient-primary)] text-primary-foreground border-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm opacity-80">Saldo consolidado</p>
              <p className="mt-2 font-display text-4xl font-bold md:text-5xl">
                {formatBRL(totalBalance)}
              </p>
            </div>
            <div className="rounded-full bg-white/15 p-3">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {accounts.map((a) => (
              <div key={a.id} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                <p className="text-xs opacity-80">{a.name}</p>
                <p className="mt-1 font-display font-semibold">{formatBRL(a.balance)}</p>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* Income */}
        <BentoCard className="md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="mt-1 font-display text-2xl font-semibold text-success">
                {formatBRL(income)}
              </p>
            </div>
            <div className="rounded-full bg-[oklch(0.65_0.16_155/0.12)] p-2.5 text-success">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </BentoCard>

        {/* Expenses */}
        <BentoCard className="md:col-span-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="mt-1 font-display text-2xl font-semibold text-destructive">
                {formatBRL(expenses)}
              </p>
            </div>
            <div className="rounded-full bg-[oklch(0.6_0.21_25/0.12)] p-2.5 text-destructive">
              <ArrowDownRight className="h-5 w-5" />
            </div>
          </div>
        </BentoCard>

        {/* Despesas por categoria */}
        <BentoCard className="md:col-span-4 md:row-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Despesas por categoria</h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          {byCategory.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sem despesas registradas.</p>
          ) : (
            <ul className="space-y-3">
              {byCategory.map((c) => (
                <li key={c.name}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{c.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatBRL(c.total)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[var(--gradient-primary)]"
                      style={{ width: `${(c.total / maxCat) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>

        {/* Reservado */}
        <BentoCard className="md:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Reservado</p>
              <p className="mt-1 font-display text-2xl font-semibold">
                {formatBRL(reservedTotal)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {reservations.length} reservas ativas
              </p>
            </div>
            <div className="rounded-full bg-accent p-2.5 text-accent-foreground">
              <PiggyBank className="h-5 w-5" />
            </div>
          </div>
        </BentoCard>

        {/* Categorias count */}
        <BentoCard className="md:col-span-2">
          <p className="text-sm text-muted-foreground">Categorias</p>
          <p className="mt-1 font-display text-2xl font-semibold">{categories.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {categories.filter((c) => c.isFixed).length} fixas ·{" "}
            {categories.filter((c) => !c.isFixed).length} variáveis
          </p>
        </BentoCard>

        {/* Recent transactions */}
        <BentoCard className="md:col-span-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">Movimentações recentes</h3>
          </div>
          <div className="divide-y divide-border">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${t.amount > 0
                      ? "bg-[oklch(0.65_0.16_155/0.12)] text-success"
                      : "bg-[oklch(0.6_0.21_25/0.12)] text-destructive"
                      }`}
                  >
                    {t.amount > 0 ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t.description ?? catName(t.categoryId)}</p>
                    <p className="text-xs text-muted-foreground">
                      {catName(t.categoryId)} · {accName(t.accountId)} · {formatDate(t.occurredAt)}
                    </p>
                  </div>
                </div>
                <p
                  className={`font-display text-sm font-semibold tabular-nums ${t.amount > 0 ? "text-success" : "text-destructive"
                    }`}
                >
                  {formatBRL(t.amount)}
                </p>
              </div>
            ))}
          </div>
        </BentoCard>
      </div>
    </AppShell>
  );
}
