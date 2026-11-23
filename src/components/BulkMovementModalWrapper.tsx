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
      {/* Full-screen on mobile, max-w-3xl w-[95vw] on desktop */}
      <div className="relative bg-card border rounded-lg shadow-lg w-full h-auto max-h-[calc(100vh-2rem)] md:max-w-3xl md:w-[95vw] flex flex-col md:rounded-lg rounded-none">
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-card z-10">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {/* Scrollable Content */}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
