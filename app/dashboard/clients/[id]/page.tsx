'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building2,
  Calendar,
  FileText,
  CreditCard,
  Activity,
  Loader2,
  Download,
  ExternalLink,
  Upload,
  X,
  File,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EditClientModal } from '@/components/clients/EditClientModal';
import { ClientActivityTimeline } from '@/components/clients/ClientActivityTimeline';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { AccountantPaymentsTable } from '@/components/payments/AccountantPaymentsTable';
import { AttachDocumentModal } from '@/components/payments/AttachDocumentModal';
import { MarkAsPaidModal } from '@/components/payments/MarkAsPaidModal';
import { PaymentDetailsModal } from '@/components/payments/PaymentDetailsModal';
import { DocumentFolderCard } from '@/components/documents/DocumentFolderCard';
import DocumentManager from '@/components/documents/DocumentManager';
import { usePaymentsByClient, type Payment } from '@/hooks/usePayments';
import { useDocumentFoldersByClient } from '@/hooks/useDocumentFolders';

interface ClientDetail {
  id: string;
  user: {
    id: string;
    email: string;
    name: string;
    isActive: boolean;
    createdAt: string;
  };
  cpfCnpj: string;
  phone?: string;
  companyName?: string;
  expenseModuleEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    documents: number;
    payments: number;
    expenses: number;
  };
}

