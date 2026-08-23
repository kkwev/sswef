import { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Safe in-memory storage fallback for restricted environments (iOS Safari Private Mode / ITP / Quota Exceeded)
const memoryStorageMap = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const val = window.localStorage.getItem(key);
        if (val !== null) return val;
      }
    } catch (e) {
      // In iOS Safari private mode or if access is restricted, fallback to memory storage
    }
    return memoryStorageMap.get(key) || null;
  },

  setItem(key: string, value: string): void {
    memoryStorageMap.set(key, value);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e: any) {
      console.warn(`[Storage] localStorage write note for "${key}". Preserved in memory vault.`);
    }
  },

  removeItem(key: string): void {
    memoryStorageMap.delete(key);
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {}
  }
};

// Global React Error Boundary to prevent blank screen crashes on any iOS/WebKit devices
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-4">
            <span className="text-2xl font-black">S</span>
          </div>
          <h1 className="text-2xl font-bold tracking-wider mb-2">SEPHORA THAILAND</h1>
          <p className="text-gray-400 text-sm max-w-sm mb-6">
            กำลังรีเฟรชระบบเพื่อแสดงผลหน้าเว็บให้สมบูรณ์สำหรับอุปกรณ์ของคุณ
          </p>
          <button
            onClick={this.handleReload}
            className="px-6 py-2.5 rounded-full bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors shadow-lg active:scale-95"
          >
            เปิดใช้งานหน้าเว็บใหม่
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Remove static HTML splash screen immediately as soon as React is ready
if (typeof document !== 'undefined') {
  const removeStaticSplash = () => {
    const splash = document.getElementById('initial-splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.pointerEvents = 'none';
      setTimeout(() => {
        try { splash.remove(); } catch (e) {}
      }, 400);
    }
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(removeStaticSplash, 50);
  } else {
    document.addEventListener('DOMContentLoaded', removeStaticSplash);
    window.addEventListener('load', removeStaticSplash);
  }
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
    </StrictMode>,
  );
}


