---
name: design-system
description: Lume design system — color, typography, spacing, layout, and component patterns for the Kubernetes dashboard frontend
autoTrigger:
  - when the user asks to create, modify, or style a frontend component
  - when the user asks about colors, typography, spacing, or UI patterns
  - when building new views, pages, or UI elements
---

# Lume Design System

This design system defines the visual language for Lume, a Kubernetes dashboard desktop app. All frontend work must follow these rules to maintain brand consistency.

---

## 1. Brand Color Palette

The brand is built on four pillars:

| Role        | Hex       | Tailwind Equivalent | Usage                                   |
|-------------|-----------|---------------------|-----------------------------------------|
| **Primary** | `#FFFFFF` | `white` / `zinc-50` | Primary text, headings, emphasis        |
| **Secondary** | `#A1A1AA` | `zinc-400`        | Body text, secondary labels, icons      |
| **Tertiary** | `#22C55E` | `green-500`        | Success states, active indicators, accent highlights |
| **Neutral** | `#09090B` | `zinc-950`         | Backgrounds, deep surfaces              |

**Key rule**: The brand has **no blue**. Do not use blue for accents, active states, or highlights. Green (`#22C55E` / `green-500`) is the accent color. Use it sparingly for emphasis — status indicators, active navigation markers, and success states.

---

## 2. Surface Elevation System

Dark mode uses layered surface colors to create depth without shadows. Each step is subtly lighter than the previous:

| Level               | Purpose                              | Tailwind Class     |
|---------------------|--------------------------------------|--------------------|
| **Deepest**         | True black, terminal/log backgrounds | `bg-black`, `bg-black/40` |
| **Background**      | App background, main canvas          | `bg-zinc-950`      |
| **Surface Low**     | Sidebar, recessed panels             | `bg-zinc-950`, `bg-[#111113]` |
| **Surface Default** | Content area background              | `bg-zinc-900`      |
| **Surface High**    | Cards, elevated sections, popovers   | `bg-zinc-800`      |
| **Surface Highest** | Tooltips, overlays, active states    | `bg-zinc-700`      |

**Rules**:
- Use background color steps for visual hierarchy — not shadows or heavy borders.
- Cards and sections use `bg-zinc-900` on a `bg-zinc-900` content area. Use the shadcn `--card` variable or explicit `bg-zinc-900` with subtle border separation.
- The content area has `rounded-tl-lg` to create a slight visual separation from the sidebar.

---

## 3. Border & Separator Rules

**Core principle: No borders on filled elements.**

- If an element has a background fill, do NOT add a visible border. Use background contrast alone for separation.
- Borders are ONLY for:
  - Elements with no background fill (outline buttons, input fields)
  - Row/cell separators in tables (`border-b border-zinc-800/30`)
  - Structural dividers (sidebar edge: `border-r border-black/50`, toolbar bottom: `border-b border-zinc-800/50`)
- Use `ring-*` for focus/active highlights on filled elements, not borders.
- When borders are needed, keep them extremely subtle: use opacity modifiers (`/10`, `/20`, `/30`, `/50`).
- Default border color: `border-border` (maps to `oklch(1 0 0 / 10%)` — white at 10% opacity).

---

## 4. Border Radius

**Near-square corners** — the design is intentionally sharp and technical.

- `--radius` is `0.2rem` — all computed radii cascade from this.
- Use `rounded-sm` (0.12rem) for most elements: cards, buttons, inputs, badges.
- Use `rounded-full` ONLY for status badge pills.
- Never use large border radius values (`rounded-xl`, `rounded-2xl`, etc.) on cards or panels.
- The overall aesthetic is precise and engineered, not soft or friendly.

---

## 5. Typography

**Font**: Geist Variable (`@fontsource-variable/geist`) — already configured as `--font-sans`.

### Type Scale

