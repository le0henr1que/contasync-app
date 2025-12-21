export type Role = 'ADMIN' | 'ACCOUNTANT' | 'CLIENT';

export type SubscriptionStatus = 'TRIALING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED' | 'INCOMPLETE';

export type DocumentType = 'NFE' | 'NFSE' | 'CTE' | 'RECEIPT' | 'STATEMENT' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELED';

export type PaymentType = 'CLIENT' | 'OFFICE';

export type RequestStatus = 'PENDING' | 'FULFILLED' | 'EXPIRED';

export interface Subscription {
  id: string;
  accountantId: string;
  planId: string;
  status: SubscriptionStatus;
  interval: 'MONTHLY' | 'YEARLY';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEnd?: string;
  canceledAt?: string;
  cancelAtPeriodEnd: boolean;
  plan?: Plan;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  limitsJson: {
    maxClients?: number;
    maxPayments?: number;
    maxExpenses?: number;
    maxDocuments?: number;
    storageGB?: number;
  };
  featuresJson: {
    apiAccess?: boolean;
    prioritySupport?: boolean;
    multiUser?: boolean;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  isActive: boolean;
  accountantId?: string;
  clientId?: string;
  expenseModuleEnabled?: boolean;
  onboardingCompleted?: boolean;
  subscriptionStatus?: SubscriptionStatus;
  subscription?: Subscription;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Accountant {
  id: string;
  userId: string;
  companyName: string;
  cnpj: string;
  crc: string;
  phone?: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionPlan?: string;
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  userId: string;
  accountantId: string;
  companyName?: string;
  cpfCnpj: string;
  expenseModuleEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface Document {
  id: string;
  clientId: string;
  type: DocumentType;
  title: string;
  description?: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  createdById: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  clientId?: string;
  accountantId: string;
  paymentType: PaymentType;
  title: string;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  paymentMethod?: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  receiptPath?: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  createdAt: string;
  updatedAt: string;
  client?: Client;
  accountant?: Accountant;
}

export interface Expense {
  id: string;
  clientId: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  receiptPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRequest {
  id: string;
  clientId: string;
  type: string;
  description: string;
  status: RequestStatus;
  dueDate?: string;
  fulfilledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: Role;
  accountantId?: string;
  clientId?: string;
  subscriptionStatus?: SubscriptionStatus;
  iat: number;
  exp: number;
}
