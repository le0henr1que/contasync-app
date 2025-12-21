'use client';

import { useState, useRef } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Upload, X, File, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentRequest {
  id: string;
  type: string;
  description: string;
  dueDate: string;
}

interface ClientUploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  request: DocumentRequest | null;
}

const documentTypeLabels: Record<string, string> = {
  NFE: 'NF-e',
  NFSE: 'NFS-e',
  RECEIPT: 'Recibo',
  CONTRACT: 'Contrato',
  BANK_STATEMENT: 'Comprovante Bancário',
  STATEMENT: 'Declaração',
  OTHER: 'Outros',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

export function ClientUploadDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  request,
}: ClientUploadDocumentModalProps) {
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setNotes('');
    setFile(null);
    setErrors({});
    setUploadProgress(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande (máx. 10MB)';
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setErrors({ ...errors, file: error });
      return;
    }

    setFile(selectedFile);
    setErrors({ ...errors, file: '' });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!file) {
      newErrors.file = 'Selecione um arquivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !request) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', file!);
      formData.append('requestId', request.id);
      if (notes) formData.append('notes', notes);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          toast.success('Documento enviado com sucesso');
          onSuccess();
          handleClose();
        } else {
          const response = JSON.parse(xhr.responseText);
          toast.error(response.message || 'Erro ao enviar documento. Tente novamente');
        }
        setIsUploading(false);
      });

      xhr.addEventListener('error', () => {
        toast.error('Erro de rede ao enviar documento');
        setIsUploading(false);
      });

      xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/documents/upload-response`);
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      xhr.send(formData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documento');
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isOverdue = request && new Date(request.dueDate) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Enviar Documento</DialogTitle>
          <DialogDescription>
            Responda à solicitação de documento
          </DialogDescription>
        </DialogHeader>

        {request && (
          <div className="space-y-4">
            {/* Request Details */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de Documento</Label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {documentTypeLabels[request.type] || request.type}
                  </Badge>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Descrição da Solicitação</Label>
                <p className="text-sm mt-1">{request.description}</p>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Prazo</Label>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm">
                    {format(new Date(request.dueDate), 'PPP', { locale: ptBR })}
                  </p>
                  {isOverdue && (
                    <Badge variant="destructive" className="gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Atrasado
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Upload de Arquivo */}
            <div className="space-y-2">
              <Label>Arquivo *</Label>
              <div
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                  ${errors.file ? 'border-destructive' : ''}
                  ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInputChange}
                  disabled={isUploading}
                />

                {file ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <File className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    {!isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-10 w-10 mx-auto text-muted-foreground" />
                    <div className="text-sm">
                      <span className="font-medium text-primary">Clique para selecionar</span>
                      <span className="text-muted-foreground"> ou arraste um arquivo</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      PDF, JPG ou PNG (máx. 10MB)
                    </p>
                  </div>
                )}
              </div>
              {errors.file && (
                <p className="text-sm text-destructive">{errors.file}</p>
              )}
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações (opcional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Adicione uma observação sobre o documento..."
                rows={3}
                disabled={isUploading}
              />
            </div>

            {/* Progress Bar */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Enviar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
