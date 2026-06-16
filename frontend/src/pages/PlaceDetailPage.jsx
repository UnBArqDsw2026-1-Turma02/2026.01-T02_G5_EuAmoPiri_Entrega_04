import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPlaceById } from '../infra/adaptor/placeAdaptor';
import { fetchExperiencesByPlace, reactToExperience } from '../infra/adaptor/experienceAdaptor';
import Button from '../presentation/atoms/Button';
import StarRating from '../presentation/atoms/StarRating';
import Spinner from '../presentation/atoms/Spinner';
import styles from './PlaceDetailPage.module.css';

/* ─── helpers ─── */
function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 7)  return `há ${days} dias`;
  const w = Math.floor(days / 7);
  if (w < 5) return w === 1 ? 'há 1 semana' : `há ${w} semanas`;
  const m = Math.floor(days / 30);
  return m === 1 ? 'há 1 mês' : `há ${m} meses`;
}

const CATEGORY_LABELS = {
  gastronomia: 'Gastronomia', natureza: 'Natureza', hospedagem: 'Hospedagem',
  cultura: 'Cultura', compras: 'Compras', aventura: 'Aventura',
};

const COST_OPTIONS = ['$', '$$', '$$$', '$$$$', '$$$$$'];

const REACTION_EMOJIS = [
  { key: 'heart',   emoji: '❤️' },
  { key: 'like',    emoji: '👍' },
  { key: 'dislike', emoji: '👎' },
];

const REACTION_LABELS = { heart: 'Amei', like: 'Gostei', dislike: 'Não gostei' };

/* ─── Sub: card de comentário ─── */
function CommentCard({ exp, onReact, showReactions = false, userReactions = new Map() }) {
  const myReaction = userReactions.get(exp.id); // emoji key ativo, ou undefined

  return (
    <article className={styles.commentCard}>
      <div className={styles.commentHeader}>
        <span className={styles.commentAuthor}>{exp.userName}</span>
        <span className={styles.commentTime}>{timeAgo(exp.createdAt)}</span>
      </div>
      <div className={styles.commentMeta}>
        <StarRating value={exp.rating} readonly size="sm" />
        {exp.cost && <span className={styles.commentCost}>{exp.cost}</span>}
      </div>
      {exp.title && <p className={styles.commentTitle}>{exp.title}</p>}
      <p className={styles.commentText}>{exp.text}</p>
      {showReactions && (
        <div className={styles.reactions}>
          {REACTION_EMOJIS.map(({ key, emoji }) => {
            const isActive = myReaction === key;
            return (
              <button
                key={key}
                aria-label={`${REACTION_LABELS[key]}: ${exp.reactions?.[key] ?? 0}`}
                className={`${styles.reactionBtn} ${isActive ? styles.reactionBtnActive : ''}`}
                onClick={() => onReact?.(exp.id, key)}
                title={isActive ? 'Clique para desfazer' : undefined}
              >
                {emoji} <span>{exp.reactions?.[key] ?? 0}</span>
              </button>
            );
          })}
        </div>
      )}
    </article>
  );
}

