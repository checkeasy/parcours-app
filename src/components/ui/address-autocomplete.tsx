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

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      // Vérifier si l'API Google Maps est chargée
      if (!window.google || !window.google.maps || !window.google.maps.places) {
        console.warn("Google Maps API n'est pas encore chargée");
        return;
      }

      if (!inputRef.current) return;

      try {
        // Initialiser l'autocomplétion Google Places (ancienne API mais toujours supportée)
        autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["address"],
          componentRestrictions: { country: ["fr", "be", "ch", "lu", "mc"] }, // Pays francophones
          fields: ["formatted_address", "address_components", "geometry", "name"],
        });

        // Écouter la sélection d'une adresse
        const listener = autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current?.getPlace();
          if (place && place.formatted_address) {
            onChange(place.formatted_address);
            onPlaceSelected?.(place);
          }
        });

        // Nettoyage
        return () => {
          if (listener) {
            google.maps.event.removeListener(listener);
          }
        };
      } catch (error) {
        console.error("Erreur lors de l'initialisation de l'autocomplétion:", error);
      }
    }, [onChange, onPlaceSelected]);

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
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          {...props}
        />
      </div>
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

