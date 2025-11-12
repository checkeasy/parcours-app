/**
 * Utilitaire pour traduire du contenu dynamique avec l'API Weglot
 * 
 * Documentation API Weglot : https://developers.weglot.com/api/
 */

// Clé API Weglot - À configurer dans les variables d'environnement
const WEGLOT_API_KEY = import.meta.env.VITE_WEGLOT_API_KEY || '';

/**
 * Cache des traductions pour éviter les appels API répétés
 */
const translationCache = new Map<string, string>();

/**
 * Génère une clé de cache unique pour une traduction
 */
function getCacheKey(text: string, fromLang: string, toLang: string): string {
  return `${fromLang}:${toLang}:${text}`;
}

/**
 * Traduit un texte avec l'API Weglot
 * 
 * @param text - Texte à traduire
 * @param targetLang - Langue cible (ex: 'en', 'fr', 'es')
 * @param sourceLang - Langue source (défaut: 'fr')
 * @returns Promise<string> - Texte traduit
 * 
 * @example
 * const translated = await translateWithWeglot('Nettoyer la cuisine', 'en');
 * // Retourne: "Clean the kitchen"
 */
export async function translateWithWeglot(
  text: string,
  targetLang: string,
  sourceLang: string = 'fr'
): Promise<string> {
  // Si la langue cible est la même que la source, retourner le texte original
  if (targetLang === sourceLang) {
    return text;
  }

  // Vérifier si la traduction est en cache
  const cacheKey = getCacheKey(text, sourceLang, targetLang);
  if (translationCache.has(cacheKey)) {
    console.log('🔄 Traduction depuis le cache:', text);
    return translationCache.get(cacheKey)!;
  }

  // Vérifier que la clé API est configurée
  if (!WEGLOT_API_KEY) {
    console.warn('⚠️ Clé API Weglot non configurée. Retour du texte original.');
    return text;
  }

  try {
    console.log(`🌍 Traduction Weglot: "${text}" (${sourceLang} → ${targetLang})`);

    const response = await fetch('https://api.weglot.com/translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEGLOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        l_from: sourceLang,
        l_to: targetLang,
        request_url: window.location.href,
        words: [
          {
            t: 1, // Type 1 = texte
            w: text
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Weglot: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedText = data.to_words?.[0]?.w || text;

    // Mettre en cache
    translationCache.set(cacheKey, translatedText);

    console.log(`✅ Traduction réussie: "${translatedText}"`);
    return translatedText;

  } catch (error) {
    console.error('❌ Erreur lors de la traduction Weglot:', error);
    // En cas d'erreur, retourner le texte original
    return text;
  }
}

/**
 * Traduit plusieurs textes en une seule requête (plus efficace)
 * 
 * @param texts - Tableau de textes à traduire
 * @param targetLang - Langue cible
 * @param sourceLang - Langue source (défaut: 'fr')
 * @returns Promise<string[]> - Tableau de textes traduits
 * 
 * @example
 * const translated = await translateBatchWithWeglot(
 *   ['Cuisine', 'Chambre', 'Salle de bain'],
 *   'en'
 * );
 * // Retourne: ["Kitchen", "Bedroom", "Bathroom"]
 */
export async function translateBatchWithWeglot(
  texts: string[],
  targetLang: string,
  sourceLang: string = 'fr'
): Promise<string[]> {
  // Si la langue cible est la même que la source, retourner les textes originaux
  if (targetLang === sourceLang) {
    return texts;
  }

  // Vérifier que la clé API est configurée
  if (!WEGLOT_API_KEY) {
    console.warn('⚠️ Clé API Weglot non configurée. Retour des textes originaux.');
    return texts;
  }

  try {
    console.log(`🌍 Traduction batch Weglot: ${texts.length} textes (${sourceLang} → ${targetLang})`);

    const response = await fetch('https://api.weglot.com/translate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WEGLOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        l_from: sourceLang,
        l_to: targetLang,
        request_url: window.location.href,
        words: texts.map(text => ({
          t: 1, // Type 1 = texte
          w: text
        }))
      })
    });

    if (!response.ok) {
      throw new Error(`Erreur API Weglot: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const translatedTexts = data.to_words?.map((word: any) => word.w) || texts;

    console.log(`✅ Traduction batch réussie: ${translatedTexts.length} textes`);
    return translatedTexts;

  } catch (error) {
    console.error('❌ Erreur lors de la traduction batch Weglot:', error);
    // En cas d'erreur, retourner les textes originaux
    return texts;
  }
}

