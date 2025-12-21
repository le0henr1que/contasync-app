import { useAuthStore } from '@/store/auth.store';

export type Role = 'ACCOUNTANT' | 'CLIENT';

export function useRole() {
  const { user } = useAuthStore();

  const hasRole = (role: Role | Role[]): boolean => {
    if (!user) return false;

    if (Array.isArray(role)) {
      return role.includes(user.role as Role);
    }

    return user.role === role;
  };

  const isAccountant = (): boolean => {
    return hasRole('ACCOUNTANT');
  };

  const isClient = (): boolean => {
    return hasRole('CLIENT');
  };

  return {
    user,
    hasRole,
    isAccountant,
    isClient,
    role: user?.role as Role | undefined,
  };
}
