import { useEffect, useState } from 'react';
import apiClient from './api-client';

const TOKEN_KEY = 'authToken';
let currentUser: any | null | undefined = undefined;
let currentUserPromise: Promise<any> | null = null;

export const setToken = (token: string) => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};

const setCurrentUser = (user: any | null) => {
  currentUser = user;
  currentUserPromise = null;
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('auth:user-changed', { detail: user }));
  }
};

export async function login(email: string, password: string) {
  const res = await apiClient.post('/auth/login', { email, password });
  const token = res.data?.token;
  const user = res.data?.user;
  if (token) setToken(token);
  setCurrentUser(user ?? null);
  return user;
}

export async function logout() {
  clearToken();
  setCurrentUser(null);
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('auth:logout'));
}

export async function signup(data: { name: string; email: string; password: string }) {
  await apiClient.post('/users', data);
  return login(data.email, data.password);
}

export async function getCurrentUser() {
  if (currentUser !== undefined) {
    return currentUser;
  }
  if (!currentUserPromise) {
    currentUserPromise = apiClient
      .get('/auth/me')
      .then((res) => {
        setCurrentUser(res.data ?? null);
        return currentUser;
      })
      .catch((err) => {
        setCurrentUser(null);
        throw err;
      });
  }
  return currentUserPromise;
}

export async function getUsers() {
  const res = await apiClient.get('/users');
  return res.data;
}

export async function createUser(data: { name: string; email: string; password: string; admin?: boolean }) {
  const res = await apiClient.post('/users', data);
  return res.data;
}

export async function updateUser(id: string, patch: Record<string, unknown>) {
  const res = await apiClient.put(`/users/${id}`, patch);
  return res.data;
}

export async function removeUser(id: string) {
  const res = await apiClient.delete(`/users/${id}`);
  return res.data;
}

export async function resetPassword(id: string, password: string) {
  const res = await apiClient.put(`/users/${id}`, { password });
  return res.data;
}

export function useCurrentUser() {
  const [user, setUser] = useState<any | null | undefined>(currentUser);
  useEffect(() => {
    let mounted = true;
    if (user === undefined) {
      (async () => {
        try {
          const u = await getCurrentUser();
          if (mounted) setUser(u);
        } catch {
          if (mounted) setUser(null);
        }
      })();
    }

    const onLogout = () => setUser(null);
    const onUserChanged = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      setUser(customEvent.detail ?? null);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('auth:logout', onLogout);
      window.addEventListener('auth:user-changed', onUserChanged);
    }
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') {
        window.removeEventListener('auth:logout', onLogout);
        window.removeEventListener('auth:user-changed', onUserChanged);
      }
    };
  }, [user]);
  return user;
}

export function useUsers() {
  const [users, setUsers] = useState<any[]>([]);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getUsers();
        if (mounted) setUsers(list);
      } catch {
        if (mounted) setUsers([]);
      }
    })();

    const onLogout = () => setUsers([]);
    if (typeof window !== 'undefined') window.addEventListener('auth:logout', onLogout);
    return () => {
      mounted = false;
      if (typeof window !== 'undefined') window.removeEventListener('auth:logout', onLogout);
    };
  }, []);
  return users;
}
