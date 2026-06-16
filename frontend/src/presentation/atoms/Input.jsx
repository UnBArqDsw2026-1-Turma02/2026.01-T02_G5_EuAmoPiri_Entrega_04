/**
 * ÁTOMO — Input
 *
 * Campo de texto de linha única com suporte a:
 * - Estados: padrão, focus, erro, disabled
 * - Ícone prefixo (ex: lupa, envelope)
 * - Mensagem de erro inline
 * - Integração com React Hook Form via ref (forwardRef)
 *
 * Reutilizado em: LoginPage, SignupPage, SearchBar, formulários de Morador/Turista.
 */
import { forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(function Input(
  {
    label,
    id,
    type = 'text',
    placeholder,
    error,
    disabled = false,
    icon,
    className = '',
    ...props
  },
  ref
) {
  return (
    <div className={[styles.wrapper, className].join(' ').trim()}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
      )}

      <div className={[styles.inputRow, error ? styles.hasError : ''].join(' ').trim()}>
        {icon && (
          <span className={styles.icon} aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          id={id}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={styles.input}
          {...props}
        />
      </div>

      {error && (
        <span id={`${id}-error`} className={styles.errorMsg} role="alert">
          {error}
        </span>
      )}
    </div>
  );
});

export default Input;
