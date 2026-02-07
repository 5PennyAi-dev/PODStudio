# Product Requirements Document (PRD): StudioDourliac - Phase 1 (Catalog)

## 1. Project Overview
**StudioDourliac** is a specialized application designed to optimize Etsy T-shirt business workflows, focusing on SEO (Titles, Keywords, Tags). 
Phase 1 focuses on the **Catalog Page**, the core interface for creating and managing product "Designs".

## 2. Tech Stack & Style
- **Frontend:** React.js with TypeScript
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui & Framer Motion (for animations)
- **Database & Auth:** Supabase (PostgreSQL, Storage, and Edge Functions)
- **Storage:** Supabase Buckets (for design mockups)
- **UI Style:** "Dark-Cyber-Professional" (Refer to `@docs/styleguide.md`)
- **Navigation:** Persistent Sidebar (Left)

## 3. Database Schema (Supabase)
The LLM should generate the following tables:

### A. Steering Tables (Taxonomy)
1.  **themes**: 
    - `id` (uuid, PK), `name` (text, unique).
    - *Seeds:* "Sports & Physical Activities", "Professions & Trades", "Hobbies & Passions", "Holidays & Seasons", "Life Events & Milestone".
2.  **niches**: 
    - `id` (uuid, PK), `theme_id` (FK to themes), `name` (text).
    - *Seeds (for Professions):* "Teachers", "Nurses", "Police".
3.  **sub_niches**: 
    - `id` (uuid, PK), `niche_id` (FK to niches), `name` (text).
    - *Seeds (for Teachers):* "Elementary Teacher", "English Teacher".

### B. Core Tables
4.  **designs**:
    - `id` (uuid, PK), `title` (text, mandatory), `slogan` (text, optional), `theme_id` (FK), `niche_id` (FK), `sub_niche_id` (FK), `created_at` (timestamp).
5.  **design_mockups**:
    - `id` (uuid, PK), `design_id` (FK to designs), `storage_url` (text), `is_primary` (boolean).

## 4. Feature Requirements

### 4.1 Layout & Navigation
- **Left Sidebar:**
    - Item 1: **Catalog** (Active)
    - Item 2: **Piloting** (Placeholder/Empty for now)
- **Main View:** A responsive grid of "Design Cards".
- **Action:** A "New Design" button (prominent, styled in Cyber-Professional theme).

### 4.2 Create New Design (Side Panel)
When clicking "New Design", a **Slide-over / Side Drawer** opens:
- **Form Fields:**
    - `Title`: Text input (Required).
    - `Slogan`: Text input (e.g., "DOG MOM").
    - `Mockup Upload`: Drag & Drop zone for images. Files must be uploaded to the Supabase Bucket `mockups/`.
    - `Theme`: Select dropdown (fetched from `themes`).
    - `Niche`: Select dropdown (filtered by selected Theme).
    - `Sub-Niche`: Select dropdown (filtered by selected Niche).
- **Logic:** A Design can have multiple images/illustrations associated with it.

### 4.3 Catalog Display (Gallery)
- Display each Design as a **Card**.
- **Card Content:**
    - Thumbnail of the primary mockup.
    - Design Title (bold).
    - Slogan (italicized/secondary text).
    - Badges for Theme, Niche, and Sub-niche.
- **Empty State:** If no mockups exist, show a themed placeholder image.

## 5. UI/UX & Aesthetics
- **Theme:** Dark-Cyber-Professional.
- Use high-contrast accents (e.g., neon cyan or purple) against deep charcoal/black backgrounds.
- Borders should be sharp or slightly geometric.
- Cards should have a subtle hover effect (glow or border transition).

## 6. Prompt for the Coder LLM
> "Based on the PRD above, focus on the Catalog page and the Side Panel for data entry. Ensure the 'Theme -> Niche -> Sub-niche' cascading logic works in the form. Apply the Dark-Cyber-Professional style strictly as per the documentation provided."
The database PODStudio already exist and here are the KEYS you need:
VITE_SUPABASE_URL:https://assvfolcuchclautzgui.supabase.co
VITE_SUPABASE_ANON_KEY:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzc3Zmb2xjdWNoY2xhdXR6Z3VpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NjEzNTEsImV4cCI6MjA4NjAzNzM1MX0.53usSAaG_AApC7F783E4h-zOpSFXXdGhoGsJkxVViR4






Style guide: 
# Studio Dourliac - Dark Cyber-Professional Design System

This document serves as the **single source of truth** for the application's visual language. All future development must strictly adhere to these specifications.

