'use client';

import useSWR, { SWRConfiguration } from 'swr';
import useSWRMutation from 'swr/mutation';
import { fetcher, fetcherWithBody } from '@/lib/fetcher';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

/**
 * Hook customizado para requisições GET com cache
 *
 * @param endpoint - Endpoint da API (ex: '/payments/me')
 * @param config - Configurações do SWR
 * @returns { data, error, isLoading, mutate }
 *
 * @example
 * const { data, error, isLoading } = useApi('/payments/me');
 */
export function useApi<T = any>(
  endpoint: string | null,
  config?: SWRConfiguration
) {
  const url = endpoint ? `${API_BASE_URL}${endpoint}` : null;

  const { data, error, isLoading, mutate } = useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: false, // Não revalidar ao focar janela
      revalidateOnReconnect: true, // Revalidar ao reconectar
      dedupingInterval: 2000, // Deduplicar requests em 2s
      ...config,
    }
  );

  return {
    data,
    error,
    isLoading,
    mutate, // Função para atualizar cache manualmente
  };
}

/**
 * Hook para requisições POST/PUT/DELETE com revalidação automática
 *
 * @param endpoint - Endpoint da API
 * @returns { trigger, isMutating, error }
 *
 * @example
 * const { trigger, isMutating } = useApiMutation('/payments');
 * await trigger({ method: 'POST', body: { amount: 100 } });
 */
export function useApiMutation<T = any>(endpoint: string) {
  const url = `${API_BASE_URL}${endpoint}`;

  const { trigger, isMutating, error } = useSWRMutation<T>(
    url,
    fetcherWithBody
  );

  return {
    trigger,
    isMutating,
    error,
  };
}

/**
 * Hook para listagem paginada com cache
 *
 * @param endpoint - Endpoint base (ex: '/payments')
 * @param page - Página atual
 * @param limit - Itens por página
 * @returns { data, error, isLoading, mutate }
 *
 * @example
 * const { data, isLoading } = useApiPaginated('/payments', page, 10);
 */
export function useApiPaginated<T = any>(
  endpoint: string,
  page: number = 1,
  limit: number = 10,
  config?: SWRConfiguration
) {
  const url = `${API_BASE_URL}${endpoint}?page=${page}&limit=${limit}`;

  return useSWR<T>(
    url,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true, // Manter dados da página anterior
      ...config,
    }
  );
}
