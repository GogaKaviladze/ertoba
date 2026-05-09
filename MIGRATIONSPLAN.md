# Ertoba — Migrationsplan (Ertoba-Analytics → ertoba)

> **Ziel:** Neues GitHub-Repo `ertoba` mit Next.js-App direkt an Root (keine Unterordner-Struktur). Sauberer Start für externe Contributors.

**Aktuell:** `github.com/GogaKaviladze/Ertoba-Analytics` — App in `ertoba-analytics-dashboard/`
**Ziel:** `github.com/GogaKaviladze/ertoba` — App direkt an Root

---

## Phase 1 — Lokales Verzeichnis aufsetzen

- [ ] **1.1** Neues Verzeichnis erstellen
  ```bash
  mkdir "/Volumes/SSD Extern 1TB/DevData/GitHub/ertoba"
  cd "/Volumes/SSD Extern 1TB/DevData/GitHub/ertoba"
  git init
  ```

- [ ] **1.2** Next.js-App-Dateien kopieren (flatten: aus `ertoba-analytics-dashboard/` → Root)
  ```bash
  SRC="/Volumes/SSD Extern 1TB/DevData/GitHub/Ertoba-Analytics/ertoba-analytics-dashboard"
  DEST="/Volumes/SSD Extern 1TB/DevData/GitHub/ertoba"

  # App-Code
  cp -r "$SRC/src"           "$DEST/src"
  cp -r "$SRC/prisma"        "$DEST/prisma"
  cp -r "$SRC/tests"         "$DEST/tests"
  cp -r "$SRC/data"          "$DEST/data"
  cp -r "$SRC/scripts"       "$DEST/scripts"
  cp -r "$SRC/docs"          "$DEST/docs"

  # Config-Dateien
  cp "$SRC/package.json"         "$DEST/package.json"
  cp "$SRC/package-lock.json"    "$DEST/package-lock.json"
  cp "$SRC/tsconfig.json"        "$DEST/tsconfig.json"
  cp "$SRC/next.config.ts"       "$DEST/next.config.ts"
  cp "$SRC/prisma.config.ts"     "$DEST/prisma.config.ts"
  cp "$SRC/postcss.config.mjs"   "$DEST/postcss.config.mjs"
  cp "$SRC/playwright.config.ts" "$DEST/playwright.config.ts"
  cp "$SRC/eslint.config.mjs"    "$DEST/eslint.config.mjs"
  cp "$SRC/components.json"      "$DEST/components.json"
  cp "$SRC/.env.example"         "$DEST/.env.example"
  cp "$SRC/.vercelignore"        "$DEST/.vercelignore"
  ```

- [ ] **1.3** Repo-Root-Dateien kopieren
  ```bash
  ROOT="/Volumes/SSD Extern 1TB/DevData/GitHub/Ertoba-Analytics"

  cp -r "$ROOT/agents"          "$DEST/agents"
  cp -r "$ROOT/.github"         "$DEST/.github"
  cp "$ROOT/requirements.txt"   "$DEST/requirements.txt"
  cp "$ROOT/README.md"          "$DEST/README.md"
  cp "$ROOT/SETUP.md"           "$DEST/SETUP.md"
  cp "$ROOT/CONTRIBUTING.md"    "$DEST/CONTRIBUTING.md"
  cp "$ROOT/ROADMAP.md"         "$DEST/ROADMAP.md"
  cp "$ROOT/CLAUDE.md"          "$DEST/CLAUDE.md"
  cp "$ROOT/SECURITY.md"        "$DEST/SECURITY.md"
  cp "$ROOT/LICENSE"            "$DEST/LICENSE"
  cp "$ROOT/MIGRATIONSPLAN.md"  "$DEST/MIGRATIONSPLAN.md"
  ```

  **Nicht kopieren:**
  - `context/` — internes AI-Session-Management
  - `supabase/` — enthält Produktions-Credentials (.temp/)
  - `BUSINESS_STRATEGY.md` — internes Strategiedokument
  - `GEMINI.md` — AI-spezifische Konfiguration
  - `ertoba-analytics-dashboard/AGENTS.md`, `GEMINI.md`, `RLS_AUDIT.md`

---

## Phase 2 — Config-Dateien aktualisieren

- [ ] **2.1** `package.json` — Name ändern
  ```json
  "name": "ertoba"
  ```
  Zeile war: `"name": "ertoba-analytics-dashboard"`

- [ ] **2.2** `.gitignore` neu erstellen — Pfade jetzt an Root (kein `ertoba-analytics-dashboard/` Prefix)
  ```gitignore
  # Dependencies
  node_modules/
  .pnp
  .pnp.*

  # Next.js
  .next/
  out/
  build/
  coverage/
  playwright-report/
  test-results/

  # Env
  .env*
  !.env.example

  # Data (große JSON-Dateien)
  data/*.json
  !data/.gitkeep
  Propaganda.json

  # Python
  __pycache__/
  *.py[cod]
  .venv/
  venv/

  # Supabase CLI temp
  supabase/.temp/

  # OS
  .DS_Store
  *.pem
  .vercel
  *.tsbuildinfo
  next-env.d.ts
  /src/generated/prisma
  ```

