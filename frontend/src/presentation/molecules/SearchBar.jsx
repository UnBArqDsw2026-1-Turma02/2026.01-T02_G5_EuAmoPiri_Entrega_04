/**
 * MOLÉCULA — SearchBar
 *
 * Campo de busca com botão de submissão e limpeza.
 * Controlado: recebe value e onChange do pai.
 *
 * Uso:
 *   <SearchBar
 *     value={query}
 *     onChange={setQuery}
 *     onSearch={handleSearch}
 *     placeholder="Buscar locais em Pirenópolis..."
 *   />
 *
 * Reutilizado em: PlacesPage (filtro de locais).
 */
import { useRef } from 'react';
import { MdSearch, MdClose } from 'react-icons/md';
import Icon from '../atoms/Icon';
import styles from './SearchBar.module.css';

export default function SearchBar({
  value = '',
  onChange,
  onSearch,
  placeholder = 'Buscar...',
  className = '',
  showSubmit = true,
}) {
  const inputRef = useRef(null);

  function handleSubmit(e) {
    e.preventDefault();
    onSearch?.(value.trim());
  }

  function handleClear() {
    onChange?.('');
    onSearch?.('');
    inputRef.current?.focus();
  }

  return (
    <form
      role="search"
      className={[styles.form, className].join(' ').trim()}
      onSubmit={handleSubmit}
    >
      <div className={styles.inputWrapper}>
        <span className={styles.searchIcon} aria-hidden="true">
          <Icon as={MdSearch} size="md" decorative />
        </span>

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          aria-label="Campo de busca"
          className={styles.input}
        />

        {value && (
          <button
            type="button"
            className={styles.clearBtn}
            aria-label="Limpar busca"
            onClick={handleClear}
          >
            <Icon as={MdClose} size="sm" decorative />
          </button>
        )}
      </div>

      {showSubmit && (
        <button type="submit" className={styles.submitBtn} aria-label="Buscar">
          Buscar
        </button>
      )}
    </form>
  );
}
