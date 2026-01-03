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
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('accessToken');
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/invitations`;

      console.log('Sending invitation request to:', apiUrl);
      console.log('Email:', email);
      console.log('Has token:', !!token);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        const error = await response.json();
        console.error('Server error response:', error);
        throw new Error(error.message || 'Erro ao enviar convite');
      }

      const data = await response.json();
      console.log('Success response:', data);

      toast.success('Convite enviado com sucesso!', {
        description: `Um email foi enviado para ${email}`,
      });

      // Reset form
      setEmail('');

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Full error details:', error);
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        toast.error('Erro de conexão', {
          description: 'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
        });
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro ao enviar convite');
      }
    } finally {
      setIsLoading(false);
    }
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
              <Label htmlFor="email">Email do Cliente *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@example.com"
                disabled={isLoading}
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Informe apenas o email. O sistema detecta automaticamente se o cliente já possui conta.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-900">
                <strong>ℹ️ Como funciona:</strong>
              </p>
              <ul className="text-xs text-blue-800 mt-2 space-y-1 ml-4 list-disc">
                <li>O cliente receberá um email com link de convite</li>
                <li>Se já tiver conta, apenas vincula ao seu escritório</li>
                <li>Se for novo, criará uma senha ao aceitar</li>
                <li>O link é válido por 7 dias</li>
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
