# Malaysia Student Tools

Free academic tools for Malaysian university students. The first product is a
GPA & CGPA Calculator that supports university-specific grading systems.

**Live site:** Deployed via GitHub Pages (coming soon)

## Architecture

This is a **static website** — no backend, no framework, no SPA routing.

```
data/*.json          Source of truth for university grading rules
       |
    build.js         Custom Node.js static site generator
       |
  +---------+--------------------+
  |                              |
Static HTML              Generated JS bundle
(SEO pages)           (university-data.js)
  |                              |
  +--------- dist/ -------------+
                  |
           GitHub Pages
```

### Key principles

- **Data-driven:** University grading rules live in `data/universities/*.json`.
  The build script generates all pages and a JS data bundle from that JSON.
  Calculator logic never hard-codes university-specific rules.

- **Build-time data embedding:** Grading data is compiled into
  `js/university-data.js` at build time. No runtime `fetch()` calls for
  grading configuration — the calculator works offline and never fails due
  to JSON loading errors.

- **Verified data only:** A university's calculator pages are generated only
  when its status is `"verified"` in the registry. Pending universities
  appear in the registry but produce no calculator pages until their grading
  rules are confirmed from official sources.

- **Separation of concerns:** Calculator engine (`src/js/calculator/`) is
  pure math with no DOM dependencies. UI code (`src/js/ui/`) handles
  rendering. University data (`data/`) is independent of both.

## Directory structure

```
GPA Calculator/
├── PROJECT_SPEC.md          # Product master plan
├── README.md                # This file
├── package.json             # Scripts: build, test, clean, dev
├── build.js                 # Static site generator
├── .gitignore
│
├── data/
│   ├── universities.json    # Registry of all universities
│   └── universities/        # Per-university grading data
│       ├── utar.json
│       ├── ucsi.json
│       └── taylors.json
│
├── src/
│   ├── templates/
│   │   ├── layouts/         # base.html — shared HTML shell
│   │   ├── pages/           # Page templates with {{placeholders}}
│   │   └── partials/        # Reusable HTML fragments (nav, footer)
│   ├── js/
│   │   ├── calculator/      # GPA/CGPA calculation engines
│   │   ├── university/      # University data loader
│   │   ├── ui/              # DOM rendering (Phase 1)
│   │   └── utils/           # Validation, localStorage
│   ├── css/
│   │   └── style.css        # Mobile-first responsive styles
│   └── assets/
│       └── favicon.svg
│
├── tests/
│   ├── engine/              # Calculation engine unit tests
│   ├── data/                # University data schema validation
│   └── build/               # Build output structure tests
│
└── dist/                    # Generated output (git-ignored)
```

## Development

**Prerequisites:** Node.js 18+ (no npm dependencies needed)

```bash
# Build the static site
npm run build

# Run all tests
npm test

# Run specific test suites
npm run test:engine    # Calculation engine tests
npm run test:data      # University data schema tests
npm run test:build     # Build output tests (runs build first)

# Clean dist/
npm run clean

# Build and get instructions
npm run dev
```

## Adding a university

1. **Research** — Find the official grading system from Tier 1 sources
   (Student Handbook, Academic Regulations). See PROJECT_SPEC.md §4.

2. **Create data file** — Add `data/universities/{slug}.json` following the
   schema in existing files. Set `"status": "pending"` initially.

3. **Register** — Add an entry to `data/universities.json`.

4. **Verify** — Once grading data is confirmed from official sources,
   change status to `"verified"`, populate `grades` and `sources`.

5. **Build** — Run `npm run build`. The build script automatically generates
   GPA and CGPA calculator pages for all verified universities.

6. **Test** — Run `npm test` to validate the data schema and build output.

## University data schema (v1)

```jsonc
{
  "schema_version": 1,
  "id": "utar",
  "name": "Universiti Tunku Abdul Rahman",
  "short_name": "UTAR",
  "slug": "utar",
  "country": "MY",
  "status": "verified",        // "verified" | "pending"
  "levels": [{
    "level": "undergraduate",
    "scale": 4.0,
    "effective_from": "2024-01-01",
    "effective_to": null,       // null = current
    "grades": [
      { "grade": "A", "point": 4.00 },
      { "grade": "A-", "point": 3.67 }
      // mark_range is optional: { "min": 80, "max": 100 }
    ],
    "pass_fail_grades": ["P", "F"],
    "special_rules": {
      "pass_fail": { "counts_in_gpa": false, "notes": [] },
      "repeat_course": { "policy": "documented", "notes": [] },
      "mpu": { "counts_in_gpa": false, "notes": [] }
    }
  }],
  "sources": [{                // Multiple sources allowed
    "title": "UTAR Student Handbook",
    "url": "https://...",
    "type": "official_handbook",
    "verified_date": "2026-08-12"
  }],
  "notes": []                  // Free-form notes
}
```

## Phase roadmap

- [x] **Phase 0** — Architecture & data foundation
- [ ] **Phase 1** — Calculator UI (GPA single-semester)
- [ ] **Phase 2** — CGPA calculator (multi-semester)
- [ ] **Phase 3** — University data verification & SEO pages
- [ ] **Phase 4** — Mobile optimization & testing
- [ ] **Phase 5** — GitHub Pages deployment

See PROJECT_SPEC.md for the complete product plan.

## License

MIT
