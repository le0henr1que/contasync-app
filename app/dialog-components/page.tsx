'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Trash2,
  AlertTriangle,
  Info,
  Upload,
  User,
  FileText,
  Save,
  X,
  Plus,
  Settings,
  Mail,
  Lock,
} from 'lucide-react';

export default function DialogComponentsPage() {
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Dialog/Modal Components</h1>
          <p className="text-muted-foreground">
            Interactive modal dialogs for critical actions and workflows
          </p>
        </div>

        <Separator />

        {/* Dialog Sizes */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Dialog Sizes</h2>
            <p className="text-muted-foreground">Five size variants from sm to 2xl</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Small (sm)
                </Button>
              </DialogTrigger>
              <DialogContent size="sm">
                <DialogHeader>
                  <DialogTitle>Small Dialog</DialogTitle>
                  <DialogDescription>
                    This is a small dialog (max-w-sm / 384px)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Use small dialogs for quick confirmations or simple messages.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Medium (md)
                </Button>
              </DialogTrigger>
              <DialogContent size="md">
                <DialogHeader>
                  <DialogTitle>Medium Dialog</DialogTitle>
                  <DialogDescription>
                    This is a medium dialog (max-w-md / 448px)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Medium dialogs work well for short forms or notifications.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Large (lg)
                </Button>
              </DialogTrigger>
              <DialogContent size="lg">
                <DialogHeader>
                  <DialogTitle>Large Dialog (Default)</DialogTitle>
                  <DialogDescription>
                    This is a large dialog (max-w-lg / 512px)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Large is the default size. Good for most use cases including forms.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  Extra Large (xl)
                </Button>
              </DialogTrigger>
              <DialogContent size="xl">
                <DialogHeader>
                  <DialogTitle>Extra Large Dialog</DialogTitle>
                  <DialogDescription>
                    This is an extra large dialog (max-w-xl / 576px)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    Extra large dialogs provide more space for complex forms or content.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  2XL (2xl)
                </Button>
              </DialogTrigger>
              <DialogContent size="2xl">
                <DialogHeader>
                  <DialogTitle>2XL Dialog</DialogTitle>
                  <DialogDescription>
                    This is a 2xl dialog (max-w-2xl / 672px)
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm text-muted-foreground">
                    2XL dialogs are ideal for detailed content, multi-step forms, or data tables.
                  </p>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </section>

        <Separator />

        {/* Confirmation Dialogs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Confirmation Dialogs</h2>
            <p className="text-muted-foreground">Confirm destructive or important actions</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Confirmation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Client
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="sm">
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-950">
                          <Trash2 className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <DialogTitle>Excluir Cliente</DialogTitle>
                          <DialogDescription>Esta ação não pode ser desfeita</DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm">
                        Tem certeza que deseja excluir <strong>ABC Contabilidade Ltda</strong>? Todos
                        os documentos e dados associados serão permanentemente removidos.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          variant="destructive"
                          onClick={() => toast.success('Cliente excluído com sucesso')}
                        >
                          Excluir
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warning Dialog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Archive Document
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="sm">
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-950">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <DialogTitle>Arquivar Documento</DialogTitle>
                          <DialogDescription>Documentos arquivados ficam ocultos</DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm">
                        Arquivar este documento irá ocultá-lo da visualização padrão. Você pode
                        restaurá-lo a qualquer momento.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button onClick={() => toast.success('Documento arquivado')}>
                          Arquivar
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Info Dialog
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Show Info
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="md">
                    <DialogHeader>
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-950">
                          <Info className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <DialogTitle>Informação Importante</DialogTitle>
                          <DialogDescription>Atualização do sistema</DialogDescription>
                        </div>
                      </div>
                    </DialogHeader>
                    <div className="py-4 space-y-3">
                      <p className="text-sm">
                        Uma nova versão do sistema está disponível com melhorias de segurança e
                        performance.
                      </p>
                      <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                        <li>Melhorias na autenticação</li>
                        <li>Correção de bugs</li>
                        <li>Nova interface de relatórios</li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button>Entendi</Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Form Dialogs */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Form Dialogs</h2>
            <p className="text-muted-foreground">Collect user input with forms inside dialogs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Add Client Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full gap-2">
                      <Plus className="h-4 w-4" />
                      Novo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="lg">
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                      <DialogDescription>
                        Preencha os dados do cliente para cadastrá-lo no sistema
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="client-name">Nome / Razão Social</Label>
                        <Input
                          id="client-name"
                          placeholder="ABC Contabilidade Ltda"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="client-email">E-mail</Label>
                        <Input
                          id="client-email"
                          type="email"
                          placeholder="contato@abc.com.br"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cnpj">CNPJ</Label>
                          <Input id="cnpj" placeholder="00.000.000/0000-00" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Telefone</Label>
                          <Input id="phone" placeholder="(11) 99999-9999" />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={() => {
                            toast.success('Cliente cadastrado!', {
                              description: `${clientName || 'Cliente'} foi adicionado ao sistema.`,
                            });
                            setClientName('');
                            setEmail('');
                          }}
                        >
                          Salvar Cliente
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Document Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full gap-2">
                      <Upload className="h-4 w-4" />
                      Enviar Documento
                    </Button>
                  </DialogTrigger>
                  <DialogContent size="lg">
                    <DialogHeader>
                      <DialogTitle>Enviar Documento</DialogTitle>
                      <DialogDescription>
                        Selecione o tipo de documento e faça o upload
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="doc-type">Tipo de Documento</Label>
                        <select
                          id="doc-type"
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option>Contrato Social</option>
                          <option>RG</option>
                          <option>CPF</option>
                          <option>Comprovante de Residência</option>
                          <option>CNPJ</option>
                          <option>Outro</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="file-upload">Arquivo</Label>
                        <Input id="file-upload" type="file" />
                        <p className="text-xs text-muted-foreground">
                          Formatos aceitos: PDF, JPG, PNG. Máximo 10MB.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descrição (opcional)</Label>
                        <Input id="description" placeholder="Adicione observações..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={() =>
                            toast.success('Upload concluído!', {
                              description: 'Documento enviado com sucesso.',
                            })
                          }
                        >
                          Enviar
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Complex Dialog */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Complex Dialog Example</h2>
            <p className="text-muted-foreground">Multi-section dialog with tabs and rich content</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Client Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <Settings className="h-4 w-4" />
                    Configurações do Cliente
                  </Button>
                </DialogTrigger>
                <DialogContent size="2xl">
                  <DialogHeader>
                    <DialogTitle>Configurações de ABC Contabilidade Ltda</DialogTitle>
                    <DialogDescription>
                      Gerencie permissões, notificações e preferências
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4 space-y-6">
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Permissões</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Pode visualizar despesas
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          Pode fazer upload de documentos
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Pode excluir documentos
                        </label>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Notificações</h3>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          E-mail quando documentos são solicitados
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" defaultChecked className="rounded" />
                          E-mail quando pagamentos são registrados
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" className="rounded" />
                          Resumo semanal por e-mail
                        </label>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold">Preferências</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="language">Idioma</Label>
                          <select
                            id="language"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option>Português (BR)</option>
                            <option>English</option>
                            <option>Español</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="timezone">Fuso Horário</Label>
                          <select
                            id="timezone"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          >
                            <option>America/Sao_Paulo</option>
                            <option>America/New_York</option>
                            <option>Europe/London</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancelar</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        onClick={() =>
                          toast.success('Configurações salvas!', {
                            description: 'As preferências foram atualizadas.',
                          })
                        }
                      >
                        Salvar Alterações
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Accessibility Testing */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Accessibility Features</h2>
            <p className="text-muted-foreground">Built-in WCAG 2.1 AA compliance</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Testing Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">ESC Key to Close</p>
                    <p className="text-muted-foreground">
                      Open any dialog and press ESC key to close it
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Click Backdrop to Close</p>
                    <p className="text-muted-foreground">
                      Click outside the dialog (on the dark overlay) to close it
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Focus Trap</p>
                    <p className="text-muted-foreground">
                      Press Tab key - focus cycles only within dialog elements
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Focus Returns to Trigger</p>
                    <p className="text-muted-foreground">
                      Close dialog - focus returns to button that opened it
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Scroll Lock</p>
                    <p className="text-muted-foreground">
                      Open dialog - background page cannot scroll
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Mobile Responsive</p>
                    <p className="text-muted-foreground">
                      On mobile devices, dialogs adapt to screen size
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">ARIA Attributes</p>
                    <p className="text-muted-foreground">
                      Proper role, aria-labelledby, and aria-describedby attributes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-1">✅</div>
                  <div>
                    <p className="font-medium">Screen Reader Support</p>
                    <p className="text-muted-foreground">
                      Dialog title and description announced to screen readers
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
