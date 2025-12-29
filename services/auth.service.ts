import { httpClient } from '@/lib/http-client';
import type { User, AuthTokens } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}



export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface RegisterAccountantData extends RegisterData {
  companyName: string;
  cnpj: string;
  crc: string;
  phone?: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await httpClient.post<LoginResponse>('/auth/login', credentials);

    if (response.accessToken) {
      httpClient.setAccessToken(response.accessToken);
      this.storeTokens(response.accessToken, response.refreshToken);
    }

    return response;
  }

  async register(data: RegisterData): Promise<User> {
    return httpClient.post<User>('/auth/register', data);
  }

  async registerAccountant(data: RegisterAccountantData): Promise<User> {
    return httpClient.post<User>('/auth/register-accountant', data);
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    const response = await httpClient.post<{ accessToken: string }>('/auth/refresh', {
      refreshToken,
    });

    if (response.accessToken) {
      httpClient.setAccessToken(response.accessToken);
      this.storeAccessToken(response.accessToken);
    }

    return response;
  }

  async logout(refreshToken: string): Promise<void> {
    await httpClient.post('/auth/logout', { refreshToken });
    this.clearTokens();
    httpClient.setAccessToken(null);
  }

  async getCurrentUser(): Promise<User> {
    return httpClient.get<User>('/auth/me');
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>('/auth/request-password-reset', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
  }

  async completeOnboarding(): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>('/auth/complete-onboarding', {});
  }

  private storeTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private storeAccessToken(accessToken: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
    }
  }

  private clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  }

  getStoredAccessToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  getStoredRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refreshToken');
    }
    return null;
  }
}

export const authService = new AuthService();
