"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "danger" | "warning" | "info" | "success";
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "Confirm",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  const icons = {
    danger: <AlertCircle className="h-6 w-6 text-rose-500" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-500" />,
    info: <AlertCircle className="h-6 w-6 text-blue-500" />,
    success: <CheckCircle2 className="h-6 w-6 text-emerald-500" />,
  };

  const colors = {
    danger: "bg-rose-50 border-rose-100",
    warning: "bg-amber-50 border-amber-100",
    info: "bg-blue-50 border-blue-100",
    success: "bg-emerald-50 border-emerald-100",
  };

  const buttonColors = {
    danger: "bg-rose-500 hover:bg-rose-600 shadow-rose-200",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-amber-200",
    info: "bg-blue-500 hover:bg-blue-600 shadow-blue-200",
    success: "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center border", colors[type])}>
                  {icons[type]}
                </div>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  title="Close"
                  className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
                >

                  <X className="h-5 w-5" />
                </button>
              </div>

              <h2 className="text-2xl font-black text-[#1F2533] uppercase tracking-tighter leading-none mb-3">
                {title}
              </h2>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">
                {message}
              </p>
            </div>

            <div className="bg-gray-50/50 p-6 flex items-center gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest border-gray-100 hover:bg-white text-gray-400"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={cn(
                  "flex-1 h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95",
                  buttonColors[type]
                )}
              >
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
