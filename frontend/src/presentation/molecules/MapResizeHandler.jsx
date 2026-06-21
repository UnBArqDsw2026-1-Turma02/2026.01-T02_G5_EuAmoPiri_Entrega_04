import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

/**
 * Recalcula o tamanho do mapa Leaflet após resize, rotação ou mudança de layout (ex.: bottom sheet).
 */
export default function MapResizeHandler({ trigger }) {
  const map = useMap();

  useEffect(() => {
    const resize = () => {
      window.requestAnimationFrame(() => {
        map.invalidateSize();
      });
    };

    resize();

    window.addEventListener('resize', resize);
    window.addEventListener('orientationchange', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('orientationchange', resize);
    };
  }, [map, trigger]);

  return null;
}
