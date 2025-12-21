'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Loading component for modals
const ModalLoader = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
  </div>
);

// ======================
// CLIENT MODALS
// ======================

export const CreateClientModal = dynamic(
  () => import('@/components/clients/CreateClientModal').then(m => ({ default: m.CreateClientModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const EditClientModal = dynamic(
  () => import('@/components/clients/EditClientModal').then(m => ({ default: m.EditClientModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const DeleteClientDialog = dynamic(
  () => import('@/components/clients/DeleteClientDialog').then(m => ({ default: m.DeleteClientDialog })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

// ======================
// PAYMENT MODALS
// ======================

export const RecordPaymentModal = dynamic(
  () => import('@/components/payments/RecordPaymentModal').then(m => ({ default: m.RecordPaymentModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const AttachReceiptModal = dynamic(
  () => import('@/components/payments/AttachReceiptModal').then(m => ({ default: m.AttachReceiptModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const PaymentDetailModal = dynamic(
  () => import('@/components/payments/PaymentDetailModal').then(m => ({ default: m.PaymentDetailModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const ConfirmDeletePaymentDialog = dynamic(
  () => import('@/components/payments/ConfirmDeletePaymentDialog').then(m => ({ default: m.ConfirmDeletePaymentDialog })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

// ======================
// EXPENSE MODALS
// ======================

export const AddExpenseModal = dynamic(
  () => import('@/components/expenses/AddExpenseModal').then(m => ({ default: m.AddExpenseModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

// ======================
// DOCUMENT MODALS
// ======================

export const RequestDocumentModal = dynamic(
  () => import('@/components/documents/RequestDocumentModal').then(m => ({ default: m.RequestDocumentModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const UploadDocumentModal = dynamic(
  () => import('@/components/documents/UploadDocumentModal').then(m => ({ default: m.UploadDocumentModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const ClientUploadDocumentModal = dynamic(
  () => import('@/components/documents/ClientUploadDocumentModal').then(m => ({ default: m.ClientUploadDocumentModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);

export const DocumentPreviewModal = dynamic(
  () => import('@/components/documents/DocumentPreviewModal').then(m => ({ default: m.DocumentPreviewModal })),
  {
    ssr: false,
    loading: () => <ModalLoader />,
  }
);
