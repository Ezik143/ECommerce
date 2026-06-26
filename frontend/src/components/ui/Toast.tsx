import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { createPortal } from 'react-dom';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

const toastClasses: Record<ToastType, string> = {
  success: 'toast-success',
  error: 'toast-error',
  warning: 'toast-warning',
  info: 'toast-info',
};

const icons: Record<ToastType, React.ComponentType<{ className?: string }>> = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  warning: ExclamationCircleIcon,
  info: InformationCircleIcon,
};

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showToast: () => {},
      removeToast: () => {},
      success: () => {},
      error: () => {},
    };
  }
  return ctx;
};

const ToastItem = ({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) => {
  const Icon = icons[toast.type];

  return (
    <div className={`toast ${toastClasses[toast.type]}`}>
      <Icon className="toast-icon" />
      <p className="toast-message">{toast.message}</p>
      <button type="button" onClick={() => onRemove(toast.id)} className="toast-dismiss" aria-label="Dismiss">
        <XMarkIcon style={{ width: '1rem', height: '1rem' }} />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) => {
  if (toasts.length === 0) return null;

  const container = document.getElementById('toast-portal');

  const content = (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );

  if (container) {
    return createPortal(content, container);
  }

  return content;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((type: ToastType, message: string, duration?: number) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, type, message, duration }]);
    if (duration && duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const value: ToastContextValue = {
    showToast,
    removeToast,
    success: (message, d) => showToast('success', message, d),
    error: (message, d) => showToast('error', message, d),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div id="toast-portal" />
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};