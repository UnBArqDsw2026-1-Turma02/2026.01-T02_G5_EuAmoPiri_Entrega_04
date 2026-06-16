/**
 * CAMADA CONTEXTO — AuthContext
 *
 * Gerencia o estado global de autenticação da aplicação.
 * Reutilizado por: ProtectedRoute, Header, qualquer componente
 * que precise saber se o usuário está logado e qual seu papel.
 *
 * Reutilização (Atomic Design → Context): este hook centraliza
 * a lógica de auth, evitando que cada componente acesse o
 * localStorage diretamente.
 */
import { createContext, useContext, useState, useCallback } from 'react';
import { getCurrentUser, login, logout, register, updateProfile } from '../infra/adaptor/authAdaptor';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { user: loggedUser } = await login(credentials);
      setUser(loggedUser);
      return loggedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser } = await register(data);
      setUser(newUser);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const handleUpdateProfile = useCallback(async (profileData) => {
    if (!user) return;
    const updated = await updateProfile(user.id, profileData);
    setUser(updated);
    return updated;
  }, [user]);

  const isAuthenticated = Boolean(user);
  const isMorador = user?.role === 'morador';
  const isTurista = user?.role === 'turista';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated,
      isMorador,
      isTurista,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      updateProfile: handleUpdateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook de conveniência — reutilizado em todos os componentes que precisam de auth */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
