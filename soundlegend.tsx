import { SoundIcon } from './SoundIcon';
import { SoundType } from './types';

const legendItems: { type: SoundType; label: string }[] = [
  { type: 'doorbell', label: 'Doorbell' },
  { type: 'phone', label: 'Phone' },
  { type: 'alarm', label: 'Alarm' },
  { type: 'voice', label: 'Voice' },
  { type: 'appliance', label: 'Appliance' },
  { type: 'pet', label: 'Pet' },
  { type: 'vehicle', label: 'Vehicle' },
];

export const SoundLegend = () => {
  return (
    <div 
      className="bg-card border border-border rounded-xl p-4"
      role="region"
      aria-label="Sound type legend"
    >
      <h2 className="text-lg font-bold text-foreground mb-4">Sound Types</h2>
      <ul className="grid grid-cols-2 gap-3">
        {legendItems.map(({ type, label }) => (
          <li 
            key={type}
            className="flex items-center gap-3"
          >
            <SoundIcon type={type} size="sm" aria-hidden="true" />
            <span className="text-sm font-medium text-foreground">{label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
