/**
 * ÁTOMO — StarRating
 *
 * Exibe ou coleta uma avaliação de 1 a 5 estrelas.
 * Dois modos:
 *   - readonly: apenas exibe (usado em cards de relato)
 *   - interativo: o usuário clica para selecionar (usado em formulário de relato)
 *
 * Reutilizado em: ExperienceCard, ExperienceForm (Turista).
 */
import { useState } from 'react';
import styles from './StarRating.module.css';

const TOTAL = 5;

export default function StarRating({
  value = 0,
  onChange,
  readonly = false,
  size = 'md',
  label = 'Avaliação',
}) {
  const [hovered, setHovered] = useState(0);

  const displayed = readonly ? value : (hovered || value);

  return (
    <div
      className={[styles.wrapper, styles[size]].join(' ')}
      role={readonly ? 'img' : 'radiogroup'}
      aria-label={readonly ? `${label}: ${value} de ${TOTAL} estrelas` : label}
    >
      {Array.from({ length: TOTAL }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= displayed;

        if (readonly) {
          return (
            <span
              key={starValue}
              className={[styles.star, filled ? styles.filled : styles.empty].join(' ')}
              aria-hidden="true"
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            className={[styles.star, styles.interactive, filled ? styles.filled : styles.empty].join(' ')}
            aria-label={`${starValue} estrela${starValue > 1 ? 's' : ''}`}
            aria-pressed={value === starValue}
            onClick={() => onChange?.(starValue)}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
