/**

 * Adaptor de Locais — integração exclusiva com API REST (sem mocks).

 */

import apiClient, { postFormData, patchFormData } from '../../api/client';

import { resolveMediaUrl } from '../../utils/mediaUrl';



function mapPlace(place) {

  if (!place) return place;

  const cover = place.coverImage ?? place.photos?.[0]?.url;

  return {

    ...place,

    coverImage: cover?.startsWith('http') ? cover : resolveMediaUrl(cover),

    photos: (place.photos ?? []).map((p) => ({

      ...p,

      url: p.url?.startsWith('http') ? p.url : resolveMediaUrl(p.url),

    })),

    lat: place.lat ?? place.latitude,

    lng: place.lng ?? place.longitude,

  };

}



function getLoggedUserId() {

  try {

    const user = JSON.parse(localStorage.getItem('euamopiri_user') ?? 'null');

    return user?.id ?? null;

  } catch {

    return null;

  }

}



export function apiErrorMessage(error, fallback) {

  return error?.response?.data?.error ?? error?.message ?? fallback;

}



export async function fetchPlaces() {

  const { data } = await apiClient.get('/places');

  return Array.isArray(data) ? data.map(mapPlace) : [];

}



export async function fetchPlaceById(id) {

  const { data } = await apiClient.get(`/places/${id}`);

  if (!data || typeof data !== 'object' || (!data.id && !data.name)) {

    throw new Error('Local não encontrado');

  }

  return mapPlace(data);

}



export async function createPlace(placeData) {

  const fd = new FormData();

  fd.append('name', placeData.name ?? '');

  fd.append('address', placeData.address ?? '');

  fd.append('category', (placeData.category ?? '').toUpperCase());

  fd.append('description', placeData.description ?? '');

  if (placeData.mapsLink) fd.append('mapsLink', placeData.mapsLink);

  if (placeData.phone) fd.append('phone', placeData.phone);

  if (placeData.openingDate) fd.append('openingDate', placeData.openingDate);



  (placeData.photos ?? []).forEach((p) => {

    if (p?.file instanceof File) fd.append('photos', p.file);

  });



  const data = await postFormData('/places', fd);

  return mapPlace(data);

}



export async function updatePlace(id, formData) {

  const data = await patchFormData(`/places/${id}`, formData);

  return mapPlace(data);

}



export async function deletePlace(id) {

  await apiClient.delete(`/places/${id}`);

  return { success: true };

}



export async function fetchMyPlaces() {

  const moradorId = getLoggedUserId();

  if (moradorId == null) {

    return [];

  }



  const { data } = await apiClient.get('/places', { params: { moradorId } });

  return Array.isArray(data) ? data.map(mapPlace) : [];

}

