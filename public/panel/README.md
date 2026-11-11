# MUNTAL — Secretariat Application Management Portal
**Executive Management Dashboard & Live Google Sheets Integration**

This portal provides an independent, lightweight administrative control panel for MUNTAL conference leadership. It fetches live delegate and applicant records directly from Google Sheets, displays all 3 committee preferences, enables direct committee allocation, and supports multi-channel email dispatches.

---

## 🚀 GitHub Pages Deployment (2 Minutes)

This portal is built with **pure HTML5, CSS3, and Vanilla JavaScript** with zero build steps or server requirements.

### Method 1: Host as an Independent GitHub Repository (Recommended)
1. Create a new GitHub repository (e.g., `muntal-portal`).
2. Copy all files from this directory (`index.html`, `styles.css`, `app.js`, `google-apps-script.js`) into that repository.
3. In your GitHub repository, navigate to **Settings > Pages**.
4. Set **Source**: `Deploy from a branch`, **Branch**: `main`, and **Folder**: `/ (root)`. Click **Save**.
5. Your portal will be live at `https://<username>.github.io/muntal-portal/` within 1–2 minutes!

### Method 2: Local & Embedded Testing
- In this repository, the portal is served statically by Vite at:
  `http://localhost:3000/panel/index.html`

---

## 📊 Core Features

### 01 — Overview Dashboard
- **4 Live KPI Indicators**: Total applications, submissions today (24h), pending reviews, and accreditation ratio (Accepted / Rejected).
- **Track Breakdown**: Delegate, Chairboard, Press & Media, and Administrative Staff tracks.
- **Committee Preferences & Allocation Metrics**: Track delegate allocations and first-choice demand across DISEC, WHO, UNSC, NATO-NAC, and JCC.
- **Recent Submissions Stream**: Chronological feed of incoming applications with instant Dossier inspection.

### 02 — Application Management & Committee Allocation
- **Track Filters**: Quickly filter by Delegate, Chairboard, Press, or Admin tracks.
- **Real-Time Search**: Search instantly by applicant name, email, school, committee preference, or Application ID.
- **Advanced Filtering**: Filter by status (Pending, Under Review, Accepted, Rejected, Waitlisted), Committee preference, and Allocation status (Assigned / Unassigned).
- **Full Dossier View**: Inspect essays, motivation statements, leadership credentials, and track-specific equipment or logistics answers.
- **Committee Allocation**:
  - Review 1st, 2nd, and 3rd choices with 1-click allocation buttons.
  - Choose from standard committees or enter custom allocation.
  - Updates local state and pushes changes live to the Google Sheets backend.
- **Bulk Operations**: Multi-select candidates for 1-click batch acceptance, rejection, or bulk email dispatch.
- **CSV / Excel Export**: One-click download with standard UTF-8 BOM encoding.

### 03 — Multi-Channel Email Dispatch
- **Targeting Modes**: Single recipient or bulk scope (Filtered, Accepted, Pending, All).
- **5 Pre-Configured Diplomatic Templates**:
  1. Official Acceptance & Committee Allocation Letter
  2. Application Outcome Notice (Decline)
  3. Preliminary Review Notice
  4. Academic Interview Invitation
  5. Conference Logistics & Preparation Guide
- **Dynamic Variable Substitution**: `{{name}}`, `{{assigned_committee}}`, `{{first_preference}}`, `{{second_preference}}`, `{{third_preference}}`, `{{category}}`, `{{school}}`, `{{application_id}}`, `{{status}}`.
- **3 Delivery Channels**:
  1. **Google Apps Script**: Direct automated backend dispatch.
  2. **1-Click Gmail Web Composer**: Launches `mail.google.com` compose tab with recipient, subject, and personalized body pre-filled.
  3. **Desktop Mail Client**: Launches standard `mailto:` client (Outlook, Apple Mail).
- **Live Preview & Audit Logs**: Real-time rendering and session audit logs.
