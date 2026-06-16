import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createExperience } from '../infra/adaptor/experienceAdaptor';
import { fetchPlaceById } from '../infra/adaptor/placeAdaptor';
import { useAuth } from '../context/AuthContext';
import ExperienceForm from '../presentation/organisms/ExperienceForm';
import StarRating from '../presentation/atoms/StarRating';
import Button from '../presentation/atoms/Button';
import styles from './CreateExperiencePage.module.css';

const CATEGORY_LABELS = {
  gastronomia: 'Gastronomia', natureza: 'Natureza', hospedagem: 'Hospedagem',
  cultura: 'Cultura', compras: 'Compras', aventura: 'Aventura',
};

export default function CreateExperiencePage() {
  const { placeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading]   = useState(false);
  const [place,   setPlace]     = useState(null);

  useEffect(() => {
    fetchPlaceById(placeId).then(setPlace).catch(() => setPlace(null));
  }, [placeId]);

  async function handleSubmit(data) {
    setLoading(true);
    try {
      await createExperience(placeId, {
        ...data,
        userName: user?.name ?? 'Turista',
        reactions: { heart: 0, like: 0 },
        createdAt: new Date().toISOString(),
      });
      navigate(`/locais/${placeId}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* ── Cabeçalho do card ── */}
        <div className={styles.cardHeader}>
          <Button variant="neutral" size="sm" as={Link} to={`/locais/${placeId}`}>← Voltar</Button>
        </div>

        <h1 className={styles.pageTitle}>Cadastrar Review</h1>

        <div className={styles.layout}>

          {/* ── Área do mini-card (grid-area: mini) ── */}
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
                      <span>{place.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Formulário (grid-area: form) ── */}
          <div className={styles.formArea}>
            <div className={styles.formWrap}>
              <ExperienceForm
                onSubmit={handleSubmit}
                onCancel={() => navigate(`/locais/${placeId}`)}
                loading={loading}
              />
            </div>
          </div>

          {/* ── Sidebar (grid-area: sidebar) ── */}
          <aside className={styles.sidebar}>

            {/* INFORMAÇÕES */}
            {place && (
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>INFORMAÇÕES</h3>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Categoria</span>
                  <span className={styles.infoValue}>{CATEGORY_LABELS[place.category] ?? place.category}</span>
                </div>
                {place.hours && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Horário</span>
                    <span className={styles.infoValue}>{place.hours}</span>
                  </div>
                )}
                {place.phone && (
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Telefone</span>
                    <span className={styles.infoValue}>{place.phone}</span>
                  </div>
                )}
              </div>
            )}

            {/* ESTATÍSTICAS */}
            {place && (
              <div className={styles.sideCard}>
                <h3 className={styles.sideTitle}>ESTATÍSTICAS</h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statNum}>{place.rating?.toFixed(1) ?? '—'}</span>
                    <span className={styles.statLabel}>Média</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNum}>{place.reviewsCount ?? '—'}</span>
                    <span className={styles.statLabel}>Avaliações</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNum}>{place.commentsCount ?? '—'}</span>
                    <span className={styles.statLabel}>Comentários</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNum}>{place.visitsCount ?? '—'}</span>
                    <span className={styles.statLabel}>Visitas</span>
                  </div>
                </div>
              </div>
            )}

          </aside>
        </div>
      </div>
    </div>
  );
}
