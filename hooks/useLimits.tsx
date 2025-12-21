'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UsageInfo {
  current: number;
  limit: number;
  percentage: number;
  isUnlimited: boolean;
}

interface LimitsData {
  limits: {
    maxClients: number;
    maxDocuments: number;
    maxPayments: number;
    maxExpenses: number;
    storageGB: number;
  };
  usage: {
    clients: UsageInfo;
    documents: UsageInfo;
    payments: UsageInfo;
    expenses: UsageInfo;
    storage: UsageInfo;
  };
  planName: string;
}

interface LimitsContextType {
  limitsData: LimitsData | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
  isFeatureBlocked: (feature: 'clients' | 'documents' | 'payments' | 'expenses') => boolean;
  hasFeatureAccess: (feature: 'clients' | 'documents' | 'payments' | 'expenses') => boolean;
}

const LimitsContext = createContext<LimitsContextType | undefined>(undefined);

export function LimitsProvider({ children }: { children: ReactNode }) {
  const [limitsData, setLimitsData] = useState<LimitsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLimits = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscriptions/me/usage`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setLimitsData(data);
      }
    } catch (error) {
      console.error('Error fetching limits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLimits();
  }, []);

  const isFeatureBlocked = (feature: 'clients' | 'documents' | 'payments' | 'expenses'): boolean => {
    if (!limitsData) return false;

    // Se o limite for 0, a feature está completamente bloqueada
    return limitsData.limits[`max${feature.charAt(0).toUpperCase() + feature.slice(1)}` as keyof typeof limitsData.limits] === 0;
  };

  const hasFeatureAccess = (feature: 'clients' | 'documents' | 'payments' | 'expenses'): boolean => {
    return !isFeatureBlocked(feature);
  };

  return (
    <LimitsContext.Provider
      value={{
        limitsData,
        isLoading,
        refetch: fetchLimits,
        isFeatureBlocked,
        hasFeatureAccess,
      }}
    >
      {children}
    </LimitsContext.Provider>
  );
}

export function useLimits() {
  const context = useContext(LimitsContext);
  if (context === undefined) {
    throw new Error('useLimits must be used within a LimitsProvider');
  }
  return context;
}
