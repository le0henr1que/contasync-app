'use client';

import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DocumentManager from '@/components/documents/DocumentManager';

export default function ClientDocumentsPage() {
  return (
    <ProtectedRoute requiredRole="CLIENT">
      <DashboardLayout>
        <DocumentManager />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
