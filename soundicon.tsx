import { 
  Bell, 
  Phone, 
  AlertTriangle, 
  MessageCircle, 
  Tv, 
  Dog,
  Car,
  LucideIcon
} from 'lucide-react';
import { SoundType } from './types';
import { cn } from '@/lib/utils';

interface SoundIconProps {
  type: SoundType;
  isActive?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  'aria-label'?: string;
}

const iconMap: Record<SoundType, LucideIcon> = {
  doorbell: Bell,
  phone: Phone,
  alarm: AlertTriangle,
  voice: MessageCircle,
  appliance: Tv,
  pet: Dog,
  vehicle: Car,
};

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
};

const iconSizes = {
  sm: 16,
  md: 24,
  lg: 32,
};

const intensityClasses = {
  low: 'ring-2',
  medium: 'ring-4',
  high: 'ring-4 animate-sound-ping',
};

export const SoundIcon = ({
  type,
  isActive = false,
  intensity = 'medium',
  size = 'md',
  className,
  'aria-label': ariaLabel,
}: SoundIconProps) => {
  const Icon = iconMap[type];
  
  return (
    <div
      role="img"
      aria-label={ariaLabel || `${type} sound indicator`}
      className={cn(
        'flex items-center justify-center rounded-full transition-all duration-300',
        sizeClasses[size],
        isActive 
          ? 'bg-primary text-primary-foreground ring-primary/50' 
          : 'bg-muted text-muted-foreground',
        isActive && intensityClasses[intensity],
        className
      )}
    >
      <Icon 
        size={iconSizes[size]} 
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </div>
  );
};
