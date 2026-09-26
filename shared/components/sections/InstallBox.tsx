'use client';
/**
 * InstallBox Molecule Component
 *
 * A copyable command display box for install/CLI commands.
 * Shows a monospace command with a copy-to-clipboard button.
 */

import React, { useState, useCallback } from 'react';
import { cn } from './cn';
import { Box, Button, Typography } from '@almadar/ui/ssr';

export interface InstallBoxProps {
  /** The command to display and copy */
  command: string;
  /** Optional label above the command */
  label?: string;
  /** Additional class names */
  className?: string;
}

export const InstallBox: React.FC<InstallBoxProps> = ({
  command,
  label,
  className,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    void navigator.clipboard.writeText(command);
    setCopied(true);
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [command]);

  return (
    <Box className={cn('inline-block', className)}>
      {label && (
        <Typography variant="caption" className="mb-1">
          {label}
        </Typography>
      )}
      <Box
        className="bg-surface rounded-container border-[length:var(--border-width)] border-border"
        padding="md"
      >
        <Box className="flex items-center gap-3">
          <Typography
            variant="body2"
            className="font-mono flex-1 min-w-0 select-all"
            truncate
          >
            {command}
          </Typography>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={copied ? 'check' : 'copy'}
            onClick={handleCopy}
            className="flex-shrink-0"
            aria-label={copied ? 'Copied' : 'Copy to clipboard'}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

InstallBox.displayName = 'InstallBox';
