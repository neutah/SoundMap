// settings modal component
// provides controls for text size, button size, icon size, and theme selection

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Settings } from 'lucide-react';
import { useSettings, ThemeType } from '@/contexts/SettingsContext';

// high contrast theme options designed for vision impairment accessibility
// high contrast theme options designed for vision impairment accessibility
const themes: { value: ThemeType; label: string; preview: string }[] = [
  { value: 'yellow-purple', label: 'Yellow & Purple', preview: 'bg-[hsl(270,80%,15%)] border-[hsl(55,100%,50%)]' },
  { value: 'green-pink', label: 'Green & Pink', preview: 'bg-[hsl(330,60%,10%)] border-[hsl(145,100%,45%)]' },
  { value: 'blue-orange', label: 'Blue & Orange', preview: 'bg-[hsl(220,60%,10%)] border-[hsl(30,100%,55%)]' },
];

export const SettingsModal = () => {
  // get current settings and update function from context
  const { settings, updateSettings } = useSettings();

  return (
    <Dialog>
      {/* settings button trigger */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Open settings"
          className="high-contrast-focus"
        >
          <Settings size={24} />
        </Button>
      </DialogTrigger>
      
      {/* modal content */}
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Settings</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* text size slider - controls body text scaling */}
          <div className="space-y-3">
            <label className="text-foreground font-semibold block">
              Text Size: {Math.round(settings.textSize * 100)}%
            </label>
            <Slider
              value={[settings.textSize]}
              onValueChange={([val]) => updateSettings({ textSize: val })}
              min={0.8}
              max={1.4}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* button size slider - controls button scaling */}
          <div className="space-y-3">
            <label className="text-foreground font-semibold block">
              Button Size: {Math.round(settings.buttonSize * 100)}%
            </label>
            <Slider
              value={[settings.buttonSize]}
              onValueChange={([val]) => updateSettings({ buttonSize: val })}
              min={0.8}
              max={1.4}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* icon size slider - controls svg icon scaling */}
          <div className="space-y-3">
            <label className="text-foreground font-semibold block">
              Icon Size: {Math.round(settings.iconSize * 100)}%
            </label>
            <Slider
              value={[settings.iconSize]}
              onValueChange={([val]) => updateSettings({ iconSize: val })}
              min={0.8}
              max={1.4}
              step={0.1}
              className="w-full"
            />
          </div>

          {/* theme selection buttons */}
          <div className="space-y-3">
            <label className="text-foreground font-semibold block">High Contrast Theme</label>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => updateSettings({ theme: theme.value })}
                  className={`p-4 rounded-lg border-4 transition-all ${theme.preview} ${
                    settings.theme === theme.value
                      ? 'ring-4 ring-ring ring-offset-2 ring-offset-background'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-pressed={settings.theme === theme.value}
                >
                  <span className="text-white font-bold text-lg">
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
