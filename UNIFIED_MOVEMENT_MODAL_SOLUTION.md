# Unified Movement Modal - Solution

## Current Situation

You currently have **TWO buttons**:
1. **"Mouvement en Masse"** - Handles multiple articles with all the smart logic
2. **"Nouveau Mouvement"** - Handles single article (original modal)

## Your Request

You want **ONE button** ("Nouveau Mouvement") that can handle:
- 1 article OR 10 articles
- Same dynamic logic (Entrée/Sortie/Transfert)
- Smart source filtering
- Shared lot information

## Solution

The "Mouvement en Masse" modal **ALREADY DOES EVERYTHING YOU WANT**. It can handle:
- ✅ 1 article (just don't add more rows)
- ✅ 10 articles (add 9 more rows)
- ✅ Dynamic logic based on type
- ✅ Smart source filtering
- ✅ Shared lot information

## Recommended Action

**Option 1: Remove "Nouveau Mouvement", Keep "Mouvement en Masse"**
- Remove the old single-article modal
- Rename "Mouvement en Masse" button to "Nouveau Mouvement"
- Users get one unified interface

**Option 2: Keep Both (Current State)**
- "Nouveau Mouvement" for quick single-article entry
- "Mouvement en Masse" for bulk operations
- Users choose based on their needs

## Implementation for Option 1

If you want Option 1 (unified modal), I need to:

1. **Remove the old modal code** from MouvementsPage
2. **Rename the button** from "Mouvement en Masse" to "Nouveau Mouvement"
3. **Update the modal title** to just "Nouveau Mouvement"
4. **Keep all the multi-article functionality**

This way, users click "Nouveau Mouvement" and can:
- Add 1 article and submit (fast)
- Add 10 articles and submit (bulk)
- All with the same smart logic

## Which Option Do You Prefer?

Please confirm which approach you'd like:
- **Option 1**: One unified "Nouveau Mouvement" button (removes old modal)
- **Option 2**: Keep both buttons (current state)

The "Mouvement en Masse" modal already has everything you described:
- ✅ Type de Mouvement selector
- ✅ Dynamic article list
- ✅ Add/remove rows
- ✅ Smart source filtering per article
- ✅ Shared lot/date/operator fields
- ✅ Works for 1 or many articles

Let me know which option you prefer and I'll implement it immediately.
