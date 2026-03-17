/**
 * FormField Molecule Component
 * 
 * A form field wrapper with label, hint, and error message support.
 * **Atomic Design**: Composed using Label and Typography atoms.
 */

import React from 'react';
import { cn } from '../../lib/cn';
import { Label } from '../atoms/Label';
import { Typography } from '../atoms/Typography';

export interface FormFieldProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  error,
  hint,
  className,
  children,
}) => {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label required={required}>{label}</Label>
      {children}
      {error && (
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      )}
      {hint && !error && (
        <Typography variant="caption" color="muted">
          {hint}
        </Typography>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';
