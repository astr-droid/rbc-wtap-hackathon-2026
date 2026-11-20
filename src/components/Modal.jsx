import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, labelledBy, className = '', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    dialogRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div ref={dialogRef} className={`modal ${className}`} role="dialog" aria-modal="true" aria-labelledby={labelledBy} tabIndex={-1}>
        {children}
      </div>
    </div>
  );
}

export function ModalHeader({ id, title, onClose, children }) {
  return (
    <div className="modal-header">
      {children ?? <h2 id={id}>{title}</h2>}
      <button className="close-button" type="button" aria-label="Close" onClick={onClose}>×</button>
    </div>
  );
}
