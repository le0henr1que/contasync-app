'use client';

import { FileText, Download, Eye, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Document } from '@/hooks/useDocumentFolders';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DocumentItemProps {
  document: Document;
  onClick?: (documentId: string) => void;
  onDownload?: (documentId: string, fileName: string) => void;
  showFolder?: boolean;
}

export function DocumentItem({
  document,
  onClick,
  onDownload,
  showFolder = false,
}: DocumentItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
      return '📊';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📎';
  };

  const hasPaymentAttachments =
    document.paymentAttachments && document.paymentAttachments.length > 0;

  return (
    <div
      className={cn(
        'group flex items-center justify-between rounded-lg border p-3 transition-colors',
        'hover:bg-muted/50',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(document.id)}
    >
      <div className="flex flex-1 items-center gap-3 overflow-hidden">
        {/* Ícone do Arquivo */}
        <div className="flex-shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <span className="text-xl">{getFileIcon(document.mimeType)}</span>
          </div>
        </div>

        {/* Informações do Documento */}
        <div className="flex-1 overflow-hidden">
          <div className="flex items-center gap-2">
            <p className="truncate font-medium text-sm">{document.title}</p>
            {showFolder && document.folder && (
              <Badge
                variant="outline"
                className="text-xs"
                style={{
                  borderColor: document.folder.color,
                  color: document.folder.color,
                }}
              >
                {document.folder.icon} {document.folder.name}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{document.fileName}</span>
            <span>•</span>
            <span>{formatFileSize(document.fileSize)}</span>
            <span>•</span>
            <span>
              {format(new Date(document.createdAt), 'dd MMM yyyy', {
                locale: ptBR,
              })}
            </span>
          </div>

          {/* Payment Attachments */}
          {hasPaymentAttachments && (
            <div className="mt-1 flex items-center gap-1">
              <LinkIcon className="h-3 w-3 text-primary" />
              <span className="text-xs text-primary">
                Anexado a{' '}
                {document.paymentAttachments!.map((att, idx) => (
                  <span key={att.id}>
                    {idx > 0 && ', '}
                    {att.payment.title}
                  </span>
                ))}
              </span>
            </div>
          )}

          {document.description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {document.description}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {onClick && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onClick(document.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        )}

        {onDownload && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(document.id, document.fileName);
            }}
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
