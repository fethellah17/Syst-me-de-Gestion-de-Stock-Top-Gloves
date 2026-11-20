import { useState } from "react";

interface CreatableSelectProps {
  options: Array<{ id: number; nom: string }>;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const CreatableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Sélectionner...",
  label,
  required = false,
}: CreatableSelectProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      {/* Standard Native Select - Lightweight & Fast */}
      <select
        value={value}
        onChange={handleChange}
        className="w-full h-9 px-3 rounded-md border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id} value={option.nom}>
            {option.nom}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CreatableSelect;
