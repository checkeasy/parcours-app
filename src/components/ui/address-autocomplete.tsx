import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AddressAutocompleteProps extends Omit<React.ComponentProps<"input">, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
}

export const AddressAutocomplete = React.forwardRef<HTMLInputElement, AddressAutocompleteProps>(
  ({ className, value, onChange, onPlaceSelected, ...props }, ref) => {
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

      // Initialiser l'autocomplétion Google Places
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
    }, [onChange, onPlaceSelected]);

    return (
      <Input
        ref={inputRef}
        className={cn(className)}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    );
  }
);

AddressAutocomplete.displayName = "AddressAutocomplete";

