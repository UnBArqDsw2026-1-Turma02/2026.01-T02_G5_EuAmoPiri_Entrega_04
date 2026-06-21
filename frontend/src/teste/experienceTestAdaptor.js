/**
 * Adaptador de teste RF12/RF13 — não commitar (pasta src/teste/).
 */
import apiClient from '../api/client';

export async function fetchExperiencesByPlace(placeId) {
  const { data } = await apiClient.get(`/places/${placeId}/experiences`);
  return Array.isArray(data) ? data : [];
}

export async function fetchPlaces() {
  const { data } = await apiClient.get('/places');
  return Array.isArray(data) ? data : [];
}

export async function fetchCommentsByExperience(placeId, experienceId) {
  try {
    const { data } = await apiClient.get(
      `/places/${placeId}/experiences/${experienceId}/comments`
    );
    return Array.isArray(data) ? data : [];
  } catch (err) {
    const status = err.response?.status;
    const isHtml = typeof err.response?.data === 'string';
    if (status === 404 && isHtml) {
      const e = new Error(
        'Endpoint de comentários não encontrado. Reinicie o backend (npm run dev na pasta backend).'
      );
      e.code = 'ENDPOINT_MISSING';
      throw e;
    }
    if (status === 404) {
      return [];
    }
    throw err;
  }
}

export async function createComment(placeId, experienceId, text) {
  const { data } = await apiClient.post(
    `/places/${placeId}/experiences/${experienceId}/comments`,
    { text }
  );
  return data;
}

export async function reactToExperience(placeId, experienceId, reaction) {
  const { data } = await apiClient.post(
    `/places/${placeId}/experiences/${experienceId}/react`,
    { reaction }
  );
  return data;
}
