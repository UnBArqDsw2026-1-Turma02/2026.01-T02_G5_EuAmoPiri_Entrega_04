/**
 * CAMADA CONTEXTO — AuthContext
 *
 * Gerencia o estado global de autenticação da aplicação.
 * Consome apenas authFacade (padrão Facade em api/auth); não acessa client nem localStorage.
 */
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getCurrentUser,
  getToken,
  login,
  logout,
  register,
  updateProfile,
  fetchMe,
  loadProfilePhotoBlob,
} from '../api/auth/authFacade';

const AuthContext = createContext(null);

async function attachAvatarBlob(user) {
  if (!user?.profilePhotoUrl) {
    return { ...user, avatarUrl: null };
  }

  try {
    const blob = await loadProfilePhotoBlob(user.profilePhotoUrl);
    if (!blob) return { ...user, avatarUrl: null };
    return { ...user, avatarUrl: URL.createObjectURL(blob) };
  } catch {
    return { ...user, avatarUrl: null };
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let avatarUrlToRevoke = null;

    async function bootstrap() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const me = await fetchMe();
        const withAvatar = await attachAvatarBlob(me);
        if (cancelled) {
          if (withAvatar.avatarUrl) URL.revokeObjectURL(withAvatar.avatarUrl);
          return;
        }
        avatarUrlToRevoke = withAvatar.avatarUrl;
        setUser(withAvatar);
      } catch {
        if (!cancelled) {
          await logout();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
      if (avatarUrlToRevoke) URL.revokeObjectURL(avatarUrlToRevoke);
    };
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const { user: loggedUser } = await login(credentials);
      const withAvatar = await attachAvatarBlob(loggedUser);
      setUser(withAvatar);
      return withAvatar;
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
    if (user?.avatarUrl?.startsWith('blob:')) {
      URL.revokeObjectURL(user.avatarUrl);
    }
    await logout();
    setUser(null);
  }, [user]);

  const handleUpdateProfile = useCallback(async (profileData, photoFile) => {
    if (!user) return;

    const previousAvatarUrl = user.avatarUrl;

    try {
      const { user: updated } = await updateProfile(profileData, photoFile);
      if (previousAvatarUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previousAvatarUrl);
      }
      const withAvatar = await attachAvatarBlob(updated);
      setUser(withAvatar);
      return withAvatar;
    } catch (err) {
      setUser((current) => (
        current ? { ...current, avatarUrl: previousAvatarUrl } : current
      ));
      throw err;
    }
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

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
