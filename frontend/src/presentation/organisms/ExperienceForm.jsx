import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import StarRating from '../atoms/StarRating';
import Button from '../atoms/Button';
import FormField from '../molecules/FormField';
import styles from './ExperienceForm.module.css';

const COST_OPTIONS = ['$', '$$', '$$$', '$$$$', '$$$$$'];

export default function ExperienceForm({ onSubmit, onCancel, loading = false, defaultValues = {} }) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      rating: defaultValues.rating ?? 0,
      cost:   defaultValues.cost   ?? '',
      title:  defaultValues.title  ?? '',
      text:   defaultValues.text   ?? '',
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

  /* ── Modal sucesso ── */
  if (submitStatus === 'success') {
    return (
      <div className={styles.resultModal}>
        <p className={styles.resultLogo}>❤ EuAmoPiri</p>
        <span className={styles.resultIcon} aria-hidden="true">✓</span>
        <h2 className={styles.resultTitle}>Avaliação enviada com sucesso</h2>
        <p className={styles.resultText}>Sua experiência vai ajudar outros viajantes.</p>
        <Button variant="primary" fullWidth as={Link} to="/locais">Avaliar outros lugares</Button>
        <Button variant="neutral" fullWidth as={Link} to="/">Voltar para a página inicial</Button>
      </div>
    );
  }

  /* ── Modal erro ── */
  if (submitStatus === 'error') {
    return (
      <div className={styles.resultModal}>
        <p className={styles.resultLogo}>❤ EuAmoPiri</p>
        <span className={`${styles.resultIcon} ${styles.resultIconError}`} aria-hidden="true">⚠️</span>
        <h2 className={styles.resultTitle}>Falha ao enviar avaliação</h2>
        <p className={styles.resultText}>Revise o conteúdo e tente novamente, mantendo uma linguagem respeitosa.</p>
        <Button variant="neutral" fullWidth onClick={() => setSubmitStatus(null)}>Voltar</Button>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onFormSubmit)} noValidate>

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
            maxLength={300}
            placeholder="Compartilhe sua experiência..."
            registration={register('text', {
              required:  'O comentário não pode estar vazio',
              minLength: { value: 20, message: 'Mínimo de 20 caracteres' },
              maxLength: { value: 300, message: 'Máximo de 300 caracteres' },
            })}
            error={errors.text?.message}
          />
        </div>
      </div>

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
  );
}
