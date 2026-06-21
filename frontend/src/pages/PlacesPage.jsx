import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MdExpandMore } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { apiErrorMessage } from '../infra/adaptor/placeAdaptor';
import { loadPlacesCatalog, peekPlacesCatalog } from '../infra/placesCatalog';
import { formatPublicRating } from '../utils/placeStats';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../utils/placeCategories';
import StarRating from '../presentation/atoms/StarRating';
import Button from '../presentation/atoms/Button';
import Spinner from '../presentation/atoms/Spinner';
import SearchBar from '../presentation/molecules/SearchBar';
import MapResizeHandler from '../presentation/molecules/MapResizeHandler';
import styles from './PlacesPage.module.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const PIRI_CENTER = [-15.8503, -48.9571];

const CATEGORY_FILTERS = [
  { value: '', label: 'Todas' },
  ...CATEGORY_OPTIONS.map((c) => ({ value: c.value, label: `${c.label}s` })),
];

const RATING_FILTERS = [
  { value: '', label: 'Todas as avaliações' },
  { value: '4.5', label: '4.5 estrelas ou mais' },
  { value: '4', label: '4 estrelas ou mais' },
  { value: '3', label: '3 estrelas ou mais' },
];

function SidebarCard({ place, active, onClick, cardRef }) {
  const { starValue, ratingLabel, reviewsLabel } = formatPublicRating(place);
  const isGoogle = place.source === 'google';

  return (
    <Link
      ref={cardRef}
      to={`/locais/${place.id}`}
      className={[styles.sidebarCard, active ? styles.sidebarCardActive : ''].join(' ')}
      onClick={onClick}
      data-place-id={place.id}
    >
      <div className={styles.sidebarCardBody}>
        {place.coverImage ? (
          <img src={place.coverImage} alt="" className={styles.sidebarCardThumb} loading="lazy" />
        ) : (
          <div className={styles.sidebarCardThumbFallback} aria-hidden="true" />
        )}
        <div className={styles.sidebarCardContent}>
          <div className={styles.sidebarCardHeader}>
            <span className={styles.sidebarCardName}>{place.name}</span>
            {isGoogle && <span className={styles.googleBadge}>Google</span>}
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

function MobileFiltersMenu({
  category,
  rating,
  onCategoryChange,
  onRatingChange,
  isMorador,
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  const activeCount = (category ? 1 : 0) + (rating ? 1 : 0);
  const toggleLabel = activeCount > 0 ? `Filtros (${activeCount})` : 'Filtros';

  useEffect(() => {
    if (!open) return undefined;

    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  function handleCategory(value) {
    onCategoryChange(value);
    setOpen(false);
  }

  function handleRating(value) {
    onRatingChange(value);
    setOpen(false);
  }

  return (
    <div className={styles.mobileFiltersWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.filtersToggle}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{toggleLabel}</span>
        <MdExpandMore
          className={[styles.filtersChevron, open ? styles.filtersChevronOpen : ''].join(' ')}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className={styles.filtersDropdown} role="menu">
          <p className={styles.filtersSectionLabel}>Categoria</p>
          <div className={styles.filtersOptions} role="group" aria-label="Filtrar por categoria">
            {CATEGORY_FILTERS.map((item) => (
              <button
                key={item.value || 'all'}
                type="button"
                role="menuitemradio"
                aria-checked={category === item.value}
                className={[
                  styles.filtersOption,
                  category === item.value ? styles.filtersOptionActive : '',
                ].join(' ')}
                onClick={() => handleCategory(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <p className={styles.filtersSectionLabel}>Avaliação mínima</p>
          <div className={styles.filtersOptions} role="group" aria-label="Filtrar por avaliação">
            {RATING_FILTERS.map((item) => (
              <button
                key={item.value || 'all-rating'}
                type="button"
                role="menuitemradio"
                aria-checked={rating === item.value}
                className={[
                  styles.filtersOption,
                  rating === item.value ? styles.filtersOptionActive : '',
                ].join(' ')}
                onClick={() => handleRating(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isMorador && (
            <Link
              to="/morador/locais/novo"
              className={styles.filtersCadastrarLink}
              onClick={() => setOpen(false)}
            >
              + Cadastrar local
            </Link>
          )}
        </div>
      )}
    </div>
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

  const listRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {
    let cancelled = false;

    const cached = peekPlacesCatalog();
    if (cached !== null) {
      setPlaces(cached);
      setLoading(false);
      setError(null);
      return undefined;
    }

    setLoading(true);
    setError(null);

    loadPlacesCatalog()
      .then((data) => {
        if (!cancelled) {
          setPlaces(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(apiErrorMessage(err, 'Erro ao carregar locais'));
          setLoading(false);
        }
      });

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

  const handleMarkerClick = useCallback((placeId) => {
    setActiveId(placeId);
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const el = cardRefs.current[activeId];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeId]);

  const mapResizeTrigger = `${category}-${rating}-${filtered.length}`;

  return (
    <div className={styles.page}>
      <div className={styles.controls}>
        <div className={styles.searchBarWrapper}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar local..."
            showSubmit={false}
          />
        </div>

        <MobileFiltersMenu
          category={category}
          rating={rating}
          onCategoryChange={setCategory}
          onRatingChange={setRating}
          isMorador={isMorador}
        />

        <Link to="/" className={styles.backLink}>← Voltar</Link>

        <div className={styles.desktopFilters}>
          <div className={styles.categoryChips} role="group" aria-label="Filtrar por categoria">
            {CATEGORY_FILTERS.map((item) => (
              <Button
                key={item.value || 'all'}
                type="button"
                size="sm"
                variant={category === item.value ? 'primary' : 'outline'}
                aria-pressed={category === item.value}
                onClick={() => setCategory(item.value)}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className={styles.filterRow}>
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
        </div>
      </div>

      <div className={styles.body}>
        <div className={styles.mapArea}>
          {!loading && (
            <MapContainer center={PIRI_CENTER} zoom={14} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapResizeHandler trigger={mapResizeTrigger} />
              {filtered.map((p) =>
                p.lat && p.lng ? (
                  <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    eventHandlers={{ click: () => handleMarkerClick(p.id) }}
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
          {loading && <div className={styles.centered}><Spinner size="lg" /></div>}
          {error && !loading && (
            <div className={styles.centered}><p>Erro ao carregar mapa: {error}</p></div>
          )}
        </div>

        <aside className={styles.sidebar} aria-label="Lista de locais">
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>LOCAIS EM PIRENÓPOLIS</h2>
            {!loading && (
              <span className={styles.sheetCount}>
                {filtered.length} {filtered.length === 1 ? 'local' : 'locais'}
              </span>
            )}
          </div>

          <p className={styles.sidebarHint}>
            Locais do Google (até 40 por categoria) e cadastrados por moradores — todos com página de detalhe e relatos.
          </p>

          <div className={styles.sheetList} ref={listRef}>
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
                cardRef={(el) => { cardRefs.current[place.id] = el; }}
              />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
