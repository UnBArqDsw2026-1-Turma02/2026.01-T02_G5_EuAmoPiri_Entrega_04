export const REPORT_REASONS = [
  { value: 'ODIO', label: 'Discurso de ódio' },
  { value: 'FALSO', label: 'Conteúdo falso' },
  { value: 'SENSIVEL', label: 'Informações sensíveis' },
  { value: 'OUTRO', label: 'Outro' },
];

export function reportReasonLabel(value) {
  return REPORT_REASONS.find((r) => r.value === value)?.label ?? value;
}
