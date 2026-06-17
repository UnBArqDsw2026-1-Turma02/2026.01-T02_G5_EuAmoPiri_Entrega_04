/** Categorias de local — alinhadas ao enum PlaceCategory do backend. */

export const CATEGORY_LABELS = {
  cachoeira: 'Cachoeira',
  restaurante: 'Restaurante',
  pousada: 'Pousada',
};

export const CATEGORY_OPTIONS = [
  { value: 'cachoeira', label: 'Cachoeira' },
  { value: 'restaurante', label: 'Restaurante' },
  { value: 'pousada', label: 'Pousada' },
];

/** Valores em maiúsculas para envio na criação de local (multipart/form-data). */
export const CREATE_PLACE_CATEGORY_OPTIONS = [
  { value: 'CACHOEIRA', label: 'Cachoeira' },
  { value: 'RESTAURANTE', label: 'Restaurante' },
  { value: 'POUSADA', label: 'Pousada' },
];

export const CATEGORY_VARIANTS = {
  cachoeira: 'green',
  restaurante: 'rust',
  pousada: 'teal',
};

export function categoryLabel(category) {
  const key = (category ?? '').toLowerCase();
  return CATEGORY_LABELS[key] ?? category;
}
