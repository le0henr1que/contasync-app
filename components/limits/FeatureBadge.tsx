'use client';

import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';
import { useLimits } from '@/hooks/useLimits';

interface FeatureBadgeProps {
  feature: 'clients' | 'documents' | 'payments' | 'expenses';
  variant?: 'default' | 'small';
}

export function FeatureBadge({ feature, variant = 'default' }: FeatureBadgeProps) {
  const { isFeatureBlocked, isLoading } = useLimits();

  if (isLoading || !isFeatureBlocked(feature)) {
    return null;
  }

  if (variant === 'small') {
    return (
      <Badge variant="destructive" className="ml-2 bg-red-100 text-red-800 border-red-300 text-[10px] px-1 py-0">
        <Lock className="h-2 w-2" />
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="ml-2 bg-red-100 text-red-800 border-red-300">
      <Lock className="h-3 w-3 mr-1" />
      Bloqueado
    </Badge>
  );
}
