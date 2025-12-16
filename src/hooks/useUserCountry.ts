import { useEffect, useState } from "react";

interface CountryInfo {
  countryCode: string | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to detect the user's country
 * Uses browser's geolocation API and falls back to timezone-based detection
 * 
 * @returns CountryInfo object with country code (ISO 3166-1 alpha-2), loading state, and error
 * 
 * @example
 * const { countryCode, isLoading } = useUserCountry();
 * // countryCode: "US", "FR", "GB", etc.
 */
export function useUserCountry(): CountryInfo {
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const detectCountry = async () => {
      try {
        // Method 1: Try to get country from browser's timezone
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log("🌍 Detected timezone:", timezone);

        // Map common timezones to countries (simplified mapping)
        const timezoneToCountry: Record<string, string> = {
          "America/New_York": "US",
          "America/Los_Angeles": "US",
          "America/Chicago": "US",
          "America/Denver": "US",
          "Europe/London": "GB",
          "Europe/Paris": "FR",
          "Europe/Berlin": "DE",
          "Europe/Madrid": "ES",
          "Europe/Rome": "IT",
          "Europe/Lisbon": "PT",
          "Europe/Brussels": "BE",
          "Europe/Amsterdam": "NL",
          "Europe/Zurich": "CH",
          "Europe/Vienna": "AT",
          "Asia/Tokyo": "JP",
          "Asia/Shanghai": "CN",
          "Asia/Hong_Kong": "HK",
          "Asia/Singapore": "SG",
          "Asia/Dubai": "AE",
          "Australia/Sydney": "AU",
          "Australia/Melbourne": "AU",
          "America/Toronto": "CA",
          "America/Vancouver": "CA",
          "America/Mexico_City": "MX",
          "America/Sao_Paulo": "BR",
          "America/Buenos_Aires": "AR",
          "Africa/Cairo": "EG",
          "Africa/Johannesburg": "ZA",
          "Asia/Kolkata": "IN",
          "Asia/Seoul": "KR",
        };

        // Try to get country from timezone
        let detectedCountry = timezoneToCountry[timezone];

        // If not found in mapping, try to extract from timezone string
        if (!detectedCountry && timezone) {
          // For timezones like "Europe/Paris", extract "Europe" and map to region
          const parts = timezone.split("/");
          if (parts.length >= 2) {
            const region = parts[0];
            const city = parts[1];

            // Try to infer country from city name
            const cityToCountry: Record<string, string> = {
              Paris: "FR",
              London: "GB",
              Berlin: "DE",
              Madrid: "ES",
              Rome: "IT",
              Lisbon: "PT",
              Brussels: "BE",
              Amsterdam: "NL",
              Zurich: "CH",
              Vienna: "AT",
              Tokyo: "JP",
              Shanghai: "CN",
              Dubai: "AE",
              Sydney: "AU",
              Toronto: "CA",
              "Mexico_City": "MX",
              "Sao_Paulo": "BR",
              "Buenos_Aires": "AR",
              Cairo: "EG",
              Johannesburg: "ZA",
              Kolkata: "IN",
              Seoul: "KR",
            };

            detectedCountry = cityToCountry[city];
          }
        }

        // Method 2: Try to get country from browser language
        if (!detectedCountry) {
          const language = navigator.language || (navigator as any).userLanguage;
          console.log("🌍 Detected language:", language);

          // Extract country code from language (e.g., "en-US" -> "US")
          if (language && language.includes("-")) {
            const langCountry = language.split("-")[1];
            if (langCountry && langCountry.length === 2) {
              detectedCountry = langCountry.toUpperCase();
            }
          }
        }

        // Default to null if no country detected (will allow worldwide search)
        if (isMounted) {
          setCountryCode(detectedCountry || null);
          setIsLoading(false);
          console.log("✅ Country detected:", detectedCountry || "Worldwide (no restriction)");
        }
      } catch (err) {
        console.error("❌ Error detecting country:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to detect country"));
          setCountryCode(null); // Allow worldwide search on error
          setIsLoading(false);
        }
      }
    };

    detectCountry();

    return () => {
      isMounted = false;
    };
  }, []);

  return { countryCode, isLoading, error };
}

