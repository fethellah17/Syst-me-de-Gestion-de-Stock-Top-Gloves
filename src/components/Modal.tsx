import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footer?: React.ReactNode;
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  maxWidth = "max-w-md", 
  maxHeight = "max-h-[90vh]", 
  className = "",
  headerClassName = "",
  bodyClassName = "",
  footer,
  hideCloseButton = false
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative bg-white border border-gray-200 rounded-lg shadow-lg ${maxWidth} w-[95vw] ${maxHeight} overflow-hidden flex flex-col ${className}`}>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0 ${headerClassName}`}>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {!hideCloseButton && (
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-900"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className={`overflow-y-auto ${bodyClassName}`}>{children}</div>
        {footer && (
          <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
