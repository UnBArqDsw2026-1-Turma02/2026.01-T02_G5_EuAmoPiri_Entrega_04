/**
 * ÁTOMO — Avatar
 *
 * Exibe a foto de perfil de um usuário.
 * Fallback automático para iniciais quando não há imagem.
 *
 * Reutilizado em: Header (usuário logado), ExperienceCard (autor do relato),
 *                 ProfilePage, comentários.
 */
import styles from './Avatar.module.css';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className = '',
}) {
  const initials = getInitials(name);
  const alt = name ? `Foto de perfil de ${name}` : 'Foto de perfil';

  return (
    <div
      className={[styles.avatar, styles[size], className].join(' ').trim()}
      aria-label={alt}
      role="img"
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          className={styles.image}
          onError={(e) => {
            // Se a imagem falhar, esconde e mostra as iniciais
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}
      <span
        className={styles.initials}
        style={{ display: src ? 'none' : 'flex' }}
        aria-hidden="true"
      >
        {initials || '?'}
      </span>
    </div>
  );
}