- [ ] **2.3** `.github/workflows/db-migrate.yml` — Pfade aktualisieren
  - `working-directory: ertoba-analytics-dashboard` → entfernen (App jetzt an Root)
  - `paths: 'ertoba-analytics-dashboard/prisma/migrations/**'` → `'prisma/migrations/**'`
  - `cache-dependency-path: ertoba-analytics-dashboard/package-lock.json` → `package-lock.json`

---

## Phase 3 — Dokumentation aktualisieren

- [ ] **3.1** `SETUP.md` — `cd ertoba-analytics-dashboard` aus allen Schritten entfernen
  - Schritt 1 war: `cd Ertoba-Analytics/ertoba-analytics-dashboard` → `cd ertoba`

- [ ] **3.2** `README.md` — Clone-Befehl prüfen
  ```bash
  git clone https://github.com/GogaKaviladze/ertoba.git
  cd ertoba
  npm install
  ```

---

## Phase 4 — GitHub Repo erstellen & pushen

- [ ] **4.1** GitHub Repo erstellen
  ```bash
  cd "/Volumes/SSD Extern 1TB/DevData/GitHub/ertoba"
  gh repo create ertoba --public --description "Privacy-first OSINT Platform for psychological assessments, media intelligence, and organizational analysis"
  ```

- [ ] **4.2** Remote setzen und initialen Commit pushen
  ```bash
  git add .
  git commit -m "feat: initial commit — ertoba platform (migrated from Ertoba-Analytics)"
  git branch -M main
  git remote add origin https://github.com/GogaKaviladze/ertoba.git
  git push -u origin main
  ```

---

## Phase 5 — Vercel verbinden

- [ ] **5.1** Vercel Dashboard öffnen → Add New Project → Import `ertoba`

- [ ] **5.2** Root Directory auf `.` setzen (war vorher `ertoba-analytics-dashboard`)

- [ ] **5.3** Environment Variables übertragen (aus altem Projekt kopieren):
  - `DATABASE_URL`
  - `DIRECT_URL`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `ASSESSMENT_ENCRYPTION_KEY`
  - `NEXT_PUBLIC_SITE_URL`

- [ ] **5.4** Ersten Deploy triggern und Build-Log prüfen

---

## Phase 6 — Verifizierung lokal

- [ ] **6.1** Dependencies installieren und Build testen
  ```bash
  cd "/Volumes/SSD Extern 1TB/DevData/GitHub/ertoba"
  npm install
  npm run build
  ```
  Erwartet: `✓ Compiled successfully`

- [ ] **6.2** Prisma generieren
  ```bash
  npx prisma generate
  ```

- [ ] **6.3** Dev-Server starten und manuell prüfen
  ```bash
  npm run dev
  # → http://localhost:3000 öffnen
  # Prüfen: Login, Dashboard, Assessments, Profil
  ```

---

## Phase 7 — Wichtige Issues neu erstellen

Die folgenden Issues aus `Ertoba-Analytics` manuell im neuen Repo neu anlegen:

- [ ] **7.1** Issue #103 — iPhone 8 Button-Darstellung (Bug)
- [ ] **7.2** Issue #105 — Landing Page strukturieren
- [ ] **7.3** Issue #22 — Zeitverlauf-Chart (Recharts AreaChart) [P2]
- [ ] **7.4** Issue #26 — ERTC Marketplace [P3]
- [ ] **7.5** Issue #29 — Mehr Assessment-Typen [P3]

  ```bash
  # Beispiel:
  gh issue create --repo GogaKaviladze/ertoba \
    --title "iPhone 8: Button nicht sichtbar" \
    --body "Bug aus altem Repo #103 — Button auf kleinen Screens nicht korrekt dargestellt"
  ```

---

## Phase 8 — Altes Repo archivieren

- [ ] **8.1** `Ertoba-Analytics` auf GitHub archivieren
  - GitHub → Settings → Danger Zone → Archive this repository
  - Hinweis in README des alten Repos hinzufügen: "⚠️ Dieses Repo ist archiviert. Neues Repo: github.com/GogaKaviladze/ertoba"

---

## Checkliste: Bereit für Contributors?

Nach Abschluss aller Phasen:

- [ ] `git clone → npm install → npm run dev` funktioniert in unter 5 Minuten
- [ ] `npm run build` läuft ohne Fehler
- [ ] Vercel Deploy ist grün
- [ ] README zeigt korrekte Repo-URL
- [ ] SETUP.md hat keine `ertoba-analytics-dashboard` Pfade mehr
- [ ] `supabase/.temp/` nicht im Repo
- [ ] Kein `context/` Ordner sichtbar
