import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import des traductions
import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationPT from './locales/pt.json';
import translationES from './locales/es.json';
import translationAR from './locales/ar.json';
import translationDE from './locales/de.json';

// Configuration des ressources de traduction
const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  },
  pt: {
    translation: translationPT
  },
  es: {
    translation: translationES
  },
  ar: {
    translation: translationAR
  },
  de: {
    translation: translationDE
  }
};

/**
 * Détecte la langue depuis l'URL
 * Supporte plusieurs formats :
 * 1. Paramètre URL : ?lang=en ou ?lang=fr
 * 2. Sous-domaine Weglot : en.app.checkeasy.co, fr.app.checkeasy.co
 * 3. Chemin URL : /en/page, /fr/page
 */
const detectLanguageFromURL = (): string | undefined => {
  // 1. Vérifier le paramètre URL ?lang=xx
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get('lang');
  if (langParam) {
    console.log('🌍 Langue détectée depuis paramètre URL:', langParam);
    return langParam;
  }

  // 2. Vérifier le sous-domaine (Weglot style)
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];

  // Liste des codes de langue supportés (correspond à Weglot)
  const supportedLanguages = ['en', 'fr', 'pt', 'es', 'ar', 'de'];

  if (supportedLanguages.includes(subdomain)) {
    console.log('🌍 Langue détectée depuis sous-domaine:', subdomain);
    return subdomain;
  }

  // 3. Vérifier le chemin URL (/en/page, /fr/page)
  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments.length > 0 && supportedLanguages.includes(pathSegments[0])) {
    console.log('🌍 Langue détectée depuis chemin URL:', pathSegments[0]);
    return pathSegments[0];
  }

  // 4. Langue par défaut
  console.log('🌍 Aucune langue détectée, utilisation du français par défaut');
  return 'fr';
};

// Configuration de i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    lng: detectLanguageFromURL(), // Langue détectée depuis l'URL
    
    // Options de détection
    detection: {
      order: ['querystring', 'localStorage', 'navigator'],
      lookupQuerystring: 'lang',
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    // Debug en développement
    debug: import.meta.env.DEV,
  });

// Écouter les changements de langue dans l'URL
window.addEventListener('popstate', () => {
  const newLang = detectLanguageFromURL();
  if (newLang && i18n.language !== newLang) {
    console.log('🌍 Changement de langue détecté:', newLang);
    i18n.changeLanguage(newLang);
  }
});

export default i18n;

