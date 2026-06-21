/** Estado em memória do catálogo enriquecido (/locais) — sobrevive ao desmontar a página. */

let catalogCache = null;
let catalogLoadPromise = null;

export function peekPlacesCatalog() {
  return catalogCache;
}

export function setPlacesCatalog(data) {
  catalogCache = data;
}

export function getPlacesCatalogLoadPromise() {
  return catalogLoadPromise;
}

export function setPlacesCatalogLoadPromise(promise) {
  catalogLoadPromise = promise;
}

export function invalidatePlacesCatalog() {
  catalogCache = null;
  catalogLoadPromise = null;
}
