import React from "react";
import { X } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <button 
              onClick={onCancel} 
              className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors -mt-1 -mr-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {description}
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
          <button 
            onClick={onCancel} 
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-4 py-2 text-sm font-medium text-white rounded-xl shadow-sm transition-colors ${
              isDestructive 
                ? "bg-red-600 hover:bg-red-700" 
                : "bg-brand-dark hover:bg-slate-800"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
