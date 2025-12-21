'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, X, Loader2, File } from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
  client: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  createdBy: {
    name: string;
    email: string;
  };
}

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string | null;
  onDelete?: () => void;
}

const documentTypeLabels: Record<string, string> = {
  NFE: 'NF-e',
  NFSE: 'NFS-e',
  RECEIPT: 'Recibo',
  CONTRACT: 'Contrato',
  BANK_STATEMENT: 'Comprovante Bancário',
  STATEMENT: 'Declaração',
  CTE: 'CT-e',
  OTHER: 'Outros',
};

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'secondary' as const },
  PROCESSED: { label: 'Processado', variant: 'default' as const },
  ERROR: { label: 'Erro', variant: 'destructive' as const },
};

export function DocumentPreviewModal({
  isOpen,
  onClose,
  documentId,
  onDelete,
}: DocumentPreviewModalProps) {
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      fetchDocument();
    } else {
      // Clean up blob URL to prevent memory leaks
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
      setDocument(null);
      setPreviewUrl(null);
    }

    // Cleanup on unmount
    return () => {
      if (previewUrl) {
        window.URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, documentId]);

  const fetchDocument = async () => {
    if (!documentId) return;

    try {
      setIsLoading(true);

      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar documento');
      }

      const data = await response.json();
      setDocument(data);

      // Fetch file for preview
      const fileResponse = await fetch(`http://localhost:3000/api/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (fileResponse.ok) {
        const blob = await fileResponse.blob();
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar documento');
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentId || !document) return;

    try {
      setIsDownloading(true);

      const response = await fetch(`http://localhost:3000/api/documents/${documentId}/download`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao baixar documento');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.fileName;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success('Download iniciado');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao baixar documento');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!documentId) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`http://localhost:3000/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao deletar documento');
      }

      toast.success('Documento deletado com sucesso');
      setShowDeleteDialog(false);
      onClose();

      // Call onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar documento');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const isPDF = document?.mimeType === 'application/pdf';
  const isImage = document?.mimeType?.startsWith('image/');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <File className="h-5 w-5" />
              {document?.title || 'Carregando...'}
            </span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : document ? (
          <div className="space-y-6">
            {/* Document Preview */}
            <div className="border rounded-lg overflow-hidden bg-muted/10">
              {isPDF && previewUrl && (
                <iframe
                  src={previewUrl}
                  className="w-full h-[500px]"
                  title={document.title}
                />
              )}
              {isImage && previewUrl && (
                <img
                  src={previewUrl}
                  alt={document.title}
                  className="w-full h-auto max-h-[500px] object-contain"
                />
              )}
              {!isPDF && !isImage && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <File className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Pré-visualização não disponível para este tipo de arquivo
                  </p>
                  <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Arquivo
                  </Button>
                </div>
              )}
            </div>

            {/* Document Metadata */}
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {documentTypeLabels[document.type] || document.type}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <div className="mt-1">
                  <Badge variant={statusConfig[document.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                    {statusConfig[document.status as keyof typeof statusConfig]?.label || document.status}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Cliente</label>
                <p className="mt-1">{document.client.user.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Data de Envio</label>
                <p className="mt-1">{new Date(document.createdAt).toLocaleDateString('pt-BR')}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Tamanho do Arquivo</label>
                <p className="mt-1">{formatFileSize(document.fileSize)}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Enviado Por</label>
                <p className="mt-1">{document.createdBy.name}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              )}
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Deletar Documento?"
        description="Esta ação não pode ser desfeita. O documento será permanentemente deletado do sistema."
        isLoading={isDeleting}
      />
    </Dialog>
  );
}
