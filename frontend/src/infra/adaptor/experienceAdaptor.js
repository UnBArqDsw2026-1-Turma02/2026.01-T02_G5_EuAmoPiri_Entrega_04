/**
 * CAMADA INFRA — Adaptor de Relatos (Experiences)
 *
 * API real disponível: GET /places/:id/experiences, POST /places/:id/experiences
 * Demais operações: mockadas até o backend implementar.
 */
import apiClient from '../fetcher/apiClient';

/* ─── Dados mock ─── */
const now = Date.now();
const daysAgo = (d) => new Date(now - d * 86400000).toISOString();

const MOCK_EXPERIENCES = [
  {
    id: 1, placeId: 1,
    userName: 'Maria Silva', title: 'Experiência incrível!',
    text: 'Adorei a comida caseira e o atendimento foi excelente. O ambiente é muito acolhedor e perfeito para passar uma tarde com amigos. Voltarei com certeza!',
    rating: 5, cost: '$$', reactions: { heart: 5, like: 1 },
    createdAt: daysAgo(2),
  },
  {
    id: 2, placeId: 1,
    userName: 'João Santos', title: 'Melhor botequim de Pirenópolis',
    text: 'Recomendo demais! A qualidade da comida é impecável e os preços são justos. Já visitei várias vezes e nunca decepcionou. Definitivamente um local imprescindível.',
    rating: 5, cost: '$$$', reactions: { heart: 12, like: 3 },
    createdAt: daysAgo(5),
  },
  {
    id: 3, placeId: 1,
    userName: 'Ana Costa', title: 'Muito bom, mas poderia melhorar',
    text: 'O botequim é ótimo, mas na minha última visita o atendimento foi um pouco lento. Mesmo assim, voltaria. A comida compensa qualquer pequeno inconveniente.',
    rating: 4, cost: '$$', reactions: { heart: 2, like: 6 },
    createdAt: daysAgo(7),
  },
  {
    id: 4, placeId: 1,
    userName: 'Carlos Mendes', title: 'Ambiente aconchegante',
    text: 'Lugar perfeito para um almoço tranquilo. A comida é saborosa e o ambiente muito agradável. Recomendo especialmente aos finais de semana.',
    rating: 5, cost: '$$', reactions: { heart: 8, like: 2 },
    createdAt: daysAgo(14),
  },
  {
    id: 5, placeId: 1,
    userName: 'Fernanda Lima', title: 'Decepcionante na última visita',
    text: 'Já fui outras vezes e sempre gostei, mas dessa vez o serviço deixou muito a desejar. Espero que seja algo pontual.',
    rating: 2, cost: '$', reactions: { heart: 1, like: 4 },
    createdAt: daysAgo(20),
  },
  {
    id: 6, placeId: 1,
    userName: 'Roberto Alves', title: 'Vale cada centavo!',
    text: 'Excelente custo-benefício. A porção é generosa e o sabor é autêntico. Recomendo especialmente o frango ao molho.',
    rating: 5, cost: '$$$', reactions: { heart: 15, like: 7 },
    createdAt: daysAgo(30),
  },
  {
    id: 7, placeId: 2,
    userName: 'Lucia Pereira', title: 'Água cristalina!',
    text: 'Uma das cachoeiras mais lindas que já visitei. A trilha é tranquila e a água gelada é perfeita para o calor.',
    rating: 5, cost: '$', reactions: { heart: 9, like: 3 },
    createdAt: daysAgo(3),
  },
];

/* ─── Funções do adaptor ─── */

export async function fetchExperiencesByPlace(placeId) {
  // TODO: descomentar quando backend estiver integrado
  // try {
  //   const { data } = await apiClient.get(`/places/${placeId}/experiences`);
  //   return Array.isArray(data) ? data : [];
  // } catch { /* fallthrough para mock */ }
  return MOCK_EXPERIENCES.filter((e) => e.placeId === Number(placeId));
}

export async function createExperience(placeId, experienceData) {
  // TODO: descomentar quando backend estiver integrado
  // const { data } = await apiClient.post(`/places/${placeId}/experiences`, experienceData);
  // return data;
  const newExp = { ...experienceData, id: Date.now(), placeId: Number(placeId) };
  MOCK_EXPERIENCES.unshift(newExp);
  return newExp;
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
