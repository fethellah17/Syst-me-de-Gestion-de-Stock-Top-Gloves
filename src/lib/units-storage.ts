// Utility for managing units in localStorage

const UNITS_STORAGE_KEY = 'topgloves_units';

export interface Unit {
  name: string;
  symbol: string;
}

// Default units with symbols
const DEFAULT_UNITS: Unit[] = [
  { name: 'Paire', symbol: 'P' },
  { name: 'Unité', symbol: 'U' },
  { name: 'Boîte', symbol: 'B' },
  { name: 'Kg', symbol: 'Kg' },
  { name: 'Litre', symbol: 'L' },
  { name: 'Pièce', symbol: 'Pc' },
];

/**
 * Migrate old string-based units to new object-based format
 */
const migrateUnits = (units: any[]): Unit[] => {
  return units.map(u => {
    if (typeof u === 'string') {
      // Old format: convert string to object with default symbol (first letter)
      return {
        name: u,
        symbol: u.charAt(0).toUpperCase()
      };
    }
    // New format: already an object
    return u as Unit;
  });
};

export const getUnits = (): Unit[] => {
  try {
    const stored = localStorage.getItem(UNITS_STORAGE_KEY);
    console.log('getUnits - stored value:', stored);
    
    if (stored) {
      const units = JSON.parse(stored);
      console.log('getUnits - parsed units:', units);
      
      if (Array.isArray(units) && units.length > 0) {
        // Migrate if necessary
        const migratedUnits = migrateUnits(units);
        
        // Save migrated format back to localStorage
        if (typeof units[0] === 'string') {
          localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(migratedUnits));
          console.log('getUnits - migrated old format to new format');
        }
        
        return migratedUnits;
      }
    }
    
    // Initialize with default units
    console.log('getUnits - initializing with defaults:', DEFAULT_UNITS);
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(DEFAULT_UNITS));
    return DEFAULT_UNITS;
  } catch (error) {
    console.error('Error reading units from localStorage:', error);
    return DEFAULT_UNITS;
  }
};

/**
 * Get unit names only (for backward compatibility)
 */
export const getUnitNames = (): string[] => {
  return getUnits().map(u => u.name);
};

/**
 * Get symbol for a unit name
 */
export const getUnitSymbol = (unitName: string): string => {
  const units = getUnits();
  const unit = units.find(u => u.name.toLowerCase() === unitName.toLowerCase());
  return unit?.symbol || unitName.charAt(0).toUpperCase();
};

export const addUnit = (name: string, symbol: string): boolean => {
  try {
    const units = getUnits();
    const trimmedName = name.trim();
    const trimmedSymbol = symbol.trim();
    
    console.log('addUnit - current units:', units);
    console.log('addUnit - adding unit:', trimmedName, 'with symbol:', trimmedSymbol);
    
    if (!trimmedName) {
      console.log('addUnit - name is empty');
      return false;
    }
    
    // Use first letter as default symbol if not provided
    const finalSymbol = trimmedSymbol || trimmedName.charAt(0).toUpperCase();
    
    // Check for duplicates (case-insensitive)
    const isDuplicate = units.some(u => u.name.toLowerCase() === trimmedName.toLowerCase());
    console.log('addUnit - is duplicate:', isDuplicate);
    
    if (isDuplicate) {
      return false;
    }
    
    const updatedUnits = [...units, { name: trimmedName, symbol: finalSymbol }];
    console.log('addUnit - updated units:', updatedUnits);
    
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(updatedUnits));
    console.log('addUnit - saved to localStorage');
    
    return true;
  } catch (error) {
    console.error('Error adding unit to localStorage:', error);
    return false;
  }
};

export const updateUnit = (oldName: string, newName: string, newSymbol: string): boolean => {
  try {
    const units = getUnits();
    const trimmedName = newName.trim();
    const trimmedSymbol = newSymbol.trim();
    
    if (!trimmedName) {
      return false;
    }
    
    const finalSymbol = trimmedSymbol || trimmedName.charAt(0).toUpperCase();
    
    // Check if new name conflicts with another unit
    const isDuplicate = units.some(u => 
      u.name.toLowerCase() === trimmedName.toLowerCase() && 
      u.name !== oldName
    );
    
    if (isDuplicate) {
      return false;
    }
    
    const updatedUnits = units.map(u => 
      u.name === oldName 
        ? { name: trimmedName, symbol: finalSymbol }
        : u
    );
    
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(updatedUnits));
    console.log('updateUnit - updated unit:', oldName, 'to', trimmedName, finalSymbol);
    
    return true;
  } catch (error) {
    console.error('Error updating unit in localStorage:', error);
    return false;
  }
};

export const deleteUnit = (unitName: string): boolean => {
  try {
    const units = getUnits();
    console.log('deleteUnit - current units:', units);
    console.log('deleteUnit - deleting unit:', unitName);
    
    const updatedUnits = units.filter(u => u.name !== unitName);
    console.log('deleteUnit - updated units:', updatedUnits);
    
    // Prevent deleting all units
    if (updatedUnits.length === 0) {
      console.log('deleteUnit - cannot delete last unit');
      return false;
    }
    
    localStorage.setItem(UNITS_STORAGE_KEY, JSON.stringify(updatedUnits));
    console.log('deleteUnit - saved to localStorage');
    
    return true;
  } catch (error) {
    console.error('Error deleting unit from localStorage:', error);
    return false;
  }
};
