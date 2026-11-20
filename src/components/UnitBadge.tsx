import { useState } from "react";
import { getUnitSymbol } from "@/lib/units-storage";

interface UnitBadgeProps {
  unit: string;
}

export const UnitBadge = ({ unit }: UnitBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Get the symbol from units storage
  const symbol = getUnitSymbol(unit);

  return (
    <div className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold border cursor-default bg-gray-100 text-gray-600 border-gray-200"
      >
        {symbol}
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10 pointer-events-none">
          {unit}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};
