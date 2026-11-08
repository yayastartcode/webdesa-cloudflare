import { X } from 'lucide-react';
import { dismissToast, useToast } from '@/hooks/use-toast';
export function ToastViewport() {
  const { toasts } = useToast();
  return <div aria-label="Pesan aplikasi" className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] space-y-3 sm:left-auto sm:w-96">{toasts.map(item => <div key={item.id} role={item.variant === 'destructive' ? 'alert' : 'status'} className={`pointer-events-auto relative rounded-xl border p-4 pr-12 shadow-lg ${item.variant === 'destructive' ? 'border-red-300 bg-red-50 text-red-900' : 'border-green-300 bg-green-50 text-green-900'}`}>
    {item.title && <p className="font-semibold">{item.title}</p>}{item.description && <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">{item.description}</p>}
    <button type="button" aria-label="Tutup pesan" className="absolute right-2 top-2 rounded p-2 hover:bg-black/5" onClick={() => dismissToast(item.id)}><X className="h-4 w-4" /></button>
  </div>)}</div>;
}
