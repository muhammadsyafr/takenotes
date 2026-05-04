import { useStore } from '../store';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

export function Toast() {
  const { toast, hideToast } = useStore();

  if (!toast) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
          toast.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-green-600 text-white'
        }`}
      >
        {toast.type === 'error' ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <CheckCircle className="w-5 h-5" />
        )}
        <span className="text-sm font-medium">{toast.message}</span>
        <button onClick={hideToast} className="ml-2 hover:opacity-80">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}