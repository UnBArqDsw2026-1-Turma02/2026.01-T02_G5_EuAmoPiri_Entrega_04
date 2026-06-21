/**
 * Adaptor de Locais — integração com API REST.
 */
import apiClient, { postFormData, patchFormData } from '../../api/client';
import { resolveMediaUrl } from '../../utils/mediaUrl';

/* ─── Mapeamento de fotos do backend ─── */
function mapPlace(place) {
  if (!place) return place;
  return {
    ...place,
    coverImage: resolveMediaUrl(place.coverImage ?? place.photos?.[0]?.url),
    photos: (place.photos ?? []).map((p) => ({ ...p, url: resolveMediaUrl(p.url) })),
  };
}

/* ─── Lê o ID do usuário logado do localStorage ─── */
function getLoggedUserId() {
  try {
    const user = JSON.parse(localStorage.getItem('euamopiri_user') ?? 'null');
    return user?.id ?? null;
  } catch { return null; }
}

/* ─── Dados mock (usados enquanto o backend não implementa) ─── */
const MOCK_PLACES = [
  {
    id: 1, name: 'Botequim Mercatto Piri', category: 'gastronomia',
    description: 'Um autêntico botequim no coração do centro histórico, oferecendo comida caseira e bebidas locais em ambiente acolhedor.',
    address: 'R. Direita, 68 - Centro Histórico, Pirenópolis',
    price: '$$', rating: 4.9, reviewsCount: 128, commentsCount: 342, visitsCount: '1.2K',
    hours: '11h - 22h', phone: '(62) 3331-1234',
    coverImage: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=300&q=70',
    lat: -15.8490, lng: -48.9568, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-10').toISOString(),
    moradorId: 1,
  },
  {
    id: 2, name: 'Cachoeira da Rosário', category: 'natureza',
    description: 'Uma das cachoeiras mais visitadas de Pirenópolis, com águas cristalinas e trilha de fácil acesso.',
    address: 'Estrada da Rosário, km 3, Pirenópolis',
    price: '$', rating: 4.8, reviewsCount: 50, commentsCount: 98, visitsCount: '800',
    hours: '8h - 17h', phone: null,
    coverImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=300&q=70',
    lat: -15.8312, lng: -48.9423, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-15').toISOString(),
    moradorId: 1,
  },
  {
    id: 3, name: 'Trilha do Poço Azul', category: 'natureza',
    description: 'Trilha de dificuldade média com chegada em uma piscina natural de água azul.',
    address: 'Zona Rural - Pirenópolis',
    price: '$$$', rating: 4.5, reviewsCount: 300, commentsCount: 210, visitsCount: '2.1K',
    hours: '7h - 16h', phone: null,
    coverImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=70',
    lat: -15.8654, lng: -48.9234, photos: [], mapsLink: null,
    createdAt: new Date('2026-04-20').toISOString(),
    moradorId: 1,
  },
  {
    id: 4, name: 'Igreja Matriz de N. S. do Rosário', category: 'cultura',
    description: 'Igreja tombada pelo IPHAN, símbolo da arquitetura colonial de Pirenópolis.',
    address: 'Praça da Matriz, s/n - Centro, Pirenópolis',
    price: '$', rating: 4.7, reviewsCount: 220, commentsCount: 180, visitsCount: '3.5K',
    hours: '8h - 18h', phone: '(62) 3331-0000',
    coverImage: 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=300&q=70',
    lat: -15.8497, lng: -48.9575, photos: [], mapsLink: null,
    createdAt: new Date('2026-03-10').toISOString(),
    moradorId: 1,
  },
  {
    id: 5, name: 'Pousada das Cavalhadas', category: 'hospedagem',
    description: 'Pousada aconchegante no centro histórico, a passos dos principais pontos turísticos.',
    address: 'Rua das Cavalhadas, 42 - Centro, Pirenópolis',
    price: '$$', rating: 4.6, reviewsCount: 80, commentsCount: 64, visitsCount: '500',
    hours: 'Check-in 14h', phone: '(62) 3335-5678',
    coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300&q=70',
    lat: -15.8510, lng: -48.9555, photos: [], mapsLink: null,
    createdAt: new Date('2026-04-01').toISOString(),
    moradorId: 1,
  },
  {
    id: 6, name: 'Restaurante LovePiri', category: 'gastronomia',
    description: 'Restaurante sofisticado com culinária goiana contemporânea e vista para a Serra dos Pireneus.',
    address: 'Av. Sizenando Jayme, 120 - Centro, Pirenópolis',
    price: '$$$', rating: 3.8, reviewsCount: 45, commentsCount: 60, visitsCount: '300',
    hours: '12h - 23h', phone: '(62) 3331-9988',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&q=70',
    lat: -15.8475, lng: -48.9541, photos: [], mapsLink: null,
    createdAt: new Date('2026-05-20').toISOString(),
    moradorId: 1,
  },
];

