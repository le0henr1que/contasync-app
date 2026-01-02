'use client';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Plus,
  Minus,
  Building2,
} from 'lucide-react';

export type InvestmentType =
  | 'STOCK'
  | 'FUND'
  | 'FIXED_INCOME'
  | 'CRYPTO'
  | 'REAL_ESTATE'
  | 'SAVINGS_BOX'
  | 'OTHER';

export interface InvestmentTransaction {
  id: string;
  investmentId: string;
  type: 'BUY' | 'SELL' | 'DEPOSIT' | 'WITHDRAWAL';
  quantity?: string | number;
  price?: string | number;
  amount?: string | number;
  fees?: string | number | null;
  date: string;
  notes?: string | null;
}

export interface Investment {
  id: string;
  clientId: string;
  type: InvestmentType;
  ticker: string;
  name: string;
  description?: string | null;
  broker?: string | null;
  currentQuantity: string | number;
  averagePrice: string | number;
  currentPrice: string | number;
  totalInvested: string | number;
  totalValue: number;
  profitLoss: number;
  profitLossPercentage: number;
  createdAt: string;
  updatedAt: string;
  transactions: InvestmentTransaction[];
}

interface InvestmentCardProps {
  investment: Investment;
  onEdit?: (investment: Investment) => void;
  onDelete?: (investment: Investment) => void;
  onBuy?: (investment: Investment) => void;
  onSell?: (investment: Investment) => void;
  onDeposit?: (investment: Investment) => void;
  onWithdraw?: (investment: Investment) => void;
}

const typeLabels: Record<InvestmentType, string> = {
  STOCK: 'Ações',
  FUND: 'Fundos',
  FIXED_INCOME: 'Renda Fixa',
  CRYPTO: 'Cripto',
  REAL_ESTATE: 'FII',
  SAVINGS_BOX: 'Caixinha',
  OTHER: 'Outros',
};

const typeColors: Record<InvestmentType, string> = {
  STOCK: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  FUND: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  FIXED_INCOME:
    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  CRYPTO: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  REAL_ESTATE:
    'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
  SAVINGS_BOX: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  OTHER: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

function formatCurrency(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numValue);
}

function formatNumber(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(numValue);
}

export function InvestmentCard({
  investment,
  onEdit,
  onDelete,
  onBuy,
  onSell,
  onDeposit,
  onWithdraw,
}: InvestmentCardProps) {
  const isProfit = investment.profitLoss >= 0;
  const quantity = Number(investment.currentQuantity);
  const isSavingsBox = investment.type === 'SAVINGS_BOX';

  return (
    <Card variant="default" className="transition-all border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <span className="font-mono font-bold text-primary">
                {investment.ticker}
              </span>
              <Badge className={typeColors[investment.type]}>
                {typeLabels[investment.type]}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 truncate">
              {investment.name}
            </p>
            {investment.broker && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3" />
                {investment.broker}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Value */}
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Valor Atual</p>
          <p className="text-2xl font-bold">
            {formatCurrency(investment.totalValue)}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatNumber(quantity)} × {formatCurrency(investment.currentPrice)}
          </p>
        </div>

        {/* Profit/Loss */}
        <div
          className={`p-3 rounded-lg ${
            isProfit
              ? 'bg-green-50 dark:bg-green-900/20'
              : 'bg-red-50 dark:bg-red-900/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isProfit ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <div>
                <p className="text-xs text-muted-foreground">Lucro/Prejuízo</p>
                <p
                  className={`text-lg font-bold ${
                    isProfit ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {isProfit ? '+' : ''}
                  {formatCurrency(investment.profitLoss)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Rentabilidade</p>
              <p
                className={`text-lg font-bold ${
                  isProfit ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {isProfit ? '+' : ''}
                {investment.profitLossPercentage.toFixed(2)}%
              </p>
            </div>
          </div>
        </div>

        {/* Investment Details */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Investido</p>
            <p className="font-medium">
              {formatCurrency(investment.totalInvested)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Preço Médio</p>
            <p className="font-medium">
              {formatCurrency(investment.averagePrice)}
            </p>
          </div>
        </div>

        {/* Recent Transactions */}
        {investment.transactions && investment.transactions.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Últimas Transações
            </p>
            {investment.transactions.slice(0, 3).map((txn) => {
              const isDeposit = txn.type === 'DEPOSIT';
              const isWithdrawal = txn.type === 'WITHDRAWAL';
              const isBuy = txn.type === 'BUY';
              const isSavingsTransaction = isDeposit || isWithdrawal;

              return (
                <div
                  key={txn.id}
                  className={`flex items-center justify-between text-xs p-2 rounded ${
                    isBuy || isDeposit
                      ? 'bg-blue-50 dark:bg-blue-900/20'
                      : 'bg-orange-50 dark:bg-orange-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isBuy || isDeposit ? (
                      <Plus className="h-3 w-3 text-blue-600" />
                    ) : (
                      <Minus className="h-3 w-3 text-orange-600" />
                    )}
                    <span className="font-medium">
                      {isDeposit ? 'DEP' : isWithdrawal ? 'RET' : txn.type}
                    </span>
                    {!isSavingsTransaction && (
                      <span className="text-muted-foreground">
                        {formatNumber(txn.quantity || 0)}
                      </span>
                    )}
                    <span className="text-muted-foreground">
                      {format(new Date(txn.date), 'dd/MM/yy')}
                    </span>
                  </div>
                  <span className="font-medium">
                    {isSavingsTransaction
                      ? formatCurrency(txn.amount || 0)
                      : formatCurrency(txn.price || 0)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          {isSavingsBox ? (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onDeposit?.(investment)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Depositar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onWithdraw?.(investment)}
                disabled={Number(investment.totalValue) <= 0}
              >
                <Minus className="h-3.5 w-3.5 mr-1.5" />
                Retirar
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="default"
                size="sm"
                className="flex-1"
                onClick={() => onBuy?.(investment)}
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Comprar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => onSell?.(investment)}
                disabled={quantity <= 0}
              >
                <Minus className="h-3.5 w-3.5 mr-1.5" />
                Vender
              </Button>
            </>
          )}
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(investment)}
            >
              <Edit className="h-3.5 w-3.5" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(investment)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
