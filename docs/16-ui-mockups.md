# 16. UI Mockups and Screen Specifications

This document describes what each screen looks like and how it behaves. Screens marked Live exist in `frontend/` today. The visual language for all screens is institute formal: white paper, deep navy authority bar, thin slate borders, soft realistic shadows, saffron institute strip, no marquee and no tilted stickers.

---

## 16.1 Design System

All screens share one token set, defined in `frontend/tailwind.config.ts` and `frontend/app/globals.css`.

| Token | Value | Used for |
|-------|-------|----------|
| paper | #FFFFFF | Page background, pure white |
| ink | #1A2233 | Borders, text, deep slate |
| navy | #1E3A8A | Authority bar, primary text, key borders |
| saffron | #FF9933 | Institute identity strip |
| primary | #2B6CB0, always with solid white text | Hero cards, primary actions, active states |
| secondary slate | #E8EEF9 | Coordinator accents, highlights |
| accent sky | #EFF6FF | Info fills, light focus background |
| success | #DCFCE7 | Approved and completed states |
| danger blush | #FEE2E2 fill plus #B91C1C text | Errors and rejected states, dark text for contrast |
| warn amber | #FEF3C7 | Pending and review states |
| muted paper | #F1F5F9 | Inactive fills |
| lilac muted | #EEF2FF | Admin, reports, muted fourth accent |

Shared building blocks live in `frontend/components/ui/`:

| Component | File | Behavior |
|-----------|------|----------|
| Button | `button.tsx` | Thin border plus soft shadow. On hover the background lightens. Variants for primary, slate, sky, dark, white, success, warn, lilac, danger with dark red text. |
| Card | `card.tsx` | White fill, thin slate border, soft shadow. Holds one idea per card. CardHover adds a subtle lift on hover. |
| Input, Textarea | `input.tsx` | Thin border, navy focus ring, inline error text in dark red. |
| StatusBadge | `badge.tsx` | Pill with thin border. Color follows project or allocation status, so Submitted reads sky and Rejected reads blush with dark red text at a glance. |
| Alert | `alert.tsx` | Bordered message box with tones info, success, warn, danger, neutral, lilac. Used for form errors. |
| Avatar | `avatar.tsx` | Initials circle cycling pastel fills. |
| Tabs | `tabs.tsx` | Pill tab group for Files, Guide, Result sections. |
| Table | `table.tsx` | Card wrapped table with sand header row plus skeleton rows for loading. |
| EmptyState | `empty-state.tsx` | Dashed card with title, hint, and optional action for not yet states. |

Type uses Archivo for headings and Space Grotesk for body, loaded in `frontend/app/layout.tsx`.

Layout rules every screen follows:

1. One yellow header bar with the product name on the left and auth links on the right.
2. Content in a centered column, max 72 rem wide.
3. One footer bar with the institute name and program range.
4. No page needs horizontal scrolling at 360 px width or above.

---

## 16.2 Landing Page (Live)

Route: `/`, file `frontend/app/page.tsx`.

The page opens with a large yellow card carrying an OOAD Lab Project badge, the product name in two lines, one paragraph explaining the portal, and two buttons: Get Started (dark) and Login (white). Below it, three white cards explain the core ideas: project repository, guide allocation, and version control, each with its own bright icon tile. A final card lists the four steps of the workflow: register, submit, review, evaluate.

---

## 16.3 Login Page (Live)

Route: `/login`, file `frontend/app/(auth)/login/page.tsx`.

A centered white card with the heading Welcome back. Two labeled fields, email and password, validated with Zod before anything is sent. A failed login shows a red bordered message box in plain words. On success the tokens and role are stored and the user lands on the dashboard. A link at the bottom leads to registration.

## 16.4 Registration Page (Live)

Route: `/register`, file `frontend/app/(auth)/register/page.tsx`.

Same centered card pattern with the heading Create account. Fields for full name, email, and password, plus a role picker rendered as toggle pills for Student, Faculty, Coordinator, Evaluator, and Admin. Validation errors appear inline under the field and in the message box. On success the new account is logged in immediately and sent to the dashboard.

---

## 16.5 Dashboard (Live Shell)

Route: `/dashboard`, file `frontend/app/(dashboard)/dashboard/page.tsx`.

The page requires a stored token and redirects to login without one. The header card shows the dashboard title for the stored role next to a dark role badge. Below it, three colored cards summarize what that role cares about. Students see projects, versions, and results. Guides see pending reviews, allocated students, and history. Coordinators see allocation, evaluation status, and reports. Evaluators see assigned, in progress, and completed work. Admins see users, roles, and system settings.

The cards are placeholders with real layout. Later issues will fill each one with live tables and actions backed by the API.

---

## 16.6 Project Submission Page (Live Shell)

Route: `/projects/new`, files `frontend/app/projects/new/page.tsx` plus `form.tsx`.

A butter card titled Submit project with a note that every upload becomes a numbered version. Fields for title (required), abstract (textarea), and tech stack. A dashed sand drop zone note explains file upload lands with version history. Two buttons sit at the bottom: Submit for Review (dark) and Save as Draft (white). Submitting a draft calls `POST /api/v1/projects`, and the review button also calls `POST /api/v1/projects/{id}/submit`. Errors show in a blush Alert with dark red text.

## 16.7 Project Detail Page (Live Shell)

Route: `/projects/[id]`, files `frontend/app/projects/[id]/page.tsx` plus `detail.tsx` with `generateMetadata`.

A status header with the project title, a StatusBadge, and the current version number. Three pill tabs below it: Files (version history table with upload dates and comments), Guide (allocated guide name with pastel avatar and review thread note), and Result (empty state until evaluation, then marks table per rubric criterion plus evaluator feedback).

## 16.8 Allocation Page (Live Shell)

Route: `/coordinator/allocation`, coordinator role only.

A lilac header card with a Run Suggestions button. Below it a table of unallocated students with preference lists. The current shell shows a pending row until the backend is wired. Confirming calls the allocation endpoints and both sides get notified. A dashed empty state documents the per row adjust plus confirm all step.

---

## 16.9 Accessibility and Production Notes

- All form fields have real labels tied to inputs, and color is never the only signal because every status also carries text.
- Buttons keep a visible focus ring and remain usable by keyboard alone.
- The palette was checked for contrast at body text sizes on paper and white fills. Danger text on tinted fills is bold to stay readable.
- Images are decorative only. Every SVG diagram in `docs/` ships with a PNG twin so pages render even where SVG is blocked.
