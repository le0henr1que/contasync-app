'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  FileText,
  Download,
  Eye,
  Trash2,
  Loader2,
  File,
} from 'lucide-react';
import { toast } from 'sonner';
import { UploadDocumentModal } from '@/components/documents/UploadDocumentModal';
import { DocumentPreviewModal } from '@/components/documents/DocumentPreviewModal';
import { ConfirmDeleteDialog } from '@/components/ui/confirm-delete-dialog';

interface Document {
  id: string;
  title: string;
  type: string;
  status: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
  client: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

const documentTypeLabels: Record<string, string> = {
  NFE: 'NF-e',
  NFSE: 'NFS-e',
  RECEIPT: 'Recibo',
  CONTRACT: 'Contrato',
  BANK_STATEMENT: 'Comprovante Bancario',
  STATEMENT: 'Declaracao',
  CTE: 'CT-e',
  OTHER: 'Outros',
};

const statusConfig = {
  PENDING: { label: 'Pendente', variant: 'secondary' as const },
  PROCESSED: { label: 'Processado', variant: 'default' as const },
  ERROR: { label: 'Erro', variant: 'destructive' as const },
};

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const limit = 20;

  // Check if user is client
  const isClient = user?.role === 'CLIENT';

  useEffect(() => {
    fetchDocuments();
  }, [search, typeFilter, statusFilter, sortBy, sortOrder, currentPage]);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (search) params.append('search', search);
      if (typeFilter && typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter && statusFilter !== 'ALL') params.append('status', statusFilter);

      // Use different endpoint for client vs accountant
      const endpoint = isClient
        ? `http://localhost:3000/api/documents/me?${params}`
        : `http://localhost:3000/api/documents?${params}`;

      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar documentos');
      }

      const data = await response.json();
      setDocuments(data.documents);
      setTotalPages(data.pagination.totalPages);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar documentos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleViewDocument = (documentId: string) => {
    setSelectedDocumentId(documentId);
    setShowPreviewModal(true);
  };

  const handleClosePreview = () => {
    setShowPreviewModal(false);
    setSelectedDocumentId(null);
  };

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete({ id: doc.id, title: doc.title });
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`http://localhost:3000/api/documents/${documentToDelete.id}`, {
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
      setDocumentToDelete(null);

      // Refresh the documents list
      fetchDocuments();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar documento');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteFromPreview = () => {
    // Close preview modal and refresh list
    setShowPreviewModal(false);
    setSelectedDocumentId(null);
    fetchDocuments();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  if (isLoading && documents.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {isClient ? 'Meus Documentos' : 'Documentos'}
            </h1>
            <p className="text-muted-foreground">
              {isClient
                ? 'Visualize e faça download dos seus documentos'
                : 'Gerencie todos os documentos dos clientes'}
            </p>
          </div>
          {!isClient && (
            <Button className="gap-2" onClick={() => setShowUploadModal(true)}>
              <Plus className="h-4 w-4" />
              Adicionar Documento
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-4">
              {/* Search */}
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do documento ou cliente..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Type Filter */}
              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os tipos</SelectItem>
                  {Object.entries(documentTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todos os status</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        {documents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum documento encontrado</h3>
              <p className="text-muted-foreground mb-4">
                Comece adicionando documentos para seus clientes
              </p>
              <Button onClick={() => setShowUploadModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Documento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome do Documento</TableHead>
                    <TableHead>Tipo</TableHead>
                    {!isClient && <TableHead>Cliente</TableHead>}
                    <TableHead>Data de Envio</TableHead>
                    <TableHead>Tamanho</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <File className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell className="font-medium">{doc.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {documentTypeLabels[doc.type] || doc.type}
                        </Badge>
                      </TableCell>
                      {!isClient && doc.client && (
                        <TableCell>
                          <button
                            onClick={() => router.push(`/dashboard/clients/${doc.client.id}`)}
                            className="text-primary hover:underline"
                          >
                            {doc.client.user.name}
                          </button>
                        </TableCell>
                      )}
                      <TableCell>
                        {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatFileSize(doc.fileSize)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[doc.status as keyof typeof statusConfig]?.variant || 'secondary'}>
                          {statusConfig[doc.status as keyof typeof statusConfig]?.label || doc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(doc.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                          {!isClient && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Pagina {currentPage} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                  >
                    Proxima
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {!isClient && (
        <UploadDocumentModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            fetchDocuments();
            setShowUploadModal(false);
          }}
        />
      )}

      <DocumentPreviewModal
        isOpen={showPreviewModal}
        onClose={handleClosePreview}
        documentId={selectedDocumentId}
        onDelete={handleDeleteFromPreview}
      />

      <ConfirmDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
        title="Deletar Documento?"
        description={`Tem certeza que deseja deletar o documento "${documentToDelete?.title}"? Esta ação não pode ser desfeita.`}
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
