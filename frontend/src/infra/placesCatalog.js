import { fetchPlaces } from './adaptor/placeAdaptor';
import { fetchExperiencesByPlaces } from './adaptor/experienceAdaptor';
import { enrichPlacesWithExperienceStats } from '../utils/placeStats';
import {
  peekPlacesCatalog,
  setPlacesCatalog,
  getPlacesCatalogLoadPromise,
  setPlacesCatalogLoadPromise,
  invalidatePlacesCatalog,
} from './placesCatalogCache';

export { peekPlacesCatalog, invalidatePlacesCatalog };

function numericPlaceIds(places) {
  return places
    .filter((p) => typeof p.id === 'number' || /^\d+$/.test(String(p.id)))
    .map((p) => Number(p.id));
}

export async function loadPlacesCatalog({ forceRefresh = false } = {}) {
  if (!forceRefresh && peekPlacesCatalog() !== null) {
    return peekPlacesCatalog();
  }

  const inFlight = getPlacesCatalogLoadPromise();
  if (!forceRefresh && inFlight) {
    return inFlight;
  }

  const promise = (async () => {
    const list = await fetchPlaces();
    const placeIds = numericPlaceIds(list);
    const experiences = placeIds.length > 0
      ? await fetchExperiencesByPlaces(placeIds)
      : [];
    const enriched = enrichPlacesWithExperienceStats(list, experiences);
    setPlacesCatalog(enriched);
    return enriched;
  })();

  setPlacesCatalogLoadPromise(promise);

  try {
    return await promise;
  } finally {
    setPlacesCatalogLoadPromise(null);
  }
}
