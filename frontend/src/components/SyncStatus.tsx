import React from 'react';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '../utils/cn';

export type SyncStatusType = 'pending' | 'syncing' | 'synced' | 'error';

interface SyncStatusProps {
  status: SyncStatusType;
  message?: string;
  className?: string;
}

/**
 * T078: Sync status indicator component showing current sync state
 */
export function SyncStatus({ status, message, className }: SyncStatusProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'text-gray-500',
      bgColor: 'bg-gray-100',
      label: 'Pending',
    },
    syncing: {
      icon: Loader2,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: 'Syncing...',
      spinning: true,
    },
    synced: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Synced',
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      label: 'Error',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon
        className={cn('h-4 w-4', config.spinning && 'animate-spin')}
      />
      <span>{message || config.label}</span>
    </div>
  );
}

