import { useEffect, useState } from "react";

interface UseGoogleMapsOptions {
  apiKey?: string;
  libraries?: string[];
}

export function useGoogleMaps(options: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  const {
    apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries = ["places"]
  } = options;

  useEffect(() => {
    console.log("🗺️ useGoogleMaps - Clé API:", apiKey ? "✅ Présente" : "❌ Manquante");
    console.log("🗺️ useGoogleMaps - Clé API complète:", apiKey);

    // Vérifier si l'API est déjà chargée
    if (window.google && window.google.maps) {
      console.log("✅ Google Maps déjà chargé");
      setIsLoaded(true);
      return;
    }

    // Vérifier si la clé API est fournie
    if (!apiKey) {
      setLoadError(new Error("Clé API Google Maps manquante"));
      console.error("❌ Clé API Google Maps non configurée. Ajoutez VITE_GOOGLE_MAPS_API_KEY dans votre fichier .env");
      return;
    }

    // Vérifier si le script est déjà en cours de chargement
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Attendre que le script existant se charge
      existingScript.addEventListener("load", () => setIsLoaded(true));
      existingScript.addEventListener("error", () => 
        setLoadError(new Error("Erreur lors du chargement de Google Maps"))
      );
      return;
    }

    // Créer et charger le script
    const script = document.createElement("script");
    const librariesParam = libraries.length > 0 ? `&libraries=${libraries.join(",")}` : "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}${librariesParam}`;
    script.async = true;
    script.defer = true;

    console.log("🔄 Chargement du script Google Maps:", script.src);

    script.addEventListener("load", () => {
      console.log("✅ Google Maps chargé avec succès");
      setIsLoaded(true);
    });

    script.addEventListener("error", (e) => {
      console.error("❌ Erreur lors du chargement de Google Maps:", e);
      setLoadError(new Error("Erreur lors du chargement de Google Maps"));
    });

    document.head.appendChild(script);

    return () => {
      // Ne pas retirer le script car il peut être utilisé ailleurs
    };
  }, [apiKey, libraries]);

  return { isLoaded, loadError };
}

