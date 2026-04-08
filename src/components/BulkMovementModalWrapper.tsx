import { X } from "lucide-react";
import React from "react";

interface BulkMovementModalWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BulkMovementModalWrapper: React.FC<BulkMovementModalWrapperProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      {/* Full-screen on mobile, 95vw on desktop */}
      <div className="relative bg-card border rounded-lg shadow-lg w-full h-screen md:w-[95vw] md:h-[90vh] flex flex-col md:rounded-lg rounded-none">
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
