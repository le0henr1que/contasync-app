'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Loader2 } from 'lucide-react';

interface Invoice {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'FAILED' | 'REFUNDED';
  invoicePdf: string | null;
}

export function BillingHistoryTable() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/invoices/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    const config = {
      PAID: { label: 'Pago', className: 'bg-green-500' },
      PENDING: { label: 'Pendente', className: 'bg-yellow-500' },
      FAILED: { label: 'Falhou', className: 'bg-red-500' },
      REFUNDED: { label: 'Reembolsado', className: 'bg-gray-500' },
    };
    const { label, className } = config[status];
    return <Badge className={className}>{label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatAmount = (amount: number) => {
    return `R$ ${(amount / 100).toFixed(2)}`;
  };

  const handleDownload = async (invoice: Invoice) => {
    if (!invoice.invoicePdf) {
      return;
    }

    try {
      window.open(invoice.invoicePdf, '_blank');
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Cobranças</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Histórico de Cobranças</CardTitle>
        <CardDescription>
          Visualize e baixe comprovantes de todas as suas cobranças
        </CardDescription>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma cobrança ainda</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Quando você tiver cobranças, elas aparecerão aqui com opção de download do comprovante.
            </p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {formatDate(invoice.date)}
                    </TableCell>
                    <TableCell>{invoice.description}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatAmount(invoice.amount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(invoice.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(invoice)}
                        disabled={!invoice.invoicePdf}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
