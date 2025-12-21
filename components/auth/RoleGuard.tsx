'use client';

import { useRole, Role } from '@/hooks/useRole';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface RoleGuardProps {
  allowedRoles: Role | Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, children, fallback, redirectTo }: RoleGuardProps) {
  const { hasRole } = useRole();
  const router = useRouter();

  const allowed = hasRole(allowedRoles);

  useEffect(() => {
    if (!allowed && redirectTo) {
      router.push(redirectTo);
    }
  }, [allowed, redirectTo, router]);

  if (!allowed) {
    return fallback || null;
  }

  return <>{children}</>;
}
