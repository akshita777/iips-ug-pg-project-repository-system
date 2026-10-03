# 16. UI Mockups and Screen Specifications

This document describes what each screen looks like and how it behaves. Screens marked Live exist in `frontend/` today. Screens marked Planned are designed here and will be built in later issues. The visual language for all screens is neobrutalism: thick black borders, hard offset shadows, bright flat fills, and heavy display type.

---

## 16.1 Design System

All screens share one token set, defined in `frontend/tailwind.config.ts` and `frontend/app/globals.css`.

| Token | Value | Used for |
|-------|-------|----------|
| paper | #FFFDF5 | Page background |
| ink | #000000 | Borders, text, dark fills |
| primary | #FFDC58 | Hero card, main actions |
| secondary | #FF90E8 | Highlights, coordinator accents |
| accent | #90E8FF | Info fills, links, focus rings |
| success | #A6FA9B | Approved and completed states |
| danger | #FF6B6B | Errors and rejected states |
| warn | #FF9D42 | Pending and review states |
| muted | #F5F0E8 | Inactive fills |

Shared building blocks live in `frontend/components/ui/`:

| Component | File | Behavior |
|-----------|------|----------|
| Button | `button.tsx` | Brutal border and shadow. On hover it shifts 2 px and the shadow collapses. Variants for primary, dark, white, success, danger. |
| Card | `card.tsx` | White fill, 2 px border, hard shadow, rounded corners. Holds one idea per card. |
| Input, Textarea | `input.tsx` | 2 px border, accent focus ring, inline error text in danger color. |
| StatusBadge | `badge.tsx` | Pill with 2 px border. Color follows project or allocation status, so Submitted reads blue and Rejected reads red at a glance. |

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

## 16.6 Project Submission Page (Planned)

Route: `/projects/new`.

A white card titled Submit project. Fields for title (required), abstract (textarea), and tech stack (comma separated hint). A file drop zone with a dashed brutal border accepts the report and code archive. A note under it explains that every upload becomes a numbered version and old versions are never overwritten. Two buttons sit at the bottom: Submit for Review (dark, primary action) on the left and Save as Draft (white) on the right. Submitting a draft calls `POST /api/v1/projects`, and the review button calls `POST /api/v1/projects/{id}/submit`.

## 16.7 Project Detail Page (Planned)

Route: `/projects/[id]`.

A status header with the project title, a StatusBadge, and the current version number. Three tabs below it: Files (version history table with upload dates and comments), Guide (allocated guide name with review thread), and Result (marks table per rubric criterion plus evaluator feedback, visible after evaluation).

## 16.8 Allocation Page (Planned)

Route: `/coordinator/allocation`, coordinator role only.

A table of unallocated students with their preference lists on the left and a Run Suggestions button above it. Suggestions appear as draft rows with a Confirm All button and per row adjust controls. Confirming calls the allocation endpoints and both sides get notified.

---

## 16.9 Accessibility and Production Notes

- All form fields have real labels tied to inputs, and color is never the only signal because every status also carries text.
- Buttons keep a visible focus ring and remain usable by keyboard alone.
- The palette was checked for contrast at body text sizes on paper and white fills. Danger text on tinted fills is bold to stay readable.
- Images are decorative only. Every SVG diagram in `docs/` ships with a PNG twin so pages render even where SVG is blocked.
