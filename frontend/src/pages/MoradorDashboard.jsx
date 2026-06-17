import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { fetchMyPlaces } from '../infra/adaptor/placeAdaptor';
import { fetchExperiencesByPlaces } from '../infra/adaptor/experienceAdaptor';
import StarRating from '../presentation/atoms/StarRating';
import Spinner from '../presentation/atoms/Spinner';
import styles from './MoradorDashboard.module.css';

/* ── Corrige ícones do Leaflet no Vite ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PIRI_CENTER = [-15.8503, -48.9571];

const SORT_OPTIONS = [
  { key: 'recent',  label: 'Mais recentes' },
  { key: 'highest', label: 'Maior avaliação' },
  { key: 'lowest',  label: 'Menor avaliação' },
  { key: 'reacted', label: 'Mais reagidos' },
];

const COST_OPTIONS = ['$', '$$', '$$$'];

/** Converte ISO date para "há X dias/horas" */
function timeAgo(isoDate) {
  const diff = Date.now() - new Date(isoDate).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoje';
  if (days === 1) return 'há 1 dia';
  if (days < 30) return `há ${days} dias`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'há 1 mês' : `há ${months} meses`;
}

const REACTION_EMOJIS = [
  { key: 'heart',   emoji: '❤️' },
  { key: 'like',    emoji: '👍' },
  { key: 'dislike', emoji: '👎' },
];

/** Total de reações (usado apenas para ordenação) */
function totalReactions(reactions = {}) {
  return Object.values(reactions).reduce((s, v) => s + (v || 0), 0);
}

/* ── Card de local na sidebar ── */
function PlaceSidebarCard({ place }) {
  return (
    <Link to={`/locais/${place.id}`} className={styles.placeCard}>
      <div className={styles.placeCardIcon} aria-hidden="true">🏠</div>
      <div className={styles.placeCardInfo}>
        <span className={styles.placeCardName}>{place.name}</span>
        <span className={styles.placeCardCat}>{place.category}</span>
        <div className={styles.placeCardMeta}>
          <StarRating value={Math.round(place.rating ?? 0)} readonly size="sm" />
          <span className={styles.placeCardRating}>{place.rating?.toFixed(1)}</span>
          <span className={styles.placeCardPrice}>{place.price}</span>
          <span className={styles.placeCardReviews}>{place.reviewsCount} Avaliações</span>
        </div>
      </div>
    </Link>
  );
}

/* ── Card de relato na seção inferior ── */
function ReviewCard({ experience, placeName, placeId }) {
  return (
    <article className={styles.reviewCard}>
      <div className={styles.reviewCardHeader}>
        <Link to={`/locais/${placeId}`} className={styles.reviewPlaceName}>
          <span className={styles.pinIcon} aria-hidden="true">📍</span>
          {placeName}
        </Link>
        <span className={styles.reviewDate}>{timeAgo(experience.createdAt)}</span>
      </div>
      <div className={styles.reviewAuthor}>{experience.userName}</div>
      <StarRating value={experience.rating ?? 0} readonly size="sm" />
      <p className={styles.reviewTitle}>{experience.title}</p>
      <p className={styles.reviewText}>{experience.text}</p>
      <div className={styles.reviewReactions}>
        {REACTION_EMOJIS.map(({ key, emoji }) => {
          const count = experience.reactions?.[key] ?? 0;
          if (count === 0) return null;
          return (
            <span
              key={key}
              className={styles.reactionCount}
              aria-label={`${key}: ${count}`}
            >
              {emoji} {count}
            </span>
          );
        })}
      </div>
    </article>
  );
}

