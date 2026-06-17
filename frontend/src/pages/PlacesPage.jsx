/**
 * PÁGINA — PlacesPage  (RF06: Consulta de Locais)
 *
 * Layout: mapa interativo (OpenStreetMap via Leaflet) + sidebar de locais.
 * Para substituir pelo Google Maps: trocar <MapContainer> por <GoogleMap>
 * de @react-google-maps/api — a estrutura de dados (lat/lng) permanece igual.
 *
 * Dependências: react-leaflet leaflet
 */
import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdSearch } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { fetchPlaces } from '../infra/adaptor/placeAdaptor';
import { fetchExperiencesByPlaces } from '../infra/adaptor/experienceAdaptor';
import { enrichPlacesWithExperienceStats, formatPublicRating } from '../utils/placeStats';
import { CATEGORY_LABELS } from '../utils/placeCategories';
import StarRating from '../presentation/atoms/StarRating';
import Button from '../presentation/atoms/Button';
import Spinner from '../presentation/atoms/Spinner';
import styles from './PlacesPage.module.css';

/* ── Corrige ícones do Leaflet no Vite ── */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PIRI_CENTER = [-15.8503, -48.9571];

/* ── Card compacto para a sidebar ── */
function SidebarCard({ place, active, onClick }) {
  const { starValue, ratingLabel, reviewsLabel } = formatPublicRating(place);

  return (
    <Link
      to={`/locais/${place.id}`}
      className={[styles.sidebarCard, active ? styles.sidebarCardActive : ''].join(' ')}
      onClick={onClick}
    >
      <div className={styles.sidebarCardBody}>
        {place.coverImage ? (
          <img
            src={place.coverImage}
            alt=""
            className={styles.sidebarCardThumb}
            loading="lazy"
          />
        ) : (
          <div className={styles.sidebarCardThumbFallback} aria-hidden="true" />
        )}
        <div className={styles.sidebarCardContent}>
          <div className={styles.sidebarCardHeader}>
            <span className={styles.sidebarCardName}>{place.name}</span>
          </div>
          <span className={styles.sidebarCardCat}>
            {CATEGORY_LABELS[place.category] ?? place.category}
          </span>
          <div className={styles.sidebarCardRating}>
            <StarRating value={starValue} readonly size="sm" />
            {ratingLabel != null && (
              <span className={styles.sidebarCardRatingNum}>{ratingLabel}</span>
            )}
            <span className={styles.sidebarCardReviews}>({reviewsLabel})</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PlacesPage() {
  const { isMorador } = useAuth();

  const [places, setPlaces]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [search, setSearch]     = useState('');
  const [category, setCategory] = useState('');
  const [rating, setRating]     = useState('');
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchPlaces();
        const list = Array.isArray(data) ? data : [];
        if (list.length === 0) {
          if (!cancelled) {
            setPlaces([]);
            setLoading(false);
          }
          return;
        }

        const experiences = await fetchExperiencesByPlaces(list.map((p) => p.id));
        if (!cancelled) {
          setPlaces(enrichPlacesWithExperienceStats(list, experiences));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message ?? 'Erro ao carregar locais');
          setLoading(false);
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return places.filter((p) => {
      const matchText = !q || p.name.toLowerCase().includes(q) || p.address?.toLowerCase().includes(q);
      const matchCat  = !category || p.category === category;
      const matchRat  = !rating   || (p.rating ?? 0) >= Number(rating);
      return matchText && matchCat && matchRat;
    });
  }, [places, search, category, rating]);

  return (
    <div className={styles.page}>

      {/* ── Barra de controles ── */}
      <div className={styles.controls}>
        <Link to="/" className={styles.backLink}>← Voltar</Link>

        <div className={styles.searchWrapper}>
          <MdSearch className={styles.searchIcon} aria-hidden="true" />
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Buscar local..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar local"
          />
        </div>

        <label className={styles.filterGroup}>
          <span className={styles.filterLabel}>CATEGORIA</span>
          <select className={styles.filterSelect} value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>

        <label className={styles.filterGroup}>
          <span className={styles.filterLabel}>AVALIAÇÃO</span>
          <select className={styles.filterSelect} value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="">Todas</option>
            <option value="4.5">4.5+</option>
            <option value="4">4+</option>
            <option value="3">3+</option>
          </select>
        </label>


        {isMorador && (
          <Button as={Link} to="/morador/locais/novo" variant="primary" size="sm">
            + Cadastrar
          </Button>
        )}
      </div>

      {/* ── Corpo: mapa + sidebar ── */}
      <div className={styles.body}>

        {/* Mapa */}
        <div className={styles.mapArea}>
          {!loading && (
            <MapContainer
              center={PIRI_CENTER}
              zoom={14}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filtered.map((p) =>
                p.lat && p.lng ? (
                  <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    eventHandlers={{ click: () => setActiveId(p.id) }}
                  >
                    <Popup>
                      <strong>{p.name}</strong><br />
                      {CATEGORY_LABELS[p.category] ?? p.category}<br />
                      <Link to={`/locais/${p.id}`}>Ver detalhes →</Link>
                    </Popup>
                  </Marker>
                ) : null
              )}
            </MapContainer>
          )}
          {loading && (
            <div className={styles.centered}><Spinner size="lg" /></div>
          )}
          {error && !loading && (
            <div className={styles.centered}>
              <p>Erro ao carregar mapa: {error}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <h2 className={styles.sidebarTitle}>LOCAIS PRÓXIMOS</h2>

          {loading && <div className={styles.centered}><Spinner size="md" /></div>}

          {!loading && filtered.length === 0 && (
            <p className={styles.emptyMsg}>Nenhum local encontrado.</p>
          )}

          {!loading && filtered.map((place) => (
            <SidebarCard
              key={place.id}
              place={place}
              active={activeId === place.id}
              onClick={() => setActiveId(place.id)}
            />
          ))}
        </aside>

      </div>
    </div>
  );
}
