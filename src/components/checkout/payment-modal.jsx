'use client';
import React from 'react';

const PaymentModal = ({
  isOpen,
  onClose,
  iframeUrl,
  title = 'Payment',
}) => {
  // Prevent background scroll when modal is open.
  React.useEffect(() => {
    if (!isOpen) return;
    if (typeof document === 'undefined') return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  // Allow closing modal with Escape.
  React.useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => {
        // Click outside closes modal
        if (e.target === e.currentTarget) onClose?.();
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: 'min(980px, calc(100vw - 32px))',
          maxHeight: 'calc(100vh - 32px)',
          background: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr auto',
        }}
      >
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600 }}>{title}</div>
          <button
            type="button"
            className="tp-btn tp-btn-border"
            onClick={onClose}
            aria-label="Close"
            style={{ padding: '6px 10px' }}
          >
            ✕
          </button>
        </div>

        <div style={{ background: '#fff' }}>
          {iframeUrl ? (
            <iframe
              title="payment"
              src={iframeUrl}
              allow="payment *"
              style={{
                border: 'none',
                width: '100%',
                height: 'min(78vh, 720px)',
                display: 'block',
              }}
            />
          ) : (
            <div style={{ padding: 24 }}>Loading payment...</div>
          )}
        </div>

        <div
          style={{
            padding: '12px 16px',
            borderTop: '1px solid rgba(0,0,0,0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          {iframeUrl && (
            <a className="tp-btn tp-btn-2" href={iframeUrl} target="_blank" rel="noreferrer">
              Open in new tab
            </a>
          )}
          <button type="button" className="tp-btn tp-btn-border" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
