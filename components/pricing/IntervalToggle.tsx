'use client';

import { Button } from '@/components/ui/button';

interface IntervalToggleProps {
  interval: 'monthly' | 'yearly';
  onIntervalChange: (interval: 'monthly' | 'yearly') => void;
}

export function IntervalToggle({ interval, onIntervalChange }: IntervalToggleProps) {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      <Button
        variant={interval === 'monthly' ? 'default' : 'outline'}
        onClick={() => onIntervalChange('monthly')}
      >
        Mensal
      </Button>
      <Button
        variant={interval === 'yearly' ? 'default' : 'outline'}
        onClick={() => onIntervalChange('yearly')}
        className="relative"
      >
        Anual
        <span className="absolute -top-3 -right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
          Economize 16%
        </span>
      </Button>
    </div>
  );
}
