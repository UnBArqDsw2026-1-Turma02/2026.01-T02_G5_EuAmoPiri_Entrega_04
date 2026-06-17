/**
 * Adaptor de Relatos (Experiences) — integração com API REST.
 */
import apiClient, { postFormData } from '../../api/client';
import { fetchPlaces } from './placeAdaptor';
import { resolveMediaUrl } from '../../utils/mediaUrl';

function mapExperience(exp) {
  return {
    ...exp,
    photos: (exp.photos ?? []).map((p) => ({ ...p, url: resolveMediaUrl(p.url) })),
  };
}

const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

const MOCK_EXPERIENCES = [
  {
    id: 1, placeId: 1, userId: 'current',
    userName: 'Maria Silva', title: 'Experiência incrível!',
    text: 'Adorei a comida caseira e o atendimento foi excelente. O ambiente é muito acolhedor e perfeito para passar uma tarde com amigos. Voltarei com certeza!',
    rating: 5, reactions: { heart: 5, like: 1 },
    createdAt: daysAgo(2),
  },
];

function sameUserId(a, b) {
  return a != null && b != null && Number(a) === Number(b);
}

async function fetchMyExperiencesFallback(userId) {
  const places = await fetchPlaces();
  const placeIds = places.map((p) => p.id);
  if (placeIds.length === 0) return [];

  const all = await fetchExperiencesByPlaces(placeIds);
  return all
    .filter((exp) => sameUserId(exp.userId, userId))
    .map((exp) => {
      const place = places.find((p) => Number(p.id) === Number(exp.placeId));
      return mapExperience({
        ...exp,
        placeName: place?.name ?? 'Local',
      });
    })
    .sort((a, b) => new Date(b.createdAt ?? 0) - new Date(a.createdAt ?? 0));
}

export async function fetchMyExperiences(userId) {
  try {
    const { data } = await apiClient.get('/auth/me/experiences');
    return Array.isArray(data) ? data.map(mapExperience) : [];
  } catch (error) {
    const status = error.response?.status;
    if (status === 404 && userId != null) {
      return fetchMyExperiencesFallback(userId);
    }
    throw error;
  }
}

export async function fetchExperiencesByPlaces(placeIds) {
  const ids = placeIds.map(Number);
  const results = await Promise.all(
    ids.map((id) => fetchExperiencesByPlace(id).catch(() => []))
  );
  return results.flat();
}

export async function fetchExperiencesByPlace(placeId) {
  try {
    const { data } = await apiClient.get(`/places/${placeId}/experiences`);
    return Array.isArray(data) ? data.map(mapExperience) : [];
  } catch {
    return MOCK_EXPERIENCES.filter((e) => e.placeId === Number(placeId)).map(mapExperience);
  }
}

export async function createExperience(placeId, experienceData, photoFiles = []) {
  const formData = new FormData();
  formData.append('rating', String(experienceData.rating));
  formData.append('text', experienceData.text);
  formData.append('visitDate', experienceData.visitDate);
  if (experienceData.title) formData.append('title', experienceData.title);
  (photoFiles ?? []).forEach((file) => formData.append('photos', file));

  const data = await postFormData(`/places/${placeId}/experiences`, formData);
  return mapExperience(data);
}

export async function updateExperience(placeId, experienceId, experienceData) {
  console.warn('[mock] updateExperience chamado para id:', experienceId);
  return { ...experienceData, id: experienceId, placeId: Number(placeId) };
}

export async function deleteExperience(placeId, experienceId) {
  console.warn('[mock] deleteExperience chamado para id:', experienceId);
  return { success: true };
}

export async function reactToExperience(placeId, experienceId, emoji) {
  console.warn('[mock] reactToExperience:', emoji, 'em', experienceId);
  return { success: true };
}

export async function reportExperience(placeId, experienceId, reason) {
  console.warn('[mock] reportExperience:', experienceId, reason);
  return { success: true };
}
