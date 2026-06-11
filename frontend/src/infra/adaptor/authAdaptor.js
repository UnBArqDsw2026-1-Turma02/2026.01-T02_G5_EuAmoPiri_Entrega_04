/**
 * CAMADA INFRA — Adaptor de Autenticação
 *
 * Totalmente mockado até o backend implementar auth.
 */
import apiClient from '../fetcher/apiClient';

/* Mock de usuário logado */
const MOCK_USERS = [
  { id: 1, name: 'Anna Brandão', email: 'anna@piri.com', role: 'morador',
    bio: '', profession: '', contact: '', birthDate: '', avatarUrl: null },
  { id: 2, name: 'João Turista', email: 'joao@piri.com', role: 'turista',
    bio: '', profession: '', contact: '', birthDate: '', avatarUrl: null },
];

export async function login({ email, password }) {
  // TODO: substituir por apiClient.post('/auth/login', { email, password })
  await new Promise((r) => setTimeout(r, 600)); // simula latência
  const user = MOCK_USERS.find((u) => u.email === email);
  if (!user || password !== '123456') {
    throw new Error('Email ou senha incorretos');
  }
  const token = `mock-token-${user.id}`;
  localStorage.setItem('euamopiri_token', token);
  localStorage.setItem('euamopiri_user', JSON.stringify(user));
  return { user, token };
}

export async function loginWithGoogle() {
  // TODO: implementar OAuth Google
  throw new Error('Login com Google ainda não implementado pelo backend');
}

export async function register({ name, email, password, role }) {
  // TODO: substituir por apiClient.post('/auth/register', ...)
  await new Promise((r) => setTimeout(r, 600));
  const newUser = { id: Date.now(), name, email, role,
    bio: '', profession: '', contact: '', birthDate: '', avatarUrl: null };
  const token = `mock-token-${newUser.id}`;
  localStorage.setItem('euamopiri_token', token);
  localStorage.setItem('euamopiri_user', JSON.stringify(newUser));
  return { user: newUser, token };
}

export async function logout() {
  localStorage.removeItem('euamopiri_token');
  localStorage.removeItem('euamopiri_user');
}

export async function updateProfile(userId, profileData) {
  // TODO: substituir por apiClient.put(`/users/${userId}`, profileData)
  const stored = JSON.parse(localStorage.getItem('euamopiri_user') || '{}');
  const updated = { ...stored, ...profileData };
  localStorage.setItem('euamopiri_user', JSON.stringify(updated));
  return updated;
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('euamopiri_user'));
  } catch {
    return null;
  }
}
