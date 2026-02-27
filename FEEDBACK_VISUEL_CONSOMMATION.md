# Feedback Visuel : Animation du Badge "Consommation / Jour"

## 🎨 Effet Visuel Implémenté

Quand une sortie est approuvée et la consommation du jour augmente, le badge affiche une animation de "brillance" pour attirer l'attention du directeur.

## 📊 Détails de l'Animation

### 1. Composant `ConsumptionBadge`

```typescript
const ConsumptionBadge = ({ value, articleRef }: { value: number; articleRef: string }) => {
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  useEffect(() => {
    if (value !== previousValue) {
      setIsHighlighted(true);
      setPreviousValue(value);
      
      // Retirer l'animation après 600ms
      const timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);
  
  // ...
}
```

### 2. Effets Appliqués Pendant l'Animation

Quand `isHighlighted = true` :

✨ **Couleur** : Orange plus intense (`bg-orange-200` → `bg-orange-900`)
✨ **Bordure** : Plus visible (`border-orange-400`)
✨ **Ombre** : Glow effect (`shadow-lg shadow-orange-400/50`)
✨ **Échelle** : Légère augmentation (`scale-110`)
✨ **Icône Flame** : Animation pulse (`animate-pulse`)

### 3. Durée de l'Animation

- **Déclenchement** : Immédiat quand la valeur change
- **Durée** : 600ms (0.6 secondes)
- **Transition** : Smooth (`transition-all duration-300`)

## 🔄 Flux de Mise à Jour

```
Utilisateur clique "Approuver la Sortie"
    ↓
Mouvement passe à statut "Terminé"
    ↓
dailyConsumptionMap recalculé
    ↓
ConsumptionBadge reçoit nouvelle valeur
    ↓
useEffect détecte le changement
    ↓
isHighlighted = true
    ↓
Badge brille pendant 600ms ✨
    ↓
isHighlighted = false
    ↓
Badge revient à l'état normal
```

## 📸 Exemple Visuel

### Avant approbation
```
🔥 100
```
(Badge orange normal)

### Pendant l'approbation (+50)
```
🔥 150
```
(Badge orange intense avec glow et pulse)

### Après 600ms
```
🔥 150
```
(Badge revient à l'état normal)

## 🎯 Cas d'Usage

### Cas 1 : Première sortie du jour
- Avant : `🔥 0`
- Approuve 50 unités
- Pendant animation : `🔥 50` (brille)
- Après : `🔥 50` (normal)

### Cas 2 : Deuxième sortie du jour
- Avant : `🔥 100`
- Approuve 75 unités
- Pendant animation : `🔥 175` (brille)
- Après : `🔥 175` (normal)

### Cas 3 : Aucun changement
- Avant : `🔥 100`
- Rejet d'une sortie (statut ≠ "Terminé")
- Pas d'animation (valeur inchangée)
- Après : `🔥 100` (normal)

## 🎨 Animations CSS

**Fichier** : `src/styles/consumption-animation.css`

### Animation `consumptionPulse`
```css
@keyframes consumptionPulse {
  0% { opacity: 1; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
  100% { opacity: 1; transform: scale(1); }
}
```

### Animation `flameFlicker`
```css
@keyframes flameFlicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

## 🔧 Personnalisation

Pour modifier l'animation, éditer `src/styles/consumption-animation.css` :

- **Durée** : Changer `0.6s` à une autre valeur
- **Intensité du glow** : Modifier `shadow-orange-400/50`
- **Échelle** : Changer `scale-110` à `scale-105` ou `scale-115`
- **Couleur** : Remplacer `orange-*` par une autre couleur

## ✅ Avantages

✓ **Feedback immédiat** : L'utilisateur voit instantanément le changement
✓ **Attention visuelle** : L'animation attire l'œil du directeur
✓ **Non-intrusif** : L'animation dure seulement 600ms
✓ **Accessible** : Fonctionne sur tous les navigateurs modernes
✓ **Performance** : Utilise CSS transitions (GPU accelerated)

## 🧪 Test Manuel

1. Aller à la page **Articles**
2. Vérifier la colonne **"Consommation / Jour"**
3. Aller à la page **Mouvements**
4. Créer une nouvelle **Sortie**
5. Cliquer sur **"Passer le contrôle qualité"**
6. Cliquer sur **"Approuver la Sortie"**
7. Retourner à la page **Articles**
8. **Observer l'animation du badge** ✨

Le badge doit briller pendant 600ms, puis revenir à l'état normal.
