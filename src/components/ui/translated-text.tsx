import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { translateWithWeglot } from '@/utils/weglot';

interface TranslatedTextProps {
  /**
   * Texte à traduire (généralement en français depuis Bubble)
   */
  text: string;
  
  /**
   * Langue source (défaut: 'fr')
   */
  sourceLang?: string;
  
  /**
   * Classe CSS optionnelle
   */
  className?: string;
  
  /**
   * Texte à afficher pendant le chargement
   */
  loadingText?: string;
}

/**
 * Composant qui traduit automatiquement du texte dynamique avec Weglot
 * 
 * Utilise la langue actuelle de i18n pour déterminer la langue cible
 * 
 * @example
 * // Traduit "Nettoyer la cuisine" selon la langue actuelle
 * <TranslatedText text="Nettoyer la cuisine" />
 * 
 * @example
 * // Avec classe CSS personnalisée
 * <TranslatedText 
 *   text="Chambre principale" 
 *   className="font-bold text-lg"
 * />
 */
export function TranslatedText({
  text,
  sourceLang = 'fr',
  className,
  loadingText
}: TranslatedTextProps) {
  const { i18n } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const targetLang = i18n.language;

    // Si la langue cible est la même que la source, pas besoin de traduire
    if (targetLang === sourceLang) {
      setTranslatedText(text);
      return;
    }

    // Traduire le texte
    const translate = async () => {
      setIsLoading(true);
      try {
        const translated = await translateWithWeglot(text, targetLang, sourceLang);
        setTranslatedText(translated);
      } catch (error) {
        console.error('Erreur de traduction:', error);
        setTranslatedText(text); // Fallback au texte original
      } finally {
        setIsLoading(false);
      }
    };

    translate();
  }, [text, sourceLang, i18n.language]);

  if (isLoading && loadingText) {
    return <span className={className}>{loadingText}</span>;
  }

  return <span className={className}>{translatedText}</span>;
}

/**
 * Hook personnalisé pour traduire du texte dynamique
 * 
 * @example
 * const { translate, isLoading } = useWeglotTranslation();
 * 
 * const handleTranslate = async () => {
 *   const result = await translate('Nettoyer la cuisine');
 *   console.log(result); // "Clean the kitchen" (si langue = en)
 * };
 */
export function useWeglotTranslation() {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const translate = async (
    text: string,
    sourceLang: string = 'fr'
  ): Promise<string> => {
    const targetLang = i18n.language;

    if (targetLang === sourceLang) {
      return text;
    }

    setIsLoading(true);
    try {
      const translated = await translateWithWeglot(text, targetLang, sourceLang);
      return translated;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  };

  return { translate, isLoading, currentLang: i18n.language };
}

