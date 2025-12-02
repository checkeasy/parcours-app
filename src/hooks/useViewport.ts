import { useState, useEffect } from 'react';

/**
 * Hook pour détecter les changements de viewport et le mode responsive
 * 
 * @returns {Object} - Informations sur le viewport
 * @property {boolean} isMobile - true si la largeur < 640px (breakpoint sm)
 * @property {boolean} isTablet - true si la largeur >= 640px et < 1024px
 * @property {boolean} isDesktop - true si la largeur >= 1024px
 * @property {number} width - Largeur actuelle du viewport
 * @property {number} height - Hauteur actuelle du viewport
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 640 : false,
    isTablet: typeof window !== 'undefined' ? window.innerWidth >= 640 && window.innerWidth < 1024 : false,
    isDesktop: typeof window !== 'undefined' ? window.innerWidth >= 1024 : false,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setViewport({
        width,
        height,
        isMobile: width < 640,
        isTablet: width >= 640 && width < 1024,
        isDesktop: width >= 1024,
      });
    };

    // Écouter les changements de taille
    window.addEventListener('resize', handleResize);
    
    // Appeler une fois au montage pour initialiser
    handleResize();

    // Nettoyer l'écouteur
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

