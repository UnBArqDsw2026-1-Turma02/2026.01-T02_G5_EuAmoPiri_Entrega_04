/**
 * Adaptor de Locais — integração com API REST.
 */
import apiClient, { postFormData, patchFormData } from '../../api/client';
import { resolveMediaUrl } from '../../utils/mediaUrl';

function mapPlace(place) {
  if (!place) return place;
  const cover = place.coverImage ?? place.photos?.[0]?.url;
  return {
    ...place,
    coverImage: resolveMediaUrl(cover),
    photos: (place.photos ?? []).map((p) => ({
      ...p,
      url: resolveMediaUrl(p.url),
    })),
  };
}

export async function fetchPlaces() {
  try {
    const { data } = await apiClient.get('/places');
    return Array.isArray(data) ? data.map(mapPlace) : [];
  } catch {
    return [];
  }
}

export async function fetchPlaceById(id) {
  const { data } = await apiClient.get(`/places/${id}`);
  return mapPlace(data);
}

export async function createPlace(formData) {
  try {
    const data = await postFormData('/places', formData);
    return mapPlace(data);
  } catch (error) {
    if (error.response) throw error;
    const wrapped = new Error(error.message ?? 'Erro ao cadastrar o local.');
    wrapped.cause = error;
    throw wrapped;
  }
}

export async function updatePlace(id, formData) {
  try {
    const data = await patchFormData(`/places/${id}`, formData);
    return mapPlace(data);
  } catch (error) {
    if (error.response) throw error;
    const wrapped = new Error(error.message ?? 'Erro ao atualizar o local.');
    wrapped.cause = error;
    throw wrapped;
  }
}

export async function deletePlace(id) {
  await apiClient.delete(`/places/${id}`);
  return { success: true };
}

export async function fetchMyPlaces(moradorId) {
  try {
    const { data } = await apiClient.get('/places', { params: { moradorId } });
    return Array.isArray(data) ? data.map(mapPlace) : [];
  } catch {
    return [];
  }
}
