'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Mail, Lock, User, Search, Calendar, DollarSign } from 'lucide-react';

export default function FormComponentsPage() {
  const [email, setEmail] = useState('');
  const [showEmailError, setShowEmailError] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setShowEmailError(false);
    setShowEmailSuccess(false);
  };

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setShowEmailError(false);
      setShowEmailSuccess(false);
    } else if (emailRegex.test(email)) {
      setShowEmailError(false);
      setShowEmailSuccess(true);
    } else {
      setShowEmailError(true);
      setShowEmailSuccess(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Form Components</h1>
          <p className="text-muted-foreground">
            Enhanced form inputs with error/success states, icons, and accessibility
          </p>
        </div>

        <Separator />

        {/* Basic Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Form Fields</CardTitle>
            <CardDescription>Standard inputs with labels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Nome completo"
              placeholder="Digite seu nome"
              required
            />

            <FormField
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              required
            />

            <FormField
              label="Telefone"
              type="tel"
              placeholder="(11) 99999-9999"
              helperText="Formato: (XX) XXXXX-XXXX"
            />
          </CardContent>
        </Card>

        {/* Error State */}
        <Card>
          <CardHeader>
            <CardTitle>Error State</CardTitle>
            <CardDescription>Fields with validation errors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="E-mail"
              type="email"
              value="invalid-email"
              error="Por favor, insira um e-mail válido"
              required
            />

            <FormField
              label="Senha"
              type="password"
              value="123"
              error="A senha deve ter no mínimo 6 caracteres"
              required
            />

            <FormField
              label="CNPJ"
              value="123"
              error="CNPJ inválido. Formato: 00.000.000/0000-00"
              required
            />
          </CardContent>
        </Card>

        {/* Success State */}
        <Card>
          <CardHeader>
            <CardTitle>Success State</CardTitle>
            <CardDescription>Fields with successful validation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="E-mail"
              type="email"
              value="usuario@exemplo.com"
              success
              required
            />

            <FormField
              label="CPF"
              value="123.456.789-00"
              success
              helperText="CPF válido"
            />
          </CardContent>
        </Card>

        {/* With Icons */}
        <Card>
          <CardHeader>
            <CardTitle>Fields with Icons</CardTitle>
            <CardDescription>Prefix and suffix icons for better UX</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              prefixIcon={<Mail className="h-4 w-4" />}
              required
            />

            <FormField
              label="Senha"
              type="password"
              placeholder="Sua senha"
              prefixIcon={<Lock className="h-4 w-4" />}
              required
            />

            <FormField
              label="Nome de usuário"
              placeholder="usuario123"
              prefixIcon={<User className="h-4 w-4" />}
            />

            <FormField
              label="Buscar"
              placeholder="Digite para buscar..."
              prefixIcon={<Search className="h-4 w-4" />}
            />

            <FormField
              label="Data de nascimento"
              type="date"
              prefixIcon={<Calendar className="h-4 w-4" />}
            />

            <FormField
              label="Valor"
              type="number"
              placeholder="0,00"
              prefixIcon={<DollarSign className="h-4 w-4" />}
              helperText="Digite o valor em reais"
            />
          </CardContent>
        </Card>

        {/* Interactive Validation */}
        <Card>
          <CardHeader>
            <CardTitle>Interactive Validation</CardTitle>
            <CardDescription>Real-time validation example</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="E-mail"
              type="email"
              value={email}
              onChange={handleEmailChange}
              onBlur={validateEmail}
              error={showEmailError ? 'E-mail inválido' : undefined}
              success={showEmailSuccess}
              prefixIcon={<Mail className="h-4 w-4" />}
              helperText={
                !showEmailError && !showEmailSuccess
                  ? 'Digite um e-mail válido'
                  : undefined
              }
              required
            />

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  setEmail('usuario@exemplo.com');
                  setShowEmailSuccess(true);
                  setShowEmailError(false);
                }}
                variant="outline"
                size="sm"
              >
                Preencher e-mail válido
              </Button>
              <Button
                onClick={() => {
                  setEmail('email-invalido');
                  setShowEmailError(true);
                  setShowEmailSuccess(false);
                }}
                variant="outline"
                size="sm"
              >
                Preencher e-mail inválido
              </Button>
              <Button
                onClick={() => {
                  setEmail('');
                  setShowEmailError(false);
                  setShowEmailSuccess(false);
                }}
                variant="outline"
                size="sm"
              >
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Disabled State */}
        <Card>
          <CardHeader>
            <CardTitle>Disabled State</CardTitle>
            <CardDescription>Non-editable fields</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              label="Campo desabilitado"
              value="Este campo não pode ser editado"
              disabled
            />

            <FormField
              label="E-mail (somente leitura)"
              type="email"
              value="usuario@exemplo.com"
              prefixIcon={<Mail className="h-4 w-4" />}
              disabled
            />
          </CardContent>
        </Card>

        {/* Accessibility Features */}
        <Card>
          <CardHeader>
            <CardTitle>Accessibility Features</CardTitle>
            <CardDescription>Built-in accessibility support</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Features:</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Label properly associated with input (htmlFor + id)</li>
                <li>Required field indicator (*) visible</li>
                <li>Error messages with aria-describedby and role="alert"</li>
                <li>aria-invalid on error state</li>
                <li>Helper text linked with aria-describedby</li>
                <li>Keyboard accessible (Tab, Enter, Esc)</li>
                <li>Screen reader friendly with semantic HTML</li>
                <li>WCAG 2.1 AA color contrast compliant</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