## 1. Core Philosophy
- **Vibe**: High-end OLED Tech, "Void" aesthetics, Precision, Neo-Brutalism nuances.
- **Key Metaphor**: A digital laboratory floating in a dark void.
- **Rules**:
    - **Never use pure black (#000)** for surfaces; use it only for the deepest void backgrounds or image mattes.
    - **Neon is for Action**: Cyan (#06B6D4) indicates interactivity. Don't overuse it for decoration.
    - **Glass is for Layering**: Use backdrop blur to create depth between panels.

## 2. Color Palette (Tailwind Tokens)

### The Void (Backgrounds)
| Token | Hex | Usage |
|-------|-----|-------|
| `bg-void-bg` | `#0B0E13` | Main app background. Deepest layer. |
| `bg-void-surface` | `#15181E` | Panels, cards, sidebars. slightly lighter. |
| `border-void-border` | `#2A2F3A` | Subtle borders for structure. |

### The Energy (Accents)
| Token | Hex | Usage |
|-------|-----|-------|
| `text-neon-accent` | `#06B6D4` | Primary actions, key data, active states. |
| `bg-neon-accent` | `#06B6D4` | Buttons, progress bars. |
| `shadow-neon` | *Custom* | Glow effect for active elements. |
| `text-purple-400` | `#C084FC` | Secondary creative actions (AI, Magic). |
| `text-green-400` | `#4ADE80` | Success, "Accept" actions. |
| `text-red-500` | `#EF4444` | Destructive, "Reject" actions. |

### Typography & readability
| Token | Hex | Usage |
|-------|-----|-------|
| `text-void-text-main` | `#FFFFFF` | Primary headings, clear reading text. |
| `text-void-text-muted` | `#9CA3AF` | Labels, secondary info, placeholders. |

## 3. Typography System
- **Interface**: `font-ui` ('Inter', sans-serif) - Clean, legible, technical.
- **Aphorisms**: `font-serif` ('Playfair Display') - Elegant, contrasting with the tech vibe.
- **Data/Code**: `font-mono` ('JetBrains Mono') - For values, seeds, coordinates.

## 4. UI Patterns & Components

### 4.1. Panels & Cards
Standard container style for layout sections.
```tsx
<div className="bg-void-surface border border-void-border rounded-xl p-6">
  {/* Content */}
</div>
```

### 4.2. Glassmorphism
Used for floating elements like Drawers or overlays.
```tsx
<div className="bg-void-surface/50 backdrop-blur-sm border-l border-void-border">
   {/* Content */}
</div>
```

### 4.3. Primary Action Button
The "Neon Glow" button for main calls to action.
```tsx
<button className="relative overflow-hidden rounded-xl font-bold text-black shadow-neon transition-all hover:scale-[1.02]">
    <div className="absolute inset-0 bg-neon-accent hover:bg-cyan-400 transition-colors"></div>
    <div className="relative flex items-center gap-2">
        <span>ACTION</span>
    </div>
</button>
```

### 4.4. Tech Decorations
Use "Tech Corners" or mono-spaced data labels to enhance the professional feel.
```tsx
{/* Tech Corner Top-Left */}
<div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-void-border/50 rounded-tl-xl"></div>
```

## 5. Spacing & Layout
- **Border Radius**: Use `rounded-xl` (16px) for standard UI elements, `rounded-2xl` (24px) for large containers.
- **Spacing**: Use standard Tailwind spacing (4, 6, 8). Avoid arbitrary pixel values.
- **Scrollbars**: Thin, custom styled scrollbars are mandatory for internal panels.
  - `scrollbar-thin scrollbar-thumb-void-border scrollbar-track-transparent`

## 6. Icons
- Use **Lucide React**.
- Stroke width: default or `stroke-[1.5px]` for a more elegant look.
- Size: Standardize on `size={16}` for inline, `size={20}` for headers.





SCHÉMA de la base SQL:
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.design_mockups (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  design_id uuid NOT NULL,
  storage_url text NOT NULL,
  is_primary boolean DEFAULT false,
  CONSTRAINT design_mockups_pkey PRIMARY KEY (id),
  CONSTRAINT design_mockups_design_id_fkey FOREIGN KEY (design_id) REFERENCES public.designs(id)
);
CREATE TABLE public.designs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  slogan text,
  theme_id uuid,
  niche_id uuid,
  sub_niche_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT designs_pkey PRIMARY KEY (id),
  CONSTRAINT designs_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id),
  CONSTRAINT designs_niche_id_fkey FOREIGN KEY (niche_id) REFERENCES public.niches(id),
  CONSTRAINT designs_sub_niche_id_fkey FOREIGN KEY (sub_niche_id) REFERENCES public.sub_niches(id)
);
CREATE TABLE public.niches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  theme_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT niches_pkey PRIMARY KEY (id),
  CONSTRAINT niches_theme_id_fkey FOREIGN KEY (theme_id) REFERENCES public.themes(id)
);
CREATE TABLE public.sub_niches (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  niche_id uuid NOT NULL,
  name text NOT NULL,
  CONSTRAINT sub_niches_pkey PRIMARY KEY (id),
  CONSTRAINT sub_niches_niche_id_fkey FOREIGN KEY (niche_id) REFERENCES public.niches(id)
);
CREATE TABLE public.themes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  CONSTRAINT themes_pkey PRIMARY KEY (id)
);