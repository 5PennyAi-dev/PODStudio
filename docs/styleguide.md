
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
