import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { createPlace } from '../infra/adaptor/placeAdaptor';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import baseStyles from './EditPlacePage.module.css';
import styles from './CreatePlacePage.module.css';

const CATEGORY_OPTIONS = [
  { value: '',            label: 'Selecione uma categoria' },
  { value: 'gastronomia', label: 'Gastronomia / Restaurante' },
  { value: 'natureza',    label: 'Natureza / Cachoeira' },
  { value: 'hospedagem',  label: 'Hospedagem / Pousada' },
  { value: 'cultura',     label: 'Cultura' },
  { value: 'compras',     label: 'Compras' },
  { value: 'aventura',    label: 'Aventura' },
];

const PRICE_OPTIONS = ['$', '$$', '$$$', '$$$$'];

export default function CreatePlacePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [saving, setSaving]             = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'
  const [photos, setPhotos]             = useState([]);   // Array de { file, previewUrl }
  const [photoError, setPhotoError]     = useState(null);
  const [dragOver, setDragOver]         = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { price: '$' } });

  /* ── Gerenciamento das fotos ── */
  function addFiles(fileList) {
    const remaining = 3 - photos.length;
    if (remaining <= 0) return;
    const newFiles = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, remaining)
      .map((file) => ({ file, previewUrl: URL.createObjectURL(file) }));
    setPhotos((prev) => [...prev, ...newFiles]);
    setPhotoError(null);
  }

  function removePhoto(index) {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }

  function handleFileChange(e) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  /* ── Submit ── */
  async function onSubmit(data) {
    if (photos.length < 1) {
      setPhotoError('Adicione pelo menos 1 foto');
      return;
    }
    setPhotoError(null);
    setSaving(true);
    try {
      // Em produção as fotos seriam enviadas ao storage; aqui usamos o previewUrl como placeholder
      const photoUrls = photos.map((p) => p.previewUrl);
      await createPlace({
        ...data,
        photos: photoUrls,
        coverImage: photoUrls[0],
        mapsLink: data.mapsLink || null,
        openingDate: data.openingDate || null,
        moradorId: 1,
        rating: 0,
        reviewsCount: 0,
        commentsCount: 0,
        visitsCount: '0',
        createdAt: new Date().toISOString(),
      });
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={baseStyles.page}>

      {/* ── Overlay de sucesso ── */}
      {submitStatus === 'success' && (
        <div className={baseStyles.resultOverlay} role="dialog" aria-modal="true">
          <div className={baseStyles.resultCard}>
            <p className={baseStyles.resultLogo}>❤ EuAmoPiri</p>
            <span className={baseStyles.resultIcon} aria-hidden="true">✓</span>
            <h2 className={baseStyles.resultTitle}>Local cadastrado com sucesso!</h2>
            <p className={baseStyles.resultText}>
              Seu estabelecimento já está disponível para consulta pública na plataforma.
            </p>
            <div className={baseStyles.resultActions}>
              <Button variant="primary" fullWidth as={Link} to="/locais">
                Ver locais
              </Button>
              <Button variant="neutral" fullWidth as={Link} to="/perfil">
                Voltar ao meu perfil
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay de erro ── */}
      {submitStatus === 'error' && (
        <div className={baseStyles.resultOverlay} role="dialog" aria-modal="true">
          <div className={`${baseStyles.resultCard} ${baseStyles.resultCardError}`}>
            <p className={baseStyles.resultLogo}>❤ EuAmoPiri</p>
            <span className={`${baseStyles.resultIcon} ${baseStyles.resultIconError}`} aria-hidden="true">⚠️</span>
            <h2 className={baseStyles.resultTitle}>Falha ao cadastrar local</h2>
            <p className={baseStyles.resultText}>Verifique os dados e tente novamente.</p>
            <div className={baseStyles.resultActions}>
              <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>
                Voltar ao formulário
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={baseStyles.container}>
        <nav>
          <Button variant="neutral" size="sm" as={Link} to="/perfil">
            ← Voltar ao perfil
          </Button>
        </nav>

        <h1 className={baseStyles.title}>Cadastrar novo local</h1>

        <form className={baseStyles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>

          {/* ── Grid 2 colunas ── */}
          <div className={baseStyles.formGrid}>
            <FormField
              id="name"
              label="Nome do local *"
              placeholder="Nome do estabelecimento"
              registration={register('name', { required: 'Nome é obrigatório' })}
              error={errors.name?.message}
            />

            <div className={baseStyles.selectGroup}>
              <label className={baseStyles.selectLabel} htmlFor="category">Categoria *</label>
              <select
                id="category"
                className={baseStyles.select}
                {...register('category', {
                  required: 'Categoria é obrigatória',
                  validate: (v) => v !== '' || 'Categoria é obrigatória',
                })}
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {errors.category && (
                <span className={baseStyles.fieldError}>{errors.category.message}</span>
              )}
            </div>

            <FormField
              id="address"
              label="Endereço *"
              placeholder="Rua, número - Bairro, Pirenópolis"
              registration={register('address', { required: 'Endereço é obrigatório' })}
              error={errors.address?.message}
            />

            <div className={baseStyles.selectGroup}>
              <label className={baseStyles.selectLabel} htmlFor="price">Faixa de preço *</label>
              <select
                id="price"
                className={baseStyles.select}
                {...register('price', { required: 'Preço é obrigatório' })}
              >
                {PRICE_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <FormField
              id="phone"
              label="Telefone"
              placeholder="Ex: (62) 3331-1234"
              registration={register('phone')}
            />

            <FormField
              id="openingDate"
              label="Data de abertura do local"
              type="date"
              registration={register('openingDate')}
            />
          </div>

          {/* ── Descrição ── */}
          <FormField
            id="description"
            label="Descrição do local * (máx. 2000 caracteres)"
            multiline
            rows={4}
            maxLength={2000}
            watch={watch}
            placeholder="Descreva o local, seus atrativos e diferenciais..."
            registration={register('description', { required: 'Descrição é obrigatória' })}
            error={errors.description?.message}
          />

          {/* ── Link do Maps (opcional) ── */}
          <FormField
            id="mapsLink"
            label="Link do Google Maps (opcional)"
            placeholder="https://maps.google.com/..."
            registration={register('mapsLink')}
          />

          {/* ── Fotos (upload de arquivo, 1–3) ── */}
          <div className={styles.photosSection}>
            <p className={styles.photosLabel}>
              Fotos *{' '}
              <span className={styles.photosHint}>(1 a 3 fotos — a 1ª vira a foto de capa)</span>
            </p>

            {/* Zona de drop */}
            {photos.length < 3 && (
              <div
                className={`${styles.uploadZone} ${dragOver ? styles.dragOver : ''}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
                aria-label="Clique ou arraste para enviar fotos"
              >
                <span className={styles.uploadIcon} aria-hidden="true">☁</span>
                <p className={styles.uploadText}>
                  Arraste e solte ou{' '}
                  <span className={styles.uploadLink}>clique para selecionar</span>
                </p>
                <p className={styles.uploadText}>
                  {photos.length === 0 ? 'Até 3 imagens (JPG, PNG, WEBP)' : `${3 - photos.length} vaga(s) restante(s)`}
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className={styles.fileInput}
              onChange={handleFileChange}
              aria-hidden="true"
            />

            {/* Previews */}
            {photos.length > 0 && (
              <div className={styles.previewGrid}>
                {photos.map(({ previewUrl }, index) => (
                  <div key={previewUrl} className={styles.previewItem}>
                    <img src={previewUrl} alt={`Foto ${index + 1}`} className={styles.previewImg} />
                    <button
                      type="button"
                      className={styles.removePreviewBtn}
                      onClick={() => removePhoto(index)}
                      aria-label={`Remover foto ${index + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {photoError && (
              <span className={baseStyles.fieldError} role="alert">{photoError}</span>
            )}
          </div>

          {/* ── Ações full-width ── */}
          <div className={styles.formActions}>
            <Button variant="neutral" type="button" onClick={() => navigate('/perfil')}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Cadastrar Novo Local
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
