# StudioDourliac — Project Context

> **Source of Truth** for development progress. Keep this document updated incrementally.

---

## 1. Vision & Mission

**StudioDourliac** is a specialized application designed to **optimize Etsy T-shirt business workflows**, with a primary focus on SEO (Titles, Keywords, Tags) for Print-on-Demand products.

**Key Metaphor**: A digital laboratory floating in a dark void — where creativity meets precision commerce.

---

## 2. Current Project Phase

### Phase 1: Catalog
The core interface for creating and managing product "Designs" (internally referred to as "Aphorismes").

| Status | Description |
|--------|-------------|
| 🟢 Active | Building the Catalog page and design entry system |
| ⏳ Pending | Piloting page (placeholder) |

---

## 3. Tech Stack Audit

| Layer | Technology | Version |
|-------|------------|---------|
| **Framework** | React | 19.2.0 |
| **Language** | TypeScript | 5.9.3 |
| **Build Tool** | Vite | 7.2.4 |
| **Styling** | Tailwind CSS | 3.4.19 |
| **Animations** | Framer Motion | 12.33.0 |
| **Icons** | Lucide React | 0.563.0 |
| **Database** | Supabase (PostgreSQL) | 2.95.3 |
| **Routing** | React Router DOM | 7.13.0 |
| **Utils** | clsx, tailwind-merge | Latest |

### UI Design System
- **Theme**: Dark-Cyber-Professional
- **Palette**: Void backgrounds (`#0B0E13`, `#15181E`) + Neon accents (`#06B6D4`)
- **Typography**: Inter (UI), Playfair Display (Aphorisms), JetBrains Mono (Data)
- **Effects**: Glassmorphism, Neon glow, Tech corners

---

## 4. Project Status Checklist — Phase 1

### Core Infrastructure
- [x] Vite + React + TypeScript setup
- [x] Tailwind CSS configured with custom void/neon tokens
- [x] Supabase client initialized
- [x] React Router DOM configured
- [x] Error Boundary component

### Layout & Navigation
- [x] Persistent sidebar (Layout component)
- [x] Catalog page route
- [x] Piloting page placeholder

### Catalog Page Features
- [x] Design grid display (responsive, 2-5 cols)
- [x] DesignCard component (vertical layout, bottom thumbnails)
- [x] Search/filter functionality
- [x] "Nouveau Design" button (Neon CTA)
- [x] CreateDesignPanel (side drawer)
- [x] Theme → Niche → Sub-Niche cascading selects
- [x] Multi-image upload to Supabase Storage
- [x] Mockup management (Gallery view, Delete functionality)
- [x] Empty state placeholder

### Database Integration
- [x] Supabase connection working
- [x] Fetching designs with relations
- [x] Create/Edit design form submission
- [x] Image upload to `mockups/` bucket
- [x] Deleting design mockups

### SEO Analysis Feature
- [x] SEO Analysis Page (`/seo-analysis/:id`)
- [x] Webhook integration (n8n)
- [x] Results display with Sparklines & Indicators
- [x] Navigation from Catalog (Loupe icon)

---

## 5. Database Schema Map

```
┌─────────────────────────────────────────────────────────────┐
│                    STEERING TABLES                          │
├─────────────────────────────────────────────────────────────┤
│  themes          niches              sub_niches             │
│  ├─ id (PK)      ├─ id (PK)          ├─ id (PK)            │
│  └─ name         ├─ theme_id (FK)    ├─ niche_id (FK)      │
│                  └─ name             └─ name               │
│         ↓                ↓                                  │
│      1:N             1:N                                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     CORE TABLES                             │
├─────────────────────────────────────────────────────────────┤
│  designs                          design_mockups            │
│  ├─ id (PK)                       ├─ id (PK)               │
│  ├─ title (required)              ├─ design_id (FK)        │
│  ├─ slogan                        ├─ storage_url           │
│  ├─ theme_id (FK)                 └─ is_primary            │
│  ├─ niche_id (FK)                                          │
│  ├─ sub_niche_id (FK)                                      │
│  └─ description                                            │
│  └─ created_at                                             │
│              │                                              │
│              └───────────────── 1:N ────────────────────────┤
└─────────────────────────────────────────────────────────────┘
```

### Seed Data Reference
| Table | Sample Values |
|-------|---------------|
| themes | Sports & Physical Activities, Professions & Trades, Hobbies & Passions, Holidays & Seasons, Life Events & Milestone |
| niches (Professions) | Teachers, Nurses, Police |
| sub_niches (Teachers) | Elementary Teacher, English Teacher |

---

## 6. Next Immediate Steps

| Priority | Task | Details |
|----------|------|---------|
| 🔴 **1** | Design Details Page | Create a dedicated page for viewing full design details and larger mockups |
| 🟠 **2** | Filter by Metadata | Add filtering by Theme/Niche in the Catalog header |
| 🟡 **3** | Pagination / Infinite Scroll | Handle large numbers of designs efficiently |

---

## 7. Key File References

| Purpose | Path |
|---------|------|
| Design System | `docs/styleguide.md` |
| Full PRD | `docs/PRD.md` |
| Agent Rules | `.agent/rules/` |
| Main Layout | `src/components/Layout.tsx` |
| Catalog Page | `src/pages/Catalog.tsx` |
| Design Form | `src/components/forms/CreateDesignPanel.tsx` |

---

*Last Updated: 2026-02-07*
