export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export const APP_NAME = 'ContaSync';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CLIENTS: '/clients',
  DOCUMENTS: '/documents',
  PAYMENTS: '/payments',
  EXPENSES: '/expenses',
  SETTINGS: '/settings',
} as const;

export const ROLES = {
  ADMIN: 'ADMIN',
  ACCOUNTANT: 'ACCOUNTANT',
  CLIENT: 'CLIENT',
} as const;

export const DOCUMENT_TYPES = {
  NFE: 'NFE',
  NFSE: 'NFSE',
  CTE: 'CTE',
  RECEIPT: 'RECEIPT',
  STATEMENT: 'STATEMENT',
  OTHER: 'OTHER',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  OVERDUE: 'OVERDUE',
  CANCELED: 'CANCELED',
} as const;
