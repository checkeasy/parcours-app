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
    const isSelectingFromAutocomplete = React.useRef(false);

    React.useImperativeHandle(ref, () => inputRef.current!);

    // Synchroniser la valeur du champ avec la prop value uniquement si ce n'est pas une sélection Google Maps
    React.useEffect(() => {
      if (inputRef.current && !isSelectingFromAutocomplete.current) {
        inputRef.current.value = value;
      }
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

            // Marquer qu'on est en train de sélectionner depuis l'autocomplétion
            isSelectingFromAutocomplete.current = true;

            // Mettre à jour la valeur du champ directement
            if (inputRef.current) {
              inputRef.current.value = place.formatted_address;
            }

            // Notifier le parent du changement
            onChange(place.formatted_address);
            onPlaceSelected?.(place);

            // Réinitialiser le flag après un court délai
            setTimeout(() => {
              isSelectingFromAutocomplete.current = false;
            }, 100);
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

        // Empêcher le blur quand on clique sur les suggestions
        const handleMouseDownOnPac = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          // Vérifier si le clic est sur une suggestion Google Maps
          if (target.closest('.pac-container')) {
            console.log("🖱️ Clic sur suggestion détecté - empêcher le blur");
            // Empêcher le blur du champ input
            e.preventDefault();
          }
        };

        // Gérer le focus pour éviter que le champ perde le focus
        const handleBlur = (e: FocusEvent) => {
          const relatedTarget = e.relatedTarget as HTMLElement;
          if (relatedTarget?.closest('.pac-container')) {
            console.log("🔍 Blur vers suggestion - refocus");
            e.preventDefault();
            inputRef.current?.focus();
          }
        };

        inputRef.current.addEventListener("keydown", handleKeyDown);
        inputRef.current.addEventListener("blur", handleBlur);

        // Ajouter l'écouteur sur le document pour capturer les clics sur les suggestions
        document.addEventListener("mousedown", handleMouseDownOnPac, true);

        // Nettoyage
        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
          if (inputRef.current) {
            inputRef.current.removeEventListener("keydown", handleKeyDown);
            inputRef.current.removeEventListener("blur", handleBlur);
          }
          document.removeEventListener("mousedown", handleMouseDownOnPac, true);
        };
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de l'autocomplétion:", error);
      }
    }, [onChange, onPlaceSelected]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
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
          defaultValue={value}
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

