import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { MdMoreVert } from 'react-icons/md';
import Icon from '../atoms/Icon';
import styles from './ContentOptionsMenu.module.css';

export default function ContentOptionsMenu({ onReport, label = 'Opções do conteúdo' }) {
  const [open, setOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState(null);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const menuWidth = 168;
      const left = Math.min(
        Math.max(8, rect.right - menuWidth),
        window.innerWidth - menuWidth - 8
      );

      setMenuStyle({
        position: 'fixed',
        top: rect.bottom + 4,
        left,
        minWidth: menuWidth,
        zIndex: 1100,
      });
    }

    updatePosition();

    function handleClickOutside(e) {
      const target = e.target;
      if (wrapRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open]);

  function handleReport() {
    setOpen(false);
    onReport?.();
  }

  const menu = open && menuStyle
    ? createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={menuStyle}
          role="menu"
        >
          <button
            type="button"
            className={`${styles.menuItem} ${styles.menuItemDanger}`}
            role="menuitem"
            onClick={handleReport}
          >
            Denunciar
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      <div className={styles.wrap} ref={wrapRef}>
        <button
          ref={triggerRef}
          type="button"
          className={styles.trigger}
          aria-label={label}
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <Icon as={MdMoreVert} size="md" decorative />
        </button>
      </div>
      {menu}
    </>
  );
}
