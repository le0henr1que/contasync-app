'use client';

import { useApi } from './useApi';

export enum PaymentStatus {
  PENDING = 'PENDING',
  AWAITING_INVOICE = 'AWAITING_INVOICE',
  READY_TO_PAY = 'READY_TO_PAY',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentType {
  OFFICE = 'OFFICE',
  CLIENT = 'CLIENT',
}

export enum RecurringFrequency {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  SEMI_ANNUALLY = 'SEMI_ANNUALLY',
  ANNUALLY = 'ANNUALLY',
}

export interface Payment {
  id: string;
  clientId: string | null;
  accountantId: string;
  paymentType: PaymentType;
  title: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  paymentMethod: string | null;
  reference: string | null;
  notes: string | null;
  status: PaymentStatus;
  isRecurring: boolean;
  recurringFrequency: RecurringFrequency | null;
  recurringDayOfMonth: number | null;
  recurringEndDate: string | null;
  parentPaymentId: string | null;
  requiresInvoice: boolean;
  invoiceAttachedAt: string | null;
  invoiceAttachedBy: string | null;
  createdAt: string;
  updatedAt: string;
  client?: {
    id: string;
    name: string;
    companyName?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  };
  attachedDocuments?: {
    id: string;
    documentId: string;
    attachedAt: string;
    document: {
      id: string;
      title: string;
      fileName: string;
      mimeType: string;
      fileSize: number;
    };
  }[];
}

export interface PaymentsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: PaymentStatus;
  type?: PaymentType;
  startDate?: string;
  endDate?: string;
  sort?: 'dueDate' | 'amount' | 'createdAt';
  order?: 'asc' | 'desc';
}

/**
 * Hook para buscar pagamentos do cliente logado
 *
 * @param params - Parâmetros de query (filtros, paginação, ordenação)
 * @returns { payments, pagination, error, isLoading, mutate }
 *
 * @example
 * const { payments, isLoading } = usePayments({ status: PaymentStatus.PENDING });
 */
export function usePayments(params?: PaymentsQueryParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.order) queryParams.append('order', params.order);

  const queryString = queryParams.toString();
  const endpoint = `/payments/me${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useApi<{
    payments: Payment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(endpoint);

  return {
    payments: data?.payments || [],
    pagination: data?.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook para buscar um pagamento específico do cliente
 *
 * @param paymentId - ID do pagamento
 * @returns { payment, error, isLoading, mutate }
 *
 * @example
 * const { payment, isLoading } = usePayment('payment123');
 */
export function usePayment(paymentId: string | null) {
  const endpoint = paymentId ? `/payments/me/${paymentId}` : null;
  const { data, error, isLoading, mutate } = useApi<Payment>(endpoint);

  return {
    payment: data,
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook para contador buscar pagamentos de um cliente específico
 *
 * @param clientId - ID do cliente
 * @param params - Parâmetros de query (filtros, paginação, ordenação)
 * @returns { payments, pagination, error, isLoading, mutate }
 *
 * @example
 * const { payments, isLoading } = usePaymentsByClient('client123', { status: PaymentStatus.PENDING });
 */
export function usePaymentsByClient(
  clientId: string | null,
  params?: PaymentsQueryParams
) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.sort) queryParams.append('sortBy', params.sort);
  if (params?.order) queryParams.append('sortOrder', params.order);

  const queryString = queryParams.toString();
  const endpoint = clientId
    ? `/payments/client/${clientId}${queryString ? `?${queryString}` : ''}`
    : null;

  const { data, error, isLoading, mutate } = useApi<{
    payments: Payment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(endpoint);

  return {
    payments: data?.payments || [],
    pagination: data?.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    error,
    isLoading,
    mutate,
  };
}

/**
 * Hook para contador buscar todos os pagamentos
 *
 * @param params - Parâmetros de query (filtros, paginação, ordenação)
 * @returns { payments, pagination, error, isLoading, mutate }
 *
 * @example
 * const { payments, isLoading } = useAllPayments({ type: PaymentType.OFFICE });
 */
export function useAllPayments(params?: PaymentsQueryParams) {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.startDate) queryParams.append('startDate', params.startDate);
  if (params?.endDate) queryParams.append('endDate', params.endDate);
  if (params?.sort) queryParams.append('sort', params.sort);
  if (params?.order) queryParams.append('order', params.order);

  const queryString = queryParams.toString();
  const endpoint = `/payments${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useApi<{
    payments: Payment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>(endpoint);

  return {
    payments: data?.payments || [],
    pagination: data?.pagination || {
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    },
    error,
    isLoading,
    mutate,
  };
}
