/**
 * Adaptor de Relatos (Experiences)
 *
 * API real disponível: GET /places/:id/experiences, POST /places/:id/experiences
 * Demais operações: mockadas até o backend implementar.
 */
import apiClient from '../../api/client';

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
    id: 2, placeId: 1, userId: 'current', placeName: 'Botequim Mercatto Piri',
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
    id: 4, placeId: 1, userId: 'current', placeName: 'Botequim Mercatto Piri',
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
    id: 7, placeId: 2, userId: 'current', placeName: 'Cachoeira da Rosário',
    userName: 'Lucia Pereira', title: 'Água cristalina!',
    text: 'Uma das cachoeiras mais lindas que já visitei. A trilha é tranquila e a água gelada é perfeita para o calor.',
    rating: 5, cost: '$', reactions: { heart: 9, like: 3 },
    createdAt: daysAgo(3),
  },
  {
    id: 8, placeId: 1,
    userName: 'Antônio Francisco', title: 'Nem bom, nem ruim!',
    text: 'A qualidade das bebidas deixou a desejar bastante. Trouxe minha esposa e meus filhos adultos para comemorar meu aniversário e o que poderia ter sido lendário era ordinário. Ok.',
    rating: 3, cost: '$$', reactions: { heart: 0, like: 23 },
    createdAt: daysAgo(4),
  },
  {
    id: 9, placeId: 6,
    userName: 'Josefina Souza', title: 'Já tive experiências melhores',
    text: 'Olha, nos meus 65 anos de vida eu já tive experiências muito diversas em vários restaurantes pelo país e tenho propriedade para dizer que já centenas de restaurantes melhores em Pirenópolis. A comida veio fria!',
    rating: 1, cost: '$$$', reactions: { heart: 0, like: 5 },
    createdAt: daysAgo(6),
  },
  {
    id: 10, placeId: 6, userId: 'current', placeName: 'Restaurante LovePiri',
    userName: 'Marcos Oliveira', title: 'Boa experiência!',
    text: 'Ambiente muito bonito e a comida estava saborosa. O serviço poderia ser mais ágil, mas no geral valeu muito a visita. Voltarei com certeza.',
    rating: 4, cost: '$$$', reactions: { heart: 7, like: 11 },
    createdAt: daysAgo(9),
  },
];

/* ─── helpers ─── */
function diffDays(isoDate) {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86400000);
}

/* ─── Funções do adaptor ─── */

/**
 * Retorna as experiências do usuário logado (mock: userId === 'current').
 * Inclui `dias` calculado a partir de `createdAt`.
 * TODO: substituir por GET /me/experiences quando o backend implementar.
 */
export async function fetchMyExperiences() {
  return MOCK_EXPERIENCES
    .filter((e) => e.userId === 'current')
    .map((e) => ({ ...e, dias: diffDays(e.createdAt) }));
}

export async function fetchExperiencesByPlaces(placeIds) {
  const ids = placeIds.map(Number);
  return MOCK_EXPERIENCES.filter((e) => ids.includes(e.placeId));
}

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
  const newExp = {
    ...experienceData,
    id:      Date.now(),
    placeId: Number(placeId),
    userId:  'current',   // marca como relato do usuário logado
  };
  MOCK_EXPERIENCES.unshift(newExp);
  return newExp;
}

export async function updateExperience(placeId, experienceId, experienceData) {
  // TODO: substituir por apiClient.put quando disponível
  const idx = MOCK_EXPERIENCES.findIndex(
    (e) => String(e.id) === String(experienceId) && String(e.placeId) === String(placeId)
  );
  if (idx !== -1) {
    MOCK_EXPERIENCES[idx] = {
      ...MOCK_EXPERIENCES[idx],
      ...experienceData,
      createdAt: new Date().toISOString(), // atualiza timestamp ao editar
    };
  }
  return MOCK_EXPERIENCES[idx] ?? { ...experienceData, id: experienceId, placeId };
}

export async function deleteExperience(placeId, experienceId) {
  // TODO: substituir por apiClient.delete quando disponível
  const idx = MOCK_EXPERIENCES.findIndex(
    (e) => String(e.id) === String(experienceId) && String(e.placeId) === String(placeId)
  );
  if (idx !== -1) MOCK_EXPERIENCES.splice(idx, 1);
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
