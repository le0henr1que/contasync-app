'use client';

import { useState } from 'react';
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DocumentItem } from './DocumentItem';
import type { DocumentFolder as DocumentFolderType } from '@/hooks/useDocumentFolders';
import { cn } from '@/lib/utils';

interface DocumentFolderCardProps {
  folder: DocumentFolderType;
  onDocumentClick?: (documentId: string) => void;
  onDownload?: (documentId: string, fileName: string) => void;
}

export function DocumentFolderCard({
  folder,
  onDocumentClick,
  onDownload,
}: DocumentFolderCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const folderColor = folder.color || '#3B82F6';
  const documentCount = folder.documents?.length || 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader
        className={cn(
          'cursor-pointer transition-colors hover:bg-muted/50',
          'flex flex-row items-center justify-between'
        )}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: folderColor,
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-lg"
            style={{
              backgroundColor: `${folderColor}20`,
              color: folderColor,
            }}
          >
            {folder.icon ? (
              <span className="text-xl">{folder.icon}</span>
            ) : (
              <FolderOpen className="h-5 w-5" />
            )}
          </div>

          <div className="flex flex-col gap-1">
            <CardTitle className="text-base">{folder.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {documentCount} {documentCount === 1 ? 'documento' : 'documentos'}
              </Badge>
              {folder.type && (
                <span className="text-xs text-muted-foreground">
                  {folder.type}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>

      {isExpanded && documentCount > 0 && (
        <CardContent className="space-y-2 pt-4">
          {folder.documents.map((document) => (
            <DocumentItem
              key={document.id}
              document={document}
              onClick={onDocumentClick}
              onDownload={onDownload}
            />
          ))}
        </CardContent>
      )}

      {isExpanded && documentCount === 0 && (
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          Nenhum documento nesta pasta
        </CardContent>
      )}
    </Card>
  );
}
