import { useSyncExternalStore } from 'react';
export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}
let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; };
const snapshot = () => toasts;
function publish(next: Toast[]) { toasts = next; listeners.forEach(listener => listener()); }
export function dismissToast(id: string) {
  clearTimeout(timers.get(id)); timers.delete(id);
  publish(toasts.filter(item => item.id !== id));
}
function toast(input: Omit<Toast, 'id'>) {
  const id = crypto.randomUUID();
  for (const timer of timers.values()) clearTimeout(timer);
  timers.clear();
  publish([{ ...input, id }]);
  if (input.variant !== 'destructive') timers.set(id, setTimeout(() => dismissToast(id), 10000));
  return { id, dismiss: () => dismissToast(id) };
}
export function useToast() { return { toast, toasts: useSyncExternalStore(subscribe, snapshot, snapshot) }; }
