'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface RequestDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  clientId: string;
  clientName: string;
}

const documentTypes = [
  { value: 'NFE', label: 'NF-e (Nota Fiscal Eletrônica)' },
  { value: 'NFSE', label: 'NFS-e (Nota Fiscal de Serviço)' },
  { value: 'RECEIPT', label: 'Recibo' },
  { value: 'CONTRACT', label: 'Contrato' },
  { value: 'BANK_STATEMENT', label: 'Comprovante Bancário' },
  { value: 'STATEMENT', label: 'Declaração' },
  { value: 'OTHER', label: 'Outros' },
];

export function RequestDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  clientId,
  clientName,
}: RequestDocumentModalProps) {
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setDocumentType('');
    setDescription('');
    setDueDate(undefined);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!documentType) {
      newErrors.type = 'Selecione o tipo de documento';
    }
    if (!description.trim()) {
      newErrors.description = 'Descreva qual documento é necessário';
    }
    if (!dueDate) {
      newErrors.dueDate = 'Defina um prazo';
    } else if (dueDate <= new Date()) {
      newErrors.dueDate = 'Prazo deve ser no futuro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          clientId,
          type: documentType,
          description,
          dueDate: dueDate?.toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar solicitação');
      }

      toast.success('Solicitação enviada com sucesso');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar solicitação. Tente novamente');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Solicitar Documento</DialogTitle>
          <DialogDescription>
            Solicite um documento de {clientName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Documento */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo de Documento *</Label>
            <Select value={documentType} onValueChange={setDocumentType} disabled={isSubmitting}>
              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-destructive">{errors.type}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva qual documento é necessário..."
              rows={4}
              disabled={isSubmitting}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Prazo (Date Picker) */}
          <div className="space-y-2">
            <Label>Prazo *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground',
                    errors.dueDate && 'border-destructive'
                  )}
                  disabled={isSubmitting}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? (
                    format(dueDate, 'PPP', { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Solicitar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
