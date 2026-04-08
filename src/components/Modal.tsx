import { X } from "lucide-react";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  maxHeight?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = "max-w-md", maxHeight = "max-h-[90vh]" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-card border rounded-lg shadow-lg ${maxWidth} ${maxHeight} overflow-y-auto`}>
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
