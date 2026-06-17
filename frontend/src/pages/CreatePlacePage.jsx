import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { createPlace } from '../infra/adaptor/placeAdaptor';
import ProfileSummaryBar from '../presentation/organisms/ProfileSummaryBar';
import RoleNotice from '../presentation/molecules/RoleNotice';
import PhotoUploadField from '../presentation/molecules/PhotoUploadField';
import FormResultModal from '../presentation/molecules/FormResultModal';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import { CREATE_PLACE_CATEGORY_OPTIONS } from '../utils/placeCategories';
import styles from './CreatePlacePage.module.css';

const CATEGORIES = CREATE_PLACE_CATEGORY_OPTIONS;

function requiredTrim(message) {
  return (value) => (typeof value === 'string' && value.trim().length > 0) || message;
}

export default function CreatePlacePage() {
  const { user, isMorador } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState('');
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      address: '',
      description: '',
      phone: '',
      mapsLink: '',
      openingDate: '',
      category: '',
    },
  });

  const category = watch('category');

  if (!isMorador) {
    return (
      <RoleNotice
        title="Acesso restrito"
        message="Para cadastrar um local, é necessário ter uma conta de morador."
        backTo="/locais"
        backLabel="Voltar aos locais"
      />
    );
  }

  async function onSubmit(data) {
    setPhotoError('');
    setFormError('');

    if (photos.length < 1 || photos.length > 3) {
      setPhotoError('Envie entre 1 e 3 fotos do estabelecimento.');
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
    photos.forEach((file) => formData.append('photos', file));

    setLoading(true);
    try {
      const created = await createPlace(formData);
      setModal({
        type: 'success',
        name: created.name,
      });
      reset();
      setPhotos([]);
    } catch (err) {
      const status = err.response?.status;
      const code = err.response?.data?.code;
      const message = err.response?.data?.error ?? 'Erro ao cadastrar o local.';

      if (code === 'PLACE_DUPLICATE') {
        setModal({ type: 'duplicate' });
        return;
      }

      if (status === 400) {
        if (/foto/i.test(message)) {
          setPhotoError(message);
        } else {
          setFormError(message);
        }
        return;
      }

      setModal({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <ProfileSummaryBar
          user={user}
          statLabel="Quantidade de relatos sobre os seus locais"
          statValue="5"
        />

        <p className={styles.sectionTitle}>CADASTRAR NOVO LOCAL</p>

        <div className={styles.card}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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
              <span className={styles.fieldError} role="alert">{errors.category.message}</span>
            )}

            {formError && (
              <p className={styles.formError} role="alert">{formError}</p>
            )}

            <div className={styles.formGrid}>
              <div className={styles.fields}>
                <FormField
                  id="name"
                  label="Nome do Local"
                  placeholder="Restaurante LovePiri"
                  registration={register('name', {
                    required: 'Nome é obrigatório',
                    validate: requiredTrim('Nome é obrigatório'),
                  })}
                  error={errors.name?.message}
                />
                <FormField
                  id="phone"
                  label="Telefone do Local"
                  placeholder="(XX) XXXXX-XXXX"
                  registration={register('phone')}
                />
                <FormField
                  id="openingDate"
                  label="Data de Abertura do Local"
                  type="date"
                  registration={register('openingDate')}
                />
                <FormField
                  id="address"
                  label="Endereço do Local"
                  placeholder="Rua, número - bairro, Pirenópolis"
                  registration={register('address', {
                    required: 'Endereço é obrigatório',
                    validate: requiredTrim('Endereço é obrigatório'),
                  })}
                  error={errors.address?.message}
                />
                <FormField
                  id="mapsLink"
                  label="Link do Local no Google Maps"
                  placeholder="https://maps.google.com/..."
                  registration={register('mapsLink')}
                />
                <FormField
                  id="description"
                  label="Descrição do Local (Máx 2000 Caracteres)"
                  multiline
                  rows={5}
                  maxLength={2000}
                  placeholder="Descreva o estabelecimento..."
                  registration={register('description', {
                    required: 'Descrição é obrigatória',
                    validate: requiredTrim('Descrição é obrigatória'),
                    maxLength: { value: 2000, message: 'Máximo de 2000 caracteres' },
                  })}
                  error={errors.description?.message}
                />
              </div>

              <PhotoUploadField
                photos={photos}
                onChange={(files) => {
                  setPhotos(files);
                  if (files.length >= 1 && files.length <= 3) setPhotoError('');
                }}
                min={1}
                max={3}
                label="Fotos do local"
                hint="Para um melhor reconhecimento do local pelos turistas, envie de 1 a 3 fotos."
                error={photoError}
              />
            </div>

            <div className={styles.actions}>
              <Button variant="neutral" type="button" as={Link} to="/perfil">Cancelar</Button>
              <Button variant="primary" type="submit" loading={loading}>Cadastrar Novo Local</Button>
            </div>
          </form>
        </div>
      </div>

      {modal?.type === 'success' && (
        <FormResultModal
          variant="success"
          title={`${modal.name} cadastrado com sucesso`}
          primaryAction={{ label: 'Voltar as informações dos meus locais', to: '/perfil' }}
        />
      )}
      {modal?.type === 'duplicate' && (
        <FormResultModal
          variant="warning"
          title="Cadastro já existente"
          text="Este estabelecimento ou experiência já foi cadastrado anteriormente"
          primaryAction={{ label: 'Outro cadastro', onClick: () => setModal(null) }}
          secondaryAction={{ label: 'Voltar as informações dos meus locais', to: '/perfil' }}
        />
      )}
      {modal?.type === 'error' && (
        <FormResultModal
          variant="error"
          title="Falha ao cadastrar local"
          text={modal.message}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
