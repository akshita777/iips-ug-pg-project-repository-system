# DESIGN.md

## Design System Reference

### 1. Color Palette
- **Primary:** Academic Blue (e.g., `slate-900` or `blue-700` for primary actions) representing trust and institution.
- **Backgrounds:** Minimalist Light (e.g., `slate-50` or `white`) for a clean, distraction-free reading experience.
- **Status Indicators:**
  - **Success/Approved:** Green (`green-600`)
  - **Warning/Pending:** Amber/Yellow (`amber-500`)
  - **Error/Rejected:** Red (`red-600`)
  - **Info:** Blue (`blue-500`)

### 2. Typography
- **Primary Font:** Inter (or similar clean sans-serif default provided by Tailwind).
- **Headings:** Bold, clear hierarchy (`text-2xl` for page headers, `text-xl` for section headers).
- **Body Text:** Legible sizes (`text-base` or `text-sm`), prioritizing readability for dense academic texts and code reviews.

### 3. Component Definitions
- **Buttons:** Use standard shadcn/ui buttons. Primary actions should be clearly distinguished from secondary actions (outline or ghost).
- **Cards:** Use cards to encapsulate distinct entities like Projects, Student Profiles, and Reviews. Keep borders subtle (`border-slate-200`).
- **Tables:** Use data tables for lists (students, allocations, repository commits). Ensure they are responsive or horizontally scrollable.
- **Forms:** Clear labels, descriptive placeholders, and inline validation messages.
- **Navigation:** A persistent sidebar or top navbar for quick access to role-specific dashboards (Student vs Guide vs Admin).

### 4. Anti-patterns to Avoid
- Avoid pure black (`#000000`) or pure white (`#ffffff`) for large surfaces; use off-whites and dark slates.
- Avoid over-nesting cards or using excessive drop shadows.
- Do not use overly playful or casual UI elements (e.g., overly rounded corners, bouncy animations); stick to a formal, institutional feel.
