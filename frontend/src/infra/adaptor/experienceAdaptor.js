/**
 * Adaptor de Relatos (Experiences) — integração com API REST.
 */
import apiClient, { postFormData } from '../../api/client';
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

function diffDays(isoDate) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
}

export async function fetchMyExperiences() {
  return MOCK_EXPERIENCES
    .filter((e) => e.userId === 'current')
    .map((e) => ({ ...e, dias: diffDays(e.createdAt) }));
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
