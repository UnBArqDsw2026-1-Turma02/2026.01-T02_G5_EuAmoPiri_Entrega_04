import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getCurrentUser,
  getToken,
  login,
  logout,
  register,
  updateProfile,
  fetchMe,
} from '../api/auth/authFacade';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError]     = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const token = getToken();
      if (!token) { setLoading(false); return; }

      try {
        const me = await fetchMe();
        if (!cancelled) setUser(me);
      } catch (err) {
        if (!cancelled) {
          // 401 = token inválido/expirado → desloga
          // Outros erros (rede, backend fora) → mantém sessão local em cache
          const status = err?.response?.status ?? err?.status;
          if (status === 401) {
            await logout();
            setUser(null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();
    return () => { cancelled = true; };
  }, []);

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

  const handleUpdateProfile = useCallback(async (profileData, photoFile) => {
    if (!user) return;
    try {
      const { user: updated } = await updateProfile(profileData, photoFile);
      setUser(updated);
      return updated;
    } catch (err) {
      throw err;
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: Boolean(user),
      isMorador:       user?.role === 'morador',
      isTurista:       user?.role === 'turista',
      login:           handleLogin,
      register:        handleRegister,
      logout:          handleLogout,
      updateProfile:   handleUpdateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
