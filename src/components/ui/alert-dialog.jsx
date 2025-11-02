"use client";

import React, { createContext, useContext } from "react";

const AlertDialogContext = createContext({ open: false, onOpenChange: () => {} });

function AlertDialog({ open, onOpenChange, children }) {
  return (
    <AlertDialogContext.Provider value={{ open: !!open, onOpenChange: onOpenChange || (() => {}) }}>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange && onOpenChange(null)} />
          <div className="relative z-10 w-full max-w-lg p-6">
            {children}
          </div>
        </div>
      ) : null}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogContent({ children, className = "", ...props }) {
  return (
    <div className={`mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className}`} {...props}>
      {children}
    </div>
  );
}

function AlertDialogHeader({ children, className = "" }) {
  return <div className={`px-4 py-3 border-b border-gray-100 dark:border-gray-700 ${className}`}>{children}</div>;
}

function AlertDialogFooter({ children, className = "" }) {
  return <div className={`px-4 py-3 flex justify-end gap-2 ${className}`}>{children}</div>;
}

function AlertDialogTitle({ children, className = "" }) {
  return <h3 className={`text-lg font-semibold text-gray-900 dark:text-gray-100 ${className}`}>{children}</h3>;
}

function AlertDialogDescription({ children, className = "" }) {
  return <p className={`text-sm text-gray-600 dark:text-gray-400 ${className}`}>{children}</p>;
}

function AlertDialogAction({ children, onClick, className = "" }) {
  const ctx = useContext(AlertDialogContext);
  const handle = (e) => {
    onClick && onClick(e);
    // By default close dialog after action
    ctx.onOpenChange && ctx.onOpenChange(null);
  };
  return (
    <button onClick={handle} className={`inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md ${className}`}>
      {children}
    </button>
  );
}

function AlertDialogCancel({ children, onClick, className = "" }) {
  const ctx = useContext(AlertDialogContext);
  const handle = (e) => {
    onClick && onClick(e);
    ctx.onOpenChange && ctx.onOpenChange(null);
  };
  return (
    <button onClick={handle} className={`inline-flex items-center px-4 py-2 border rounded-md ${className}`}>
      {children}
    </button>
  );
}

export {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};