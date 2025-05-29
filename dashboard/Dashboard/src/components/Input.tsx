'use client';

import React from 'react';
import { Input as ShadcnInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

export default function Input({
  label,
  error,
  helperText,
  containerClassName,
  labelClassName,
  inputClassName,
  helperTextClassName,
  errorClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <Label
          htmlFor={inputId}
          className={cn(
            'text-sm font-medium text-gray-700',
            error && 'text-red-500',
            labelClassName,
          )}
        >
          {label}
        </Label>
      )}

      <ShadcnInput
        id={inputId}
        className={cn(
          'transition-all',
          error ? 'border-red-500 focus-visible:ring-red-500' : 'focus-visible:ring-blue-500',
          inputClassName,
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        {...props}
      />

      {error && (
        <p id={`${inputId}-error`} className={cn('text-sm text-red-500 mt-1', errorClassName)}>
          {error}
        </p>
      )}

      {!error && helperText && (
        <p
          id={`${inputId}-helper`}
          className={cn('text-sm text-gray-500 mt-1', helperTextClassName)}
        >
          {helperText}
        </p>
      )}
    </div>
  );
}
