// Simple auth state management (connects to backend when available, localStorage fallback)
import { login as apiLogin, signup as apiSignup } from './api';

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  email: string | null;
}

function getState(): AuthState {
  return {
    isAuthenticated: localStorage.getItem('smartshelf_auth') === 'true',
    token: localStorage.getItem('smartshelf_token'),
    email: localStorage.getItem('smartshelf_email'),
  };
}

export function isAuthenticated(): boolean {
  return getState().isAuthenticated;
}

export function getEmail(): string | null {
  return getState().email;
}

export function getToken(): string | null {
  return getState().token;
}

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiLogin(email, password);
    if (data.token) {
      localStorage.setItem('smartshelf_auth', 'true');
      localStorage.setItem('smartshelf_token', data.token);
      localStorage.setItem('smartshelf_email', email);
      return { success: true };
    }
    return { success: false, error: data.error || 'Invalid credentials' };
  } catch {
    // Demo fallback
    const users = JSON.parse(localStorage.getItem('smartshelf_users') || '{}');
    if (users[email] && users[email] === password) {
      localStorage.setItem('smartshelf_auth', 'true');
      localStorage.setItem('smartshelf_email', email);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }
}

export async function signup(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  try {
    const data = await apiSignup(email, password);
    if (data.success) {
      return { success: true };
    }
    return { success: false, error: data.error || 'Signup failed' };
  } catch {
    // Demo fallback
    const users = JSON.parse(localStorage.getItem('smartshelf_users') || '{}');
    if (users[email]) return { success: false, error: 'User already exists' };
    users[email] = password;
    localStorage.setItem('smartshelf_users', JSON.stringify(users));
    return { success: true };
  }
}

export function logout() {
  localStorage.removeItem('smartshelf_auth');
  localStorage.removeItem('smartshelf_token');
  localStorage.removeItem('smartshelf_email');
}
