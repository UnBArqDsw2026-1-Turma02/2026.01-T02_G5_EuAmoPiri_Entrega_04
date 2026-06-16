/**
 * ÁTOMO — Button
 *
 * Componente de botão reutilizável com suporte a:
 * - 5 variantes visuais: primary, secondary, outline, ghost, teal
 * - 3 tamanhos: sm, md, lg
 * - Estado de loading (integra o Spinner)
 * - Estado disabled com acessibilidade
 * - Renderização como <button> ou <a> (prop `as`)
 *
 * Reutilizado em: formulários, painéis, cards, modais, header.
 */
import Spinner from './Spinner';
import styles from './Button.module.css';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  type = 'button',
  as: Tag = 'button',
  className = '',
  onClick,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      className={[
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ].join(' ').trim()}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      {...props}
    >
      {loading && (
        <span className={styles.spinnerWrapper} aria-hidden="true">
          <Spinner
            size="sm"
            color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'}
          />
        </span>
      )}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </Tag>
  );
}
