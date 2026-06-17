import { useState } from 'react';
import { useForm } from 'react-hook-form';
import StarRating from '../atoms/StarRating';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import PhotoUploadField from '../molecules/PhotoUploadField';
import FormResultModal from '../molecules/FormResultModal';
import { containsBlacklistedWord } from '../../utils/blacklist';
import styles from './ExperienceForm.module.css';

const MIN_TEXT = 100;
const MAX_TEXT = 2000;

export default function ExperienceForm({
  onSubmit,
  onCancel,
  loading       = false,
  defaultValues = {},
  successTitle   = 'Avaliação enviada com sucesso',
  successText    = 'Sua experiência vai ajudar outros viajantes.',
  successPrimary = { label: 'Avaliar outros lugares', to: '/locais' },
  successSecondary = { label: 'Voltar para a página inicial', to: '/' },
  errorTitle   = 'Falha ao enviar avaliação',
  errorText    = 'Revise o conteúdo e tente novamente, mantendo uma linguagem respeitosa.',
}) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: defaultValues.rating ?? 0,
      title:  defaultValues.title  ?? '',
      text:   defaultValues.text   ?? '',
      visitDate: defaultValues.visitDate ?? '',
    },
  });

  const rating = watch('rating');
  const [photos, setPhotos] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [blacklistError, setBlacklistError] = useState('');

  async function onFormSubmit(data) {
    setRatingTouched(true);
    setBlacklistError('');
    if (data.rating === 0) return;
    if (!data.text?.trim()) return;
    if (containsBlacklistedWord(data.text)) {
      setBlacklistError('Revise o conteúdo e tente novamente, mantendo uma linguagem respeitosa.');
      setSubmitStatus('error');
      return;
    }
    try {
      await onSubmit({ ...data, photos });
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  }

  return (
    <>
    {submitStatus === 'success' && (
      <FormResultModal
        variant="success"
        title={successTitle}
        text={successText}
        primaryAction={successPrimary}
        secondaryAction={successSecondary}
      />
    )}

    {submitStatus === 'error' && (
      <FormResultModal
        variant="error"
        title={errorTitle}
        text={blacklistError || errorText}
        onClose={() => setSubmitStatus(null)}
      />
    )}

    <form className={styles.form} onSubmit={handleSubmit(onFormSubmit)} noValidate>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Qual sua avaliação?</span>
        <div className={styles.box}>
          <span className={styles.boxLabel}>AVALIAÇÃO EM ESTRELAS</span>
          <StarRating
            value={rating}
            onChange={(v) => { setValue('rating', v); setRatingTouched(true); }}
            size="lg"
            label="Avaliação do local"
          />
          {ratingTouched && rating === 0 && (
            <span className={styles.fieldError}>Selecione uma avaliação</span>
          )}
          {!ratingTouched && rating === 0 && (
            <span className={styles.hint}>Clique para avaliar</span>
          )}
        </div>
      </div>

      <FormField
        id="visitDate"
        label="Data da visita"
        type="date"
        registration={register('visitDate', { required: 'Data da visita é obrigatória' })}
        error={errors.visitDate?.message}
      />

      <div className={styles.guidelines}>
        <p className={styles.guidelinesTitle}>COMPARTILHE SUA EXPERIÊNCIA COM RESPEITO 🤝</p>
        <p className={styles.guidelinesText}>
          EVITE LINGUAGEM OFENSIVA E PREFIRA COMENTÁRIOS CONSTRUTIVOS — ISSO AJUDA OUTROS VIAJANTES!
        </p>
      </div>

      <div className={styles.field}>
        <span className={styles.fieldLabel}>Deixe seu comentário</span>
        <div className={styles.box}>
          <FormField
            id="title"
            label="TÍTULO (OPCIONAL)"
            placeholder="Ex: Experiência incrível"
            registration={register('title')}
          />
          <FormField
            id="text"
            label="SEU COMENTÁRIO"
            multiline
            rows={4}
            maxLength={MAX_TEXT}
            placeholder="Compartilhe sua experiência (mínimo 100 caracteres)..."
            registration={register('text', {
              required: 'O comentário não pode estar vazio',
              validate: (value) => {
                if (rating > 0 && !value?.trim()) {
                  return 'O comentário é obrigatório quando há avaliação em estrelas';
                }
                if (value?.trim() && value.trim().length < MIN_TEXT) {
                  return `Mínimo de ${MIN_TEXT} caracteres`;
                }
                return true;
              },
              minLength: { value: MIN_TEXT, message: `Mínimo de ${MIN_TEXT} caracteres` },
              maxLength: { value: MAX_TEXT, message: `Máximo de ${MAX_TEXT} caracteres` },
            })}
            error={errors.text?.message || blacklistError}
          />
        </div>
      </div>

      <PhotoUploadField
        photos={photos}
        onChange={setPhotos}
        min={0}
        max={3}
        label="Fotos (opcional)"
        hint="Envie até 3 fotos da sua visita."
      />

      <div className={styles.actions}>
        {onCancel && (
          <Button variant="neutral" type="button" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
        )}
        <Button variant="primary" type="submit" loading={loading}>
          Enviar Avaliação
        </Button>
      </div>
    </form>
    </>
  );
}
