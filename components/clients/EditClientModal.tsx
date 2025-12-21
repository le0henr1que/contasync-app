'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Validation schema
const editClientSchema = z.object({
  name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  cpfCnpj: z.string().min(11, 'CPF/CNPJ inválido'),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  expenseModuleEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

type EditClientFormData = z.infer<typeof editClientSchema>;

interface EditClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  initialData?: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    companyName?: string;
    expenseModuleEnabled: boolean;
    isActive: boolean;
  };
}

// Mask helpers
const formatCPFCNPJ = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    // CPF: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 10) {
    // (00) 0000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  } else {
    // (00) 00000-0000
    return numbers
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  }
};

export function EditClientModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  initialData,
}: EditClientModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<EditClientFormData>({
    resolver: zodResolver(editClientSchema),
    defaultValues: {
      ...initialData,
      isActive: initialData?.isActive ?? true,
      expenseModuleEnabled: initialData?.expenseModuleEnabled ?? false,
    },
  });

  const expenseModuleEnabled = watch('expenseModuleEnabled') ?? false;
  const isActive = watch('isActive') ?? true;

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        ...initialData,
        isActive: initialData.isActive ?? true,
        expenseModuleEnabled: initialData.expenseModuleEnabled ?? false,
      });
    }
  }, [initialData, isOpen, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: EditClientFormData) => {
    try {
      setIsLoading(true);

      // Remove formatting from CPF/CNPJ and phone
      const cleanData = {
        ...data,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
        phone: data.phone?.replace(/\D/g, ''),
      };

      const response = await fetch(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao atualizar cliente');
      }

      toast.success('Cliente atualizado com sucesso');
      handleClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar cliente. Tente novamente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Cliente</DialogTitle>
          <DialogDescription>
            Atualize as informações do cliente
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            {/* Nome */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nome Completo / Razão Social <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Digite o nome"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@exemplo.com"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* CPF/CNPJ */}
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj">
                CPF/CNPJ <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpfCnpj"
                {...register('cpfCnpj')}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={isLoading}
                onChange={(e) => {
                  const formatted = formatCPFCNPJ(e.target.value);
                  setValue('cpfCnpj', formatted);
                }}
                maxLength={18}
              />
              {errors.cpfCnpj && (
                <p className="text-sm text-red-500">{errors.cpfCnpj.message}</p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="(00) 00000-0000"
                disabled={isLoading}
                onChange={(e) => {
                  const formatted = formatPhone(e.target.value);
                  setValue('phone', formatted);
                }}
                maxLength={15}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Company Name (optional) */}
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome Fantasia (opcional)</Label>
              <Input
                id="companyName"
                {...register('companyName')}
                placeholder="Nome fantasia da empresa"
                disabled={isLoading}
              />
            </div>

            {/* Client Status */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={isActive === true}
                onCheckedChange={(checked) => {
                  setValue('isActive', checked === true, { shouldDirty: true });
                }}
                disabled={isLoading}
              />
              <Label
                htmlFor="isActive"
                className="text-sm font-normal cursor-pointer"
              >
                Cliente ativo
              </Label>
            </div>

            {/* Expense Module Enabled */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="expenseModuleEnabled"
                checked={expenseModuleEnabled === true}
                onCheckedChange={(checked) => {
                  setValue('expenseModuleEnabled', checked === true, { shouldDirty: true });
                }}
                disabled={isLoading}
              />
              <Label
                htmlFor="expenseModuleEnabled"
                className="text-sm font-normal cursor-pointer"
              >
                Habilitar módulo de despesas
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
