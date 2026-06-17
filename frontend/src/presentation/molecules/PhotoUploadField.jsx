import { useRef } from 'react';
import Button from '../atoms/Button';
import styles from './PhotoUploadField.module.css';

export default function PhotoUploadField({
  photos = [],
  onChange,
  min = 0,
  max = 3,
  label = 'Fotos',
  hint,
  error,
}) {
  const inputRef = useRef(null);

  function handleFiles(e) {
    const files = Array.from(e.target.files ?? []);
    const merged = [...photos, ...files].slice(0, max);
    onChange(merged);
    e.target.value = '';
  }

  function removeAt(index) {
    onChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint && <p className={styles.hint}>{hint}</p>}

      <div className={styles.grid}>
        {photos.map((file, i) => (
          <div key={`${file.name}-${i}`} className={styles.preview}>
            <img src={URL.createObjectURL(file)} alt="" />
            <button type="button" className={styles.remove} onClick={() => removeAt(i)} aria-label="Remover foto">×</button>
          </div>
        ))}
        {photos.length < max && (
          <button type="button" className={styles.addBtn} onClick={() => inputRef.current?.click()}>
            <span>Upload...</span>
            <span className={styles.cloud} aria-hidden="true">☁</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className={styles.hidden}
        onChange={handleFiles}
      />

      <p className={styles.count}>{photos.length}/{max} foto(s) — mínimo {min}</p>
      {error && <span className={styles.error} role="alert">{error}</span>}
      {photos.length < max && (
        <Button type="button" variant="primary" size="sm" onClick={() => inputRef.current?.click()}>
          Enviar Fotos
        </Button>
      )}
    </div>
  );
}
