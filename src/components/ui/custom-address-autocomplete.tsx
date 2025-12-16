import * as React from "react";
import { cn } from "@/lib/utils";
import { MapPin, Loader2, Check } from "lucide-react";

interface AddressSuggestion {
  placeId: string;
  mainText: string;
  secondaryText: string;
  fullText: string;
}

interface CustomAddressAutocompleteProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

export const CustomAddressAutocomplete = React.forwardRef<HTMLInputElement, CustomAddressAutocompleteProps>(
  ({ className, value, onChange, onPlaceSelected, id, placeholder, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);
    const autocompleteServiceRef = React.useRef<google.maps.places.AutocompleteService | null>(null);
    const placesServiceRef = React.useRef<google.maps.places.PlacesService | null>(null);
    const [suggestions, setSuggestions] = React.useState<AddressSuggestion[]>([]);
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedIndex, setSelectedIndex] = React.useState(-1);
    const [isFocused, setIsFocused] = React.useState(false);

    React.useImperativeHandle(ref, () => inputRef.current!);

    // Initialiser les services Google Maps
    React.useEffect(() => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("📍 Google Maps API n'est pas encore chargée");
        return;
      }

      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      
      // Créer un div invisible pour le PlacesService
      const div = document.createElement('div');
      placesServiceRef.current = new google.maps.places.PlacesService(div);

      console.log("✅ Services Google Maps initialisés");
    }, []);

    // Gérer la recherche de suggestions
    const fetchSuggestions = React.useCallback((input: string) => {
      if (!input || input.length < 3) {
        setSuggestions([]);
        setIsOpen(false);
        return;
      }

      if (!autocompleteServiceRef.current) {
        console.warn("⚠️ AutocompleteService non initialisé");
        return;
      }

      setIsLoading(true);

      autocompleteServiceRef.current.getPlacePredictions(
        {
          input,
          types: ["address"],
          // No country restrictions - support worldwide addresses
        },
        (predictions, status) => {
          setIsLoading(false);

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const formattedSuggestions: AddressSuggestion[] = predictions.map((prediction) => ({
              placeId: prediction.place_id,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text || "",
              fullText: prediction.description,
            }));

            setSuggestions(formattedSuggestions);
            setIsOpen(true);
            setSelectedIndex(-1);
          } else {
            setSuggestions([]);
            setIsOpen(false);
          }
        }
      );
    }, []);

    // Debounce pour la recherche
    React.useEffect(() => {
      const timer = setTimeout(() => {
        if (isFocused) {
          fetchSuggestions(value);
        }
      }, 300);

      return () => clearTimeout(timer);
    }, [value, fetchSuggestions, isFocused]);

    // Sélectionner une suggestion
    const selectSuggestion = React.useCallback((suggestion: AddressSuggestion) => {
      if (!placesServiceRef.current) return;

      console.log("📍 Sélection de l'adresse:", suggestion.fullText);

      // Fermer le dropdown immédiatement
      setIsOpen(false);
      setSuggestions([]);
      setIsFocused(false);

      // Récupérer les détails complets du lieu
      placesServiceRef.current.getDetails(
        {
          placeId: suggestion.placeId,
          fields: ["formatted_address", "address_components", "geometry", "name"],
        },
        (place, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place) {
            console.log("✅ Détails du lieu récupérés:", place);
            console.log("📍 Mise à jour de l'adresse avec:", place.formatted_address);

            // Utiliser formatted_address au lieu de fullText pour plus de précision
            onChange(place.formatted_address || suggestion.fullText);
            onPlaceSelected?.(place);
          } else {
            console.warn("⚠️ Impossible de récupérer les détails, utilisation de fullText");
            onChange(suggestion.fullText);
          }
        }
      );
    }, [onChange, onPlaceSelected]);

    // Gérer les touches clavier
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isOpen || suggestions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            selectSuggestion(suggestions[selectedIndex]);
          }
          break;
        case "Escape":
          setIsOpen(false);
          setSuggestions([]);
          setSelectedIndex(-1);
          break;
      }
    };

    // Fermer le dropdown en cliquant à l'extérieur
    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current &&
          !inputRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
      <div className="relative w-full">
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            type="text"
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-10 py-2 text-base ring-offset-background",
              "placeholder:text-muted-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "transition-all duration-200",
              "md:text-sm",
              className
            )}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              if (value.length >= 3) {
                fetchSuggestions(value);
              }
            }}
            onBlur={() => {
              // Délai pour permettre le clic sur une suggestion
              setTimeout(() => setIsFocused(false), 200);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
            {...props}
          />
          
          {/* Icône de localisation */}
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          
          {/* Indicateur de chargement */}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-spin" />
          )}
        </div>

        {/* Dropdown personnalisé */}
        {isOpen && suggestions.length > 0 && (
          <div
            ref={dropdownRef}
            className={cn(
              "absolute z-50 w-full mt-2 rounded-lg border border-border bg-popover shadow-lg",
              "animate-in fade-in-0 zoom-in-95",
              "max-h-[300px] overflow-y-auto"
            )}
          >
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.placeId}
                  type="button"
                  onClick={() => selectSuggestion(suggestion)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-md text-left transition-colors",
                    "hover:bg-accent hover:text-accent-foreground",
                    "focus:bg-accent focus:text-accent-foreground focus:outline-none",
                    selectedIndex === index && "bg-accent text-accent-foreground"
                  )}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {suggestion.mainText}
                    </div>
                    {suggestion.secondaryText && (
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        {suggestion.secondaryText}
                      </div>
                    )}
                  </div>
                  {selectedIndex === index && (
                    <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Message "Aucun résultat" */}
        {isOpen && !isLoading && suggestions.length === 0 && value.length >= 3 && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-2 rounded-lg border border-border bg-popover shadow-lg p-4 text-center text-sm text-muted-foreground"
          >
            Aucune adresse trouvée
          </div>
        )}
      </div>
    );
  }
);

CustomAddressAutocomplete.displayName = "CustomAddressAutocomplete";

