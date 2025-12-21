'use client';

import { useApi } from './useApi';

export interface DocumentFolder {
  id: string;
  clientId: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
  _count: {
    documents: number;
  };
}

export interface Document {
  id: string;
  clientId: string;
  folderId: string | null;
  requestId: string | null;
  type: string;
  title: string;
  description: string | null;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdById: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
  paymentAttachments?: PaymentAttachment[];
  folder?: {
    id: string;
    name: string;
    type: string;
    icon: string;
    color: string;
  } | null;
}

export interface PaymentAttachment {
  id: string;
  paymentId: string;
  documentId: string;
  attachedAt: string;
  attachedBy: string;
  payment: {
    id: string;
    title: string;
  };
}

/**
 * Hook para buscar documentos agrupados por pastas (Cliente)
 *
 * @param search - Termo de busca (opcional)
 * @param type - Filtro por tipo de documento (opcional)
 * @returns { folders, error, isLoading, mutate }
 *
 * @example
 * const { folders, isLoading } = useDocumentFolders();
 */
export function useDocumentFolders(search?: string, type?: string) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);

  const queryString = params.toString();
  const endpoint = `/documents/me/grouped${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useApi<DocumentFolder[]>(endpoint);

  return {
    folders: data || [],
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook para buscar documentos agrupados de um cliente específico (Contador)
 *
 * @param clientId - ID do cliente
 * @param search - Termo de busca (opcional)
 * @param type - Filtro por tipo de documento (opcional)
 * @returns { folders, error, isLoading, mutate }
 *
 * @example
 * const { folders, isLoading } = useDocumentFoldersByClient('client123');
 */
export function useDocumentFoldersByClient(
  clientId: string | null,
  search?: string,
  type?: string
) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (type) params.append('type', type);

  const queryString = params.toString();
  const endpoint = clientId
    ? `/documents/client/${clientId}/grouped${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useApi<DocumentFolder[]>(endpoint);

  return {
    folders: data || [],
    error,
    isLoading,
    mutate,
  };
}
