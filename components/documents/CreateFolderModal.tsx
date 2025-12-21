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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const FOLDER_ICONS = [
  '📁', '📂', '🗂️', '📋', '📄', '📝', '📊', '📈',
  '💼', '🏦', '💰', '📑', '🗄️', '📇', '📰', '📓'
];

const FOLDER_COLORS = [
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#10b981', // green
  '#f59e0b', // amber
  '#06b6d4', // cyan
  '#ef4444', // red
  '#64748b', // slate
  '#ec4899', // pink
];

export function CreateFolderModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateFolderModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(FOLDER_ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(FOLDER_COLORS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setName('');
    setDescription('');
    setSelectedIcon(FOLDER_ICONS[0]);
    setSelectedColor(FOLDER_COLORS[0]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm();
      onClose();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome da pasta é obrigatório';
    } else if (name.length > 50) {
      newErrors.name = 'Nome muito longo (máx. 50 caracteres)';
    }

    if (description && description.length > 200) {
      newErrors.description = 'Descrição muito longa (máx. 200 caracteres)';
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

      const response = await fetch('http://localhost:3000/api/document-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          icon: selectedIcon,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao criar pasta');
      }

      toast.success('Pasta criada com sucesso');
      onSuccess();
      handleClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar pasta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Pasta</DialogTitle>
          <DialogDescription>
            Crie uma pasta customizada para organizar seus documentos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Pasta *</Label>
            <Input
              id="name"
              placeholder="Ex: Contratos 2024"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descreva o conteúdo da pasta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description}</p>
            )}
          </div>

          {/* Ícone */}
          <div className="space-y-2">
            <Label>Ícone</Label>
            <div className="grid grid-cols-8 gap-2">
              {FOLDER_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setSelectedIcon(icon)}
                  disabled={isSubmitting}
                  className={`
                    p-2 text-xl rounded-md border-2 transition-colors
                    ${selectedIcon === icon
                      ? 'border-primary bg-primary/10'
                      : 'border-muted hover:border-primary/50'
                    }
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Cor */}
          <div className="space-y-2">
            <Label>Cor</Label>
            <div className="grid grid-cols-8 gap-2">
              {FOLDER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  disabled={isSubmitting}
                  className={`
                    h-10 w-10 rounded-md border-2 transition-all
                    ${selectedColor === color
                      ? 'border-foreground scale-110'
                      : 'border-muted hover:scale-105'
                    }
                    ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Pré-visualização</Label>
            <div
              className="flex items-center gap-3 p-4 rounded-lg border-2"
              style={{ borderLeftColor: selectedColor }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${selectedColor}20`,
                  color: selectedColor,
                }}
              >
                <span className="text-xl">{selectedIcon}</span>
              </div>
              <div>
                <p className="font-medium">{name || 'Nome da pasta'}</p>
                {description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Criar Pasta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
