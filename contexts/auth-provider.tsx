'use client';

import { createContext, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import { httpClient } from '@/lib/http-client';

interface AuthContextType {
  // Context will use the store, this is just for provider setup
}

const AuthContext = createContext<AuthContextType>({});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const accessToken = authService.getStoredAccessToken();

      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        httpClient.setAccessToken(accessToken);
        const user = await authService.getCurrentUser();
        setUser(user);
        setLoading(false); // Mark loading as complete
      } catch (error) {
        console.error('Failed to load user:', error);

        const refreshToken = authService.getStoredRefreshToken();
        if (refreshToken) {
          try {
            await authService.refreshToken(refreshToken);
            const user = await authService.getCurrentUser();
            setUser(user);
            setLoading(false); // Mark loading as complete
          } catch (refreshError) {
            console.error('Failed to refresh token:', refreshError);
            setUser(null);
            setLoading(false); // Mark loading as complete
          }
        } else {
          setUser(null);
          setLoading(false); // Mark loading as complete
        }
      }
    };

    initAuth();
  }, [setUser, setLoading]);

  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
