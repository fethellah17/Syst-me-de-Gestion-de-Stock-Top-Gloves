import { useState } from "react";

interface UnitBadgeProps {
  unit: string;
}

const UNIT_CONFIG = {
  paire: {
    abbreviation: "P",
    fullName: "Paire",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    borderColor: "border-blue-200",
  },
  unité: {
    abbreviation: "U",
    fullName: "Unité",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
    borderColor: "border-green-200",
  },
  boîte: {
    abbreviation: "B",
    fullName: "Boîte",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
};

export const UnitBadge = ({ unit }: UnitBadgeProps) => {
  const [showTooltip, setShowTooltip] = useState(false);
  
  const normalizedUnit = unit.toLowerCase();
  const config = UNIT_CONFIG[normalizedUnit as keyof typeof UNIT_CONFIG] || {
    abbreviation: unit.charAt(0).toUpperCase(),
    fullName: unit,
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
    borderColor: "border-gray-200",
  };

  return (
    <div className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold border cursor-default ${config.bgColor} ${config.textColor} ${config.borderColor}`}
      >
        {config.abbreviation}
      </span>
      
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-foreground text-background text-xs rounded whitespace-nowrap z-10 pointer-events-none">
          {config.fullName}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
};
