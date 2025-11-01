"use client";

import React, { useEffect, useState } from "react";

let idCounter = 0;

export function toastEvent(detail) {
  try {
    window.dispatchEvent(new CustomEvent("app:toast", { detail }));
  } catch (e) {}
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const { title, message, type } = e.detail || {};
      const id = ++idCounter;
      setToasts((t) => [...t, { id, title, message, type }]);
      // auto remove
      setTimeout(() => {
        setToasts((t) => t.filter((x) => x.id !== id));
      }, 4000);
    };
    window.addEventListener("app:toast", handler);
    return () => window.removeEventListener("app:toast", handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`max-w-sm w-full px-4 py-3 rounded-lg shadow-lg border transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700`}
        >
          <div className="flex items-start gap-3">
            <div className="flex-1">
              {t.title && <div className="font-semibold text-gray-900 dark:text-white">{t.title}</div>}
              {t.message && <div className="text-sm text-gray-700 dark:text-gray-300">{t.message}</div>}
            </div>
            <button
              onClick={() => setToasts((s) => s.filter((x) => x.id !== t.id))}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
