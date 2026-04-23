import { useState, useEffect, useCallback, createContext, useContext, type ReactNode } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600',
  };

  const icons = {
    success: '✔',
    error: '✖',
    info: 'ℹ',
  };

  return (
    <div
      className={`${colors[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
      }`}
    >
      <span className="text-lg">{icons[toast.type]}</span>
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button onClick={onDismiss} className="text-white/70 hover:text-white text-lg leading-none">&times;</button>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast() {
  return useContext(ToastContext);
}