export default function MoradorDashboard() {
  const { user } = useAuth();

  const [places, setPlaces]           = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  /* Filtros */
  const [ratingFilter, setRatingFilter] = useState('');
  const [costFilter, setCostFilter]     = useState('');

  /* Ordenação */
  const [sortKey, setSortKey] = useState('recent');

  /* Carrega dados do morador */
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const myPlaces = await fetchMyPlaces(user.id);
        if (cancelled) return;
        setPlaces(myPlaces);

        if (myPlaces.length > 0) {
          const placeIds = myPlaces.map((p) => p.id);
          const exps = await fetchExperiencesByPlaces(placeIds);
          if (!cancelled) setExperiences(exps);
        }
      } catch {
        if (!cancelled) setError('Erro ao carregar dados do painel.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [user]);

  /* Mapa de id→place para lookup rápido nos cards de relato */
  const placeMap = useMemo(
    () => Object.fromEntries(places.map((p) => [p.id, p])),
    [places],
  );

  /* Filtragem */
  const filtered = useMemo(() => {
    return experiences.filter((e) => {
      if (ratingFilter && e.rating !== Number(ratingFilter)) return false;
      if (costFilter && e.cost !== costFilter) return false;
      return true;
    });
  }, [experiences, ratingFilter, costFilter]);

  /* Ordenação */
  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortKey) {
      case 'highest': return arr.sort((a, b) => b.rating - a.rating);
      case 'lowest':  return arr.sort((a, b) => a.rating - b.rating);
      case 'reacted': return arr.sort((a, b) => totalReactions(b.reactions) - totalReactions(a.reactions));
      default:        return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  }, [filtered, sortKey]);

  if (loading) {
    return (
      <div className={styles.centered}>
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorMsg}>{error}</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* Barra de filtros */}
      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-rating">AVALIAÇÃO</label>
          <select
            id="filter-rating"
            className={styles.filterSelect}
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            aria-label="Filtrar por avaliação"
          >
            <option value="">Todas</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>{n} estrela{n !== 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel} htmlFor="filter-cost">CUSTO</label>
          <select
            id="filter-cost"
            className={styles.filterSelect}
            value={costFilter}
            onChange={(e) => setCostFilter(e.target.value)}
            aria-label="Filtrar por custo"
          >
            <option value="">Todos</option>
            {COST_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Área principal: mapa + sidebar de locais */}
      <div className={styles.mainArea}>

        {/* Mapa */}
        <div className={styles.mapWrapper}>
          {places.length > 0 ? (
            <MapContainer
              center={PIRI_CENTER}
              zoom={13}
              className={styles.map}
              aria-label="Mapa dos seus locais cadastrados"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              />
              {places.map((place) => (
                <Marker
                  key={place.id}
                  position={[place.lat, place.lng]}
                >
                  <Popup>
                    <strong>{place.name}</strong>
                    <br />
                    <Link to={`/locais/${place.id}`}>Ver detalhes →</Link>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          ) : (
            <div className={styles.mapEmpty}>
              <p>Você ainda não tem locais cadastrados.</p>
              <Link to="/morador/locais/novo" className={styles.noPlacesLink}>
                + Cadastrar novo local
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: locais cadastrados */}
        <aside className={styles.placesSidebar} aria-label="Locais cadastrados">
          <h2 className={styles.sidebarTitle}>LOCAIS CADASTRADOS</h2>
          <div className={styles.placesList}>
            {places.length === 0 ? (
              <p className={styles.emptyMsg}>Nenhum local cadastrado.</p>
            ) : (
              places.map((place) => (
                <PlaceSidebarCard key={place.id} place={place} />
              ))
            )}
          </div>
          <Link to="/morador/locais/novo" className={styles.addPlaceBtn}>
            + Cadastrar novo local
          </Link>
        </aside>
      </div>

      {/* Seção de relatos */}
      <section className={styles.reviewsSection} aria-label="Relatos sobre locais cadastrados">
        <h2 className={styles.reviewsSectionTitle}>RELATOS SOBRE LOCAIS CADASTRADOS</h2>

        <div className={styles.reviewsLayout}>

          {/* Botões de ordenação */}
          <div className={styles.sortPanel}>
            <span className={styles.sortLabel}>Ordenar por:</span>
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                className={[
                  styles.sortBtn,
                  sortKey === opt.key ? styles.sortBtnActive : '',
                ].join(' ')}
                onClick={() => setSortKey(opt.key)}
                aria-pressed={sortKey === opt.key}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Cards de relatos */}
          <div className={styles.reviewsGrid}>
            {sorted.length === 0 ? (
              <p className={styles.emptyMsg}>
                {experiences.length === 0
                  ? 'Ainda não há relatos nos seus locais.'
                  : 'Nenhum relato encontrado para os filtros selecionados.'}
              </p>
            ) : (
              sorted.map((exp) => (
                <ReviewCard
                  key={exp.id}
                  experience={exp}
                  placeName={placeMap[exp.placeId]?.name ?? 'Local'}
                  placeId={exp.placeId}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