/* ─── Locais criados localmente nesta sessão ─── */
/* Persistidos em sessionStorage para sobreviver ao HMR do Vite */
function loadLocalPlaces() {
  try {
    const raw = sessionStorage.getItem('euamopiri_local_places');
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}
function saveLocalPlaces(arr) {
  try { sessionStorage.setItem('euamopiri_local_places', JSON.stringify(arr)); } catch {}
}
const LOCAL_PLACES = loadLocalPlaces();

/* ─── Funções do adaptor ─── */

export async function fetchPlaces() {
  try {
    const { data } = await apiClient.get('/places');
    const apiPlaces = Array.isArray(data) ? data.map(mapPlace) : MOCK_PLACES;
    // Mescla locais criados localmente que ainda não estão na API
    const localOnly = LOCAL_PLACES.filter(
      (lp) => !apiPlaces.find((ap) => String(ap.id) === String(lp.id))
    );
    return [...apiPlaces, ...localOnly];
  } catch {
    return [...MOCK_PLACES, ...LOCAL_PLACES];
  }
}

export async function fetchPlaceById(id) {
  // Verifica primeiro os locais criados localmente nesta sessão
  const localPlace = LOCAL_PLACES.find((p) => String(p.id) === String(id));
  if (localPlace) return localPlace;

  try {
    const { data } = await apiClient.get(`/places/${id}`);
    // Valida que a resposta contém dados reais
    if (!data || typeof data !== 'object' || (!data.id && !data.name)) {
      throw new Error('Resposta vazia da API');
    }
    return mapPlace(data);
  } catch {
    return MOCK_PLACES.find((p) => String(p.id) === String(id)) ?? null;
  }
}

export async function createPlace(placeData) {
  try {
    const fd = new FormData();
    fd.append('name',        placeData.name        ?? '');
    fd.append('address',     placeData.address     ?? '');
    fd.append('category',    (placeData.category   ?? '').toUpperCase());
    fd.append('description', placeData.description ?? '');
    if (placeData.mapsLink)    fd.append('mapsLink',    placeData.mapsLink);
    if (placeData.phone)       fd.append('phone',       placeData.phone);
    if (placeData.openingDate) fd.append('openingDate', placeData.openingDate);

    // photos pode ser Array<{file, previewUrl}> (CreatePlacePage) ou Array<string> (mock)
    (placeData.photos ?? []).forEach((p) => {
      if (p?.file instanceof File) fd.append('photos', p.file);
    });

    const data = await postFormData('/places', fd);
    return mapPlace(data);
  } catch (error) {
    // Fallback local para quando o backend não está disponível
    const photoUrls = (placeData.photos ?? []).map((p) => p?.previewUrl ?? p);
    const newPlace = {
      ...placeData,
      id: Date.now(),
      photos: photoUrls.map((url) => ({ url })),
      coverImage: photoUrls[0] ?? null,
    };
    LOCAL_PLACES.push(newPlace);
    saveLocalPlaces(LOCAL_PLACES);
    return newPlace;
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

export async function fetchMyPlaces() {
  let apiPlaces = [];
  try {
    const moradorId = getLoggedUserId();
    if (moradorId != null) {
      const { data } = await apiClient.get('/places', { params: { moradorId } });
      apiPlaces = Array.isArray(data) ? data.map(mapPlace) : [];
    }
  } catch {
    // API falhou — usa apenas mocks
  }

  // Inclui mocks com moradorId que não estejam já na API
  const mockWithMorador = MOCK_PLACES.filter((p) => p.moradorId);
  const mockExtra = mockWithMorador.filter(
    (mp) => !apiPlaces.find((ap) => String(ap.id) === String(mp.id))
  );

  // Inclui locais criados localmente nesta sessão
  const allBase = [...apiPlaces, ...mockExtra];
  const localOnly = LOCAL_PLACES.filter(
    (lp) => !allBase.find((p) => String(p.id) === String(lp.id))
  );

  return [...allBase, ...localOnly];
}
