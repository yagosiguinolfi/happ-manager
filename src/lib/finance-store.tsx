// Mock in-memory store for finance manager (React Context based, no extra deps).
// Mirrors the Prisma schema (Account, Category, Transaction, Reservation).

import { createContext, useContext, useState, type ReactNode } from "react";
import type { Frequency } from "@/enums/frequency.ts";

export type CategoryType = "income" | "expense";

export interface Account {
  id: string;
  name: string;
  balance: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  isFixed: boolean;
  active: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  frequency: Frequency;
  occurredAt: string;
  totalInstallments?: number | null;
  description?: string;
  active: boolean;
}

export interface Reservation {
  id: string;
  accountId: string;
  categoryId: string;
  amount: number;
  frequency: Frequency;
  reservedAt: string;
  description?: string;
  active: boolean;
}

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();
const daysAgo = (n: number) =>
  new Date(Date.now() - n * 86400000).toISOString();

const seedAccounts: Account[] = [
  { id: "a1", name: "Conta Corrente", balance: 8420.55, createdAt: now() },
  { id: "a2", name: "Poupança", balance: 15230.0, createdAt: now() },
  { id: "a3", name: "Cartão Nubank", balance: -1250.32, createdAt: now() },
];

const seedCategories: Category[] = [
  { id: "c1", name: "Salário", type: "income", isFixed: true, active: true },
  { id: "c2", name: "Freelance", type: "income", isFixed: false, active: true },
  { id: "c3", name: "Aluguel", type: "expense", isFixed: true, active: true },
  { id: "c4", name: "Mercado", type: "expense", isFixed: false, active: true },
  { id: "c5", name: "Transporte", type: "expense", isFixed: false, active: true },
  { id: "c6", name: "Lazer", type: "expense", isFixed: false, active: true },
  { id: "c7", name: "Assinaturas", type: "expense", isFixed: true, active: true },
];

const seedTransactions: Transaction[] = [
  { id: uid(), accountId: "a1", categoryId: "c1", amount: 6500, frequency: "monthly", occurredAt: daysAgo(2), description: "Salário Setembro", active: true },
  { id: uid(), accountId: "a1", categoryId: "c3", amount: -1800, frequency: "monthly", occurredAt: daysAgo(3), description: "Aluguel apto", active: true },
  { id: uid(), accountId: "a1", categoryId: "c4", amount: -380.55, frequency: null, occurredAt: daysAgo(1), description: "Compras Pão de Açúcar", active: true },
  { id: uid(), accountId: "a3", categoryId: "c6", amount: -120, frequency: null, occurredAt: daysAgo(4), description: "Cinema + Jantar", active: true },
  { id: uid(), accountId: "a1", categoryId: "c2", amount: 1200, frequency: null, occurredAt: daysAgo(6), description: "Projeto site", active: true },
  { id: uid(), accountId: "a3", categoryId: "c7", amount: -39.9, frequency: "monthly", occurredAt: daysAgo(7), description: "Spotify", active: true },
  { id: uid(), accountId: "a1", categoryId: "c5", amount: -210, frequency: null, occurredAt: daysAgo(8), description: "Combustível", active: true },
  { id: uid(), accountId: "a1", categoryId: "c4", amount: -95.4, frequency: null, occurredAt: daysAgo(10), description: "Padaria semana", active: true },
  { id: uid(), accountId: "a2", categoryId: "c1", amount: 800, frequency: "monthly", occurredAt: daysAgo(15), description: "Aporte poupança", active: true },
];

const seedReservations: Reservation[] = [
  { id: uid(), accountId: "a2", categoryId: "c6", amount: 500, frequency: null, reservedAt: daysAgo(-30), description: "Viagem fim de ano", active: true },
  { id: uid(), accountId: "a1", categoryId: "c7", amount: 200, frequency: "monthly", reservedAt: daysAgo(-7), description: "Reserva assinaturas", active: true },
];

interface FinanceContextValue {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  reservations: Reservation[];
  addTransaction: (t: Omit<Transaction, "id" | "active">) => void;
  removeTransaction: (id: string) => void;
  addCategory: (c: Omit<Category, "id" | "active">) => void;
  removeCategory: (id: string) => void;
  addAccount: (a: Omit<Account, "id" | "createdAt">) => void;
  removeAccount: (id: string) => void;
  addReservation: (r: Omit<Reservation, "id" | "active">) => void;
  removeReservation: (id: string) => void;
}

const FinanceContext = createContext<FinanceContextValue | null>(null);

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(seedAccounts);
  const [categories, setCategories] = useState<Category[]>(seedCategories);
  const [transactions, setTransactions] = useState<Transaction[]>(seedTransactions);
  const [reservations, setReservations] = useState<Reservation[]>(seedReservations);

  const value: FinanceContextValue = {
    accounts,
    categories,
    transactions,
    reservations,
    addTransaction: (t) =>
      setTransactions((prev) => [{ ...t, id: uid(), active: true }, ...prev]),
    removeTransaction: (id) =>
      setTransactions((prev) => prev.filter((t) => t.id !== id)),
    addCategory: (c) =>
      setCategories((prev) => [...prev, { ...c, id: uid(), active: true }]),
    removeCategory: (id) =>
      setCategories((prev) => prev.filter((c) => c.id !== id)),
    addAccount: (a) =>
      setAccounts((prev) => [...prev, { ...a, id: uid(), createdAt: now() }]),
    removeAccount: (id) => setAccounts((prev) => prev.filter((a) => a.id !== id)),
    addReservation: (r) =>
      setReservations((prev) => [{ ...r, id: uid(), active: true }, ...prev]),
    removeReservation: (id) =>
      setReservations((prev) => prev.filter((r) => r.id !== id)),
  };

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}

export const formatBRL = (value: number) =>
  value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
