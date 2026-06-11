/**
 * CAMADA INFRA — Adaptor de Relatos (Experiences)
 *
 * API real disponível: GET /places/:id/experiences, POST /places/:id/experiences
 * Demais operações: mockadas até o backend implementar.
 */
import apiClient from '../fetcher/apiClient';

/* ─── Dados mock ─── */
const MOCK_EXPERIENCES = [
  {
    id: 1,
    placeId: 1,
    userName: 'Maria Silva',
    text: 'Adorei a comida caseira e o atendimento foi excelente. O ambiente é muito acolhedor e perfeito para passar uma tarde com amigos. Voltarei com certeza!',
    rating: 5,
    visitDate: '2026-05-08',
    photos: [],
    reactions: { heart: 12, gem: 5 },
    createdAt: new Date('2026-06-09').toISOString(),
  },
  {
    id: 2,
    placeId: 1,
    userName: 'Antônio Francisco',
    text: 'A qualidade das bebidas deixou a desejar bastante. Trouxe minha esposa e meus filhos adultos para comemorar meu aniversário e o que poderia ter sido lendário era ordinário. Ok.',
    rating: 3,
    visitDate: '2026-05-06',
    photos: [],
    reactions: { heart: 23, gem: 2 },
    createdAt: new Date('2026-06-07').toISOString(),
  },
  {
    id: 3,
    placeId: 1,
    userName: 'Josefina Souza',
    text: 'Já tive experiências melhores. Olha, nos meus 65 anos de vida já tive experiências muito diversas em vários restaurantes pelo país e tenho propriedade para dizer que já centenas de restaurantes melhores em Pirenópolis. A comida veio fria!',
    rating: 2,
    visitDate: '2026-05-04',
    photos: [],
    reactions: { heart: 5, gem: 1 },
    createdAt: new Date('2026-06-05').toISOString(),
  },
];

/* ─── Funções do adaptor ─── */

export async function fetchExperiencesByPlace(placeId) {
  try {
    const { data } = await apiClient.get(`/places/${placeId}/experiences`);
    return data;
  } catch {
    // TODO: remover mock quando o backend retornar texto dos relatos
    return MOCK_EXPERIENCES.filter((e) => e.placeId === Number(placeId));
  }
}

export async function createExperience(placeId, experienceData) {
  const { data } = await apiClient.post(`/places/${placeId}/experiences`, experienceData);
  return data;
}

export async function updateExperience(placeId, experienceId, experienceData) {
  // TODO: substituir por apiClient.put quando disponível
  console.warn('[mock] updateExperience:', experienceId);
  return { ...experienceData, id: experienceId, placeId };
}

export async function deleteExperience(placeId, experienceId) {
  // TODO: substituir por apiClient.delete quando disponível
  console.warn('[mock] deleteExperience:', experienceId);
  return { success: true };
}

export async function reactToExperience(placeId, experienceId, emoji) {
  // TODO: substituir quando o backend implementar
  console.warn('[mock] reactToExperience:', emoji, 'em', experienceId);
  return { success: true };
}

export async function reportExperience(placeId, experienceId, reason) {
  // TODO: substituir quando o backend implementar
  console.warn('[mock] reportExperience:', experienceId, reason);
  return { success: true };
}