| Token         | Size        | Weight     | Tracking    | Color         | Usage                                |
|---------------|-------------|------------|-------------|---------------|--------------------------------------|
| **Page title**| `text-xl` (20px) | `font-bold` | `tracking-tight` | `text-zinc-100` | Main heading (h2) of a detail view |
| **Stat value**| `text-lg` (18px) | `font-bold` | default     | `text-zinc-200` | KPI/stat card values               |
| **Body**      | `text-[13px]` | normal    | default     | `text-zinc-200` | Default text, table cells, values  |
| **Secondary** | `text-[13px]` | normal    | default     | `text-zinc-400` | Less prominent body text           |
| **Small**     | `text-[12px]` | normal    | default     | `text-zinc-400` | Supplementary info, timestamps     |
| **Section heading** | `text-[11px]` | `font-bold` | `tracking-widest` | `text-zinc-500` | Section titles (via `SectionHeading`) |
| **Table header** | `text-[11px]` | `font-bold` | `tracking-wide` | `text-zinc-500` | Table column headers, uppercase    |
| **Stat label** | `text-[10px]` | `font-semibold` | `tracking-widest` | `text-zinc-500` | Stat card labels, uppercase        |
| **Detail label** | `text-[10px]` | `font-medium` | default | `text-zinc-500` | Metadata grid labels, uppercase    |
| **Mono**      | `text-xs` or `text-[12px]` | normal | default | `text-zinc-400` | IPs, UIDs, container images, technical values |

### Typography Rules

- **All section headings** use: `text-[11px] font-bold text-zinc-500 uppercase tracking-widest` (via `SectionHeading` component).
- **Micro labels** (breadcrumbs, category labels in sidebar) use `text-[10px]` or `text-[11px]`, uppercase, with wide/widest tracking.
- **Monospace** (`font-mono`) for all machine-readable values: IPs, ports, UIDs, hashes, container images, annotation values, resource quantities. Never use monospace for human-readable names.
- The base app font size is `text-[13px]` — compact and dense for a desktop dashboard. Do not increase this.
- **Weight hierarchy**: `font-bold` for headings/emphasis, `font-semibold` for active/highlighted items, `font-medium` for slightly emphasized text, normal weight for body.

---

## 6. Text Color Hierarchy

| Priority    | Class           | Usage                                     |
|-------------|-----------------|-------------------------------------------|
| **Highest** | `text-zinc-100` / `text-zinc-200` | Resource names, primary values, active items |
| **Standard**| `text-zinc-300` | Hovered items, slightly emphasized text    |
| **Secondary**| `text-zinc-400` | Body text, most table cells, descriptions |
| **Muted**   | `text-zinc-500` | Labels, metadata keys, section headings    |
| **Faint**   | `text-zinc-600` | Category headers, disabled text, expand arrows |

Use shadcn variables (`text-foreground`, `text-muted-foreground`) in UI primitives, but prefer explicit zinc classes in application components for precise control.

---

## 7. Status Colors

Status indication uses a tinted background + matching text pattern:

| Status                  | Background       | Text              | Dot/Indicator    |
|-------------------------|------------------|-------------------|------------------|
| **Running / Ready**     | `bg-emerald-950` | `text-emerald-400`| `bg-emerald-400` |
| **Succeeded / Complete**| `bg-sky-950`     | `text-sky-400`    | `bg-sky-400`     |
| **Pending / Waiting**   | `bg-amber-950`   | `text-amber-400`  | `bg-amber-400`   |
| **Failed / Error**      | `bg-red-950`     | `text-red-400`    | `bg-red-400`     |
| **Unknown / Default**   | `bg-zinc-800`    | `text-zinc-400`   | `bg-zinc-400`    |

**Rules**:
- Status badges use `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0`.
- Every status badge includes a **dot indicator**: `w-1.5 h-1.5 rounded-full` with the matching color.
- For inline status text (not badges), just use the text color without a background.
- Use the `StatusBadge` and `statusColorClass` from `@/components/shared/StatusBadge` — do not reinvent.

**Condition status colors** (used in ConditionsTable):
- `True` → `text-emerald-400`
- `False` → `text-red-400`
- Other → `text-zinc-400`

**Event type colors** (used in EventsTable):
- `Warning` → `text-amber-400` (with bold weight)
- `Normal` → `text-zinc-400`

**Container state colors** (used in PodDetailView):
- `running` → `text-emerald-400`
- `CrashLoopBackOff`, `Error`, `OOMKilled`, `Completed` → `text-red-400`
- Other → `text-amber-400`

**Connection health dot** (used in StatusBar):
- Connected: `bg-emerald-400`
- High latency (>500ms): `bg-amber-400`
- Disconnected: `bg-red-400`

---

## 8. Layout Patterns

### App Shell
```
AppShell (h-screen, flex col, bg-zinc-900, text-zinc-200, font-sans, text-[13px])
  TopBar (h-10, bg-zinc-950, shrink-0, wails-drag)
    Traffic light spacer (w-[70px]) — macOS window controls
    Back/Forward buttons
    Tabs (h-7, rounded-sm)
    New tab button
  Error banner (conditional, bg-red-950, text-red-300)
  Body (flex-1, flex row, min-h-0, bg-zinc-950)
    Sidebar (w-[180px], bg-zinc-950, border-r border-black/50)
    Content (flex-1, bg-zinc-900, rounded-tl-lg, overflow-hidden)
  StatusBar (h-7, bg-zinc-950, border-t border-zinc-800/50)
    Connection dot + cluster name (popover for switching)
    Namespace (centered)
    Latency (right)
```

