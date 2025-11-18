import React, { useEffect, useState } from 'react';
import * as ToastPrimitive from '@radix-ui/react-toast';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '../utils/cn';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: ToastData;
  onOpenChange: (open: boolean) => void;
}

/**
 * T076: Toast notification component for conflict alerts and other notifications
 */
export function Toast({ toast, onOpenChange }: ToastProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setOpen(false);
        onOpenChange(false);
      }, toast.duration || 5000);

      return () => clearTimeout(timer);
    }
  }, [open, toast.duration, onOpenChange]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    onOpenChange(newOpen);
  };

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-600" />,
    error: <AlertCircle className="h-5 w-5 text-red-600" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
    info: <Info className="h-5 w-5 text-blue-600" />,
  };

  const styles = {
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
  };

  const type = toast.type || 'info';

  return (
    <ToastPrimitive.Root
      open={open}
      onOpenChange={handleOpenChange}
      className={cn(
        'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all',
        styles[type]
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-0.5">{icons[type]}</div>
        <div className="flex-1">
          <ToastPrimitive.Title className="text-sm font-semibold">
            {toast.title}
          </ToastPrimitive.Title>
          {toast.description && (
            <ToastPrimitive.Description className="mt-1 text-sm opacity-90">
              {toast.description}
            </ToastPrimitive.Description>
          )}
        </div>
      </div>
      <ToastPrimitive.Close className="absolute right-2 top-2 rounded-md p-1 text-gray-400 opacity-0 transition-opacity hover:text-gray-600 focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100">
        <X className="h-4 w-4" />
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  );
}

interface ToastProviderProps {
  children: React.ReactNode;
}

// Global toast manager
class ToastManager {
  private listeners: Set<(toasts: ToastData[]) => void> = new Set();
  private toasts: ToastData[] = [];

  subscribe(listener: (toasts: ToastData[]) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  addToast(toast: Omit<ToastData, 'id'>) {
    const id = `toast-${Date.now()}-${Math.random()}`;
    this.toasts = [...this.toasts, { ...toast, id }];
    this.notify();
  }

  removeToast(id: string) {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  getToasts() {
    return [...this.toasts];
  }
}

const toastManager = new ToastManager();

/**
 * Toast provider and container for managing multiple toasts
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  useEffect(() => {
    // Subscribe to toast manager
    const unsubscribe = toastManager.subscribe(setToasts);
    return unsubscribe;
  }, []);

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {children}
      <ToastPrimitive.Viewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onOpenChange={(open) => {
            if (!open) {
              toastManager.removeToast(toast.id);
            }
          }}
        />
      ))}
    </ToastPrimitive.Provider>
  );
}

/**
 * Helper function to show a toast notification
 */
export function showToast(toast: Omit<ToastData, 'id'>) {
  toastManager.addToast(toast);
}

