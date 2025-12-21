'use client';

import { useState, useEffect } from 'react';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileText, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';
import type { Payment } from '@/hooks/usePayments';
import type { Document } from '@/hooks/useDocumentFolders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface AttachDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  payment: Payment | null;
}

export function AttachDocumentModal({
  isOpen,
  onClose,
  onSuccess,
  payment,
}: AttachDocumentModalProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAttaching, setIsAttaching] = useState(false);
  const [isDetaching, setIsDetaching] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && payment?.clientId) {
      fetchClientDocuments();
    } else {
      resetState();
    }
  }, [isOpen, payment?.clientId]);

  useEffect(() => {
    if (search) {
      const filtered = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search.toLowerCase()) ||
          doc.fileName.toLowerCase().includes(search.toLowerCase()) ||
          doc.type.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredDocuments(filtered);
    } else {
      setFilteredDocuments(documents);
    }
  }, [search, documents]);

  const resetState = () => {
    setDocuments([]);
    setFilteredDocuments([]);
    setSearch('');
    setSelectedDocumentId(null);
  };

  const fetchClientDocuments = async () => {
    if (!payment?.clientId) return;

    try {
      setIsLoading(true);
      const response = await fetch(
        `http://localhost:3000/api/documents/client/${payment.clientId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
      setFilteredDocuments(data.documents || []);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAttachDocument = async () => {
    if (!selectedDocumentId || !payment) return;

    try {
      setIsAttaching(true);
      const response = await fetch(
        `http://localhost:3000/api/payments/${payment.id}/attach-document`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({
            documentId: selectedDocumentId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao anexar documento');
      }

      toast.success('Documento anexado com sucesso');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao anexar documento');
    } finally {
      setIsAttaching(false);
    }
  };

  const handleDetachDocument = async (documentId: string) => {
    if (!payment) return;

    try {
      setIsDetaching(true);
      const response = await fetch(
        `http://localhost:3000/api/payments/${payment.id}/detach-document/${documentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao remover documento');
      }

      toast.success('Documento removido com sucesso');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover documento');
    } finally {
      setIsDetaching(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📎';
  };

  const isDocumentAttached = (documentId: string) => {
    return payment?.attachedDocuments?.some((att) => att.documentId === documentId);
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Anexar Documento ao Pagamento</DialogTitle>
          <DialogDescription>
            Selecione um documento do cliente para anexar ao pagamento "{payment.title}"
          </DialogDescription>
        </DialogHeader>

        {/* Attached Documents */}
        {payment.attachedDocuments && payment.attachedDocuments.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Documentos já anexados:</h4>
            <div className="space-y-2">
              {payment.attachedDocuments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getFileIcon(att.document.mimeType)}</span>
                    <div>
                      <p className="font-medium text-sm">{att.document.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {att.document.fileName} • {formatFileSize(att.document.fileSize)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDetachDocument(att.documentId)}
                    disabled={isDetaching}
                  >
                    {isDetaching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Documents List */}
        <div className="max-h-[400px] space-y-2 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                {search
                  ? 'Nenhum documento encontrado com esse termo'
                  : 'Nenhum documento disponível para este cliente'}
              </p>
            </div>
          ) : (
            filteredDocuments.map((doc) => {
              const isAttached = isDocumentAttached(doc.id);
              const isSelected = selectedDocumentId === doc.id;

              return (
                <div
                  key={doc.id}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted/50',
                    isSelected && 'border-primary bg-primary/5',
                    isAttached && 'opacity-50'
                  )}
                  onClick={() => {
                    if (!isAttached) {
                      setSelectedDocumentId(isSelected ? null : doc.id);
                    }
                  }}
                >
                  <div className="flex flex-1 items-center gap-3">
                    <span className="text-xl">{getFileIcon(doc.mimeType)}</span>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium text-sm">{doc.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {doc.type}
                        </Badge>
                        {isAttached && (
                          <Badge variant="secondary" className="text-xs">
                            <Paperclip className="mr-1 h-3 w-3" />
                            Anexado
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{doc.fileName}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span>•</span>
                        <span>
                          {format(new Date(doc.createdAt), 'dd MMM yyyy', {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && !isAttached && (
                    <div className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <span className="text-xs">✓</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isAttaching}>
            Cancelar
          </Button>
          <Button
            onClick={handleAttachDocument}
            disabled={!selectedDocumentId || isAttaching}
          >
            {isAttaching && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Anexar Documento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
