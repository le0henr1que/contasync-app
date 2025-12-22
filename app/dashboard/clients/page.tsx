'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { FeatureGuard } from '@/components/limits/FeatureGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CreateClientModal } from '@/components/clients/CreateClientModal';
import { EditClientModal } from '@/components/clients/EditClientModal';
import { DeleteClientDialog } from '@/components/clients/DeleteClientDialog';
import { InviteClientModal } from '@/components/clients/InviteClientModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Mail,
  Users,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';

// Interface for client data
interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  cnpj: string;
  companyName: string;
  expenseModuleEnabled: boolean;
  status: string;
  pendingDocuments: number;
  createdAt: string;
}

// Mock data - será substituído por dados da API
const mockClients: Client[] = [];

const statusConfig = {
  ACTIVE: { label: 'Ativo', variant: 'default' as const },
  INACTIVE: { label: 'Inativo', variant: 'secondary' as const },
  PENDING: { label: 'Pendente', variant: 'warning' as const },
};

export default function ClientsPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [deletingClient, setDeletingClient] = useState<{ id: string; name: string } | null>(null);
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 10;

  // Redirect if not accountant
  useEffect(() => {
    if (user && user.role !== 'ACCOUNTANT') {
      router.push('/client-portal');
    }
  }, [user, router]);

  // Fetch clients from API
  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Transform API data to match mock structure
        const transformedClients = data.map((client: any) => ({
          id: client.id,
          name: client.user.name,
          email: client.user.email,
          phone: client.phone || '-',
          cnpj: client.cpfCnpj,
          companyName: client.companyName || '',
          expenseModuleEnabled: client.expenseModuleEnabled || false,
          status: client.user.isActive ? 'ACTIVE' : 'INACTIVE',
          pendingDocuments: 0, // TODO: get from _count
          createdAt: client.createdAt,
        }));
        setClients(transformedClients);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchInvitations();
  }, []);

  // Fetch invitations from API
  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invitations`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleResendInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/invitations/${invitationId}/resend`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        alert('Convite reenviado com sucesso!');
      }
    } catch (error) {
      console.error('Error resending invitation:', error);
      alert('Erro ao reenviar convite');
    }
  };

  // Filter clients based on search and status
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.cnpj.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const handleDelete = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setDeletingClient({ id: client.id, name: client.name });
      setIsDeleteDialogOpen(true);
    }
  };

  const handleEdit = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setEditingClient({
        id: client.id,
        name: client.name,
        email: client.email,
        cpfCnpj: client.cnpj,
        phone: client.phone === '-' ? '' : client.phone,
        companyName: client.companyName || '',
        expenseModuleEnabled: client.expenseModuleEnabled === true,
        isActive: client.status === 'ACTIVE',
      });
      setIsEditModalOpen(true);
    }
  };

  const handleView = (clientId: string) => {
    router.push(`/dashboard/clients/${clientId}`);
  };

  return (
    <DashboardLayout>
      <FeatureGuard
        feature="clients"
        featureName="Gestão de Clientes"
        featureDescription="Gerencie seu portfólio de clientes e suas informações"
        icon={<Users className="h-8 w-8 text-muted-foreground" />}
        benefits={[
          'Adicione clientes ilimitados ao seu portfólio',
          'Gerencie informações completas de cada cliente',
          'Controle módulos habilitados por cliente',
          'Envie convites e gerencie acessos',
          'Visualize estatísticas e documentos pendentes',
        ]}
      >
        <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seus clientes e suas informações
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Mail className="h-4 w-4" />
              Convidar Cliente
            </Button>
            <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Search - 75% da largura (9/12 colunas) */}
              <div className="relative md:col-span-9">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 !h-10"
                />
              </div>

              {/* Status Filter - 25% da largura (3/12 colunas) */}
              <div className="md:col-span-3">
                <Select value={statusFilter} onValueChange={(value) => {
                  setStatusFilter(value);
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="!h-10 w-full">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="ACTIVE">Ativo</SelectItem>
                    <SelectItem value="INACTIVE">Inativo</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {currentClients.length} de {filteredClients.length} clientes
          </p>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-muted-foreground">
                          Nenhum cliente encontrado
                        </p>
                        <Button variant="outline" size="sm" onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}>
                          Limpar filtros
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {client.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{client.cnpj}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{client.phone}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[client.status as keyof typeof statusConfig].variant}>
                          {statusConfig[client.status as keyof typeof statusConfig].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                                <span className="sr-only">Ações</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleView(client.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Visualizar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(client.id)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(client.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}

        {/* Invite Client Modal */}
        <InviteClientModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          onSuccess={() => {
            fetchInvitations();
            fetchClients();
          }}
        />

        {/* Create Client Modal */}
        <CreateClientModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchClients}
        />

        {/* Edit Client Modal */}
        {editingClient && (
          <EditClientModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setEditingClient(null);
            }}
            onSuccess={fetchClients}
            clientId={editingClient.id}
            initialData={{
              name: editingClient.name,
              email: editingClient.email,
              cpfCnpj: editingClient.cpfCnpj,
              phone: editingClient.phone,
              companyName: editingClient.companyName,
              expenseModuleEnabled: editingClient.expenseModuleEnabled,
              isActive: editingClient.isActive,
            }}
          />
        )}

        {/* Delete Client Dialog */}
        {deletingClient && (
          <DeleteClientDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => {
              setIsDeleteDialogOpen(false);
              setDeletingClient(null);
            }}
            onSuccess={fetchClients}
            clientId={deletingClient.id}
            clientName={deletingClient.name}
          />
        )}
        </div>
      </FeatureGuard>
    </DashboardLayout>
  );
}