**Wails desktop integration**:
- `wails-drag` class on TopBar enables macOS window dragging.
- `wails-no-drag` class on interactive elements within the TopBar (buttons, tabs) prevents drag interference.
- Traffic light spacer: `w-[70px]` reserves space for macOS native window controls.

### List View Layout
```
ResourceListView
  Toolbar (px-6 py-3, bg-zinc-900, border-b border-zinc-800/50)
    Namespace selector (if scoped) + Search input (w-[220px], bg-zinc-950)
  Table (flex-1, overflow-auto)
    Header row (sticky top-0 z-10, bg-zinc-900, text-zinc-500 uppercase text-[11px] font-bold tracking-wide)
    Body rows (hover:bg-zinc-900/70, cursor-pointer, border-b border-zinc-800/30)
  Status bar line (px-6 py-1.5, text-zinc-600, bg-[#111113], border-t border-zinc-800/50)
```

### Detail View Layout
```
ResourceDetailView
  Scrollable container (flex-1 overflow-auto)
    Content (px-6 py-5, flex flex-col gap-6)
      Back button
      Overview card (bg-zinc-900, rounded-sm, px-5 py-4, flex flex-col gap-4)
        Name (text-xl font-bold tracking-tight) + StatusBadge (flex justify-between)
        Quick stats grid (grid-cols-4, gap-4)
        Metadata grid (grid-cols-2, gap-x-8 gap-y-4)
      Labels / Annotations section (chip-style KeyValueList)
      Conditions table
      Resource-specific sections
      Events table
```

### Bento Grid (Summary Cards)
For quick stats/KPIs at the top of detail views:
```
grid grid-cols-4 gap-4
  Card: bg-zinc-950 rounded-sm px-4 py-3
    Label: text-[10px] font-semibold text-zinc-500 uppercase tracking-widest
    Value: text-lg font-bold text-zinc-200 (or font-mono for numeric)
```

### Metadata Grid (Configuration Details)
For key-value configuration details within the overview card:
```
grid grid-cols-2 gap-x-8 gap-y-4 text-[13px]
  Item: <div>
    Label: text-[10px] text-zinc-500 uppercase font-medium
    Value: text-zinc-200 (or font-mono text-xs for IPs/UIDs)
  </div>
```

---

## 9. Component Patterns

### Cards / Sections
- Background: `bg-zinc-900 rounded-sm`
- Internal padding: `px-5 py-4` (standard) or `px-4 py-3` (compact)
- Section header inside card: `border-b border-zinc-800/30 pb-3 mb-3`
- No outer border on cards (filled background provides separation)

### Tables
- Header: `bg-zinc-900 text-zinc-500 uppercase text-[11px] font-bold tracking-wide`
- Header cells: `px-3 py-2` (list views) or `px-3 py-1.5` (detail view inline tables)
- Body cells: `px-3 py-2 text-[13px]` (list views) or `px-3 py-1.5 text-[13px]` (inline tables)
- Row separator: `border-b border-zinc-800/30`
- Row hover: `hover:bg-zinc-900/70`
- Row click: `cursor-pointer`
- First column (name): `font-semibold text-zinc-200`
- Other columns: `text-zinc-400`
- Sticky header: `sticky top-0 z-10`

### Metadata Rows (Key-Value Pairs)
- Use `MetadataRow` component for structured detail displays.
- Label: `text-zinc-500 min-w-[140px] shrink-0`
- Value: `text-zinc-200 break-all`
- Row: `flex gap-2 py-1`

### Labels / Annotations Display (KeyValueList)
- Uses the `KeyValueList` component from `@/components/shared/KeyValueList`.
- Layout: `flex flex-wrap gap-2`
- Key-value chip: split key/value badge with contrasting backgrounds.
  - Key side: `bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500`
  - Value side: `bg-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-200`
  - Wrapper: `rounded-sm overflow-hidden border border-zinc-800/30`

