'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Upload,
  Download,
  Save,
  Trash2,
  Send,
  Bell,
} from 'lucide-react';

export default function ToastComponentsPage() {
  const [customMessage, setCustomMessage] = useState('');
  const [customDuration, setCustomDuration] = useState('5000');

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Toast Notifications (Sonner)</h1>
          <p className="text-muted-foreground">
            Feedback system for user actions with auto-dismiss and accessibility features
          </p>
        </div>

        <Separator />

        {/* Basic Toast Types */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Basic Toast Types</h2>
            <p className="text-muted-foreground">Four semantic types with icons and colors</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <CardTitle>Success</CardTitle>
                </div>
                <CardDescription>Positive confirmations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.success('Operação realizada com sucesso!')}
                >
                  Simple Success
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.success('Cliente salvo!', {
                      description: 'ABC Contabilidade foi adicionado ao sistema.',
                    })
                  }
                >
                  With Description
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <CardTitle>Error</CardTitle>
                </div>
                <CardDescription>Error messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.error('Erro ao processar solicitação')}
                >
                  Simple Error
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.error('Falha no upload', {
                      description: 'O arquivo excede o tamanho máximo de 10MB.',
                    })
                  }
                >
                  With Description
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <CardTitle>Warning</CardTitle>
                </div>
                <CardDescription>Caution alerts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.warning('Atenção necessária')}
                >
                  Simple Warning
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.warning('Documento pendente', {
                      description: 'Você tem 3 documentos aguardando análise.',
                    })
                  }
                >
                  With Description
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  <CardTitle>Info</CardTitle>
                </div>
                <CardDescription>Informational messages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => toast.info('Nova atualização disponível')}
                >
                  Simple Info
                </Button>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.info('Sincronização completa', {
                      description: 'Todos os dados foram sincronizados às 14:30.',
                    })
                  }
                >
                  With Description
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Toast with Actions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Toast with Action Buttons</h2>
            <p className="text-muted-foreground">Add interactive buttons to toasts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Undo Action</CardTitle>
                <CardDescription>Allow users to undo operations</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.success('Cliente excluído', {
                      description: 'ABC Contabilidade foi removido.',
                      action: {
                        label: 'Desfazer',
                        onClick: () => toast.info('Operação revertida!'),
                      },
                    })
                  }
                >
                  Delete with Undo
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Confirm Action</CardTitle>
                <CardDescription>Request confirmation from users</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.warning('Confirmar download?', {
                      description: 'Arquivo: Relatório-2024.pdf (2.4 MB)',
                      action: {
                        label: 'Baixar',
                        onClick: () => toast.success('Download iniciado!'),
                      },
                    })
                  }
                >
                  Download Confirmation
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Loading Toast */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Loading Toast</h2>
            <p className="text-muted-foreground">Show progress for async operations</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Async Operations</CardTitle>
              <CardDescription>Display loading state, then update to success/error</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const toastId = toast.loading('Salvando documento...');
                  setTimeout(() => {
                    toast.success('Documento salvo com sucesso!', { id: toastId });
                  }, 2000);
                }}
              >
                Simulated Save (2s)
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const toastId = toast.loading('Enviando e-mail...');
                  setTimeout(() => {
                    toast.success('E-mail enviado!', {
                      id: toastId,
                      description: 'Notificação enviada para cliente@exemplo.com',
                    });
                  }, 3000);
                }}
              >
                Simulated Email (3s)
              </Button>

              <Button
                className="w-full"
                variant="outline"
                onClick={() => {
                  const toastId = toast.loading('Processando pagamento...');
                  setTimeout(() => {
                    toast.error('Falha no processamento', {
                      id: toastId,
                      description: 'Cartão recusado. Tente outro método.',
                    });
                  }, 2500);
                }}
              >
                Simulated Error (2.5s)
              </Button>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Custom Duration */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Custom Duration</h2>
            <p className="text-muted-foreground">
              Control auto-dismiss timing (default: 5 seconds)
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Duration Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('2 segundos', { duration: 2000 })
                  }
                >
                  2s
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('5 segundos (default)', { duration: 5000 })
                  }
                >
                  5s
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('10 segundos', { duration: 10000 })
                  }
                >
                  10s
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.success('Permanente (clique para fechar)', {
                      duration: Infinity,
                    })
                  }
                >
                  Infinity
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Real-World Examples */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Real-World Use Cases</h2>
            <p className="text-muted-foreground">Common scenarios in ContaSync application</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Document Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const toastId = toast.loading('Fazendo upload do documento...');
                    setTimeout(() => {
                      toast.success('Upload concluído!', {
                        id: toastId,
                        description: 'Contrato Social foi enviado com sucesso.',
                      });
                    }, 2000);
                  }}
                >
                  Upload Document
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.success('Cliente salvo!', {
                      description: 'Dados de ABC Ltda foram atualizados.',
                    })
                  }
                >
                  Save Client
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete with Undo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="destructive"
                  onClick={() =>
                    toast.success('Documento excluído', {
                      description: 'Você pode desfazer esta ação.',
                      action: {
                        label: 'Desfazer',
                        onClick: () => toast.info('Documento restaurado!'),
                      },
                      duration: 10000,
                    })
                  }
                >
                  Delete Document
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const toastId = toast.loading('Enviando e-mail...');
                    setTimeout(() => {
                      toast.success('E-mail enviado!', {
                        id: toastId,
                        description: 'Solicitação enviada ao cliente.',
                      });
                    }, 1500);
                  }}
                >
                  Send Request
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => {
                    const toastId = toast.loading('Gerando relatório...');
                    setTimeout(() => {
                      toast.success('Relatório pronto!', {
                        id: toastId,
                        description: 'Download iniciado automaticamente.',
                        action: {
                          label: 'Abrir',
                          onClick: () => toast.info('Abrindo relatório...'),
                        },
                      });
                    }, 2500);
                  }}
                >
                  Export PDF
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  System Notification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() =>
                    toast.info('Nova atualização disponível', {
                      description: 'Versão 2.1.0 com melhorias e correções.',
                      action: {
                        label: 'Ver Mais',
                        onClick: () => toast.info('Abrindo changelog...'),
                      },
                      duration: 8000,
                    })
                  }
                >
                  Show Update
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Custom Toast Playground */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Custom Toast Playground</h2>
            <p className="text-muted-foreground">Create your own toast with custom message and duration</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Your Toast</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Input
                  id="message"
                  placeholder="Enter toast message..."
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (ms)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="5000"
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Button
                  onClick={() =>
                    toast.success(customMessage || 'Success!', {
                      duration: parseInt(customDuration) || 5000,
                    })
                  }
                >
                  Success
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    toast.error(customMessage || 'Error!', {
                      duration: parseInt(customDuration) || 5000,
                    })
                  }
                >
                  Error
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    toast.warning(customMessage || 'Warning!', {
                      duration: parseInt(customDuration) || 5000,
                    })
                  }
                >
                  Warning
                </Button>
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast.info(customMessage || 'Info!', {
                      duration: parseInt(customDuration) || 5000,
                    })
                  }
                >
                  Info
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Accessibility Features */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Accessibility Features</h2>
            <p className="text-muted-foreground">Built-in WCAG 2.1 AA compliance</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Accessibility Support</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li><strong>ARIA Live Region:</strong> Screen readers announce toasts automatically</li>
                <li><strong>Keyboard Accessible:</strong> Press ESC to dismiss toasts</li>
                <li><strong>Focus Management:</strong> Focus returns to trigger after dismiss</li>
                <li><strong>Color Contrast:</strong> All variants meet WCAG AA (4.5:1 minimum)</li>
                <li><strong>Icons:</strong> Semantic icons for visual users (CircleCheckIcon, OctagonXIcon, etc.)</li>
                <li><strong>Auto-dismiss:</strong> Default 5 seconds, customizable per toast</li>
                <li><strong>Manual Dismiss:</strong> Click X button or press ESC</li>
                <li><strong>Multiple Toasts:</strong> Stack vertically with proper spacing</li>
                <li><strong>Position:</strong> Bottom-right on desktop, bottom on mobile</li>
                <li><strong>Responsive:</strong> Adapts to screen size automatically</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator />

        {/* Testing Instructions */}
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">Testing Instructions</h2>
            <p className="text-muted-foreground">How to test toast functionality</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Manual Testing Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Auto-dismiss timing</p>
                    <p className="text-muted-foreground">Trigger a toast and wait 5 seconds - it should disappear</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Manual dismiss</p>
                    <p className="text-muted-foreground">Click the X button on any toast to dismiss it immediately</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Keyboard dismiss (ESC)</p>
                    <p className="text-muted-foreground">Trigger a toast and press ESC key to dismiss</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Multiple toasts</p>
                    <p className="text-muted-foreground">Trigger 3-4 toasts quickly - they should stack vertically</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Action buttons</p>
                    <p className="text-muted-foreground">Click action buttons in toasts to verify functionality</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Loading state</p>
                    <p className="text-muted-foreground">Trigger loading toasts and verify they update to success/error</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Screen reader</p>
                    <p className="text-muted-foreground">Use VoiceOver (Mac) or NVDA (Windows) to verify announcements</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Mobile responsive</p>
                    <p className="text-muted-foreground">Test on mobile device - toast should be full-width at bottom</p>
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
