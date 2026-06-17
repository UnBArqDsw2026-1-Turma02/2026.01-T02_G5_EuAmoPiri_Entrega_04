const BLACKLIST = [
  'idiota', 'burro', 'merda', 'porra', 'caralho', 'fdp',
  'otario', 'imbecil', 'estupido', 'babaca', 'lixo',
];

function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function containsBlacklistedWord(text) {
  const normalized = normalize(text);
  return BLACKLIST.some((word) => {
    const pattern = new RegExp(`\\b${word}\\b`, 'i');
    return pattern.test(normalized);
  });
}

export function getBlacklistWords() {
  return BLACKLIST;
}
