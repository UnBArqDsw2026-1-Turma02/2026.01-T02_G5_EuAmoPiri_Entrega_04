import { Link } from 'react-router-dom';
import StarRating from '../atoms/StarRating';
import Badge from '../atoms/Badge';
import styles from './PlaceCard.module.css';

const CATEGORY_LABELS = {
  gastronomia: 'Gastronomia',
  natureza:    'Natureza',
  hospedagem:  'Hospedagem',
  cultura:     'Cultura',
  compras:     'Compras',
  aventura:    'Aventura',
};

const CATEGORY_VARIANTS = {
  gastronomia: 'rust',
  natureza:    'green',
  hospedagem:  'teal',
  cultura:     'brown',
  compras:     'olive',
  aventura:    'green',
};

export default function PlaceCard({ place }) {
  const {
    id,
    name,
    category,
    description,
    address,
    rating,
    reviewsCount,
    price,
  } = place;

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
        {price && <span className={styles.price}>{price}</span>}
      </div>

      <h3 className={styles.name}>{name}</h3>

      {truncated && <p className={styles.description}>{truncated}</p>}

      <div className={styles.footer}>
        <div className={styles.ratingRow}>
          <StarRating value={Math.round(rating ?? 0)} readonly size="sm" />
          <span className={styles.ratingNum}>{rating?.toFixed(1)}</span>
          {reviewsCount != null && (
            <span className={styles.reviews}>({reviewsCount} avaliações)</span>
          )}
        </div>
        {address && <span className={styles.address}>📍 {address}</span>}
      </div>
    </Link>
  );
}
