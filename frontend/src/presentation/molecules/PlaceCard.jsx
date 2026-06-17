/**
 * MOLÉCULA — PlaceCard
 *
 * Card de um ponto turístico para uso na listagem PlacesPage.
 * Exibe: nome, categoria, descrição curta, endereço e avaliação.
 *
 * Reutilizado em: PlacesPage, ProfilePage (meus locais do morador).
 */
import { Link } from 'react-router-dom';
import StarRating from '../atoms/StarRating';
import Badge from '../atoms/Badge';
import { formatPublicRating } from '../../utils/placeStats';
import { CATEGORY_LABELS, CATEGORY_VARIANTS } from '../utils/placeCategories';
import styles from './PlaceCard.module.css';

export default function PlaceCard({ place }) {
  const {
    id,
    name,
    category,
    description,
    address,
  } = place;

  const { starValue, ratingLabel, reviewsLabel } = formatPublicRating(place);

  const truncated = description?.length > 100
    ? description.slice(0, 100).trimEnd() + '…'
    : description;

  return (
    <Link to={`/locais/${id}`} className={styles.card} aria-label={`Ver detalhes de ${name}`}>
      <div className={styles.header}>
        <Badge
          variant={CATEGORY_VARIANTS[category] ?? 'gray'}
          size="sm"
        >
          {CATEGORY_LABELS[category] ?? category}
        </Badge>
      </div>

      <h3 className={styles.name}>{name}</h3>

      {truncated && <p className={styles.description}>{truncated}</p>}

      <div className={styles.footer}>
        <div className={styles.ratingRow}>
          <StarRating value={starValue} readonly size="sm" />
          {ratingLabel != null && (
            <span className={styles.ratingNum}>{ratingLabel}</span>
          )}
          <span className={styles.reviews}>({reviewsLabel})</span>
        </div>
        {address && <span className={styles.address}>📍 {address}</span>}
      </div>
    </Link>
  );
}
