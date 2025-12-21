'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { Payment } from './PaymentCard';

interface ConfirmDeletePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: Payment | null;
}

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

export function ConfirmDeletePaymentDialog({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: ConfirmDeletePaymentDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!payment) return null;

  const clientName = payment?.client?.companyName || payment?.client?.user?.name;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/${payment.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao deletar pagamento');
      }

      toast.success('Pagamento deletado com sucesso');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar pagamento. Tente novamente');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle>Deletar pagamento?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-3 pt-3">
            <p>Esta ação não pode ser desfeita.</p>
            <div className="rounded-lg bg-muted p-3 space-y-1">
              <p className="text-sm font-medium text-foreground">Detalhes do pagamento:</p>
              <p className="text-sm">
                <span className="text-muted-foreground">Cliente:</span>{' '}
                <span className="font-medium text-foreground">{clientName}</span>
              </p>
              <p className="text-sm">
                <span className="text-muted-foreground">Valor:</span>{' '}
                <span className="font-medium text-foreground">
                  {formatCurrency(payment.amount)}
                </span>
              </p>
              {payment.reference && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Ref:</span>{' '}
                  <span className="font-medium text-foreground">{payment.reference}</span>
                </p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
