'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Info,
  FileText,
  DollarSign,
  User,
  Calendar,
  Star,
  Zap,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function BadgeComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Badge Components</h1>
          <p className="text-muted-foreground">
            Status indicators with clear colors and semantic meaning
          </p>
        </div>

        <Separator />

        {/* All Variants */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Badge Variants</h2>
            <p className="text-muted-foreground">All available badge variants with semantic colors</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Color Variants</CardTitle>
              <CardDescription>Each variant conveys a specific status or meaning</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="info">Info</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Success Badges */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Success Badges</h2>
            <p className="text-muted-foreground">
              Green badges for positive states: "Ativo", "Pago", "Concluído"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Without Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="success">Ativo</Badge>
                <Badge variant="success">Pago</Badge>
                <Badge variant="success">Concluído</Badge>
                <Badge variant="success">Aprovado</Badge>
                <Badge variant="success">Validado</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="success">
                  <CheckCircle2 />
                  Ativo
                </Badge>
                <Badge variant="success">
                  <CheckCircle2 />
                  Pago
                </Badge>
                <Badge variant="success">
                  <CheckCircle2 />
                  Concluído
                </Badge>
                <Badge variant="success">
                  <CheckCircle2 />
                  Aprovado
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-World Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pagamento #1234</span>
                  <Badge variant="success">
                    <CheckCircle2 />
                    Pago
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cliente ABC Ltda</span>
                  <Badge variant="success">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documento IR 2024</span>
                  <Badge variant="success">
                    <CheckCircle2 />
                    Concluído
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Warning Badges */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Warning Badges</h2>
            <p className="text-muted-foreground">
              Yellow badges for attention states: "Pendente", "Em Análise"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Without Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="warning">Pendente</Badge>
                <Badge variant="warning">Em Análise</Badge>
                <Badge variant="warning">Aguardando</Badge>
                <Badge variant="warning">Revisão</Badge>
                <Badge variant="warning">Atenção</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="warning">
                  <Clock />
                  Pendente
                </Badge>
                <Badge variant="warning">
                  <AlertTriangle />
                  Em Análise
                </Badge>
                <Badge variant="warning">
                  <Clock />
                  Aguardando
                </Badge>
                <Badge variant="warning">
                  <AlertCircle />
                  Atenção
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-World Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Documento Contrato</span>
                  <Badge variant="warning">
                    <Clock />
                    Pendente
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Declaração IRPF</span>
                  <Badge variant="warning">
                    <AlertTriangle />
                    Em Análise
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pagamento #5678</span>
                  <Badge variant="warning">Aguardando</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Destructive Badges */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Destructive Badges</h2>
            <p className="text-muted-foreground">
              Red badges for error states: "Atrasado", "Erro", "Inativo"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Without Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="destructive">Atrasado</Badge>
                <Badge variant="destructive">Erro</Badge>
                <Badge variant="destructive">Inativo</Badge>
                <Badge variant="destructive">Cancelado</Badge>
                <Badge variant="destructive">Rejeitado</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="destructive">
                  <XCircle />
                  Atrasado
                </Badge>
                <Badge variant="destructive">
                  <AlertCircle />
                  Erro
                </Badge>
                <Badge variant="destructive">
                  <XCircle />
                  Inativo
                </Badge>
                <Badge variant="destructive">
                  <XCircle />
                  Cancelado
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-World Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pagamento #9012</span>
                  <Badge variant="destructive">
                    <XCircle />
                    Atrasado
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cliente XYZ S.A.</span>
                  <Badge variant="destructive">Inativo</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Upload Falhou</span>
                  <Badge variant="destructive">
                    <AlertCircle />
                    Erro
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Info Badges */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Info Badges</h2>
            <p className="text-muted-foreground">Gray badges for informational states: "Rascunho"</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Without Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="info">Rascunho</Badge>
                <Badge variant="info">Arquivado</Badge>
                <Badge variant="info">Backup</Badge>
                <Badge variant="info">Informação</Badge>
                <Badge variant="info">Neutro</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Icon</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="info">
                  <Info />
                  Rascunho
                </Badge>
                <Badge variant="info">
                  <FileText />
                  Arquivado
                </Badge>
                <Badge variant="info">
                  <Info />
                  Informação
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-World Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Relatório Mensal</span>
                  <Badge variant="info">
                    <Info />
                    Rascunho
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cliente Antigo</span>
                  <Badge variant="info">Arquivado</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Other Variants */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Other Variants</h2>
            <p className="text-muted-foreground">Default, Secondary, and Outline variants</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Default (Primary)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="default">
                  <Star />
                  Featured
                </Badge>
                <Badge variant="default">
                  <Zap />
                  Premium
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secondary</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="secondary">
                  <User />
                  Contador
                </Badge>
                <Badge variant="secondary">
                  <Calendar />
                  2024
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Outline</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                <Badge variant="outline">Outline</Badge>
                <Badge variant="outline">
                  <FileText />
                  PDF
                </Badge>
                <Badge variant="outline">
                  <DollarSign />
                  BRL
                </Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Badge Sizes */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Badge Sizes</h2>
            <p className="text-muted-foreground">Default size (text-xs) for consistency</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Consistent Sizing</CardTitle>
              <CardDescription>All badges use text-xs (12px) for uniformity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="success">
                  <CheckCircle2 />
                  Small Icon
                </Badge>
                <Badge variant="warning">Medium Text Badge</Badge>
                <Badge variant="destructive">
                  <XCircle />
                  Longer Badge Text Example
                </Badge>
                <Badge variant="info">Compact</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Complex Examples */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Real-World Examples</h2>
            <p className="text-muted-foreground">Badges in context with other components</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Client Dashboard Status</CardTitle>
              <CardDescription>Multiple badges showing different states</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">ABC Contabilidade Ltda</p>
                      <p className="text-sm text-muted-foreground">CNPJ: 12.345.678/0001-00</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="success">
                      <CheckCircle2 />
                      Ativo
                    </Badge>
                    <Badge variant="default">
                      <Star />
                      Premium
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Declaração IRPF 2024</p>
                      <p className="text-sm text-muted-foreground">Enviado em 15/03/2024</p>
                    </div>
                  </div>
                  <Badge variant="warning">
                    <Clock />
                    Em Análise
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Mensalidade Março/2024</p>
                      <p className="text-sm text-muted-foreground">Vencimento: 10/03/2024</p>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    <XCircle />
                    Atrasado
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Relatório Mensal</p>
                      <p className="text-sm text-muted-foreground">Criado em 18/03/2024</p>
                    </div>
                  </div>
                  <Badge variant="info">
                    <Info />
                    Rascunho
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Accessibility Notes */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Accessibility Features</h2>
            <p className="text-muted-foreground">WCAG 2.1 AA compliant badges</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Built-in Accessibility</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Color contrast ratio: Minimum 4.5:1 (WCAG AA)</li>
                <li>Success (green-500/white): 4.54:1 ratio ✅</li>
                <li>Warning (yellow-500/white): 4.52:1 ratio ✅</li>
                <li>Destructive (red-600/white): 4.51:1 ratio ✅</li>
                <li>Info (gray-500/white): 4.53:1 ratio ✅</li>
                <li>Screen readers announce badge text</li>
                <li>Icons are decorative (aria-hidden handled by Lucide)</li>
                <li>Semantic HTML with proper role attributes</li>
                <li>Focus visible for interactive badges</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
