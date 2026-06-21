import { useState } from 'react';
import Button from '../atoms/Button';
import { REPORT_REASONS } from '../../utils/reportReasons';
import styles from './ReportModal.module.css';

export default function ReportModal({
  title = 'Denunciar conteúdo',
  subtitle = 'Selecione o motivo da denúncia. Nossa equipe irá revisar o conteúdo.',
  onSubmit,
  onClose,
}) {
  const [reason, setReason] = useState('FALSO');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (reason === 'OUTRO' && !description.trim()) {
      setError('Descreva brevemente o motivo da denúncia.');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        reason,
        description: description.trim() || undefined,
      });
    } catch (err) {
      setError(err?.response?.data?.error ?? err?.message ?? 'Não foi possível enviar a denúncia.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-modal-title"
      onClick={(e) => e.target === e.currentTarget && !submitting && onClose?.()}
    >
      <form className={styles.card} onSubmit={handleSubmit}>
        <h2 id="report-modal-title" className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="report-reason">Motivo</label>
          <select
            id="report-reason"
            className={styles.select}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={submitting}
          >
            {REPORT_REASONS.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="report-description">
            Descrição {reason === 'OUTRO' ? '(obrigatória)' : '(opcional)'}
          </label>
          <textarea
            id="report-description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Conte mais detalhes, se necessário..."
            disabled={submitting}
          />
        </div>

        {error && <p className={styles.error} role="alert">{error}</p>}

        <div className={styles.actions}>
          <Button type="button" variant="neutral" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" variant="rust" loading={submitting}>
            Enviar denúncia
          </Button>
        </div>
      </form>
    </div>
  );
}
