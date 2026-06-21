import { useEffect, useRef, useState } from 'react';
import styles from './ContentOptionsMenu.module.css';

export default function ContentOptionsMenu({ onReport, label = 'Opções do conteúdo' }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  function handleReport() {
    setOpen(false);
    onReport?.();
  }

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.trigger}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        ⋮
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            role="menuitem"
            onClick={handleReport}
          >
            Denunciar
          </button>
        </div>
      )}
    </div>
  );
}
