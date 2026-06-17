import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { fetchPlaceById, updatePlace } from '../infra/adaptor/placeAdaptor';
import Button from '../presentation/atoms/Button';
import FormField from '../presentation/molecules/FormField';
import Spinner from '../presentation/atoms/Spinner';
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from '../utils/placeCategories';
import styles from './EditPlacePage.module.css';

const CATEGORIAS = CATEGORY_OPTIONS;

export default function EditPlacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [loadErr,      setLoadErr]      = useState(null);
  const [submitStatus, setSubmitStatus] = useState(null); // null | 'success' | 'error'

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  /* Carrega o local e popula o form */
  useEffect(() => {
    fetchPlaceById(id)
      .then((place) => {
        reset({
          name:        place.name        ?? '',
          category:    place.category    ?? 'restaurante',
          description: place.description ?? '',
          address:     place.address     ?? '',
          hours:       place.hours       ?? '',
          phone:       place.phone       ?? '',
        });
        setLoading(false);
      })
      .catch(() => {
        setLoadErr('Local não encontrado.');
        setLoading(false);
      });
  }, [id, reset]);

  async function onSubmit(data) {
    setSaving(true);
    try {
      await updatePlace(id, data);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    } finally {
      setSaving(false);
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.centered}><Spinner size="lg" /></div>
      </div>
    );
  }

  /* ── Erro de carregamento ── */
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

      {/* ── Overlay sucesso ── */}
      {submitStatus === 'success' && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          <div className={styles.resultCard}>
            <p className={styles.resultLogo}>❤ EuAmoPiri</p>
            <span className={styles.resultIcon} aria-hidden="true">✓</span>
            <h2 className={styles.resultTitle}>Local atualizado com sucesso!</h2>
            <p className={styles.resultText}>As informações do local já estão disponíveis para os visitantes.</p>
            <div className={styles.resultActions}>
              <Button variant="primary" fullWidth as={Link} to="/perfil">Voltar ao meu perfil</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Overlay erro ── */}
      {submitStatus === 'error' && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          <div className={`${styles.resultCard} ${styles.resultCardError}`}>
            <p className={styles.resultLogo}>❤ EuAmoPiri</p>
            <span className={`${styles.resultIcon} ${styles.resultIconError}`} aria-hidden="true">⚠️</span>
            <h2 className={styles.resultTitle}>Falha ao salvar alterações</h2>
            <p className={styles.resultText}>Revise os dados e tente novamente.</p>
            <div className={styles.resultActions}>
              <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>Voltar ao formulário</Button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>

        {/* ── Breadcrumb ── */}
        <nav>
          <Button variant="neutral" size="sm" as={Link} to="/perfil">
            ← Voltar ao perfil
          </Button>
        </nav>

        <h1 className={styles.title}>Editar Local</h1>

        <form className={styles.formCard} onSubmit={handleSubmit(onSubmit)} noValidate>

          <div className={styles.formGrid}>

            <FormField
              id="name"
              label="Nome do local"
              placeholder="Ex: Botequim Mercatto Piri"
              registration={register('name', { required: 'Nome é obrigatório' })}
              error={errors.name?.message}
            />

            {/* Categoria */}
            <div className={styles.selectGroup}>
              <label className={styles.selectLabel} htmlFor="category">Categoria</label>
              <select
                id="category"
                className={styles.select}
                {...register('category', { required: 'Selecione uma categoria' })}
              >
                {CATEGORIAS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              {errors.category && (
                <span className={styles.fieldError}>{errors.category.message}</span>
              )}
            </div>

            <FormField
              id="address"
              label="Endereço"
              placeholder="Ex: R. Direita, 68 - Centro Histórico"
              registration={register('address', { required: 'Endereço é obrigatório' })}
              error={errors.address?.message}
            />

            <FormField
              id="hours"
              label="Horário de funcionamento"
              placeholder="Ex: 11h - 22h"
              registration={register('hours')}
            />

            <FormField
              id="phone"
              label="Telefone"
              placeholder="Ex: (62) 3331-1234"
              registration={register('phone')}
            />

          </div>

          <FormField
            id="description"
            label="Descrição"
            multiline
            rows={4}
            maxLength={500}
            placeholder="Descreva o local para os turistas..."
            registration={register('description', {
              maxLength: { value: 500, message: 'Máximo 500 caracteres' },
            })}
            error={errors.description?.message}
          />

          <div className={styles.formActions}>
            <Button
              variant="neutral"
              type="button"
              as={Link}
              to="/perfil"
              disabled={saving}
            >
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
