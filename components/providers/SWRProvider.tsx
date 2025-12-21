'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Configurações globais do SWR
        revalidateOnFocus: false, // Não revalidar ao focar na janela
        revalidateOnReconnect: true, // Revalidar ao reconectar internet
        revalidateIfStale: true, // Revalidar se dados estão stale
        dedupingInterval: 2000, // Deduplicar requests em 2s
        errorRetryCount: 3, // Tentar 3x em caso de erro
        errorRetryInterval: 5000, // Esperar 5s entre retries
        focusThrottleInterval: 5000, // Throttle de 5s no revalidate on focus
        shouldRetryOnError: true, // Retry automático em erros
        onError: (error, key) => {
          // Log de erros (pode enviar para serviço de monitoramento)
          console.error('SWR Error:', { error, key });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
