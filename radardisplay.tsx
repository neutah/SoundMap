// radar display component
// renders a circular radar interface showing sound positions and directions

import { cn } from '@/lib/utils';
import { SoundEvent } from './types';
import { SoundIcon } from './SoundIcon';

interface RadarDisplayProps {
  sounds: SoundEvent[];   // array of sound events to display
  size?: number;          // diameter of the radar in pixels
  className?: string;
}

export const RadarDisplay = ({ 
  sounds, 
  size = 320,
  className 
}: RadarDisplayProps) => {
  const center = size / 2;
  const maxRadius = (size / 2) - 40; // leave room for icons at edge

  // calculates x,y position for a sound based on direction and distance
  // direction: 0-360 degrees (0 = north, 90 = east)
  // distance: 0-100 (0 = center, 100 = edge)
  const getSoundPosition = (direction: number, distance: number) => {
    // convert direction to radians, offset by -90 so 0 degrees points up (north)
    const radians = ((direction - 90) * Math.PI) / 180;
    const radius = (distance / 100) * maxRadius;
    
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians),
    };
  };

  // converts numeric direction to compass label
  const getDirectionLabel = (direction: number): string => {
    if (direction >= 337.5 || direction < 22.5) return 'North';
    if (direction >= 22.5 && direction < 67.5) return 'Northeast';
    if (direction >= 67.5 && direction < 112.5) return 'East';
    if (direction >= 112.5 && direction < 157.5) return 'Southeast';
    if (direction >= 157.5 && direction < 202.5) return 'South';
    if (direction >= 202.5 && direction < 247.5) return 'Southwest';
    if (direction >= 247.5 && direction < 292.5) return 'West';
    return 'Northwest';
  };

  return (
    <div 
      className={cn('relative', className)}
      style={{ width: size, height: size }}
      role="application"
      aria-label="Sound direction radar. Shows sounds coming from different directions around you."
    >
      {/* svg radar background with rings and crosshairs */}
      <svg 
        viewBox={`0 0 ${size} ${size}`} 
        className="absolute inset-0"
        aria-hidden="true"
      >
        {/* outer background circle */}
        <circle 
          cx={center} 
          cy={center} 
          r={maxRadius + 20} 
          className="fill-card stroke-border"
          strokeWidth="2"
        />
        
        {/* concentric distance rings at 33%, 66%, and 100% */}
        {[0.33, 0.66, 1].map((scale, i) => (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={maxRadius * scale}
            className="fill-none stroke-border"
            strokeWidth="1.5"
            strokeDasharray="8 4"
          />
        ))}
        
        {/* vertical crosshair line */}
        <line 
          x1={center} 
          y1={center - maxRadius - 10} 
          x2={center} 
          y2={center + maxRadius + 10}
          className="stroke-border"
          strokeWidth="1"
        />
        {/* horizontal crosshair line */}
        <line 
          x1={center - maxRadius - 10} 
          y1={center} 
          x2={center + maxRadius + 10} 
          y2={center}
          className="stroke-border"
          strokeWidth="1"
        />
        
        {/* center dot representing user position */}
        <circle 
          cx={center} 
          cy={center} 
          r={8} 
          className="fill-secondary stroke-secondary-foreground"
          strokeWidth="2"
        />
      </svg>

      {/* compass direction labels */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <span className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-bold text-foreground">N</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-bold text-foreground">S</span>
        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">W</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground">E</span>
      </div>

      {/* animated pulse effect behind active sounds */}
      {sounds.filter(s => s.isActive).map((sound) => {
        const pos = getSoundPosition(sound.direction, sound.distance);
        return (
          <div
            key={`pulse-${sound.id}`}
            className="absolute w-12 h-12 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ left: pos.x, top: pos.y }}
            aria-hidden="true"
          >
            <div className="absolute inset-0 rounded-full bg-primary/30 animate-radar-pulse" />
          </div>
        );
      })}

      {/* sound icons positioned on the radar */}
      {sounds.map((sound) => {
        const pos = getSoundPosition(sound.direction, sound.distance);
        const directionLabel = getDirectionLabel(sound.direction);
        
        return (
          <div
            key={sound.id}
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-fade-in-up"
            style={{ left: pos.x, top: pos.y }}
          >
            <SoundIcon
              type={sound.type}
              isActive={sound.isActive}
              intensity={sound.intensity}
              aria-label={`${sound.label} detected ${directionLabel}, ${sound.isActive ? 'currently active' : 'inactive'}`}
            />
          </div>
        );
      })}

      {/* screen reader only announcements for active sounds */}
      <div className="sr-only" role="status" aria-live="polite">
        {sounds.filter(s => s.isActive).map(sound => (
          <span key={`sr-${sound.id}`}>
            {sound.label} detected to the {getDirectionLabel(sound.direction)}.
          </span>
        ))}
      </div>
    </div>
  );
};