const statusConfig = {
  ACTIVE: { label: 'Ativo', variant: 'default' as const },
  INACTIVE: { label: 'Inativo', variant: 'secondary' as const },
};

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = params.id as string;

  const [client, setClient] = useState<ClientDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showAttachDocModal, setShowAttachDocModal] = useState(false);
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
  const [showPaymentDetailsModal, setShowPaymentDetailsModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState('info');
  const [paymentPage, setPaymentPage] = useState(1);

  // Documents state using hook
  const {
    folders,
    isLoading: isLoadingDocuments,
    mutate: refreshDocuments,
  } = useDocumentFoldersByClient(activeTab === 'documents' ? clientId : null);

  // Payments state using hook
  const {
    payments,
    pagination: paymentPagination,
    isLoading: isLoadingPayments,
    mutate: refreshPayments,
  } = usePaymentsByClient(activeTab === 'payments' ? clientId : null, {
    page: paymentPage,
    limit: 10,
    sort: 'dueDate',
    order: 'asc',
  });

  // Document upload state
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('');
  const [docDescription, setDocDescription] = useState('');
  const [docFile, setDocFile] = useState<File | null>(null);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClient();
  }, [clientId]);

  const fetchClient = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:3000/api/clients/${clientId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao carregar dados do cliente');
      }

      const data = await response.json();
      setClient(data);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao carregar cliente');
      router.push('/dashboard/clients');
    } finally {
      setIsLoading(false);
    }
  };



  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      const response = await fetch(`http://localhost:3000/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir cliente');
      }

      toast.success('Cliente excluído com sucesso');
      router.push('/dashboard/clients');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir cliente');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo nao permitido. Use PDF, JPG ou PNG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande (max. 10MB)';
    }
    return null;
  };

  const handleFileSelect = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setErrors({ ...errors, file: error });
      return;
    }

    setDocFile(selectedFile);
    if (!docTitle) {
      setDocTitle(selectedFile.name);
    }
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

  const validateDocumentForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!docType) {
      newErrors.type = 'Selecione o tipo de documento';
    }
    if (!docFile) {
      newErrors.file = 'Selecione um arquivo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const resetDocumentForm = () => {
    setDocTitle('');
    setDocType('');
    setDocDescription('');
    setDocFile(null);
    setErrors({});
    setUploadProgress(0);
  };

  const handleDocumentUpload = async () => {
    if (!validateDocumentForm()) {
      return;
    }

    try {
      setIsUploadingDoc(true);
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('file', docFile!);
      formData.append('clientId', clientId);
      formData.append('type', docType);
      if (docTitle) formData.append('title', docTitle);
      if (docDescription) formData.append('description', docDescription);

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
          setShowDocumentModal(false);
          resetDocumentForm();
          fetchClient();
          refreshDocuments();
        } else {
          const response = JSON.parse(xhr.responseText);
          toast.error(response.message || 'Erro ao enviar documento. Tente novamente');
        }
        setIsUploadingDoc(false);
      });

      xhr.addEventListener('error', () => {
        toast.error('Erro de rede ao enviar documento');
        setIsUploadingDoc(false);
      });

      xhr.open('POST', 'http://localhost:3000/api/documents');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('accessToken')}`);
      xhr.send(formData);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar documento');
      setIsUploadingDoc(false);
    }
  };

  const formatCPFCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 11) {
      // CPF: 000.000.000-00
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (numbers.length === 14) {
      // CNPJ: 00.000.000/0000-00
      return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');

    if (numbers.length === 10) {
      // (00) 0000-0000
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else if (numbers.length === 11) {
      // (00) 00000-0000
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return value;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <p className="text-muted-foreground">Cliente não encontrado</p>
          <Button onClick={() => router.push('/dashboard/clients')}>
            Voltar para lista
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const status = client.user.isActive ? 'ACTIVE' : 'INACTIVE';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/dashboard/clients')}
            className="gap-2 -ml-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Clientes
          </Button>
          <span>/</span>
          <span className="text-foreground">{client.user.name}</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{client.user.name}</h1>
              <Badge variant={statusConfig[status].variant}>
                {statusConfig[status].label}
              </Badge>
            </div>
            {client.companyName && (
              <p className="text-muted-foreground">{client.companyName}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowEditModal(true)}>
              <Edit className="h-4 w-4" />
              Editar
            </Button>
            <Button
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="info" className="gap-2">
              <FileText className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="documents" className="gap-2">
              <FileText className="h-4 w-4" />
              Documentos
              {client._count && client._count.documents > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {client._count.documents}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              Pagamentos
              {client._count && client._count.payments > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {client._count.payments}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Atividade
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                  <CardDescription>Dados para comunicação com o cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{client.user.email}</p>
                    </div>
                  </div>
                  {client.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Telefone</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPhone(client.phone)}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <CardDescription>Dados cadastrais do cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">CPF/CNPJ</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {formatCPFCNPJ(client.cpfCnpj)}
                      </p>
                    </div>
                  </div>
                  {client.companyName && (
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">Nome Fantasia</p>
                        <p className="text-sm text-muted-foreground">{client.companyName}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* System Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações do Sistema</CardTitle>
                  <CardDescription>Configurações e datas</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Cadastrado em</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Última atualização</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(client.updatedAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Módulos Habilitados</CardTitle>
                  <CardDescription>Funcionalidades ativas para este cliente</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Módulo de Despesas</span>
                    <Badge variant={client.expenseModuleEnabled ? 'default' : 'secondary'}>
                      {client.expenseModuleEnabled ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <DocumentManager clientId={clientId} />
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pagamentos</CardTitle>
                    <CardDescription>Gerencie os pagamentos do cliente</CardDescription>
                  </div>
                  <Button onClick={() => setShowPaymentModal(true)} className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Registrar Pagamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <AccountantPaymentsTable
                  payments={payments}
                  isLoading={isLoadingPayments}
                  showClientColumn={false}
                  onViewDetails={(payment) => {
                    setSelectedPayment(payment);
                    setShowPaymentDetailsModal(true);
                  }}
                  onAttachDocument={(payment) => {
                    setSelectedPayment(payment);
                    setShowAttachDocModal(true);
                  }}
                  onMarkAsPaid={(payment) => {
                    setSelectedPayment(payment);
                    setShowMarkAsPaidModal(true);
                  }}
                />

                {/* Pagination */}
                {paymentPagination.totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between border-t pt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando {(paymentPage - 1) * paymentPagination.limit + 1} -{' '}
                      {Math.min(paymentPage * paymentPagination.limit, paymentPagination.total)} de{' '}
                      {paymentPagination.total} resultados
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => Math.max(1, p - 1))}
                        disabled={paymentPage === 1}
                      >
                        Anterior
                      </Button>
                      <span className="text-sm">
                        Página {paymentPage} de {paymentPagination.totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => Math.min(paymentPagination.totalPages, p + 1))}
                        disabled={paymentPage === paymentPagination.totalPages}
                      >
                        Próxima
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <ClientActivityTimeline clientId={clientId} />
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir o cliente <strong>{client.user.name}</strong>?
                Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Document Upload Modal */}
        <Dialog open={showDocumentModal} onOpenChange={(open) => {
          setShowDocumentModal(open);
          if (!open) resetDocumentForm();
        }}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Documento</DialogTitle>
              <DialogDescription>
                Envie um documento para o cliente {client.user.name}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Tipo de Documento */}
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Documento *</Label>
                <Select value={docType} onValueChange={setDocType} disabled={isUploadingDoc}>
                  <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NFE">NF-e (Nota Fiscal Eletronica)</SelectItem>
                    <SelectItem value="NFSE">NFS-e (Nota Fiscal de Servico)</SelectItem>
                    <SelectItem value="RECEIPT">Recibo</SelectItem>
                    <SelectItem value="CONTRACT">Contrato</SelectItem>
                    <SelectItem value="BANK_STATEMENT">Comprovante Bancario</SelectItem>
                    <SelectItem value="STATEMENT">Declaracao</SelectItem>
                    <SelectItem value="OTHER">Outros</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>

              {/* Upload de Arquivo */}
              <div className="space-y-2">
                <Label>Arquivo *</Label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                    ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                    ${errors.file ? 'border-destructive' : ''}
                    ${isUploadingDoc ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !isUploadingDoc && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileInputChange}
                    disabled={isUploadingDoc}
                  />

                  {docFile ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-primary" />
                        <div className="text-left">
                          <p className="font-medium text-sm">{docFile.name}</p>
                          <p className="text-xs text-muted-foreground">{formatFileSize(docFile.size)}</p>
                        </div>
                      </div>
                      {!isUploadingDoc && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDocFile(null);
                            setDocTitle('');
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
                        PDF, JPG ou PNG (max. 10MB)
                      </p>
                    </div>
                  )}
                </div>
                {errors.file && (
                  <p className="text-sm text-destructive">{errors.file}</p>
                )}
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title">Titulo (opcional)</Label>
                <Input
                  id="title"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  placeholder="Nome do documento"
                  disabled={isUploadingDoc}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description">Descricao (opcional)</Label>
                <Textarea
                  id="description"
                  value={docDescription}
                  onChange={(e) => setDocDescription(e.target.value)}
                  placeholder="Adicione uma descricao..."
                  rows={3}
                  disabled={isUploadingDoc}
                />
              </div>

              {/* Progress Bar */}
              {isUploadingDoc && (
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDocumentModal(false)} disabled={isUploadingDoc}>
                Cancelar
              </Button>
              <Button onClick={handleDocumentUpload} disabled={isUploadingDoc}>
                {isUploadingDoc && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Payment Modal */}
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={() => {
            fetchClient();
            refreshPayments();
            setShowPaymentModal(false);
          }}
          clientId={clientId}
        />

        {/* Edit Client Modal */}
        <EditClientModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            fetchClient();
            setShowEditModal(false);
          }}
          clientId={clientId}
          initialData={{
            name: client.user.name,
            email: client.user.email,
            cpfCnpj: client.cpfCnpj,
            phone: client.phone,
            companyName: client.companyName,
            expenseModuleEnabled: client.expenseModuleEnabled,
          }}
        />

        {/* Attach Document Modal */}
        <AttachDocumentModal
          isOpen={showAttachDocModal}
          onClose={() => {
            setShowAttachDocModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            refreshPayments();
            fetchClient();
          }}
          payment={selectedPayment}
        />

        {/* Mark As Paid Modal */}
        <MarkAsPaidModal
          isOpen={showMarkAsPaidModal}
          onClose={() => {
            setShowMarkAsPaidModal(false);
            setSelectedPayment(null);
          }}
          onSuccess={() => {
            refreshPayments();
            fetchClient();
          }}
          payment={selectedPayment}
        />

        {/* Payment Details Modal */}
        <PaymentDetailsModal
          isOpen={showPaymentDetailsModal}
          onClose={() => {
            setShowPaymentDetailsModal(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      </div>
    </DashboardLayout>
  );
}