/* ─── Sub: modal de todos os comentários ─── */
function CommentsModal({ experiences, onReact, onClose, userReactions }) {
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Comentários ({experiences.length})</h2>
        <div className={styles.modalList}>
          {experiences.map((exp) => (
            <CommentCard key={exp.id} exp={exp} onReact={onReact} showReactions userReactions={userReactions} />
          ))}
        </div>
        <div className={styles.modalFooter}>
          <Button variant="outline" size="sm" onClick={onClose}>Voltar</Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Componente principal ─── */
export default function PlaceDetailPage() {
  const { id } = useParams();
  const { isAuthenticated, isTurista } = useAuth();

  const [place,         setPlace]         = useState(null);
  const [experiences,   setExperiences]   = useState([]);
  const [loadingPlace,  setLoadingPlace]  = useState(true);
  const [error,         setError]         = useState(null);
  const [showModal,     setShowModal]     = useState(false);
  // Map<expId, emojiKey> — 1 reação por comentário, anulável
  const [userReactions, setUserReactions] = useState(new Map());

  useEffect(() => {
    fetchPlaceById(id)
      .then((data) => { setPlace(data); setLoadingPlace(false); })
      .catch((err)  => { setError(err.message); setLoadingPlace(false); });
    fetchExperiencesByPlace(id)
      .then((data) => setExperiences(Array.isArray(data) ? data : []));
  }, [id]);

  function handleReact(expId, emoji) {
    const current = userReactions.get(expId);
    const next = new Map(userReactions);

    if (current === emoji) {
      // mesmo emoji → desfaz
      next.delete(expId);
      setUserReactions(next);
      setExperiences((prev) =>
        prev.map((e) => e.id === expId
          ? { ...e, reactions: { ...e.reactions, [emoji]: Math.max(0, (e.reactions?.[emoji] ?? 1) - 1) } }
          : e
        )
      );
    } else {
      // emoji diferente (ou sem reação) → troca/adiciona
      next.set(expId, emoji);
      setUserReactions(next);
      setExperiences((prev) =>
        prev.map((e) => {
          if (e.id !== expId) return e;
          const updated = { ...e.reactions };
          if (current) updated[current] = Math.max(0, (updated[current] ?? 1) - 1); // remove anterior
          updated[emoji] = (updated[emoji] ?? 0) + 1; // adiciona novo
          return { ...e, reactions: updated };
        })
      );
      reactToExperience(id, expId, emoji);
    }
  }

  if (loadingPlace) return <div className={styles.centered}><Spinner size="lg" /></div>;
  if (error || !place) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorMsg}>{error ?? 'Local não encontrado.'}</p>
        <Button as={Link} to="/locais" variant="outline" size="sm">← Voltar à lista</Button>
      </div>
    );
  }

  /* computed */
  const ratingDist = [5,4,3,2,1].map((star) => ({
    star,
    count: experiences.filter((e) => Math.round(e.rating) === star).length,
  }));
  const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);
  const costDist = COST_OPTIONS.map((opt) => ({
    opt,
    count: experiences.filter((e) => e.cost === opt).length,
  }));
  const PREVIEW = 3;

  return (
    <div className={styles.page}>
      <div className={styles.pageWrapper}>
      <div className={styles.card}>

        {/* ── Cabeçalho do card ── */}
        <div className={styles.cardHeader}>
          <Button variant="neutral" size="sm" as={Link} to="/locais">← Voltar</Button>
        </div>

          {/* ── Info area ── */}
          <div className={styles.infoArea}>

            {/* Info do local */}
            <div className={styles.placeInfo}>
              <div className={styles.placePhotoWrap}>
                {place.coverImage
                  ? <img src={place.coverImage} alt={place.name} className={styles.placePhoto}
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                  : null}
                <div className={styles.placePhotoFallback}
                  style={{ display: place.coverImage ? 'none' : 'block' }} />
              </div>
              <div className={styles.placeDetails}>
                <h1 className={styles.placeName}>{place.name}</h1>
                {place.address && <p className={styles.placeAddr}>{place.address}</p>}
                <div className={styles.placeMeta}>
                  <span>Categoria: <strong className={styles.metaTeal}>
                    {CATEGORY_LABELS[place.category] ?? place.category}
                  </strong></span>
                  {place.hours && (
                    <span>Horário: <strong className={styles.metaTeal}>{place.hours}</strong></span>
                  )}
                </div>
                {place.description && <p className={styles.placeDesc}>{place.description}</p>}
              </div>
            </div>
          </div>

        </div>

      {/* ── Reviews card (grid-area: reviews) ── */}
      <div className={styles.reviewsCard}>

            {/* Avaliações da Comunidade */}
            <section>
              <h2 className={styles.sectionTitle}>Avaliações da Comunidade</h2>
              <div className={styles.sectionDivider} />
              <div className={styles.ratingCard}>
              <div className={styles.ratingOverview}>
                <div className={styles.ratingBig}>
                  <span className={styles.ratingNum}>{place.rating?.toFixed(1) ?? '—'}</span>
                  <StarRating value={Math.round(place.rating ?? 0)} readonly size="lg" />
                  <span className={styles.ratingBase}>BASEADO EM {place.reviewsCount ?? experiences.length} AVALIAÇÕES</span>
                </div>
                <div className={styles.ratingBars}>
                  {ratingDist.map(({ star, count }) => (
                    <div key={star} className={styles.ratingBarRow}>
                      <span className={styles.barStar}>{star} ★</span>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: count === 0 ? '0%' : `${Math.max(6, (count / maxCount) * 100)}%` }} />
                      </div>
                      <span className={styles.barCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            </section>

            {/* Classificação de custo */}
            <section>
              <h2 className={`${styles.sectionTitle} ${styles.sectionTitleSm}`}>CLASSIFICAÇÃO DE CUSTO</h2>
              <div className={styles.sectionDivider} />
              <div className={styles.costRow}>
                {costDist.map(({ opt, count }) => (
                  <div key={opt} className={styles.costItem}>
                    <span className={styles.costLabel}>{opt}</span>
                    <span className={styles.costCount}>{count}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Comentários */}
            <section>
              <div className={styles.commentsSectionHeader}>
                <h2 className={styles.sectionTitle}>Comentários ({experiences.length})</h2>
                {isTurista && (
                  <Button size="sm" as={Link} to={`/locais/${id}/relatos/novo`}>
                    + Avaliar
                  </Button>
                )}
                {!isAuthenticated && (
                  <Button variant="outline" size="sm" as={Link} to="/login">
                    Avaliar Local
                  </Button>
                )}
              </div>
              <div className={styles.sectionDivider} />

              {experiences.length === 0 && (
                <p className={styles.emptyMsg}>
                  Nenhum relato ainda. {isTurista ? 'Seja o primeiro!' : ''}
                </p>
              )}

              {experiences.slice(0, PREVIEW).map((exp) => (
                <CommentCard
                  key={exp.id}
                  exp={exp}
                  showReactions
                  onReact={handleReact}
                  userReactions={userReactions}
                />
              ))}

              {experiences.length > 0 && (
                <div className={styles.loadMoreWrap}>
                  <Button variant="outline" onClick={() => setShowModal(true)}>
                    Carregar Mais Comentários
                  </Button>
                </div>
              )}
            </section>

      </div>

      {/* ── Sidebar (fora do card) ── */}
      <aside className={styles.sidebar}>
        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>ESTATÍSTICAS</h3>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avaliações</span>
            <span className={styles.statValue}>{place.reviewsCount ?? experiences.length}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Comentários</span>
            <span className={styles.statValue}>{place.commentsCount ?? experiences.length}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Visitas</span>
            <span className={styles.statValue}>{place.visitsCount ?? '—'}</span>
          </div>
        </div>
        {isTurista && (
          <Button variant="primary" fullWidth as={Link} to={`/locais/${id}/relatos/novo`}>
            Avaliar Local
          </Button>
        )}
        {!isAuthenticated && (
          <Button variant="primary" fullWidth as={Link} to="/login">
            Avaliar Local
          </Button>
        )}
      </aside>

      </div>

      {showModal && (
        <CommentsModal
          experiences={experiences}
          onReact={handleReact}
          onClose={() => setShowModal(false)}
          userReactions={userReactions}
        />
      )}
    </div>
  );
}
