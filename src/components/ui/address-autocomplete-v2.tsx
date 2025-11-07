import * as React from "react";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

/**
 * Version alternative du composant AddressAutocomplete
 * Cette version utilise une approche complètement non-contrôlée pour éviter
 * les conflits entre React et Google Maps
 */
export const AddressAutocompleteV2 = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, value, onChange, onPlaceSelected, id, placeholder, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const autocompleteRef = React.useRef<google.maps.places.Autocomplete | null>(null);
    const isSelectingPlace = React.useRef(false);

    React.useImperativeHandle(ref, () => inputRef.current!);

    // Initialiser Google Maps Autocomplete
    React.useEffect(() => {
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("📍 Google Maps API n'est pas encore chargée");
        return;
      }

      if (!inputRef.current) return;

      try {
        console.log("📍 [V2] Initialisation de l'autocomplétion Google Places");

        // Créer l'instance Autocomplete
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["fr", "be", "ch", "lu", "mc"] },
          fields: ["formatted_address", "address_components", "geometry", "name"],
        });

        console.log("✅ [V2] Autocomplétion initialisée avec succès");

        // Écouter la sélection d'une adresse
        const listener = autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          console.log("📍 [V2] Place sélectionné:", place);

          if (place && place.formatted_address) {
            console.log("✅ [V2] Adresse formatée:", place.formatted_address);

            // Marquer qu'on est en train de sélectionner
            isSelectingPlace.current = true;

            // Attendre que Google Maps ait fini de mettre à jour le champ
            setTimeout(() => {
              if (inputRef.current) {
                const currentValue = inputRef.current.value;
                console.log("📍 [V2] Valeur du champ après sélection:", currentValue);

                // Notifier le parent avec la valeur actuelle du champ
                onChange(currentValue);
                onPlaceSelected?.(place);

                // Réinitialiser le flag
                isSelectingPlace.current = false;
              }
            }, 100);
          } else {
            console.warn("⚠️ [V2] Aucune adresse formatée trouvée");
            isSelectingPlace.current = false;
          }
        });

        // Empêcher la soumission du formulaire avec Enter
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === "Enter") {
            const pacContainer = document.querySelector(".pac-container");
            if (pacContainer && pacContainer.querySelector(".pac-item-selected")) {
              e.preventDefault();
            }
          }
        };

        // Gérer le mousedown sur les suggestions pour empêcher le blur
        const handleDocumentMouseDown = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (target.closest('.pac-container')) {
            console.log("🖱️ [V2] Clic sur suggestion - marquer la sélection");
            isSelectingPlace.current = true;
          }
        };

        inputRef.current.addEventListener("keydown", handleKeyDown);
        document.addEventListener("mousedown", handleDocumentMouseDown, true);

        // Nettoyage
        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
          if (inputRef.current) {
            inputRef.current.removeEventListener("keydown", handleKeyDown);
          }
          document.removeEventListener("mousedown", handleDocumentMouseDown, true);
        };
      } catch (error) {
        console.error("❌ [V2] Erreur lors de l'initialisation:", error);
      }
    }, []); // Pas de dépendances - initialiser une seule fois

    // Gérer les changements manuels de l'input
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      console.log("📝 [V2] Changement manuel:", newValue);
      onChange(newValue);
    };

    // Gérer le blur pour capturer la valeur finale
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      // Ne pas traiter le blur si on est en train de sélectionner une adresse
      if (isSelectingPlace.current) {
        console.log("⏭️ [V2] Blur ignoré - sélection en cours");
        return;
      }

      const finalValue = e.target.value;
      console.log("👋 [V2] Blur - valeur finale:", finalValue);
      onChange(finalValue);
    };

    return (
      <div className="relative w-full">
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
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="off"
          {...props}
        />
      </div>
    );
  }
);

AddressAutocompleteV2.displayName = "AddressAutocompleteV2";

