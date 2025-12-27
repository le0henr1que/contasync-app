'use client';

import { useState } from 'react';
import { MessageCircle, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

type FeedbackType = 'DUVIDA' | 'PROBLEMA' | 'MELHORIA' | 'AVALIACAO';

interface CreateFeedbackDto {
  tipo: FeedbackType;
  titulo: string;
  descricao: string;
  avaliacao?: number;
}

const feedbackTypes = [
  { value: 'DUVIDA', label: 'Dúvida' },
  { value: 'PROBLEMA', label: 'Problema' },
  { value: 'MELHORIA', label: 'Sugestão de Melhoria' },
  { value: 'AVALIACAO', label: 'Avaliação' },
];

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipo, setTipo] = useState<FeedbackType | ''>('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [avaliacao, setAvaliacao] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tipo || !titulo.trim() || !descricao.trim()) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (tipo === 'AVALIACAO' && !avaliacao) {
      toast.error('Por favor, selecione uma avaliação de 1 a 5 estrelas.');
      return;
    }

    setLoading(true);

    try {
      const feedbackData: CreateFeedbackDto = {
        tipo,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        ...(tipo === 'AVALIACAO' && avaliacao ? { avaliacao } : {}),
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao enviar feedback');
      }

      toast.success('Feedback enviado! Obrigado pelo seu feedback. Ele será analisado em breve.');

      // Reset form
      setTipo('');
      setTitulo('');
      setDescricao('');
      setAvaliacao(null);
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar feedback. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="fixed bottom-6 right-6 rounded-full shadow-lg z-50 gap-2 px-6 py-6 group hover:scale-105 transition-transform"
          aria-label="Enviar feedback"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Enviar Feedback</DialogTitle>
          <DialogDescription>
            Compartilhe suas dúvidas, problemas, sugestões ou avaliações sobre o
            sistema.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">
              Tipo de Feedback <span className="text-destructive">*</span>
            </Label>
            <Select
              value={tipo}
              onValueChange={(value) => {
                setTipo(value as FeedbackType);
                if (value !== 'AVALIACAO') {
                  setAvaliacao(null);
                }
              }}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {feedbackTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {tipo === 'AVALIACAO' && (
            <div className="space-y-2">
              <Label>
                Avaliação <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setAvaliacao(rating)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        avaliacao && rating <= avaliacao
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="titulo">
              Título <span className="text-destructive">*</span>
            </Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Resumo do seu feedback"
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">
              Descrição <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva em detalhes..."
              rows={5}
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">
              {descricao.length}/1000 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>Enviando...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
