'use client';

import { ReactNode } from 'react';
import { useLimits } from '@/hooks/useLimits';
import { FeatureBlockedCard } from './FeatureBlockedCard';
import { Loader2 } from 'lucide-react';

interface FeatureGuardProps {
  feature: 'clients' | 'documents' | 'payments' | 'expenses';
  featureName: string;
  featureDescription: string;
  icon?: ReactNode;
  benefits?: string[];
  children: ReactNode;
}

export function FeatureGuard({
  feature,
  featureName,
  featureDescription,
  icon,
  benefits,
  children,
}: FeatureGuardProps) {
  const { isFeatureBlocked, isLoading } = useLimits();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isFeatureBlocked(feature)) {
    return (
      <FeatureBlockedCard
        featureName={featureName}
        featureDescription={featureDescription}
        icon={icon}
        benefits={benefits}
      />
    );
  }

  return <>{children}</>;
}
