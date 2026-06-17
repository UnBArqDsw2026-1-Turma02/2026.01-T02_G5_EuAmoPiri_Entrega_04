import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createExperience } from '../infra/adaptor/experienceAdaptor';
import { fetchPlaceById } from '../infra/adaptor/placeAdaptor';
import { useAuth } from '../context/AuthContext';
import ExperienceForm from '../presentation/organisms/ExperienceForm';
import RoleNotice from '../presentation/molecules/RoleNotice';
import StarRating from '../presentation/atoms/StarRating';
import Button from '../presentation/atoms/Button';
import { CATEGORY_LABELS } from '../utils/placeCategories';
import styles from './CreateExperiencePage.module.css';

export default function CreateExperiencePage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { user, isTurista } = useAuth();

  const [loading, setLoading] = useState(false);
  const [place, setPlace]       = useState(null);

  useEffect(() => {
    fetchPlaceById(placeId).then(setPlace).catch(() => setPlace(null));
  }, [placeId]);

  if (!isTurista) {
    return (
      <RoleNotice
        title="Conta de turista necessária"
        message="Para cadastrar uma experiência, é necessário ter uma conta de turista."
        backTo={`/locais/${placeId}`}
        backLabel="Voltar ao local"
      />
    );
  }

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await createExperience(placeId, {
        rating: data.rating,
        text: data.text,
        title: data.title,
        visitDate: data.visitDate,
        userName: user?.name ?? 'Turista',
        placeName: place?.name ?? '',
      }, data.photos ?? []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <Button variant="neutral" size="sm" as={Link} to={`/locais/${placeId}`}>← Voltar</Button>
        </div>

        <h1 className={styles.pageTitle}>Cadastrar Review</h1>

        <div className={styles.layout}>
          <div className={styles.miniArea}>
            {place && (
              <div className={styles.placeMiniCard}>
                {place.coverImage && (
                  <img
                    src={place.coverImage}
                    alt={place.name}
                    className={styles.miniCardPhoto}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                )}
                <div className={styles.miniCardInfo}>
                  <span className={styles.miniCardName}>{place.name}</span>
                  <span className={styles.miniCardAddr}>{place.address}</span>
                  {place.rating && (
                    <div className={styles.miniCardRating}>
                      <StarRating value={Math.round(place.rating)} readonly size="sm" />
                      <span>{Number(place.rating).toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.formArea}>
            <div className={styles.formWrap}>
              <ExperienceForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/locais/${placeId}`)}
                loading={loading}
                successPrimary={{ label: 'Voltar ao local', to: `/locais/${placeId}` }}
                successSecondary={{ label: 'Avaliar outros lugares', to: '/locais' }}
              />
            </div>
          </div>

          <aside className={styles.sidebar}>
            {place && (
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>INFORMAÇÕES</h3>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Categoria</span>
                  <span className={styles.infoValue}>{CATEGORY_LABELS[place.category] ?? place.category}</span>
                </div>
                {place.phone && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Telefone</span>
                    <span className={styles.infoValue}>{place.phone}</span>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
