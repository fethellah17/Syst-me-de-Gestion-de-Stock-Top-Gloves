# ✅ Checklist Pré-Déploiement Vercel

## 🔍 Vérifications Automatiques

### 1. Fichiers de Configuration

- [x] ✅ `package.json` existe et contient le script `build`
- [x] ✅ `vercel.json` configuré correctement (routing SPA)
- [x] ✅ `.vercelignore` ne bloque pas les fichiers nécessaires
- [x] ✅ `.gitignore` configuré

### 2. Structure du Projet

```
✅ src/                  (Code source - DOIT être présent)
✅ public/               (Assets statiques - DOIT être présent)
✅ package.json          (Dépendances - DOIT être présent)
✅ vite.config.ts        (Config Vite - DOIT être présent)
✅ tsconfig.json         (Config TypeScript - DOIT être présent)
✅ index.html            (Point d'entrée - DOIT être présent)
❌ node_modules/         (Sera installé par Vercel)
❌ dist/                 (Sera généré par Vercel)
```

---

## 🧪 Tests Locaux

### Test 1 : Build Local

```bash
npm run build
```

**Résultat attendu :**
```
✓ built in XXXms
dist/index.html                   X.XX kB
dist/assets/index-XXXXX.js        XXX.XX kB
dist/assets/index-XXXXX.css       XX.XX kB
```

### Test 2 : Preview Local

```bash
npm run preview
```

**Résultat attendu :**
- Serveur démarre sur http://localhost:4173
- Application fonctionne correctement
- Navigation entre pages OK
- Refresh de page ne donne pas 404

### Test 3 : Tests Unitaires

```bash
npm run test
```

**Résultat attendu :**
- Tous les tests passent ✅

---

## 📋 Configuration Vercel

### Paramètres Détectés Automatiquement

| Paramètre | Valeur Attendue | Statut |
|-----------|-----------------|--------|
| Framework | Vite | ✅ Auto-détecté |
| Build Command | `npm run build` | ✅ Auto-détecté |
| Output Directory | `dist` | ✅ Auto-détecté |
| Install Command | `npm install` | ✅ Auto-détecté |
| Node Version | 18.x ou plus | ✅ Auto-détecté |

### Fichiers Critiques

```bash
# Vérifier que ces fichiers existent
ls -la package.json      # ✅ Doit exister
ls -la vite.config.ts    # ✅ Doit exister
ls -la index.html        # ✅ Doit exister
ls -la vercel.json       # ✅ Doit exister
ls -la src/              # ✅ Doit exister
ls -la public/           # ✅ Doit exister (si vous avez des assets)
```

---

## 🚫 Erreurs Communes à Éviter

### ❌ Erreur 1 : Exclure src/ ou public/

**Mauvais `.vercelignore` :**
```
src/        ← ❌ NE PAS FAIRE
public/     ← ❌ NE PAS FAIRE
```

**Bon `.vercelignore` :**
```
.git
.vscode
*.test.ts
*.md
!README.md
```

### ❌ Erreur 2 : Build Command Incorrect

**Mauvais `vercel.json` :**
```json
{
  "buildCommand": "npm build"  ← ❌ Incorrect
}
```

**Bon `vercel.json` :**
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Laissez Vercel détecter automatiquement !

### ❌ Erreur 3 : Dépendances Manquantes

Vérifiez que toutes les dépendances sont dans `package.json` :

```bash
npm install
npm run build
```

Si ça marche localement, ça marchera sur Vercel.

---

## ✅ Checklist Finale

Avant de déployer, cochez :

- [ ] Build local réussi (`npm run build`)
- [ ] Preview local fonctionne (`npm run preview`)
- [ ] Tests passent (`npm run test`)
- [ ] Pas d'erreurs TypeScript (`npm run lint`)
- [ ] `src/` et `public/` ne sont PAS dans `.vercelignore`
- [ ] `vercel.json` est simplifié (routing SPA uniquement)
- [ ] `package.json` contient le script `"build": "vite build"`
- [ ] Compte Vercel créé
- [ ] Repository Git prêt (si déploiement via GitHub)

---

## 🚀 Commandes de Déploiement

### Via GitHub (Recommandé)

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push
```

Puis sur Vercel : Import Project → Sélectionner le repo → Deploy

### Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 📊 Après le Déploiement

### Vérifications Post-Déploiement

1. **Build Status** ✅
   - Dashboard Vercel → Status "Ready"
   - Pas d'erreurs dans les logs

2. **Application Accessible** ✅
   - URL fonctionne : `https://votre-projet.vercel.app`
   - Page d'accueil charge

3. **Routing Fonctionne** ✅
   - Navigation : `/dashboard`, `/articles`, etc.
   - Refresh de page ne donne pas 404
   - Bouton retour du navigateur fonctionne

4. **Fonctionnalités** ✅
   - Login fonctionne
   - CRUD articles fonctionne
   - Mouvements fonctionnent
   - Inventaire fonctionne

---

## 🐛 Troubleshooting

### Si le Build Échoue

1. **Vérifier les logs Vercel**
   - Dashboard → Deployments → Logs

2. **Reproduire localement**
   ```bash
   rm -rf node_modules dist
   npm install
   npm run build
   ```

3. **Vérifier les dépendances**
   ```bash
   npm outdated
   npm audit
   ```

### Si 404 sur Refresh

✅ Déjà résolu avec `vercel.json` (rewrites configurés)

### Si Assets ne Chargent Pas

Vérifier que `public/` n'est pas dans `.vercelignore`

---

## 📞 Support

- **Documentation Fix :** `VERCEL_FIX.md`
- **Guide Complet :** `DEPLOYMENT_GUIDE.md`
- **Vercel Docs :** https://vercel.com/docs
- **Vercel Support :** https://vercel.com/support

---

**Tout est prêt ! Vous pouvez déployer en toute confiance. 🚀**
