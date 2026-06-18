import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import StarRating from '../atoms/StarRating';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import styles from './ExperienceForm.module.css';

const COST_OPTIONS = ['$', '$$', '$$$', '$$$$', '$$$$$'];

/**
 * RNF02 — Blacklist client-side
 * Detecta linguagem ofensiva antes de enviar ao backend.
 */
const BLACKLIST = [
  'merda', 'idiota', 'imbecil', 'burro', 'puta', 'foda', 'fodas', 'fodase',
  'caralho', 'viado', 'desgraça', 'inferno', 'lixo', 'bosta', 'cuzão', 'otário',
  'filhodaputa', 'arrombado', 'babaca', 'cretino', 'maldito', 'vagabundo',
];

function containsBlacklistedWord(text) {
  if (!text) return false;
  const normalized = text.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return BLACKLIST.some((w) => normalized.includes(w));
}

export default function ExperienceForm({
  onSubmit,
  onCancel,
  loading       = false,
  defaultValues = {},
  /* Customização dos modais de resultado */
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
    getValues,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating:    defaultValues.rating    ?? 0,
      cost:      defaultValues.cost      ?? '',
      visitDate: defaultValues.visitDate ?? '',
      title:     defaultValues.title     ?? '',
      text:      defaultValues.text      ?? '',
    },
  });

  const rating = watch('rating');
  const cost   = watch('cost');
  const [submitStatus,  setSubmitStatus]  = useState(null); // null | 'success' | 'error'
  const [ratingTouched, setRatingTouched] = useState(false);

  async function onFormSubmit(data) {
    setRatingTouched(true);
    if (data.rating === 0) return;
    try {
      await onSubmit(data);
      setSubmitStatus('success');
    } catch {
      setSubmitStatus('error');
    }
  }

  /**
   * RNF02 — Verifica blacklist ANTES da validação do react-hook-form.
   * Se o texto contiver palavra proibida, exibe o overlay de erro imediatamente,
   * sem depender de minLength/required.
   */
  function handleFormSubmit(e) {
    const text = getValues('text');
    if (containsBlacklistedWord(text)) {
      e.preventDefault();
      setSubmitStatus('error');
      return;
    }
    // Passa para a validação normal do react-hook-form
    handleSubmit(onFormSubmit)(e);
  }

  return (
    <>
    {/* ── Overlay de sucesso ── */}
    {submitStatus === 'success' && (
      <div className={styles.resultModal} role="dialog" aria-modal="true">
        <div className={styles.resultCard}>
          <p className={styles.resultLogo}>❤ EuAmoPiri</p>
          <span className={styles.resultIcon} aria-hidden="true">✓</span>
          <h2 className={styles.resultTitle}>{successTitle}</h2>
          <p className={styles.resultText}>{successText}</p>
          <div className={styles.resultActions}>
            <Button variant="primary" fullWidth as={Link} to={successPrimary.to}>{successPrimary.label}</Button>
            {successSecondary && (
              <Button variant="neutral" fullWidth as={Link} to={successSecondary.to}>{successSecondary.label}</Button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── Overlay de erro ── */}
    {submitStatus === 'error' && (
      <div className={styles.resultModal} role="dialog" aria-modal="true">
        <div className={`${styles.resultCard} ${styles.resultCardError}`}>
          <p className={styles.resultLogo}>❤ EuAmoPiri</p>
          <span className={`${styles.resultIcon} ${styles.resultIconError}`} aria-hidden="true">⚠️</span>
          <h2 className={styles.resultTitle}>{errorTitle}</h2>
          <p className={styles.resultText}>{errorText}</p>
          <div className={styles.resultActions}>
            <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>Voltar</Button>
          </div>
        </div>
      </div>
    )}

    <form className={styles.form} onSubmit={handleFormSubmit} noValidate>

      {/* ── Avaliação em estrelas ── */}
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

      {/* ── Data da visita ── */}
      <FormField
        id="visitDate"
        label="Data da visita"
        type="date"
        registration={register('visitDate')}
      />

      {/* ── Classificação de custo ── */}
      <div className={styles.field}>
        <span className={styles.fieldLabel}>Qual foi o custo?</span>
        <div className={styles.box}>
          <span className={styles.boxLabel}>CLASSIFICAÇÃO DE CUSTO</span>
          <div className={styles.costRow}>
            {COST_OPTIONS.map((opt) => (
              <Button
                key={opt}
                type="button"
                variant={cost === opt ? 'olive' : 'outline'}
                size="sm"
                onClick={() => setValue('cost', opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Diretrizes ── */}
      <div className={styles.guidelines}>
        <p className={styles.guidelinesTitle}>COMPARTILHE SUA EXPERIÊNCIA COM RESPEITO 🤝</p>
        <p className={styles.guidelinesText}>
          EVITE LINGUAGEM OFENSIVA E PREFIRA COMENTÁRIOS CONSTRUTIVOS — ISSO AJUDA OUTROS VIAJANTES!
        </p>
      </div>

      {/* ── Título + Comentário numa caixinha ── */}
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
            maxLength={2000}
            placeholder="Compartilhe sua experiência (mínimo 20 caracteres)..."
            registration={register('text', {
              required:  'O comentário não pode estar vazio',
              minLength: { value: 20, message: 'Mínimo de 20 caracteres' },
              maxLength: { value: 2000, message: 'Máximo de 2000 caracteres' },
            })}
            error={errors.text?.message}
          />
    
        </div>
      </div>

      {/* ── Ações ── */}
      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" variant="neutral" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" variant="primary" loading={loading}>
          Enviar Avaliação
        </Button>
      </div>
    </form>
    </>
  );
}