### Buttons
Use shadcn `Button` component with these variants:
- **Primary action**: `variant="default"` — filled, high emphasis
- **Secondary action**: `variant="outline"` — bordered, medium emphasis
- **Tertiary action**: `variant="ghost"` — minimal, low emphasis
- **Danger action**: `variant="destructive"` — red-tinted
- Prefer `size="sm"` (h-7) or `size="xs"` (h-6) for toolbar actions. Default `size="default"` (h-8) for standalone actions.
- Icon-only buttons: `size="icon-xs"` or `size="icon-sm"`

### Inputs
- Use shadcn `Input` component.
- Height: `h-8` (compact).
- Background: transparent with subtle dark fill (`dark:bg-input/30`).
- Border: `border-input` (subtle).
- Search inputs: add a search icon as visual prefix.

### Resource Name + Subtitle
The standard header for detail views:
```
<div className="flex items-start justify-between gap-4">
  <div className="min-w-0">
    <h2 className="text-xl font-bold tracking-tight text-zinc-100 truncate">
      {name}
    </h2>
    <p className="text-xs text-zinc-500 mt-0.5">{namespace}</p>
  </div>
  <StatusBadge status={status} />
</div>
```

### Accent Badges (Type/Scope Indicators)
For non-status badges that indicate type or scope (e.g., "ClusterRole", "default"):
```
"inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm text-emerald-400 bg-emerald-500/10"
```
These use the brand's green/emerald accent. Place them inline after headings with `ml-2 align-middle`.

### Clickable References / Links
For cross-references to other resources (owner links, role refs):
```
"text-zinc-200 hover:underline cursor-pointer"
```
Do NOT use colored text for links. Links are just emphasized text with hover underline.

### Inline Code Chips
For small technical values displayed as chips (ports, protocols, tags):
```
"inline-block px-2 py-0.5 bg-zinc-800 rounded text-[11px] font-mono text-zinc-300"
```
Wrap in a `flex flex-wrap gap-1.5` container.

### Expandable / Collapsible Sections
Pattern used for container lists, image lists, etc.:
```
<button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-zinc-900 transition-colors">
  <span className="text-[10px] text-zinc-600">{expanded ? "▼" : "▶"}</span>
  <span className="font-semibold text-[13px] text-zinc-200">{name}</span>
  <span className="ml-auto text-xs text-zinc-500 font-mono truncate">{detail}</span>
</button>
```
Expanded content uses `px-4 pb-3 pt-1 flex flex-col gap-3 text-[13px]` inside a `bg-zinc-900 rounded-sm` card.

### Sidebar Navigation
- Active item: `bg-zinc-800 text-zinc-200 font-medium border-l-2 border-green-500`
- Inactive item: `text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 border-l-2 border-transparent`
- Category label: `text-[11px] font-bold text-zinc-600 uppercase tracking-wide`
- Icons: Lucide React, `size={15} strokeWidth={1.8}`

### TopBar Tabs
- Active tab: `bg-zinc-800 text-zinc-200 h-7 px-3 rounded-sm text-[12px]`
- Inactive tab: `text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 h-7 px-3 rounded-sm text-[12px]`
- Close button on active: `text-zinc-500 hover:text-zinc-200 hover:bg-zinc-700`
- Close button on inactive: `opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300`
- Back/Forward buttons: `p-1 rounded-sm text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 disabled:text-zinc-700`

### Error Banner
Displayed below TopBar for cluster-level errors:
```
"flex items-center justify-between px-6 py-2.5 bg-red-950 text-red-300 text-[13px]"
```
Dismiss button: `variant="outline" size="xs"` with `border-red-400 text-red-400 hover:bg-red-400/10`.

### Empty / Loading / Error States
- **Loading**: `"flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3"`
- **Empty**: Same as loading — centered, `text-zinc-600`, `text-[13px]`
- **Error**: `"text-red-400"` for message, with a `variant="secondary"` back button

---

## 10. Spacing Conventions

| Context          | Padding/Gap                     |
|------------------|---------------------------------|
| Page content     | `px-6 py-5`                     |
| Section gap      | `gap-6` (between major sections)|
| Card internal    | `px-5 py-4` or `px-4 py-3`     |
| Toolbar          | `px-6 py-3`                     |
| Table cells (list) | `px-3 py-2` (both header and body) |
| Table cells (inline) | `px-3 py-1.5` (both header and body) |
| Compact items    | `px-2 py-1` or `px-3 py-1.5`   |
| Inline gaps      | `gap-1` to `gap-3`             |
| Bento grid       | `gap-4`                             |
| Metadata grid    | `gap-x-8 gap-y-4`                  |

---

## 11. Interactions & Transitions

