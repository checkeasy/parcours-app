import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface EmojiPickerProps {
  value?: string;
  onChange: (emoji: string) => void;
  placeholder?: string;
}

// Liste d'emojis organisés par catégories
const EMOJI_CATEGORIES = {
  "Ménage & Nettoyage": [
    "🧹", "🧺", "🧽", "🧴", "🧼", "🪣", "🚿", "🛁", "🚽", "🪠",
    "🧻", "🪥", "🧯", "🗑️", "♻️", "✨", "💧", "🫧"
  ],
  "Pièces & Mobilier": [
    "🏠", "🏡", "🛏️", "🛋️", "🪑", "🚪", "🪟", "🍳", "🍽️", "🔑",
    "💡", "🕯️", "🪔", "📺", "🖼️", "🪴", "🌿", "🌱"
  ],
  "Vérifications": [
    "✅", "✔️", "☑️", "📋", "📝", "🔍", "👀", "⚠️", "❗", "❓",
    "💯", "🎯", "📌", "📍", "🔔", "⏰", "⏱️", "⌚"
  ],
  "Équipements": [
    "🔧", "🔨", "🪛", "⚙️", "🔩", "⛓️", "🪜", "🧰", "🛠️", "⚡",
    "🔌", "💡", "🔦", "🕯️", "🧲", "📡", "📻", "☎️"
  ],
  "Cuisine": [
    "🍳", "🍽️", "🥄", "🍴", "🔪", "🥘", "🍲", "🥗", "🧊", "🥤",
    "☕", "🫖", "🍵", "🧃", "🥛", "🍶", "🧈", "🧂"
  ],
  "Extérieur": [
    "🌳", "🌲", "🌴", "🌱", "🌿", "☘️", "🍀", "🌾", "🌺", "🌸",
    "🌼", "🌻", "🌷", "🏵️", "🌹", "🥀", "🪴", "🌵"
  ],
  "Transport & Garage": [
    "🚗", "🚙", "🚕", "🚌", "🚎", "🏎️", "🚓", "🚑", "🚒", "🚐",
    "🛻", "🚚", "🚛", "🚜", "🏍️", "🛵", "🚲", "🛴"
  ],
  "Autres": [
    "📦", "📫", "📪", "📬", "📭", "📮", "🗳️", "✉️", "📧", "📨",
    "📩", "📤", "📥", "📯", "📢", "📣", "📡", "🎁"
  ]
};

export function EmojiPicker({ value, onChange, placeholder = "🧹" }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleEmojiSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10"
        >
          <span className="text-base">
            {value || placeholder}
          </span>
          <Smile className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="max-h-[400px] overflow-y-auto">
          {Object.entries(EMOJI_CATEGORIES).map(([category, emojis]) => (
            <div key={category} className="p-3 border-b last:border-b-0">
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                {category}
              </h4>
              <div className="grid grid-cols-8 gap-1">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleEmojiSelect(emoji)}
                    className="w-8 h-8 flex items-center justify-center text-xl hover:bg-accent rounded transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
                    title={emoji}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {value && (
          <div className="p-2 border-t bg-muted/50">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => handleEmojiSelect("")}
            >
              Supprimer l'emoji
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

