'use client';

import { useState, useEffect, createContext, useContext, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Zap, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

type AlertType = 'success' | 'warning' | 'error' | 'info' | 'signal';

interface TerminalAlert {
  id: string;
  type: AlertType;
  title: string;
  message: string;
  ticker?: string;
  duration?: number;
}

interface TerminalAlertContextValue {
  showAlert: (alert: Omit<TerminalAlert, 'id'>) => void;
  dismissAlert: (id: string) => void;
}

const TerminalAlertContext = createContext<TerminalAlertContextValue | null>(null);

export function useTerminalAlert() {
  const context = useContext(TerminalAlertContext);
  if (!context) {
    throw new Error('useTerminalAlert must be used within TerminalAlertProvider');
  }
  return context;
}

export function TerminalAlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<TerminalAlert[]>([]);

  const showAlert = useCallback((alert: Omit<TerminalAlert, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newAlert: TerminalAlert = { ...alert, id };

    setAlerts((prev) => [...prev, newAlert]);

    // Auto-dismiss after duration (default 5s)
    const duration = alert.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== id));
      }, duration);
    }
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  return (
    <TerminalAlertContext.Provider value={{ showAlert, dismissAlert }}>
      {children}
      <TerminalAlertContainer alerts={alerts} onDismiss={dismissAlert} />
    </TerminalAlertContext.Provider>
  );
}

function TerminalAlertContainer({
  alerts,
  onDismiss,
}: {
  alerts: TerminalAlert[];
  onDismiss: (id: string) => void;
}) {
  if (alerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {alerts.map((alert) => (
        <TerminalAlertCard key={alert.id} alert={alert} onDismiss={() => onDismiss(alert.id)} />
      ))}
    </div>
  );
}

function TerminalAlertCard({
  alert,
  onDismiss,
}: {
  alert: TerminalAlert;
  onDismiss: () => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const getAlertConfig = (type: AlertType) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-950/95',
          border: 'border-green-500/50',
          text: 'text-green-400',
          icon: <TrendingUp className="w-4 h-4" />,
          label: 'SUCCESS',
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/95',
          border: 'border-amber-500/50',
          text: 'text-amber-400',
          icon: <AlertTriangle className="w-4 h-4" />,
          label: 'WARNING',
        };
      case 'error':
        return {
          bg: 'bg-red-950/95',
          border: 'border-red-500/50',
          text: 'text-red-400',
          icon: <TrendingDown className="w-4 h-4" />,
          label: 'ERROR',
        };
      case 'signal':
        return {
          bg: 'bg-cyan-950/95',
          border: 'border-cyan-500/50',
          text: 'text-cyan-400',
          icon: <Zap className="w-4 h-4" />,
          label: 'SIGNAL',
        };
      default:
        return {
          bg: 'bg-zinc-900/95',
          border: 'border-zinc-500/50',
          text: 'text-zinc-300',
          icon: <Bell className="w-4 h-4" />,
          label: 'INFO',
        };
    }
  };

  const config = getAlertConfig(alert.type);

  return (
    <div
      className={cn(
        'font-mono text-sm border rounded-lg backdrop-blur-sm shadow-lg transition-all duration-300',
        config.bg,
        config.border,
        isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center justify-between px-3 py-2 border-b', config.border)}>
        <div className={cn('flex items-center gap-2', config.text)}>
          {config.icon}
          <span className="text-xs font-bold tracking-wider">[{config.label}]</span>
          {alert.ticker && (
            <span className="text-xs opacity-70">{alert.ticker}</span>
          )}
        </div>
        <button
          onClick={onDismiss}
          className={cn('p-1 hover:bg-white/10 rounded transition-colors', config.text)}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div className="px-3 py-2">
        <div className={cn('font-bold text-xs mb-1', config.text)}>
          {alert.title}
        </div>
        <div className="text-zinc-400 text-xs leading-relaxed">
          &gt; {alert.message}
        </div>
      </div>

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none opacity-5 rounded-lg overflow-hidden"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,255,255,0.03) 2px, transparent 3px)',
          backgroundSize: '100% 3px',
        }}
      />
    </div>
  );
}

// Standalone component for simpler usage without context
export function TerminalToast({
  type = 'info',
  title,
  message,
  ticker,
  isVisible,
  onClose,
}: {
  type?: AlertType;
  title: string;
  message: string;
  ticker?: string;
  isVisible: boolean;
  onClose: () => void;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100]">
      <TerminalAlertCard
        alert={{ id: 'toast', type, title, message, ticker }}
        onDismiss={onClose}
      />
    </div>
  );
}
