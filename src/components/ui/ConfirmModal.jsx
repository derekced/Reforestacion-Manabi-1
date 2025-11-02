import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel }) {
  const { t } = useLanguage();
  
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            {title}
          </h3>
        </div>
        
        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-600 dark:text-gray-300">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-medium transition-colors"
          >
            {t('common.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
