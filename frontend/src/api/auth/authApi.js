/**
 * Cliente HTTP Auth
 *
 * Responsabilidade única: chamadas REST aos endpoints /auth/*.
 */
import apiClient, { patchFormData, fetchBlob } from '../client';

export async function postLogin(email, password) {
  const { data } = await apiClient.post('/auth/login', { email, password });
  return data;
}

export async function postRegister(payload) {
  const { data } = await apiClient.post('/auth/register', payload);
  return data;
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function patchProfile(formData) {
  return patchFormData('/auth/me', formData);
}

export async function getProfilePhotoBlob(profilePhotoUrl) {
  const version = profilePhotoUrl
    ? encodeURIComponent(profilePhotoUrl)
    : String(Date.now());
  return fetchBlob(`/auth/me/photo?v=${version}`);
}

export async function deleteMyAccount() {
  await apiClient.delete('/auth/me');
}
