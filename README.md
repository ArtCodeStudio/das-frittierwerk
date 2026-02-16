# Das Frittierwerk

Offizielle Website des Imbiss **Das Frittierwerk** (Wurster Nordseeküste). Statische Seite, gehostet auf **GitHub Pages**. Inhalte über YAML und Markdown editierbar.

---

## Funktionen

- **Speisekarte** — `menu.yml`, Kategorien und Preise
- **Kontakt & Anfahrt** — `contact.yml`, OpenStreetMap (OpenLayers)
- **Über uns / Qualität** — Markdown-Seiten
- **Galerie** — Bilder über `gallery.yml`, Assets in `src/assets/gallery/`
- **Navigation** — Einzelseite mit Ankerlinks zu allen Bereichen

---

## Inhalte bearbeiten

| Inhalt      | Datei |
|------------|-------|
| Speisekarte | [src/content/menu.yml](src/content/menu.yml) |
| Kontakt    | [src/content/contact.yml](src/content/contact.yml) |
| Galerie    | [src/content/gallery.yml](src/content/gallery.yml) |
| Über uns   | [src/content/about.md](src/content/about.md) |
| Qualität   | [src/content/quality.md](src/content/quality.md) |

Auf GitHub: Datei bearbeiten → speichern → nach Deploy ist es live.

---

## Deployment (GitHub Pages)

1. Repo auf GitHub (z. B. `ArtCodeStudio/das-frittier-werk`).
2. **Settings → Pages → Source:** **GitHub Actions** wählen.
3. Workflow: `.github/workflows/node-gh-pages.yml` — bei Push auf `main` wird gebaut und deployt.

URL: `https://artcodestudio.github.io/das-frittier-werk/` (oder Custom Domain).

---

## Tech-Stack

- **Build:** Vite
- **UI:** [Riba.js](https://github.com/ribajs/riba) — Web Components, Datenbindung, Binder wie gewohnt
- **Styling:** Bootstrap 5 (SCSS), Corporate Design
- **Templates:** Pug
- **Karte:** OpenLayers + OpenStreetMap
- **Schriften:** Fontsource (Palanquin)
- **Content:** YAML + Markdown zur Build-Zeit

**Lokal:** Node.js ≥ 24, Yarn 4. Ausgabe: `_site/`.

---

## Lokal bauen

```bash
yarn install
yarn build
yarn preview   # z. B. http://localhost:4173
```

Entwicklung mit Live-Reload:

```bash
yarn start
```

---

## Lizenz

MIT — siehe [LICENSE](LICENSE).
