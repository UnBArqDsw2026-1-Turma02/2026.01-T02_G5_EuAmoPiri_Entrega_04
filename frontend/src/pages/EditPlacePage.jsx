import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchPlaceById, updatePlace } from '../infra/adaptor/placeAdaptor';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import PhotoUploadField from '../presentation/molecules/PhotoUploadField';
import Spinner from '../presentation/atoms/Spinner';
import { CREATE_PLACE_CATEGORY_OPTIONS } from '../utils/placeCategories';
import styles from './EditPlacePage.module.css';
import createStyles from './CreatePlacePage.module.css';

const CATEGORY_OPTIONS = [
  { value: 'gastronomia', label: 'Gastronomia' },
  { value: 'natureza',    label: 'Natureza' },
  { value: 'hospedagem',  label: 'Hospedagem' },
  { value: 'cultura',     label: 'Cultura' },
  { value: 'compras',     label: 'Compras' },
  { value: 'aventura',    label: 'Aventura' },
];

const CATEGORIES = CREATE_PLACE_CATEGORY_OPTIONS;

function requiredTrim(message) {
  return (value) => (typeof value === 'string' && value.trim().length > 0) || message;
}

function formatDateInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export default function EditPlacePage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadErr, setLoadErr] = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const category = watch('category');

  useEffect(() => {
    fetchPlaceById(id)
      .then((place) => {
        reset({
          name: place.name ?? '',
          category: (place.category ?? '').toUpperCase(),
          description: place.description ?? '',
          address: place.address ?? '',
          phone: place.phone ?? '',
          mapsLink: place.mapsLink ?? '',
          openingDate: formatDateInput(place.openingDate),
        });
        setExistingPhotos(place.photos ?? []);
        setLoading(false);
      })
      .finally(() => setLoading(false));
  }, [id, reset]);

  /* ── Gerenciamento de fotos ── */
  function addFiles(fileList) {
    const remaining = 3 - allPhotos.length;
    if (remaining <= 0) return;
    const newItems = Array.from(fileList)
      .filter((f) => f.type.startsWith('image/'))
      .slice(0, remaining)
      .map((file) => ({ url: URL.createObjectURL(file), isNew: true }));
    setAllPhotos((prev) => [...prev, ...newItems]);
  }

  function removePhoto(index) {
    setAllPhotos((prev) => {
      if (prev[index].isNew) URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  }

  function setCover(index) {
    setAllPhotos((prev) => {
      const next = [...prev];
      const [chosen] = next.splice(index, 1);
      return [chosen, ...next];
    });
  }

  function handleFileChange(e) { addFiles(e.target.files); e.target.value = ''; }
  function handleDrop(e) { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }

  async function onSubmit(data) {
    setPhotoError('');

    if (newPhotos.length > 0 && (newPhotos.length < 1 || newPhotos.length > 3)) {
      setPhotoError('Envie entre 1 e 3 fotos para substituir as atuais.');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name.trim());
    formData.append('address', data.address.trim());
    formData.append('category', data.category);
    formData.append('description', data.description.trim());
    if (data.phone?.trim()) formData.append('phone', data.phone.trim());
    if (data.mapsLink?.trim()) formData.append('mapsLink', data.mapsLink.trim());
    if (data.openingDate) formData.append('openingDate', data.openingDate);
    newPhotos.forEach((file) => formData.append('photos', file));

    setSaving(true);
    try {
      await updatePlace(id, formData);
      setSubmitStatus('success');
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const message = err.response?.data?.error;

      if (code === 'PLACE_DUPLICATE') {
        setSubmitStatus('duplicate');
        return;
      }
      if (status === 403) {
        setSubmitStatus('forbidden');
        return;
      }
      if (status === 400 && message && /foto/i.test(message)) {
        setPhotoError(message);
        return;
      }
      setSubmitStatus('error');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}><Spinner size="lg" /></div>
      </div>
    );
  }

  if (loadErr) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={`${styles.feedback} ${styles.error}`}>{loadErr}</p>
          <Button variant="neutral" as={Link} to="/perfil">← Voltar ao perfil</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {submitStatus === 'success' && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          <div className={styles.resultCard}>
            <p className={styles.resultLogo}>❤ EuAmoPiri</p>
            <span className={styles.resultIcon} aria-hidden="true">✓</span>
            <h2 className={styles.resultTitle}>Local atualizado com sucesso!</h2>
            <p className={styles.resultText}>As alterações foram salvas.</p>
            <div className={styles.resultActions}>
              <Button variant="primary" fullWidth as={Link} to={returnTo}>
                {returnTo.startsWith('/locais/') ? 'Ver local' : returnTo === '/locais' ? 'Voltar a Locais' : 'Voltar ao meu perfil'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {submitStatus === 'duplicate' && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.resultCard} ${styles.resultCardError}`}>
            <p className={styles.resultLogo}>❤ EuAmoPiri</p>
            <span className={`${styles.resultIcon} ${styles.resultIconError}`} aria-hidden="true">⚠️</span>
            <h2 className={styles.resultTitle}>Cadastro já existente</h2>
            <p className={styles.resultText}>Já existe outro local com este nome e endereço.</p>
            <div className={styles.resultActions}>
              <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>Voltar ao formulário</Button>
            </div>
          </div>
        </div>
      )}

      {(submitStatus === 'error' || submitStatus === 'forbidden') && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          <div className={styles.resultCard}>
            <p className={styles.resultLogo}>❤ EuAmoPiri</p>
            <span className={styles.resultIcon} aria-hidden="true">⚠️</span>
            <h2 className={styles.resultTitle}>Falha ao salvar alterações</h2>
            <p className={styles.resultText}>
              {submitStatus === 'forbidden'
                ? 'Você não tem permissão para editar este local.'
                : 'Revise os dados e tente novamente.'}
            </p>
            <div className={styles.resultActions}>
              <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>
                Voltar ao formulário
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>

        <nav>
          <Button variant="neutral" size="sm" as={Link} to={returnTo}>
            ← Voltar
          </Button>
        </nav>

        <h1 className={styles.title}>Editar local</h1>

        <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                type="button"
                variant={category === c.value ? 'primary' : 'outline'}
                onClick={() => setValue('category', c.value, { shouldValidate: true })}
              >
                {c.label}
              </Button>
            ))}
          </div>
          <input type="hidden" {...register('category', { required: 'Selecione o tipo de local' })} />
          {errors.category && (
            <span className={styles.fieldError}>{errors.category.message}</span>
          )}

          <div className={styles.formGrid}>
            <FormField
              id="name"
              label="Nome do local"
              placeholder="Ex: Botequim Mercatto Piri"
              registration={register('name', {
                required: 'Nome é obrigatório',
                validate: requiredTrim('Nome é obrigatório'),
              })}
              error={errors.name?.message}
            />

            <FormField
              id="address"
              label="Endereço"
              placeholder="Ex: R. Direita, 68 - Centro Histórico"
              registration={register('address', {
                required: 'Endereço é obrigatório',
                validate: requiredTrim('Endereço é obrigatório'),
              })}
              error={errors.address?.message}
            />
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel} htmlFor="price">Faixa de preço</label>
              <select
                id="price"
                className={styles.select}
                {...register('price')}
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
              label="Data de abertura"
              type="date"
              registration={register('openingDate')}
            />

            <FormField
              id="mapsLink"
              label="Link do Google Maps"
              placeholder="https://maps.google.com/..."
              registration={register('mapsLink')}
            />

          </div>

          <FormField
            id="description"
            label="Descrição"
            multiline
            rows={4}
            maxLength={2000}
            placeholder="Descreva o local para os turistas..."
            registration={register('description', {
              required: 'Descrição é obrigatória',
              validate: requiredTrim('Descrição é obrigatória'),
              maxLength: { value: 2000, message: 'Máximo 2000 caracteres' },
            })}
            error={errors.description?.message}
          />

          {existingPhotos.length > 0 && (
            <div className={styles.existingPhotos}>
              <span className={styles.existingPhotosLabel}>Fotos atuais</span>
              <div className={styles.existingPhotosGrid}>
                {existingPhotos.map((photo) => (
                  <img key={photo.id} src={photo.url} alt="" className={styles.existingPhoto} />
                ))}
              </div>
            </div>
          )}

          <PhotoUploadField
            photos={newPhotos}
            onChange={(files) => {
              setNewPhotos(files);
              if (files.length === 0 || (files.length >= 1 && files.length <= 3)) setPhotoError('');
            }}
            min={0}
            max={3}
            label="Substituir fotos (opcional)"
            hint="Envie de 1 a 3 novas fotos para substituir as atuais. Deixe vazio para manter as fotos existentes."
            error={photoError}
          />

          <div className={styles.formActions}>
            <Button variant="neutral" type="button" onClick={() => navigate(returnTo)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit" loading={saving}>
              Salvar alterações
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
