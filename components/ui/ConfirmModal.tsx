
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'warning';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white w-full max-w-md p-10 rounded-[2.5rem] shadow-2xl border border-slate-100"
        >
          <div className="mb-8">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl ${
              type === 'danger' ? 'bg-red-50 text-red-600 shadow-red-500/10' :
              type === 'warning' ? 'bg-amber-50 text-amber-600 shadow-amber-500/10' :
              'bg-blue-50 text-blue-600 shadow-blue-500/10'
            }`}>
              {type === 'danger' ? '⚠️' : type === 'warning' ? '⚡' : 'ℹ️'}
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-500 text-sm font-bold leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl transition-all active:scale-95 ${
                type === 'danger' ? 'bg-red-600 text-white shadow-red-500/20 hover:bg-red-700' :
                type === 'warning' ? 'bg-amber-500 text-white shadow-amber-500/20 hover:bg-amber-600' :
                'bg-slate-900 text-white shadow-slate-500/20 hover:bg-slate-800'
              }`}
            >
              {confirmText}
            </button>
            <button
              onClick={onClose}
              className="px-8 py-5 border-2 border-slate-100 rounded-2xl font-black uppercase text-slate-400 text-[10px] tracking-widest hover:bg-slate-50 transition-all"
            >
              {cancelText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmModal;
