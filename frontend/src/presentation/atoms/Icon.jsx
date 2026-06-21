/**
 * ÁTOMO — Icon
 *
 * Wrapper semântico para ícones da biblioteca react-icons.
 * Padroniza tamanho, cor e acessibilidade em um único lugar.
 *
 * Uso:
 *   import { MdSearch } from 'react-icons/md';
 *   <Icon as={MdSearch} label="Buscar" />
 *   <Icon as={MdSearch} decorative />   // puramente visual, sem label
 *
 * Reutilizado em: Header, SearchBar, Button com ícone, navegação.
 */
import styles from './Icon.module.css';

export default function Icon({
  as: IconComponent,
  size = 'md',
  color = 'inherit',
  label,
  decorative = false,
  className = '',
}) {
  if (!IconComponent) return null;

  const ariaProps = decorative
    ? { 'aria-hidden': true }
    : { role: 'img', 'aria-label': label };

  return (
    <span
      className={[styles.icon, styles[size], styles[`color-${color}`], className].join(' ').trim()}
      {...ariaProps}
    >
      <IconComponent />
    </span>
  );
}
