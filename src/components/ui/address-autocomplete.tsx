import * as React from "react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

export const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, value, onChange, onPlaceSelected, id, placeholder, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    const [internalValue, setInternalValue] = React.useState(value);

    React.useImperativeHandle(ref, () => inputRef.current!);

    // Synchroniser la valeur interne avec la prop value
    React.useEffect(() => {
      setInternalValue(value);
    }, [value]);

    React.useEffect(() => {
      // Vérifier si l'API Google Maps est chargée
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("📍 Google Maps API n'est pas encore chargée");
        return;
      }

      if (!inputRef.current) return;

      try {
        console.log("📍 Initialisation de l'autocomplétion Google Places");

        // Utiliser l'ancienne API Autocomplete (toujours supportée jusqu'en 2025)
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["fr", "be", "ch", "lu", "mc"] }, // Pays francophones
          fields: ["formatted_address", "address_components", "geometry", "name"],
        });

        console.log("✅ Autocomplétion initialisée avec succès");

        // Écouter la sélection d'une adresse
        const listener = autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          console.log("📍 Place sélectionné:", place);

          if (place && place.formatted_address) {
            console.log("✅ Adresse formatée:", place.formatted_address);
            setInternalValue(place.formatted_address);
            onChange(place.formatted_address);
            onPlaceSelected?.(place);
          } else {
            console.warn("⚠️ Aucune adresse formatée trouvée dans le résultat");
          }
        });

        // Empêcher la soumission du formulaire lors de la sélection avec Enter
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            const pacContainer = document.querySelector(".pac-container");
            if (pacContainer && pacContainer.querySelector(".pac-item-selected")) {
              e.preventDefault();
            }
          }
        };

        inputRef.current.addEventListener("keydown", handleKeyDown);

        // Nettoyage
        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
          if (inputRef.current) {
            inputRef.current.removeEventListener("keydown", handleKeyDown);
          }
        };
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de l'autocomplétion:", error);
      }
    }, [onChange, onPlaceSelected]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange(newValue);
    };

    return (
      <div ref={containerRef} className="relative w-full">
        <input
          ref={inputRef}
          id={id}
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={internalValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

