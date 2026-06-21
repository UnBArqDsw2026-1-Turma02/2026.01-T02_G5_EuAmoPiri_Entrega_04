import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchPlaceById, deletePlace } from '../infra/adaptor/placeAdaptor';
import {
  fetchExperiencesByPlace,
  fetchCommentsByExperience,
  createComment,
  reactToExperience,
  reportExperience,
  reportComment,
} from '../infra/adaptor/experienceAdaptor';
import { containsBlacklistedWord } from '../utils/blacklist';
import Button from '../presentation/atoms/Button';
import StarRating from '../presentation/atoms/StarRating';
import Spinner from '../presentation/atoms/Spinner';
import ContentOptionsMenu from '../presentation/molecules/ContentOptionsMenu';
import ReportModal from '../presentation/molecules/ReportModal';
import FormResultModal from '../presentation/molecules/FormResultModal';
import styles from './PlaceDetailPage.module.css';

/* ─── helpers ─── */
function timeAgo(iso) {
  const days = Math.floor((Date.now() - new Date(iso)) / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 7) return `há ${days} dias`;
  const w = Math.floor(days / 7);
  if (w < 5) return w === 1 ? 'há 1 semana' : `há ${w} semanas`;
  const m = Math.floor(days / 30);
  return m === 1 ? 'há 1 mês' : `há ${m} meses`;
}

import { categoryLabel } from '../utils/placeCategories';

const REACTION_EMOJIS = [
  { key: 'heart', emoji: '❤️' },
  { key: 'like', emoji: '👍' },
];

const REACTION_LABELS = { heart: 'Amei', like: 'Gostei' };

function shouldShowContentOptions(currentUserId, authorUserId) {
  if (authorUserId == null) return true;
  if (currentUserId == null) return true;
  return Number(authorUserId) !== Number(currentUserId);
}

const COMMENT_MIN = 3;
const COMMENT_MAX = 500;
const TEXT_PREVIEW_LIMIT = 150;

function ExpandableText({ text, className, readMoreClassName }) {
  const [expanded, setExpanded] = useState(false);
  if (!text) return null;

  const isLong = text.length > TEXT_PREVIEW_LIMIT;
  const preview = isLong ? `${text.slice(0, TEXT_PREVIEW_LIMIT).trimEnd()}…` : text;

  return (
    <p className={className}>
      {expanded || !isLong ? text : preview}
      {isLong && !expanded && (
        <>
          {' '}
          <button
            type="button"
            className={readMoreClassName}
            onClick={() => setExpanded(true)}
          >
            ler mais
          </button>
        </>
      )}
    </p>
  );
}

