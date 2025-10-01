'use client'
import React, { useState, useEffect } from 'react';

// Toast Context
const ToastContext = React.createContext();

// Toast Provider
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Expose addToast to global window object
  useEffect(() => {
    if (message) {
      addToast(message, type);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addToast = addToast;
    }
    return () => {
      if (typeof window !== 'undefined') {
        delete window.addToast;
      }
    };
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
};

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast} 
          onRemove={() => removeToast(toast.id)} 
        />
      ))}
      <style jsx>{`
        .toast-container {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 10);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onRemove, 300);
  };

  return (
    <div 
      className={`toast toast-${toast.type} ${isVisible ? 'toast-visible' : ''}`}
      onClick={handleClose}
    >
      <div className="toast-content">
        <span className="toast-icon">
          {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
        </span>
        <span className="toast-message">{toast.message}</span>
        <button className="toast-close" onClick={handleClose}>×</button>
      </div>
      
      <style jsx>{`
        .toast {
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          padding: 12px 16px;
          min-width: 300px;
          max-width: 500px;
          pointer-events: all;
          cursor: pointer;
          transform: translateY(-20px);
          opacity: 0;
          transition: all 0.3s ease;
          border-left: 4px solid;
        }
        
        .toast-visible {
          transform: translateY(0);
          opacity: 1;
        }
        
        .toast-success {
          border-left-color: #10b981;
        }
        
        .toast-error {
          border-left-color: #ef4444;
        }
        
        .toast-info {
          border-left-color: #3b82f6;
        }
        
        .toast-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .toast-icon {
          font-size: 16px;
          font-weight: bold;
        }
        
        .toast-success .toast-icon {
          color: #10b981;
        }
        
        .toast-error .toast-icon {
          color: #ef4444;
        }
        
        .toast-info .toast-icon {
          color: #3b82f6;
        }
        
        .toast-message {
          flex: 1;
          font-size: 14px;
          color: #374151;
        }
        
        .toast-close {
          background: none;
          border: none;
          font-size: 18px;
          color: #9ca3af;
          cursor: pointer;
          padding: 0;
          width: 20px;
          height: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toast-close:hover {
          color: #6b7280;
        }
      `}</style>
    </div>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Helper functions for backward compatibility
export const notifySuccess = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'success');
  }
};

export const notifyError = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'error');
  }
};

export const notifyInfo = (message) => {
  if (typeof window !== 'undefined' && window.addToast) {
    window.addToast(message, 'info');
  }
};
