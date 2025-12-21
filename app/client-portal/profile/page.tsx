'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, User } from 'lucide-react';
import { toast } from 'sonner';

interface ClientProfile {
  id: string;
  companyName: string | null;
  cpfCnpj: string;
  phone: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export default function ClientProfilePage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Redirect if not client
  useEffect(() => {
    if (user && user.role !== 'CLIENT') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar perfil');
      }

      const data = await response.json();
      setProfile(data);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.phone || '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    // Phone validation (if provided)
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^\(\d{2}\)\s?\d{4,5}-?\d{4}$/;
      const cleanPhone = formData.phone.replace(/\D/g, '');
      if (cleanPhone.length !== 10 && cleanPhone.length !== 11) {
        toast.error('Telefone inválido. Use o formato (XX) XXXXX-XXXX');
        return;
      }
    }

    try {
      setIsSaving(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }

      const updatedProfile = await response.json();

      // Update auth store with new user data
      if (user) {
        setUser({
          ...user,
          name: formData.name,
          email: formData.email,
        });
      }

      toast.success('Perfil atualizado com sucesso');
      setProfile(updatedProfile);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Apply phone mask
    let masked = cleaned;
    if (cleaned.length > 0) {
      if (cleaned.length <= 2) {
        masked = `(${cleaned}`;
      } else if (cleaned.length <= 6) {
        masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
      } else if (cleaned.length <= 10) {
        masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
      } else {
        masked = `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
      }
    }

    setFormData({ ...formData, phone: masked });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Perfil não encontrado</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações do Perfil</h1>
          <p className="text-muted-foreground mt-2">
            Atualize suas informações pessoais
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Mantenha suas informações atualizadas para melhor comunicação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome completo"
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">
                  Formato: (XX) XXXXX-XXXX
                </p>
              </div>

              {/* CPF/CNPJ (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ</Label>
                <Input
                  id="cpfCnpj"
                  value={profile.cpfCnpj}
                  disabled
                  className="bg-muted cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">
                  Este campo não pode ser alterado
                </p>
              </div>

              {/* Company Name (if exists, read-only) */}
              {profile.companyName && (
                <div className="space-y-2">
                  <Label htmlFor="companyName">Razão Social</Label>
                  <Input
                    id="companyName"
                    value={profile.companyName}
                    disabled
                    className="bg-muted cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    Este campo não pode ser alterado
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Informações Importantes</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>CPF/CNPJ e Razão Social não podem ser alterados</li>
                  <li>Seu contador será notificado sobre mudanças no email</li>
                  <li>Mantenha um telefone válido para contato de emergência</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
