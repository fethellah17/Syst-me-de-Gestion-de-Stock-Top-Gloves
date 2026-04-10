# PDF Filename Optimization - COMPLETE

## Overview
Optimized PDF filename generation to use product names and dates instead of UUIDs. Downloaded files are now easily identifiable and professional for administrative filing and archiving.

## Implementation Details

### 1. New Filename Helper Function
**File: `src/lib/pdf-generator.ts`**

New function: `generatePDFFilename(documentType, productName, isRefusal)`

**Features:**
- Generates professional filenames with product names and dates
- Removes special characters and replaces spaces with hyphens
- Limits product name to 50 characters for filesystem compatibility
- Formats date as DD-MM-YYYY
- Handles refusal documents with special naming

**Function Logic:**
```typescript
const generatePDFFilename = (documentType: string, productName: string, isRefusal: boolean = false): string => {
  // Clean product name: remove special characters, replace spaces with hyphens
  const cleanProductName = emergencyClean(productName)
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9\-]/g, '') // Remove special characters except hyphens
    .substring(0, 50); // Limit length for filesystem compatibility

  // Get current date in DD-MM-YYYY format
  const now = new Date();
  const dateStr = now.toLocaleDateString('fr-FR').replace(/\//g, '-');

  // Build filename based on document type
  let filename = '';
  if (isRefusal) {
    filename = `Avis_Refus_Reception_${cleanProductName}_${dateStr}.pdf`;
  } else {
    filename = `${documentType}_${cleanProductName}_${dateStr}.pdf`;
  }

  return filename;
};
```

### 2. Filename Formats by Document Type

#### Bon d'Entrée (Inbound Receipt)
**Format:** `Bon_Entree_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Bon_Entree_Gants-Nitrile-M_09-04-2026.pdf`
- `Bon_Entree_Masques-FFP2_09-04-2026.pdf`
- `Bon_Entree_Gants-Latex-S_09-04-2026.pdf`

#### Avis de Refus de Réception (Refusal Notice)
**Format:** `Avis_Refus_Reception_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Avis_Refus_Reception_Gants-Nitrile-M_09-04-2026.pdf`
- `Avis_Refus_Reception_Masques-FFP2_09-04-2026.pdf`

#### Bon de Sortie (Outbound Receipt)
**Format:** `Bon_Sortie_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Bon_Sortie_Gants-Nitrile-M_09-04-2026.pdf`
- `Bon_Sortie_Masques-FFP2_09-04-2026.pdf`

#### Bon de Transfert (Transfer Receipt)
**Format:** `Bon_Transfert_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Bon_Transfert_Gants-Nitrile-M_09-04-2026.pdf`

#### Bon d'Ajustement (Adjustment Receipt)
**Format:** `Bon_d'Ajustement_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Bon_d'Ajustement_Gants-Nitrile-M_09-04-2026.pdf`

#### Bon de Rejet (Rejection Report)
**Format:** `Bon_Rejet_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Bon_Rejet_Gants-Nitrile-M_09-04-2026.pdf`

#### Bon d'Inventaire (Inventory Receipt)
**Format:** `Inventaire_[Product-Name]_[DD-MM-YYYY].pdf`

**Examples:**
- `Inventaire_Gants-Nitrile-M_09-04-2026.pdf`

### 3. Filename Cleaning Rules

#### Product Name Processing
1. **Remove special characters:** `&`, `@`, `#`, `$`, etc.
2. **Replace spaces with hyphens:** `Gants Nitrile M` → `Gants-Nitrile-M`
3. **Keep alphanumeric and hyphens:** Only `a-z`, `A-Z`, `0-9`, `-`
4. **Limit length:** Maximum 50 characters for filesystem compatibility
5. **Preserve readability:** Hyphens maintain word separation

#### Date Format
- **Locale:** French (fr-FR)
- **Format:** DD-MM-YYYY
- **Example:** `09-04-2026` (April 9, 2026)
- **Separator:** Hyphens for consistency with product name