/* ─── Sub: comentários de um relato ─── */
function ExperienceComments({
  placeId,
  experienceId,
  commentsCount,
  isTurista,
  canReport,
  currentUserId,
  onReportComment,
  onCommentAdded,
}) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [draft, setDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const displayCount = Math.max(commentsCount ?? 0, comments.length);
  const showSection = isTurista || displayCount > 0 || open;

  async function loadComments() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommentsByExperience(placeId, experienceId);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setError('Não foi possível carregar os comentários.');
    } finally {
      setLoading(false);
    }
  }

  async function toggleComments() {
    if (open) {
      setOpen(false);
      return;
    }

    if (comments.length === 0) {
      await loadComments();
    }
    setOpen(true);
  }

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!isTurista) return;

    setFormError('');
    const trimmed = draft.trim();
    if (trimmed.length < COMMENT_MIN) {
      setFormError(`Mínimo de ${COMMENT_MIN} caracteres.`);
      return;
    }
    if (trimmed.length > COMMENT_MAX) {
      setFormError(`Máximo de ${COMMENT_MAX} caracteres.`);
      return;
    }
    if (containsBlacklistedWord(trimmed)) {
      setFormError('Revise o conteúdo e tente novamente, mantendo uma linguagem respeitosa.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createComment(placeId, experienceId, trimmed);
      setComments((prev) => [...prev, created]);
      setDraft('');
      onCommentAdded?.(experienceId);
      if (!open) setOpen(true);
    } catch (err) {
      setFormError(err?.response?.data?.error ?? 'Erro ao enviar comentário.');
    } finally {
      setSubmitting(false);
    }
  }

  if (!showSection) return null;

  const actionLabel = loading
    ? 'Carregando...'
    : open
      ? 'Ocultar'
      : isTurista
        ? 'Comentar'
        : 'Ver comentários';

  return (
    <div className={styles.relatoCommentsWrap}>
      <div className={styles.relatoCommentsBar}>
        <button
          type="button"
          className={styles.relatoCommentsToggle}
          onClick={toggleComments}
          disabled={loading}
          aria-label={`${actionLabel}, ${displayCount} comentários`}
        >
          {actionLabel}
        </button>
        <span className={styles.relatoCommentsCount}>
          {displayCount} {displayCount === 1 ? 'comentário' : 'comentários'}
        </span>
      </div>
      {error && <p className={styles.relatoCommentsError} role="alert">{error}</p>}
      {open && comments.length === 0 && !loading && !isTurista && (
        <p className={styles.relatoCommentsEmpty}>Nenhum comentário neste relato.</p>
      )}
      {open && comments.map((comment) => (
        <div key={comment.id} className={styles.relatoCommentItem}>
          <div className={styles.commentHeader}>
            <span className={styles.commentAuthor}>{comment.userName}</span>
            <div className={styles.commentHeaderRight}>
              <span className={styles.commentTime}>{timeAgo(comment.createdAt)}</span>
              {shouldShowContentOptions(currentUserId, comment.userId) && (
                <ContentOptionsMenu
                  label="Opções do comentário"
                  onReport={() => onReportComment(experienceId, comment)}
                />
              )}
            </div>
          </div>
          <ExpandableText
            text={comment.text}
            className={styles.commentText}
            readMoreClassName={styles.readMoreBtn}
          />
        </div>
      ))}
      {open && isTurista && (
        <form className={styles.commentForm} onSubmit={handleSubmitComment}>
          <label className={styles.commentFormLabel} htmlFor={`comment-${experienceId}`}>
            Escreva um comentário
          </label>
          <textarea
            id={`comment-${experienceId}`}
            className={styles.commentFormInput}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={COMMENT_MAX}
            rows={3}
            placeholder="Compartilhe sua opinião sobre este relato..."
            disabled={submitting}
          />
          <div className={styles.commentFormFooter}>
            <span className={styles.commentFormCount}>{draft.length}/{COMMENT_MAX}</span>
            {formError && <p className={styles.relatoCommentsError} role="alert">{formError}</p>}
            <Button type="submit" variant="primary" size="sm" loading={submitting}>
              Publicar comentário
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

/* ─── Sub: card de relato ─── */
function CommentCard({
  exp,
  placeId,
  onReact,
  showReactions = false,
  userReactions = new Map(),
  canReport = false,
  currentUserId,
  onReportExperience,
  onReportComment,
  onCommentAdded,
  isTurista = false,
}) {
  const myReaction = userReactions.get(exp.id); // emoji key ativo, ou undefined

  return (
    <article className={styles.commentCard}>
      <div className={styles.commentHeader}>
        <span className={styles.commentAuthor}>{exp.userName}</span>
        <div className={styles.commentHeaderRight}>
          <span className={styles.commentTime}>{timeAgo(exp.createdAt)}</span>
          {shouldShowContentOptions(currentUserId, exp.userId) && (
            <ContentOptionsMenu
              label="Opções do relato"
              onReport={() => onReportExperience?.(exp)}
            />
          )}
        </div>
      </div>
      <div className={styles.commentMeta}>
        <StarRating value={exp.rating} readonly size="sm" />
      </div>
      {exp.title && <p className={styles.commentTitle}>{exp.title}</p>}
      <ExpandableText
        text={exp.text}
        className={styles.commentText}
        readMoreClassName={styles.readMoreBtn}
      />
      {showReactions && (
        <div className={styles.reactions}>
          {REACTION_EMOJIS.map(({ key, emoji }) => {
            const count = exp.reactions?.[key] ?? 0;
            if (!onReact) {
              // Morador: apenas visualiza os contadores, sem interação
              return (
                <span
                  key={key}
                  className={styles.reactionBtnReadonly}
                  aria-label={`${REACTION_LABELS[key]}: ${count}`}
                >
                  {emoji} <span>{count}</span>
                </span>
              );
            }
            const isActive = myReaction === key;
            return (
              <button
                key={key}
                aria-label={`${REACTION_LABELS[key]}: ${count}`}
                className={`${styles.reactionBtn} ${isActive ? styles.reactionBtnActive : ''}`}
                onClick={() => onReact(exp.id, key)}
                title={isActive ? 'Clique para desfazer' : undefined}
              >
                {emoji} <span>{count}</span>
              </button>
            );
          })}
        </div>
      )}
      <ExperienceComments
        placeId={placeId}
        experienceId={exp.id}
        commentsCount={exp.commentsCount}
        isTurista={isTurista}
        canReport={canReport}
        currentUserId={currentUserId}
        onReportComment={onReportComment}
        onCommentAdded={onCommentAdded}
      />
    </article>
  );
}

/* ─── Sub: modal de todos os comentários ─── */
function CommentsModal({
  experiences,
  placeId,
  onReact,
  onClose,
  userReactions,
  canReport,
  currentUserId,
  onReportExperience,
  onReportComment,
  onCommentAdded,
  isTurista = false,
}) {
  return (
    <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Relatos ({experiences.length})</h2>
        <div className={styles.modalList}>
          {experiences.map((exp) => (
            <CommentCard
              key={exp.id}
              exp={exp}
              placeId={placeId}
              onReact={onReact}
              showReactions
              userReactions={userReactions}
              canReport={canReport}
              currentUserId={currentUserId}
              onReportExperience={onReportExperience}
              onReportComment={onReportComment}
              onCommentAdded={onCommentAdded}
              isTurista={isTurista}
            />
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
  const navigate = useNavigate();
  const { isAuthenticated, isTurista, isMorador, user, canReport } = useAuth();

  const [place, setPlace] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [loadingPlace, setLoadingPlace] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [deleteErr, setDeleteErr] = useState(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  // Map<expId, emojiKey> — 1 reação por comentário, anulável
  const [userReactions, setUserReactions] = useState(new Map());
  const [reportTarget, setReportTarget] = useState(null);
  const [reportFeedback, setReportFeedback] = useState(null);

  useEffect(() => {
    fetchPlaceById(id)
      .then((data) => { setPlace(data); setLoadingPlace(false); })
      .catch((err) => { setError(err.message); setLoadingPlace(false); });
    fetchExperiencesByPlace(id)
      .then((data) => setExperiences(Array.isArray(data) ? data : []));
  }, [id]);

  async function handleDeleteConfirm() {
    setDeleting(true);
    setDeleteErr(null);
    try {
      await deletePlace(id);
      setDeleteSuccess(true);
    } catch {
      setDeleteErr('Erro ao excluir. Tente novamente.');
    } finally {
      setDeleting(false);
    }
  }

  function closeDeleteModal() {
    if (deleteSuccess) {
      navigate('/locais');
    } else {
      setConfirmDelete(false);
      setDeleteErr(null);
      setDeleteSuccess(false);
    }
  }

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

  function tryOpenReport(openFn) {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/locais/${id}` } });
      return;
    }
    if (!canReport) {
      setReportFeedback({
        type: 'error',
        title: 'Denúncia indisponível',
        text: 'Apenas contas de turista ou administrador podem denunciar relatos e comentários.',
      });
      return;
    }
    openFn();
  }

  function openExperienceReport(exp) {
    tryOpenReport(() => {
      setReportTarget({ type: 'experience', experienceId: exp.id });
    });
  }

  function openCommentReport(experienceId, comment) {
    tryOpenReport(() => {
      setReportTarget({ type: 'comment', experienceId, commentId: comment.id });
    });
  }

  function handleCommentAdded(experienceId) {
    setExperiences((prev) =>
      prev.map((exp) =>
        exp.id === experienceId
          ? { ...exp, commentsCount: (exp.commentsCount ?? 0) + 1 }
          : exp
      )
    );
  }

  async function handleReportSubmit(payload) {
    if (!reportTarget) return;

    let result;
    if (reportTarget.type === 'experience') {
      result = await reportExperience(id, reportTarget.experienceId, payload);
    } else {
      result = await reportComment(id, reportTarget.experienceId, reportTarget.commentId, payload);
    }

    setReportTarget(null);
    setReportFeedback({
      type: 'success',
      title: 'Denúncia recebida!',
      text: result?.message ?? 'O conteúdo foi sinalizado para revisão.',
    });
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

  /* computed — fotos */
  const allPhotos = (Array.isArray(place.photos) && place.photos.length > 0
    ? place.photos.map((p) => (typeof p === 'string' ? p : p?.url)).filter(Boolean)
    : place.coverImage ? [place.coverImage] : []);
  function prevPhoto() { setPhotoIndex((i) => (i - 1 + allPhotos.length) % allPhotos.length); }
  function nextPhoto() { setPhotoIndex((i) => (i + 1) % allPhotos.length); }

  /* computed */
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: experiences.filter((e) => Math.round(e.rating) === star).length,
  }));
  const maxCount = Math.max(...ratingDist.map((d) => d.count), 1);
  const PREVIEW = 3;

  const communityRelatosCount = experiences.length;
  const totalCommentsCount = experiences.reduce(
    (sum, exp) => sum + (exp.commentsCount ?? 0),
    0
  );
  const hasCommunityRatings = communityRelatosCount > 0;
  const avaliacoesCount = hasCommunityRatings
    ? communityRelatosCount
    : (place.reviewsCount ?? 0);
  const avaliacoesSourceLabel = hasCommunityRatings ? 'DA COMUNIDADE' : 'GOOGLE MAPS';
  const displayRating = hasCommunityRatings
    ? Math.round(
        (experiences.reduce((sum, exp) => sum + (Number(exp.rating) || 0), 0) / communityRelatosCount) * 10
      ) / 10
    : place.rating;

  const canManagePlace =
    isMorador &&
    place.source !== 'google' &&
    place.moradorId != null &&
    Number(place.moradorId) === Number(user?.id);

  return (
    <div className={styles.page}>
      <div className={styles.pageWrapper}>
        <div className={styles.card}>

          {/* ── Cabeçalho do card ── */}
          <div className={styles.cardHeader}>
            <Button variant="neutral" size="sm" as={Link} to="/locais">← Voltar</Button>
            {canManagePlace && (
              <div className={styles.ownerActions}>
                <button
                  className={styles.btnEdit}
                  onClick={() => navigate(`/morador/locais/${id}/editar`, { state: { returnTo: `/locais/${id}` } })}
                >
                  Editar Local
                </button>
                <button
                  className={styles.btnDelete}
                  onClick={() => setConfirmDelete(true)}
                >
                  Excluir Local
                </button>
              </div>
            )}
          </div>

          {/* ── Info area ── */}
          <div className={styles.infoArea}>

            {/* Info do local */}
            <div className={styles.placeInfo}>
              {/* Carrossel de fotos */}
              <div className={styles.carousel}>
                {allPhotos.length > 0 ? (
                  <img
                    src={allPhotos[photoIndex]}
                    alt={`${place.name} — foto ${photoIndex + 1}`}
                    className={styles.placePhoto}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className={styles.placePhotoFallback} />
                )}
                {allPhotos.length > 1 && (
                  <>
                    <button
                      className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
                      onClick={prevPhoto}
                      aria-label="Foto anterior"
                    >‹</button>
                    <button
                      className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
                      onClick={nextPhoto}
                      aria-label="Próxima foto"
                    >›</button>
                    <span className={styles.carouselDots}>
                      {allPhotos.map((_, i) => (
                        <span
                          key={i}
                          className={`${styles.dot} ${i === photoIndex ? styles.dotActive : ''}`}
                          onClick={() => setPhotoIndex(i)}
                        />
                      ))}
                    </span>
                  </>
                )}
              </div>

              <div className={styles.placeDetails}>
                <h1 className={styles.placeName}>{place.name}</h1>
                {place.address && <p className={styles.placeAddr}>{place.address}</p>}
                <div className={styles.placeMeta}>
                  <span>Categoria: <strong className={styles.metaTeal}>
                    {categoryLabel(place.category)}
                  </strong></span>
                  {place.source === 'google' && place.mapsLink && (
                    <span>
                      <a href={place.mapsLink} target="_blank" rel="noopener noreferrer">
                        Ver no Google Maps
                      </a>
                    </span>
                  )}
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
                  <span className={styles.ratingNum}>{displayRating?.toFixed(1) ?? '—'}</span>
                  <StarRating value={Math.round(displayRating ?? 0)} readonly size="lg" />
                  <span className={styles.ratingBase}>
                    BASEADO EM {avaliacoesCount} AVALIAÇÕES ({avaliacoesSourceLabel})
                  </span>
                </div>
                <div className={styles.ratingBarsWrap}>
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
                  <p className={styles.ratingBarsCaption}>
                    Avaliações coletadas no Eu Amo Piri
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Relatos da comunidade */}
          <section>
            <div className={styles.commentsSectionHeader}>
              <h2 className={styles.sectionTitle}>Relatos ({communityRelatosCount})</h2>
              {isTurista && (
                <Link to={`/locais/${id}/relatos/novo`} className={styles.btnAvaliarSm}>
                  + Relato
                </Link>
              )}
              {!isAuthenticated && (
                <Link to={`/locais/${id}/relatos/novo`} className={styles.btnAvaliarOutline}>
                  Cadastrar relato
                </Link>
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
                placeId={id}
                showReactions
                onReact={isTurista ? handleReact : undefined}
                userReactions={userReactions}
                canReport={canReport}
                currentUserId={user?.id}
                onReportExperience={openExperienceReport}
                onReportComment={openCommentReport}
                onCommentAdded={handleCommentAdded}
                isTurista={isTurista}
              />
            ))}

            {experiences.length > 0 && (
              <div className={styles.loadMoreWrap}>
                <Button variant="outline" onClick={() => setShowModal(true)}>
                  Carregar Mais Relatos
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
              <span className={styles.statValue}>{avaliacoesCount}</span>
            </div>
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Comentários</span>
              <span className={styles.statValue}>{totalCommentsCount}</span>
            </div>
          </div>
          {isTurista && (
            <Link to={`/locais/${id}/relatos/novo`} className={styles.btnAvaliar}>
              Cadastrar relato
            </Link>
          )}
          {!isAuthenticated && (
            <Link to={`/locais/${id}/relatos/novo`} className={styles.btnAvaliar}>
              Cadastrar relato
            </Link>
          )}
        </aside>

      </div>

      {showModal && (
        <CommentsModal
          experiences={experiences}
          placeId={id}
          onReact={isTurista ? handleReact : undefined}
          onClose={() => setShowModal(false)}
          userReactions={userReactions}
          canReport={canReport}
          currentUserId={user?.id}
          onReportExperience={openExperienceReport}
          onReportComment={openCommentReport}
          onCommentAdded={handleCommentAdded}
          isTurista={isTurista}
        />
      )}

      {reportTarget && (
        <ReportModal
          title={reportTarget.type === 'experience' ? 'Denunciar relato' : 'Denunciar comentário'}
          onSubmit={handleReportSubmit}
          onClose={() => setReportTarget(null)}
        />
      )}

      {reportFeedback && (
        <FormResultModal
          variant={reportFeedback.type === 'error' ? 'error' : 'success'}
          title={reportFeedback.title}
          text={reportFeedback.text}
          onClose={() => setReportFeedback(null)}
        />
      )}

      {confirmDelete && (
        <div
          className={styles.confirmOverlay}
          onClick={(e) => e.target === e.currentTarget && !deleting && closeDeleteModal()}
        >
          <div className={`${styles.confirmDialog} ${deleteSuccess ? styles.confirmDialogSuccess : deleteErr ? styles.confirmDialogError : ''}`}>
            {deleteSuccess ? (
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={styles.confirmSuccessIcon} aria-hidden="true">✓</p>
                <h3 className={styles.confirmTitle}>Local excluído com sucesso!</h3>
                <p className={styles.confirmBody}>O local foi removido da lista.</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="primary" fullWidth onClick={closeDeleteModal}>Fechar</Button>
                </div>
              </>
            ) : deleteErr ? (
              <>
                <p className={styles.confirmLogo}>❤ EuAmoPiri</p>
                <p className={`${styles.confirmSuccessIcon} ${styles.confirmErrIcon}`} aria-hidden="true">⚠️</p>
                <h3 className={styles.confirmTitle}>Erro ao excluir local</h3>
                <p className={styles.confirmBody}>{deleteErr}</p>
                <div className={styles.confirmActionsCol}>
                  <Button variant="neutral" fullWidth onClick={() => setDeleteErr(null)}>Voltar</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className={styles.confirmTitle}>Excluir local</h3>
                <p className={styles.confirmBody}>
                  Tem certeza que deseja excluir <strong>{place.name}</strong>? Esta ação não pode ser desfeita.
                </p>
                <div className={styles.confirmActions}>
                  <Button variant="neutral" fullWidth onClick={closeDeleteModal} disabled={deleting}>
                    Cancelar
                  </Button>
                  <button className={styles.btnDelete} onClick={handleDeleteConfirm} disabled={deleting}>
                    {deleting ? 'Excluindo...' : 'Excluir'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
