import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar Exclusão',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-700 max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="p-2.5 bg-zinc-900 border border-zinc-700 text-zinc-300">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wide">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed font-light">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs uppercase tracking-wider text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs uppercase tracking-wider font-semibold bg-white text-black hover:bg-zinc-200 transition-colors cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
