import { useEffect } from 'react';

export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(onDone, 3200);
    return () => window.clearTimeout(timer);
  }, [toast, onDone]);

  return (
    <div className={`toast${toast ? ' show' : ''}`} role="status" aria-live="polite">
      {toast?.message}
    </div>
  );
}
