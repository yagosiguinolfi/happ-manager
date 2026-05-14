// Mock auth store — local users, persisted in localStorage. No backend.
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextValue {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { name: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  createUser: (data: { name: string; email: string; password: string; role: UserRole }) => void;
  updateUser: (id: string, patch: Partial<Pick<User, "name" | "email" | "role" | "active">>) => void;
  removeUser: (id: string) => void;
  resetPassword: (id: string, password: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = "fin.users";
const SESSION_KEY = "fin.session";
const uid = () => Math.random().toString(36).slice(2, 10);

const seed: StoredUser[] = [
  {
    id: "u1",
    name: "Admin Demo",
    email: "admin@demo.com",
    password: "admin123",
    role: "admin",
    active: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "u2",
    name: "Maria Silva",
    email: "maria@demo.com",
    password: "123456",
    role: "user",
    active: true,
    createdAt: new Date().toISOString(),
  },
];

const isBrowser = () => typeof window !== "undefined";

const loadUsers = (): StoredUser[] => {
  if (!isBrowser()) return seed;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as StoredUser[];
  } catch {
    return seed;
  }
};

const saveUsers = (users: StoredUser[]) => {
  if (isBrowser()) localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
};

const loadSession = (): string | null => {
  if (!isBrowser()) return null;
  return localStorage.getItem(SESSION_KEY);
};

const stripPwd = (u: StoredUser): User => {
  const { password: _password, ...rest } = u;
  return rest;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>(() => loadUsers());
  const [sessionId, setSessionId] = useState<string | null>(() => loadSession());
  const [ready, setReady] = useState(isBrowser());

  useEffect(() => {
    if (!ready) {
      setStoredUsers(loadUsers());
      setSessionId(loadSession());
      setReady(true);
    }
  }, [ready]);

  const persist = (next: StoredUser[]) => {
    setStoredUsers(next);
    saveUsers(next);
  };

  const user = sessionId ? storedUsers.find((u) => u.id === sessionId) ?? null : null;

  const value: AuthContextValue = {
    user: user ? stripPwd(user) : null,
    users: storedUsers.map(stripPwd),
    login: async (email, password) => {
      const found = storedUsers.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password,
      );
      if (!found) throw new Error("E-mail ou senha inválidos");
      if (!found.active) throw new Error("Usuário desativado");
      setSessionId(found.id);
      if (isBrowser()) localStorage.setItem(SESSION_KEY, found.id);
    },
    signup: async ({ name, email, password }) => {
      if (storedUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("Já existe um usuário com este e-mail");
      }
      const newUser: StoredUser = {
        id: uid(),
        name,
        email,
        password,
        role: "user",
        active: true,
        createdAt: new Date().toISOString(),
      };
      const next = [...storedUsers, newUser];
      persist(next);
      setSessionId(newUser.id);
      if (isBrowser()) localStorage.setItem(SESSION_KEY, newUser.id);
    },
    logout: () => {
      setSessionId(null);
      if (isBrowser()) localStorage.removeItem(SESSION_KEY);
    },
    createUser: ({ name, email, password, role }) => {
      if (storedUsers.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("E-mail já cadastrado");
      }
      persist([
        ...storedUsers,
        {
          id: uid(),
          name,
          email,
          password,
          role,
          active: true,
          createdAt: new Date().toISOString(),
        },
      ]);
    },
    updateUser: (id, patch) => {
      persist(storedUsers.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    },
    removeUser: (id) => {
      persist(storedUsers.filter((u) => u.id !== id));
      if (sessionId === id) {
        setSessionId(null);
        if (isBrowser()) localStorage.removeItem(SESSION_KEY);
      }
    },
    resetPassword: (id, password) => {
      persist(storedUsers.map((u) => (u.id === id ? { ...u, password } : u)));
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // During SSR/pre-hydration, return a safe stub
    return {
      user: null,
      users: [],
      login: async () => {},
      signup: async () => {},
      logout: () => {},
      createUser: () => {},
      updateUser: () => {},
      removeUser: () => {},
      resetPassword: () => {},
    } as AuthContextValue;
  }
  return ctx;
}
