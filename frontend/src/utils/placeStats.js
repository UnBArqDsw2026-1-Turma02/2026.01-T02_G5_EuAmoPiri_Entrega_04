/** Converte ISO date para "há X dias/horas" */
export function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'há 1 mês' : `há ${months} meses`;
}

/** Agrega rating e contagem a partir dos relatos (fallback quando a API não envia). */
export function enrichPlacesWithExperienceStats(places, experiences) {
  const statsByPlace = new Map();

  for (const exp of experiences) {
    const placeId = Number(exp.placeId);
    const current = statsByPlace.get(placeId) ?? { sum: 0, count: 0 };
    current.sum += Number(exp.rating) || 0;
    current.count += 1;
    statsByPlace.set(placeId, current);
  }

  return places.map((place) => {
    const stats = statsByPlace.get(Number(place.id));
    const apiCount = place.reviewsCount ?? 0;
    const apiRating = place.rating;

    if (stats && stats.count > 0) {
      return {
        ...place,
        reviewsCount: Math.max(apiCount, stats.count),
        rating: apiRating ?? Math.round((stats.sum / stats.count) * 10) / 10,
      };
    }

    return {
      ...place,
      reviewsCount: apiCount,
    };
  });
}

const CATEGORY_ICONS = {
  cachoeira: '🏞️',
  restaurante: '🍽️',
  pousada: '🏨',
};

export function categoryIcon(category) {
  const key = (category ?? '').toLowerCase();
  return CATEGORY_ICONS[key] ?? '📍';
}

/** Texto público de avaliação para cards de locais. */
export function formatPublicRating(place) {
  const reviewsCount = place?.reviewsCount ?? 0;
  const rating = place?.rating;

  if (reviewsCount === 0 || rating == null) {
    return { starValue: 0, ratingLabel: null, reviewsLabel: 'Sem avaliações' };
  }

  return {
    starValue: Math.round(Number(rating)),
    ratingLabel: Number(rating).toFixed(1),
    reviewsLabel: `${reviewsCount} ${reviewsCount === 1 ? 'avaliação' : 'avaliações'}`,
  };
}
