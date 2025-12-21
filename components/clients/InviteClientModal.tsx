'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail, Send } from 'lucide-react';
import { toast } from 'sonner';

interface InviteClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function InviteClientModal({ open, onOpenChange, onSuccess }: InviteClientModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('http://localhost:3000/api/invitations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erro ao enviar convite');
      }

      const data = await response.json();

      toast.success('Convite enviado com sucesso!', {
        description: `Um email foi enviado para ${formData.email}`,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        cpfCnpj: '',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error sending invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao enviar convite');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Convidar Cliente
          </DialogTitle>
          <DialogDescription>
            Envie um convite por email para que o cliente tenha acesso ao portal
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nome Completo *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="João Silva"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="joao@example.com"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                O convite será enviado para este email
              </p>
            </div>

            <div>
              <Label htmlFor="cpfCnpj">CPF ou CNPJ *</Label>
              <Input
                id="cpfCnpj"
                name="cpfCnpj"
                type="text"
                required
                value={formData.cpfCnpj}
                onChange={handleChange}
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Documento de identificação do cliente
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Como funciona:</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                <li>O cliente receberá um email com link de convite</li>
                <li>O link é válido por 7 dias</li>
                <li>Ao aceitar, o cliente criará uma senha</li>
                <li>Depois poderá acessar o portal com seus dados</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Convite
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
