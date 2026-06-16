/**
 * ÁTOMO — Badge
 *
 * Etiqueta visual pequena para categorias, status e tags.
 * Variantes de cor mapeadas nos tokens do design system.
 *
 * Reutilizado em: PlaceCard (categoria do local), ExperienceCard (tipo de visita).
 */
import styles from './Badge.module.css';

export default function Badge({
  children,
  variant = 'green',
  size = 'md',
  className = '',
}) {
  return (
    <span
      className={[
        styles.badge,
        styles[variant],
        styles[size],
        className,
      ].join(' ').trim()}
    >
      {children}
    </span>
  );
}
