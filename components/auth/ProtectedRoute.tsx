'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CLIENT' | 'ACCOUNTANT';
  fallbackPath?: string;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) {
      return;
    }

    // If no user, redirect to login
    if (!user) {
      router.push(fallbackPath);
      return;
    }

    // If role is required and doesn't match, redirect
    if (requiredRole && user.role !== requiredRole) {
      const redirectPath = user.role === 'ACCOUNTANT' ? '/dashboard' : '/client-portal';
      router.push(redirectPath);
      return;
    }
  }, [user, isLoading, router, requiredRole, fallbackPath]);

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render until we have a user
  if (!user) {
    return null;
  }

  // If role is required and doesn't match, don't render
  if (requiredRole && user.role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