- Hover transitions: `transition-colors` (not `transition-all` — avoid animating layout properties).
- Hover states: subtle background shift, typically one step lighter on the surface scale.
- Active/pressed: `active:translate-y-px` on buttons (already in shadcn button).
- Focus: `focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50` (shadcn default).
- Cursor: `cursor-pointer` on all clickable non-button elements (table rows, nav items, links).
- Disabled: `opacity-50 pointer-events-none`.

---

## 12. Icons

- **Library**: Lucide React (already installed).
- **Default size**: `size={15}` with `strokeWidth={1.8}` for sidebar/inline icons.
- **Smaller icons**: `size={12}` for breadcrumb chevrons, expand/collapse indicators.
- **Button icons**: Let the shadcn button handle sizing via `[&_svg]:size-4` / `size-3.5` / `size-3`.
- Always import from `lucide-react`, not Material Symbols or other icon sets.

---

## 13. What NOT To Do

- **No blue accents.** The brand accent is green. Use `green-500` / `emerald-400` family, not blue.
- **No large border radius.** Keep corners near-square. Never use `rounded-xl`, `rounded-2xl`, etc. on cards or panels.
- **No shadows for elevation.** Use layered background colors instead.
- **No borders on filled cards/buttons.** Background contrast provides separation.
- **No light mode.** This is dark-only.
- **No custom fonts.** Geist Variable for UI, system monospace or `font-mono` (Tailwind default) for code.
- **No inline styles.** Use Tailwind classes exclusively.
- **No arbitrary color values.** Stick to the zinc scale, status colors, and green accent defined here.
- **No decorative elements.** The aesthetic is minimal, dense, and utilitarian.
- **Do not increase base font size.** The app is intentionally compact at 13px.

---

## Quick Reference: Common Class Combos

```
// Page heading
"text-xl font-bold tracking-tight text-zinc-100"

// Section heading (SectionHeading component)
"text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-2"

// Card
"bg-zinc-900 rounded-sm px-5 py-4"

// Stat card
"bg-zinc-950 rounded-sm px-4 py-3"

// Stat label
"text-[10px] font-semibold text-zinc-500 uppercase tracking-widest"

// Stat value
"text-lg font-bold text-zinc-200"

// Detail grid label
"text-[10px] text-zinc-500 uppercase font-medium"

// Table header cell
"px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-zinc-500 bg-zinc-900"

// Table body row
"border-b border-zinc-800/30 hover:bg-zinc-900/70 cursor-pointer"

// Status badge (with dot)
"inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0"

// Key-value chip (KeyValueList)
"flex items-center rounded-sm overflow-hidden border border-zinc-800/30"
// Key: "bg-zinc-800 px-2 py-1 text-[10px] font-bold text-zinc-500"
// Value: "bg-zinc-700 px-2 py-1 text-[10px] font-bold text-zinc-200"

// Mono value (IPs, UIDs, etc.)
"font-mono text-xs text-zinc-400"

// Sidebar nav item (active)
"bg-zinc-800 text-zinc-200 font-medium border-l-2 border-green-500"

// Sidebar nav item (inactive)
"text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-300 border-l-2 border-transparent"

// Sidebar category label
"text-[11px] font-bold text-zinc-600 uppercase tracking-wide"

// Accent badge (ClusterRole, Default, etc.)
"inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-sm text-emerald-400 bg-emerald-500/10"

// Clickable reference (owner links, role refs)
"text-zinc-200 hover:underline cursor-pointer"

// Inline code chip (ports, tags)
"inline-block px-2 py-0.5 bg-zinc-800 rounded text-[11px] font-mono text-zinc-300"

// Namespace subtitle (below resource name)
"text-xs text-zinc-500 mt-0.5"

// Toolbar namespace label
"text-xs font-semibold text-zinc-500 uppercase tracking-wide"

// Search input
"w-[220px] bg-zinc-950"

// Empty / loading state container
"flex flex-col items-center justify-center flex-1 text-zinc-600 gap-3"

// Error message
"text-red-400"

// Error banner
"flex items-center justify-between px-6 py-2.5 bg-red-950 text-red-300 text-[13px]"

// TopBar tab (active)
"bg-zinc-800 text-zinc-200 h-7 px-3 rounded-sm text-[12px]"

// TopBar tab (inactive)
"text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 h-7 px-3 rounded-sm text-[12px]"

// Popover content
"bg-zinc-900 border-zinc-800 text-[12px]"

// Popover item (active)
"text-zinc-200 bg-zinc-800 rounded-sm"

// Popover item (inactive)
"text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 rounded-sm"
```
