/**
 * Fachada de Autenticação (padrão Facade)
 *
 * Orquestra authApi, authMapper e authSessionStorage.
 * Ponto único de entrada para AuthContext e páginas.
 */
import * as authApi from './authApi';
import {
  mapApiUserToFrontend,
  mapProfileToApi,
  mapRegisterToApi,
} from './authMapper';
import {
  persistSession,
  saveUser,
  clearSession,
  getCurrentUser,
  getToken,
} from './authSessionStorage';

export { mapApiUserToFrontend, mapProfileToApi } from './authMapper';
export { getCurrentUser, getToken } from './authSessionStorage';

function extractErrorMessage(error) {
  return error.response?.data?.error ?? error.message ?? 'Erro inesperado';
}

async function hydrateUserAvatar(user) {
  if (!user?.profilePhotoUrl) return user;

  try {
    const blob = await loadProfilePhotoBlob(user.profilePhotoUrl);
    if (blob) {
      return { ...user, avatarUrl: URL.createObjectURL(blob) };
    }
  } catch {
    // Mantém iniciais quando a foto não puder ser carregada
  }

  return user;
}

function buildProfileFormData(profileData, photoFile) {
  const formData = new FormData();
  const apiFields = mapProfileToApi(profileData);

  Object.entries(apiFields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  if (photoFile) {
    formData.append('profilePhoto', photoFile);
  }

  return formData;
}

export async function login({ email, password }) {
  try {
    const data = await authApi.postLogin(email, password);
    let user = mapApiUserToFrontend(data.user);
    user = await hydrateUserAvatar(user);
    persistSession({ user, token: data.token });
    return { user, token: data.token };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function register(input) {
  try {
    const data = await authApi.postRegister(mapRegisterToApi(input));
    let user = mapApiUserToFrontend(data.user);
    user = await hydrateUserAvatar(user);
    persistSession({ user, token: data.token });
    return { user, token: data.token };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function logout() {
  clearSession();
}

export async function fetchMe() {
  try {
    const data = await authApi.getMe();
    let user = mapApiUserToFrontend(data.user);
    user = await hydrateUserAvatar(user);
    saveUser(user);
    return user;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function loadProfilePhotoBlob(profilePhotoUrl) {
  try {
    return await authApi.getProfilePhotoBlob(profilePhotoUrl);
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

export async function updateProfile(profileData, photoFile) {
  try {
    const data = await authApi.patchProfile(buildProfileFormData(profileData, photoFile));
    let user = mapApiUserToFrontend(data.user);
    user = await hydrateUserAvatar(user);
    saveUser(user);
    return { user, message: data.message };
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}

export async function deleteMyAccount() {
  try {
    await authApi.deleteMyAccount();
    clearSession();
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
}