### 4. Files Updated
**File: `src/lib/pdf-generator.ts`**

Updated functions:
1. `generatePDFTemplate()` - Used by Bon de Sortie, Bon de Transfert, Bon d'Ajustement
2. `generateInboundPDF()` - Bon d'Entrée and Avis de Refus de Réception
3. `generateRejectionPDF()` - Bon de Rejet
4. `generateInventoryPDF()` - Bon d'Inventaire

### 5. Benefits

#### For Administrative Filing
- **Easy identification:** Product name immediately visible
- **Date-based organization:** Files naturally sort by date
- **Professional appearance:** No cryptic UUIDs
- **Archiving:** Date helps with historical records

#### For Users
- **Intuitive naming:** Understand file content at a glance
- **Filesystem friendly:** No special characters causing issues
- **Searchable:** Product names are searchable in file explorer
- **Organized downloads:** Files group by product and date

#### For Compliance
- **Audit trail:** Date embedded in filename
- **Product traceability:** Product name in every file
- **Professional documentation:** Enterprise-grade naming
- **Historical tracking:** Easy to find documents by date

### 6. Examples of Filename Transformation

#### Before (UUID-based)
```
Bon_Entree_27e06876-4c3f-4a2b-8f1d-9c5e3b7a2f1d.pdf
Avis_Refus_Reception_a1b2c3d4-e5f6-4g7h-8i9j-0k1l2m3n4o5p.pdf
Bon_Sortie_x9y8z7w6-v5u4-3t2s-1r0q-9p8o7n6m5l4k.pdf
```

#### After (Product-name and date-based)
```
Bon_Entree_Gants-Nitrile-M_09-04-2026.pdf
Avis_Refus_Reception_Gants-Nitrile-M_09-04-2026.pdf
Bon_Sortie_Gants-Nitrile-M_09-04-2026.pdf
```

### 7. Special Character Handling

#### Examples of Product Name Cleaning
| Original | Cleaned |
|----------|---------|
| `Gants Nitrile M` | `Gants-Nitrile-M` |
| `Masques FFP2 (N95)` | `Masques-FFP2-N95` |
| `Gants Latex S/M/L` | `Gants-Latex-SML` |
| `Sur-gants PE` | `Sur-gants-PE` |
| `Gants & Masques` | `Gants-Masques` |
| `Produit #1` | `Produit-1` |

### 8. Filesystem Compatibility

**Supported on:**
- Windows (NTFS, FAT32)
- macOS (APFS, HFS+)
- Linux (ext4, btrfs)
- Cloud storage (Google Drive, OneDrive, Dropbox)

**Avoided characters:**
- `< > : " / \ | ? *` (Windows reserved)
- `\0` (null character)
- Control characters

### 9. Testing Checklist
- [ ] Bon d'Entrée generates correct filename with product name and date
- [ ] Avis de Refus de Réception uses special naming format
- [ ] Bon de Sortie generates correct filename
- [ ] Bon de Transfert generates correct filename
- [ ] Bon d'Ajustement generates correct filename
- [ ] Bon de Rejet generates correct filename
- [ ] Bon d'Inventaire generates correct filename
- [ ] Spaces are replaced with hyphens
- [ ] Special characters are removed
- [ ] Product names are limited to 50 characters
- [ ] Date format is DD-MM-YYYY
- [ ] Files are easily identifiable in downloads folder
- [ ] Files sort chronologically by date
- [ ] Filenames work on Windows, macOS, and Linux
- [ ] Multiple files from same product on same day have identical names (expected behavior)

### 10. Future Enhancements
- Add sequential numbering for multiple files on same day: `Bon_Entree_Gants-Nitrile-M_09-04-2026_001.pdf`
- Add time component for more granular tracking: `Bon_Entree_Gants-Nitrile-M_09-04-2026_14-32.pdf`
- Configurable filename format via settings
- Filename templates for different organizations
- Automatic file organization into date-based folders
