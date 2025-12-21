'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  User,
  FileText,
  DollarSign,
  Settings,
  ArrowRight,
  CheckCircle,
  Clock,
  TrendingUp,
  MoreVertical
} from 'lucide-react';

export default function CardComponentsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Card Components</h1>
          <p className="text-muted-foreground">
            Flexible card components with multiple variants and compositions
          </p>
        </div>

        <Separator />

        {/* Basic Card */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Basic Cards</h2>
            <p className="text-muted-foreground">Standard card with header, content, and footer</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <CardDescription>Card description goes here</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This is the card content area. You can put any content here.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Footer</CardTitle>
                <CardDescription>Card with footer actions</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  This card includes a footer with action buttons.
                </p>
              </CardContent>
              <CardFooter className="gap-2">
                <Button variant="outline" size="sm">Cancel</Button>
                <Button size="sm">Confirm</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>With Icon</CardTitle>
                <CardDescription>Card with icon in header</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">150</p>
                    <p className="text-sm text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Clickable Cards */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Clickable Cards</h2>
            <p className="text-muted-foreground">Interactive cards with hover and active states</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card variant="clickable" onClick={() => alert('Clients clicked!')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Clientes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">24</p>
                <p className="text-sm text-muted-foreground mt-1">Total de clientes</p>
              </CardContent>
            </Card>

            <Card variant="clickable" onClick={() => alert('Documents clicked!')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">142</p>
                <p className="text-sm text-muted-foreground mt-1">Documentos enviados</p>
              </CardContent>
            </Card>

            <Card variant="clickable" onClick={() => alert('Payments clicked!')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Pagamentos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">R$ 45.200</p>
                <p className="text-sm text-muted-foreground mt-1">Recebido este mês</p>
              </CardContent>
            </Card>

            <Card variant="clickable" onClick={() => alert('Settings clicked!')}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configurações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Acesse as configurações do sistema
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Highlighted Cards */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Highlighted Cards</h2>
            <p className="text-muted-foreground">Cards with border accent to draw attention</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card variant="highlighted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Plano Ativo</CardTitle>
                    <CardDescription>Professional Plan</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Seu plano está ativo até 18/01/2026
                </p>
                <Button className="w-full mt-4" variant="outline">
                  Gerenciar Plano
                </Button>
              </CardContent>
            </Card>

            <Card variant="highlighted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Clock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle>Ação Necessária</CardTitle>
                    <CardDescription>5 itens pendentes</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Você tem documentos aguardando análise
                </p>
                <Button className="w-full mt-4">
                  Ver Pendências
                </Button>
              </CardContent>
            </Card>

            <Card variant="highlighted">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Crescimento</CardTitle>
                    <CardDescription>Este mês</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">+23%</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Comparado ao mês anterior
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Cards with Actions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Cards with Header Actions</h2>
            <p className="text-muted-foreground">Cards with action buttons in the header</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 7 days</CardDescription>
                <CardAction>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                    <p className="text-sm">Novo cliente cadastrado</p>
                    <span className="text-xs text-muted-foreground ml-auto">2h atrás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                    <p className="text-sm">Documento enviado</p>
                    <span className="text-xs text-muted-foreground ml-auto">5h atrás</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-yellow-500" />
                    <p className="text-sm">Pagamento recebido</p>
                    <span className="text-xs text-muted-foreground ml-auto">1d atrás</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full gap-2">
                  Ver Todas <ArrowRight className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Documents</CardTitle>
                <CardDescription>Awaiting review</CardDescription>
                <CardAction>
                  <Badge variant="destructive">5</Badge>
                </CardAction>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Contrato Social', 'RG', 'Comprovante de Residência', 'CNPJ', 'Outros'].map((doc) => (
                    <div key={doc} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{doc}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Responsive Padding Demo */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Responsive Padding</h2>
            <p className="text-muted-foreground">Cards automatically adjust padding on mobile devices</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Responsive Card</CardTitle>
              <CardDescription>Resize the browser to see padding changes</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                This card uses responsive padding classes:
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Mobile: Optimized for touch (px-6 py-6)</li>
                <li>Desktop: More spacious layout (px-6 py-6)</li>
                <li>Gap between sections: gap-6</li>
              </ul>
            </CardContent>
            <CardFooter className="gap-2">
              <Badge>Responsive</Badge>
              <Badge variant="secondary">Mobile-First</Badge>
            </CardFooter>
          </Card>
        </section>

        <Separator />

        {/* Complex Layout Example */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Complex Card Layout</h2>
            <p className="text-muted-foreground">Real-world example combining multiple patterns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Overview Dashboard</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Clientes</p>
                    <p className="text-2xl font-bold">24</p>
                    <Badge variant="secondary" className="text-xs">+3 este mês</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Documentos</p>
                    <p className="text-2xl font-bold">142</p>
                    <Badge variant="secondary" className="text-xs">+12 este mês</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pagamentos</p>
                    <p className="text-2xl font-bold">89</p>
                    <Badge className="text-xs">+5 este mês</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Receita</p>
                    <p className="text-2xl font-bold">R$ 45,2k</p>
                    <Badge className="text-xs">+23%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="highlighted">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Atalhos rápidos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <User className="h-4 w-4" />
                  Novo Cliente
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <FileText className="h-4 w-4" />
                  Enviar Documento
                </Button>
                <Button className="w-full justify-start gap-2" variant="outline">
                  <DollarSign className="h-4 w-4" />
                  Registrar Pagamento
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
