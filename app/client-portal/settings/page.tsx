'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Save, User, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { PlanLimitsInfo } from '../components/PlanLimitsInfo';

interface ProfileData {
  user: {
    name: string;
    email: string;
  };
  phone: string | null;
  cpfCnpj: string;
  companyName: string | null;
}

function formatPhone(value: string): string {
  // Remove tudo exceto números
  const numbers = value.replace(/\D/g, '');

  if (numbers.length === 0) return '';

  // Aplica máscara (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
  if (numbers.length <= 2) {
    return `(${numbers}`;
  } else if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }
}

function unformatPhone(value: string): string {
  // Remove tudo exceto números
  return value.replace(/\D/g, '');
}

export default function ClientSettingsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
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

      const data: ProfileData = await response.json();
      setProfileData(data);
      setFormData({
        name: data.user.name,
        email: data.user.email,
        phone: data.phone ? formatPhone(data.phone) : '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setFormData({ ...formData, phone: formatted });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.email.trim()) {
      toast.error('Email é obrigatório');
      return;
    }

    // Valida formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Email inválido');
      return;
    }

    // Valida telefone se preenchido
    if (formData.phone) {
      const phoneNumbers = unformatPhone(formData.phone);
      if (phoneNumbers.length < 10 || phoneNumbers.length > 11) {
        toast.error('Telefone deve ter 10 ou 11 dígitos');
        return;
      }
    }

    try {
      setIsSaving(true);

      const payload: any = {
        name: formData.name.trim(),
        email: formData.email.trim(),
      };

      // Só envia telefone se preenchido
      if (formData.phone) {
        payload.phone = formData.phone;
      } else {
        payload.phone = null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients/me/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar perfil');
      }

      const updatedProfile: ProfileData = await response.json();
      setProfileData(updatedProfile);
      setFormData({
        name: updatedProfile.user.name,
        email: updatedProfile.user.email,
        phone: updatedProfile.phone ? formatPhone(updatedProfile.phone) : '',
      });

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setIsSaving(false);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie as informações do seu perfil
          </p>
        </div>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize seus dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nome <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-9"
                    placeholder="Seu nome completo"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-9"
                    placeholder="seu@email.com"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="text"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    className="pl-9"
                    placeholder="(00) 00000-0000"
                    disabled={isSaving}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Formato: (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
                </p>
              </div>

              {/* Read-only fields */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Informações não editáveis
                </h3>

                {profileData?.cpfCnpj && (
                  <div className="space-y-2">
                    <Label>CPF/CNPJ</Label>
                    <Input
                      value={profileData.cpfCnpj}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                {profileData?.companyName && (
                  <div className="space-y-2">
                    <Label>Nome Fantasia</Label>
                    <Input
                      value={profileData.companyName}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSaving} className="gap-2">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Plan Limits */}
        <PlanLimitsInfo />
      </div>
    </DashboardLayout>
  );
}
