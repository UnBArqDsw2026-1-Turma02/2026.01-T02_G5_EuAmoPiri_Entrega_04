/**
 * ÁTOMO — Textarea
 *
 * Campo de texto multilinha com suporte a:
 * - Estados: padrão, focus, erro, disabled
 * - Contagem de caracteres (maxLength)
 * - Mensagem de erro inline
 * - Integração com React Hook Form via ref (forwardRef)
 * - Resize apenas vertical (padrão) ou desabilitado
 *
 * Reutilizado em: formulário de Relato (Turista), formulário de Local (Morador).
 */
import { forwardRef } from 'react';
import styles from './Textarea.module.css';

const Textarea = forwardRef(function Textarea(
  {
    label,
    id,
    placeholder,
    error,
    disabled = false,
    maxLength,
    currentLength = 0,
    rows = 4,
    resize = 'vertical',
    className = '',
    ...props
  },
  ref
) {
  const nearLimit = maxLength && currentLength >= maxLength * 0.9;

  return (
    <div className={[styles.wrapper, className].join(' ').trim()}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <textarea
        ref={ref}
        id={id}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          styles.textarea,
          error ? styles.hasError : '',
          styles[`resize-${resize}`],
        ].join(' ').trim()}
        {...props}
      />

      <div className={styles.footer}>
        {error ? (
          <span id={`${id}-error`} className={styles.errorMsg} role="alert">
            {error}
          </span>
        ) : (
          <span />
        )}

        {maxLength && (
          <span className={[styles.counter, nearLimit ? styles.nearLimit : ''].join(' ').trim()}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

export default Textarea;
