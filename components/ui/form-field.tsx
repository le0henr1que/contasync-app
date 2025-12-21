'use client';

import * as React from 'react';
import { Label } from './label';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export interface FormFieldProps extends React.ComponentPropsWithoutRef<'input'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  success?: boolean;
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      helperText,
      required = false,
      success = false,
      prefixIcon,
      suffixIcon,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `form-field-${React.useId()}`;
    const hasError = Boolean(error);
    const hasSuccess = success && !hasError;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={inputId} className="block">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}

        <div className="relative">
          {prefixIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {prefixIcon}
            </div>
          )}

          <Input
            ref={ref}
            id={inputId}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                  ? `${inputId}-helper`
                  : undefined
            }
            className={cn(
              prefixIcon && 'pl-10',
              (suffixIcon || hasError || hasSuccess) && 'pr-10',
              hasSuccess &&
                'border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/50',
              className
            )}
            {...props}
          />

          {/* Suffix Icons */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {hasError && (
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            )}
            {hasSuccess && !hasError && (
              <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />
            )}
            {!hasError && !hasSuccess && suffixIcon && (
              <div className="text-muted-foreground">{suffixIcon}</div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-sm text-destructive flex items-center gap-1"
            role="alert"
          >
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {error}
          </p>
        )}

        {/* Helper Text */}
        {!error && helperText && (
          <p
            id={`${inputId}-helper`}
            className="text-sm text-muted-foreground"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export { FormField };
