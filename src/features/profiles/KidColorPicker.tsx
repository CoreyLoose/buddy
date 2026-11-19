import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { Button, Card, ColorWheel } from '@/ui';

export interface KidColorPickerProps {
  kidId: string;
}

/**
 * Lets a kid pick their own accent color on a color wheel and save it.
 * Nothing changes until they press Save (writes via `updateKid`).
 */
export function KidColorPicker({ kidId }: KidColorPickerProps) {
  const kid = useStore((s) => s.kids.find((k) => k.id === kidId));
  const updateKid = useStore((s) => s.updateKid);
  const [color, setColor] = useState(kid?.color ?? '#3b82f6');
  const [saved, setSaved] = useState(false);

  // Reset the draft when switching to a different kid (not on our own save).
  useEffect(() => {
    setColor(kid?.color ?? '#3b82f6');
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kidId]);

  if (!kid) return null;
  const dirty = color.toLowerCase() !== kid.color.toLowerCase();

  return (
    <Card accent={color} className="flex flex-col items-center gap-4 text-center">
      <h3 className="text-xl font-bold text-slate-800">Pick your color</h3>
      <ColorWheel
        value={color}
        onChange={(hex) => {
          setColor(hex);
          setSaved(false);
        }}
        label="Pick your color"
      />
      <div
        className="h-12 w-32 rounded-full border-4 border-white shadow"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <Button
        size="lg"
        disabled={!dirty}
        onClick={() => {
          updateKid(kid.id, { color });
          setSaved(true);
        }}
      >
        Save
      </Button>
      <p role="status" className="min-h-[1.5rem] font-semibold text-green-600">
        {saved && !dirty ? 'Saved! 🎉' : ''}
      </p>
    </Card>
  );
}
