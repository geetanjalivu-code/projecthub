Build a fully working web application called "UX Project Hub" 
for Infineon Technologies. This is an internal tool for UX 
designers to manage and document multiple design projects 
from start to finish. All data stored in localStorage. 
No backend needed.

---

VISUAL STYLE

Use the Infineon design system:

Primary color: #0A8276 (ocean-500)
Hover state: #08665C (ocean-600)
Pressed state: #06534B (ocean-700)
Light tint: #DFF4F3 (ocean-100)
Page background: #F7F7F7 (engineering-100)
Card background: #FFFFFF
Borders and dividers: #EEEDED (engineering-200)
Disabled / subtle borders: #BFBBBB (engineering-300)
Placeholder text: #8D8786 (engineering-400)
Muted text, labels, icons: #575352 (engineering-500)
Hover on muted elements: #3C3A39 (engineering-600)
Primary text: #1D1D1D
White: #FFFFFF
Font: Inter or Segoe UI or system font stack

Layout style:
- White left sidebar, collapsible, icon and label nav items
- Active nav item has ocean-500 color and left border indicator
- White topbar with title, status pill, avatar
- Light grey page background with white cards
- Clean, spacious, minimal — no heavy shadows
- Status pills are outlined with colored dot prefix
- Primary buttons: ocean-500 filled, white text
- Secondary buttons: white background, ocean-500 border and text
- All inputs have subtle border, ocean-500 focus ring
- All modals closable with Escape key

---

OVERALL APP STRUCTURE

The app has three screens:

SCREEN 1 — PROJECT HUB (Dashboard)
Shows all projects. Entry point of the app.

SCREEN 2 — PROJECT WORKSPACE
Shows all 13 sections of a selected project.

Navigation:
- Clicking a project card on dashboard 
  opens that project workspace
- Back to Hub button in sidebar returns 
  to dashboard

---

SCREEN 1 — PROJECT HUB / DASHBOARD

This is the home screen when the app loads.

Sidebar:
- Infineon logo top left
- Collapse toggle button
- Nav items: 
  All Projects
  Active
  In Review
  Completed
  On Hold
- Footer: Terms of use, Imprint, 
  Privacy policy
- Copyright: © 1999–2023 Infineon Technologies AG

Topbar:
- Title: UX Project Hub
- Notification bell icon
- User avatar initials (AA)

Page content:

Page title: All Projects
Subtitle: Manage and track all your UX design projects

NEW PROJECT button (primary, top right)
Clicking opens a modal (described below)

5 stat cards auto-calculated from all projects:
- Total Projects
- Active (in-progress)
- In Review
- Completed
- On Hold

Filter pills (filter project cards in real time):
All / Not Started / In Progress / 
In Review / Completed / On Hold

Search input — filters project cards 
by project name in real time

Project cards grid:
- One card per project
- Each card shows:
  Project name
  Status pill
  Phase label
  Progress bar with percentage 
  (auto-calculated, described later)
  Owner name with avatar initials
  Deadline date
  Last updated timestamp
  Click anywhere on card opens project workspace

Empty state when no projects:
Large centered message with 
Create New Project button

Maximum 5 projects allowed.
If 5 projects exist, New Project button 
shows a tooltip: 
"Maximum 5 projects reached. 
Delete a project to create a new one."
Each project card has a delete button 
(with confirmation dialog before deleting).

NEW PROJECT MODAL:

Fields:
- Project Name (required, text input)
- Project Owner (text input)
- Start Date (date picker)
- Deadline (date picker)
- Brief Description (textarea)

Buttons: Cancel and Create Project

On Create Project:
- Validate project name is not empty
- Generate a unique project ID
- Scaffold all 13 sections with empty 
  default state
- Set version to v1.0.0
- Set created date and last updated 
  to current timestamp
- Add first changelog entry: 
  "Project created" — v1.0.0
- Save to localStorage
- Close modal
- Open project workspace for new project
- Update dashboard stats

---

SCREEN 2 — PROJECT WORKSPACE

Sidebar:
- Infineon logo
- Collapse toggle
- Back to Hub (navigate to dashboard)
- Divider
- Section label: Project Sections
- 13 nav items (listed below)
- Active section highlighted ocean-500
- Bottom of sidebar: dynamic message
  If progress < 30% → 
    "Fill in every section before 
    moving to the next phase." (red text)
  If progress 30–70% → 
    "Keep going, good progress." (amber text)
  If progress > 70% → 
    "Great progress!" (green text)
  If progress = 100% → 
    "All sections complete ✓" (green text)

Topbar:
- Project name (editable inline on click)
- Current section breadcrumb: 
  UX Workspace / [section number] — [section name]
- Left and right arrow buttons to go to 
  previous and next section
- Section counter: e.g. 3 / 13
- Auto-save indicator: 
  "Saving..." while saving
  "All changes saved" after save
- Status pill (reflects current project status, 
  click to change via dropdown)
- Version badge showing current version 
  e.g. v1.2.0
- Notification bell
- Avatar

Bottom navigation bar:
- Previous section button with section name
- Section dot indicators (one dot per section, 
  active dot filled)
- Next section button with section name
- Clicking previous/next updates sidebar 
  active state

All fields auto-save to localStorage 
on every change with 800ms debounce 
for text fields and immediately for 
dropdowns and selections.

Every save refreshes Last Updated timestamp.

---

THE 13 SECTIONS

---

SECTION 01 — COVER

Full-width cover layout:

Top area:
- Label: UX DESIGN PROJECT (small caps, muted)
- Project name as large editable heading
  (click to edit inline, full width, no truncation)
- Project tagline/description as editable subtitle
- Status selector pill (click to change):
  Not Started / In Progress / In Review / 
  Completed / On Hold
- Phase selector:
  Planning / Discovery / Research / IA & Flows /
  Wireframing / UI Design / Prototyping / 
  Testing / Handoff

Progress section:
- Label: Overall Progress
- Progress bar (auto-calculated, described below)
- Percentage label next to bar
- Phase milestone markers below bar showing 
  all phases, current phase highlighted

Meta grid (6 cells):
- Owner (editable text)
- Team (editable text)
- Client (editable text)
- Version (auto, shows full semantic version 
  e.g. v1.2.0)
- Start Date (date picker)
- Target Date (date picker)

Additional fields:
- Project Type dropdown:
  Product Redesign / New Product / 
  Feature Addition / Research Only / Other
- Platform (text input, e.g. Web, iOS, Android)
- Figma File Link (URL input)
- Jira / Linear / Notion Link (URL input)

PROGRESS BAR CALCULATION:
Progress = percentage of sections 
that have meaningful content.

A section counts as filled when:

01 Cover → name not empty AND phase selected
02 Project Overview → objective has text 
   AND at least 1 team member added
03 Project Canvas → at least 6 of 9 canvas 
   cells have content
04 Competitive Analysis → at least 1 competitor 
   AND at least 3 features rated
05 Research & Insights → at least 1 persona 
   OR at least 1 finding added
06 Information Architecture → at least 3 pages 
   in page inventory OR embed URL added
07 Heuristic Audit → all 10 heuristics assessed
08 Screens & Flows → at least 1 screen added
09 Prototypes → at least 1 prototype added
10 Usability Testing → test plan has content 
   AND at least 1 participant logged
11 Feature Metrics → at least 1 metric added 
   with target value
12 Meeting Notes → at least 1 meeting logged
13 Changelog → always counts as filled

Progress = (filled count / 13) × 100
Round to nearest whole number.
Update in real time.

---

SECTION 02 — PROJECT OVERVIEW

Sections:

Objective:
Large textarea, placeholder: 
"What is the main goal of this project? 
What problem does it solve?"

Team Members:
Table with columns: 
Avatar initials (auto from name), Name, 
Role, Email
Add Member button adds a new empty row
Each row has a remove button
Avatar initials auto-generated from name field

Related Documents:
List of document links, each has:
Document type label (dropdown): 
Brief / Research / Brand Guidelines / 
Figma File / Jira / Other
Title (text input)
URL (url input, opens in new tab)
Add Link button adds new row
Each row has remove button

Project meta (read-only display):
Project Name / Status / 
Last Updated (auto) / Version (auto)

---

SECTION 03 — PROJECT CANVAS

Two modes: Q&A Mode and Canvas View Mode
Toggle button to switch between them.

Q&A MODE:
Show questions one at a time.
Progress indicator: Question X of 13
Previous and Next buttons.
Each answer auto-saves to corresponding 
canvas cell.

Questions:
1. What problem are you solving? 
   → Problem Statement
2. Who is your primary user? 
   → Target Users Primary
3. Who is your secondary user? 
   → Target Users Secondary
4. What are the main goals of this project? 
   → Goals
5. What metrics will prove each goal 
   is achieved? 
   → Success Metrics
6. What do users need to accomplish? 
   → User Needs
7. What does the business need to achieve? 
   → Business Needs
8. What are the technical constraints? 
   → Constraints: Technical
9. What are the timeline constraints? 
   → Constraints: Timeline
10. What are the budget constraints? 
    → Constraints: Budget
11. What assumptions are you making? 
    → Assumptions
12. What is explicitly out of scope? 
    → Out of Scope
13. What are the main risks? 
    → Risks

CANVAS VIEW MODE:
3x3 grid showing all 9 cells:
- Problem Statement
- Target Users (primary + secondary)
- Goals & Success Metrics
- User Needs
- Business Needs
- Constraints (tech + timeline + budget)
- Assumptions
- Out of Scope
- Risks

Each cell is directly editable in canvas view.
Retake Q&A button resets to Q&A mode 
without clearing existing answers 
(answers pre-fill the questions).

---

SECTION 04 — COMPETITIVE ANALYSIS

Three steps shown as a stepper at the top:
Step 1: Add Competitors
Step 2: Rate Features  
Step 3: View Insights

STEP 1 — ADD COMPETITORS:
Input field + Add button
Type competitor name and click Add or press Enter
Each competitor appears as a card showing:
- Competitor name (editable)
- Website URL (optional)
- Brief description (optional)
- Remove button
First column is always "Our Product" 
and cannot be removed, shown highlighted.
Minimum 1 competitor besides Our Product.
Maximum 8 competitors.
Next Step button to proceed.

STEP 2 — RATE FEATURES:
Input field to add feature/criteria rows.
Press Enter or click Add Feature.
Comparison table auto-builds:
- Rows = features
- Columns = Our Product + all competitors
For each cell, show a 3-option selector:
  ✅ Strong
  🟡 Partial  
  ❌ Missing
Each cell cycles through options on click.
Our Product column is highlighted with 
a light ocean tint background.
Add Feature and Remove Feature buttons.
View Insights button to proceed.

STEP 3 — VIEW INSIGHTS:
Auto-generated insight cards below the table.

Analyse all ratings and show 3 cards:

Card 1 — TABLE STAKES
Features where 3 or more competitors 
rated Strong (✅)
Label: "Market standard — must have"
List features as bullet points.

Card 2 — OPPORTUNITIES
Features where 3 or more competitors 
rated Missing (❌) or Partial (🟡)
Label: "Potential differentiator for us"
List features as bullet points.

Card 3 — OUR GAPS
Features where Our Product is rated 
Partial or Missing but most competitors 
are Strong.
Label: "Priority to address"
List features as bullet points.

Auto-regenerate insight cards every time 
any rating changes.
If not enough data yet, show placeholder: 
"Rate at least 3 features to see insights."

---

SECTION 05 — RESEARCH & INSIGHTS

Sub-tabs: 
Personas / Findings / Journey Map / 
Pain Points / Opportunities

PERSONAS sub-tab:
Add persona cards, each has:
- Name
- Age
- Role / Job title
- Goals (bullet list, add/remove items)
- Pain points (bullet list, add/remove items)
- Quote (italic text field)
- Remove persona button
Add Persona button adds new card.

FINDINGS sub-tab:
Add finding rows, each has:
- Finding description (text)
- Related task or area
- Type tag dropdown: 
  Behaviour / Need / Pain Point / Opportunity
- Severity: High / Medium / Low
Add Finding button.
Findings auto-grouped by severity: 
High shown first.

JOURNEY MAP sub-tab:
- Embed URL field (Figma or Miro)
- Rendered iframe below when URL is entered
- Description textarea

PAIN POINTS sub-tab:
Tag-style list.
Each tag shows pain point text and 
severity color:
High = red, Medium = amber, Low = grey
Add Pain Point button opens small input modal.
Click tag to delete.

OPPORTUNITIES sub-tab:
Numbered list of opportunity statements.
Add Opportunity button adds new item.
Each item has a remove button.

---

SECTION 06 — INFORMATION ARCHITECTURE

Sub-tabs: Page Inventory / Embed

PAGE INVENTORY sub-tab:
Table with columns:
Page Name / URL or Route / Parent Page / 
Priority (P1/P2/P3 dropdown) / 
Status (Not Started/In Progress/Done dropdown) / 
Notes
All cells inline editable.
Add Row button adds empty row at bottom.
Each row has remove button.

EMBED sub-tab:
IA Type selector: 
Sitemap / User Flow / Task Flow / Card Sort
URL input for Figma or FigJam embed.
Rendered iframe below when URL is entered.
Description textarea.

---

SECTION 07 — HEURISTIC AUDIT

Top stat cards:
- Overall Score: X/50
- Issues Found: count of severity 3 and 4
- Heuristics Assessed: X/10

For each of the 10 heuristics show a card with:
- Heuristic number and name
- Brief description of the heuristic
- Example use case (in italic, muted)
- Score selector: 1 to 5 
  (1 = Poor, 5 = Excellent)
  shown as clickable number buttons
- Severity selector:
  0 — Not a problem
  1 — Cosmetic
  2 — Minor
  3 — Major
  4 — Catastrophic
  shown as clickable pill buttons
- Issue Observed textarea
- Notes & Recommendations textarea

All 10 heuristics:
H1 — Visibility of System Status
H2 — Match Between System and Real World
H3 — User Control and Freedom
H4 — Consistency and Standards
H5 — Error Prevention
H6 — Recognition Rather Than Recall
H7 — Flexibility and Efficiency of Use
H8 — Aesthetic and Minimalist Design
H9 — Help Users Recognize and Recover 
     from Errors
H10 — Help and Documentation

PRIORITY FIX LIST:
Auto-generated below all 10 heuristic cards.
Include all heuristics where severity is 
3 (Major) or 4 (Catastrophic).
Each item shows:
- Heuristic number and name
- Severity badge
- Issue observed text
- Notes and recommendations text
Sort: Catastrophic first, then Major.
If no major or catastrophic issues → 
show green success message:
"No critical issues found. Good baseline."
Auto-updates whenever any severity changes.

---

SECTION 08 — SCREENS & FLOWS

Sub-tabs: Mockups / Flows

MOCKUPS sub-tab:

Add Screen button adds a new screen card.
Each screen card shows:
- Screen name (editable text)
- Platform tag: Web / Mobile / Tablet 
  (dropdown)
- Status pill: Draft / In Review / Approved 
  (dropdown)
- Version label (text input)
- Upload area: drag and drop or click to 
  upload PNG or JPG
- OR Figma embed URL field — 
  if URL entered, renders as iframe
- Annotation Mode toggle button
- Annotations table below image
- Delete screen button

ANNOTATION MODE:
When Annotation Mode is toggled ON:
- Cursor changes to crosshair over the 
  mockup image area
- User clicks anywhere on the image
- A numbered circular pin marker (filled 
  ocean-500 circle with white number) 
  appears at the exact click coordinates,
  positioned absolutely over the image
- A slide-in panel opens from the right 
  with these fields:
  * Element / Component name (text input)
  * Behaviour description (textarea)
  * Interaction type (dropdown):
    Click / Hover / Swipe / Long press / Drag
  * States (multi-select checkboxes):
    Default / Hover / Active / Disabled / 
    Error / Loading
  * CSS Details (collapsible sub-section 
    with individual text inputs for):
    display / width / height / padding / 
    margin / font-size / font-weight / 
    color / background-color / 
    border-radius / box-shadow / opacity
  * Developer Notes (textarea)
  * Save Annotation button
  * Cancel button
- On Save: pin stays on image, 
  panel closes, annotation added to table
- Pins are numbered sequentially per screen
- Clicking an existing pin opens its 
  annotation panel to view or edit
- When Annotation Mode is OFF:
  Pins still visible, clicking opens 
  read-only panel

Annotation table below image:
Columns: # / Element / Behaviour / 
States / Notes & CSS
Each row corresponds to a pin number.
Clicking a row highlights its pin on image.

FLOWS sub-tab:

Figma prototype or flow diagram embed:
- URL input field
- Rendered iframe below

Flow Step-by-Step table:
Columns: Step / Screen / User Action / 
Transition / Destination / Condition
Add row button.
All cells inline editable.

Flow Notes section:
Textarea for edge cases, error paths, 
and decision points.

---

SECTION 09 — PROTOTYPES

List of prototype entries.
Add Prototype button adds new entry.

Each prototype entry shows:
- Prototype name (editable text)
- Version (text input)
- Status dropdown: 
  Draft / In Review / Approved
- Description (textarea)
- Figma prototype embed URL input
- When URL entered, renders as 
  interactive iframe below
- Last updated (auto timestamp)
- Delete prototype button

---

SECTION 10 — USABILITY TESTING

Sub-tabs: 
Test Plan / Participant Log / 
Findings / Recommendations

TEST PLAN sub-tab:
Guided Q&A format, one question at a time.
Progress indicator: Question X of 7.

Questions:
1. What are you testing?
2. What are your research questions?
3. Who are your participants?
   (role, number, recruitment criteria)
4. What tasks will participants perform?
   (add multiple tasks, one per line)
5. What are you measuring?
   (metrics per task)
6. What is the test format?
   Moderated or Unmoderated (radio)
   Remote or In-person (radio)
7. What is the test duration?

After all answered, show formatted 
test plan document below.
Edit Test Plan button to go back 
to Q&A with answers pre-filled.

PARTICIPANT LOG sub-tab:
Table with columns:
ID (auto: P1, P2...) / Name or Code / 
Session Date / Format (dropdown: 
Remote/In-person) / Profile / 
Completed (dropdown: Yes/Partial/No) / Notes

Add Row button adds new row.
Each row has remove button.

On opening this sub-tab:
Check if an entry for today's date exists.
If not: auto-create a new empty row 
with today's date pre-filled.
If yes: show existing rows, 
offer Add Row button.
Do not duplicate on repeated opens.

FINDINGS sub-tab:
Add finding entries, each has:
- Finding reference number (auto: F1, F2...)
- Finding description
- Related task
- Observation type dropdown:
  Usability Issue / Positive Finding / 
  Suggestion / Question
- Severity dropdown:
  Critical / High / Medium / Low / Positive
- Affected screen (text input)
Auto-group findings by severity, 
Critical shown first.
Add Finding button.
Each finding has remove button.

RECOMMENDATIONS sub-tab:
Auto-populate cards from all Critical 
and High severity findings.
Each auto-card shows:
- Severity badge
- Affected area
- Finding text
- Recommended Solution textarea
- Effort dropdown: Low/Medium/High
- Impact dropdown: Low/Medium/High
- Owner text input

Below auto-cards, show:
All Recommendations table with columns:
Finding Ref / Recommendation / 
Effort / Impact / Owner / Status
Status dropdown: 
Not Started / In Progress / Done
Add Row button for manual recommendations.

---

SECTION 11 — FEATURE METRICS

Top stat cards (auto-calculated):
- Total Metrics
- On Track (green count)
- At Risk (amber count)
- Off Track (red count)

Feature Metrics Table:
Columns:
Feature / Metric / Frequency / 
Baseline / Target / Current / Status / Owner

Add Metric button adds new row.
All cells inline editable.
Each row has remove button.

Frequency dropdown per row:
Daily / Weekly / Monthly / Quarterly

Status auto-calculated per row:
If no current value → ⚪ Not Tracked
If current meets or exceeds target → 
  🟢 On Track
If current is 80–99% of target → 
  🟡 At Risk
If current is below 80% of target → 
  🔴 Off Track

Each row has a "Lower is better" toggle.
When on, reverse the logic:
If current ≤ target → 🟢 On Track
If current is target to 120% of target → 
  🟡 At Risk
If current > 120% of target → 
  🔴 Off Track

Status updates instantly when current 
value is changed.
Status color shown as colored text label.

Measurement Notes section below table:
Textarea for notes on how metrics are 
collected, what tools used, any caveats.

---

SECTION 12 — MEETING NOTES

Header shows count of meetings logged.
New Meeting button (primary, top right).

On opening this section:
Check localStorage for today's date.
If no meeting entry exists for today →
  Auto-create a new empty meeting entry
  with today's date pre-filled.
If an entry exists for today →
  Show it expanded. 
  Show Add Another Meeting button.
Do not create duplicates on repeated opens.

Each meeting entry shows as a card:
- Collapse/expand toggle
- Calendar icon + Meeting title (editable)
- Date (auto-filled, editable)
- Meeting type tag: 
  Ad hoc / Sprint Review / Stakeholder / 
  Design Review / Other (dropdown)
- Delete meeting button

Expanded content:
Two columns: Agenda and Attendees
Each as a bullet list with Add item button.

Discussion Points:
Full-width textarea.
Placeholder: "Summarise the key topics 
discussed, questions raised, and context 
shared. This is a narrative section, 
not a transcript."

Decisions Made:
Bullet list with Add item button.

Action Items table:
Columns: Task / Owner / Due Date / Status
Status dropdown: 
Open / In Progress / Done
Add row button.
Each row has remove button.

All entries shown in reverse 
chronological order (newest first).

---

SECTION 13 — CHANGELOG

This section is fully automatic.
No manual editing of entries.

One manual action allowed:
"Log Design Change" button at the top.
This opens a modal described below.

All other entries are auto-generated 
by the system as described below.

DESIGN CHANGE LOG MODAL:
This is the only way to manually 
log a version entry.
It opens when user clicks 
"Log Design Change" button.

The modal asks:
Step 1 — What type of change is this?
Show as selectable cards, 
user must pick exactly one:

PATCH changes (increment patch number):
□ Spacing or layout adjustment
□ Color or style tweak
□ Typography update
□ Icon change or update
□ Copy edit or text correction
□ Minor UI polish
□ CSS or annotation update

MINOR changes (increment minor number, 
reset patch to 0):
□ New screen added
□ New user flow added
□ New prototype added
□ UI enhancement to existing screen
□ New component or pattern introduced
□ New interaction or animation defined
□ Updated existing flow or screen significantly

MAJOR changes (increment major number, 
reset minor and patch to 0):
□ Full redesign of a section or feature
□ New design system applied
□ Breaking change requiring 
  dev rework
□ Major UX strategy shift
□ Phase completion 
  (e.g. Wireframing done, 
  starting UI Design)

Step 2 — Describe what changed:
Textarea: "Briefly describe what was 
changed in this version"
Placeholder: 
"e.g. Updated the onboarding flow — 
moved email verification to step 2 
and removed step 4"

Step 3 — Which screens are affected?
Text input: "Screen names or areas affected"
Placeholder: "e.g. Onboarding Step 1, 
Sign-up form, Dashboard"

Confirm & Log Version button.
Cancel button.

On confirm:
- Determine change type from selection
- Increment version accordingly:
  PATCH: v1.2.3 → v1.2.4
  MINOR: v1.2.3 → v1.3.0
  MAJOR: v1.2.3 → v2.0.0
- Create changelog entry with:
  New version number
  Date and time (auto)
  Change type badge: 
    MAJOR (red) / MINOR (blue) / PATCH (grey)
  Change category (from card selection)
  Description (from textarea)
  Screens affected (from input)
- Update version displayed everywhere:
  Cover page, topbar, project card 
  on dashboard
- Close modal

AUTO-GENERATED CHANGELOG ENTRIES
(these do not bump version, 
they only log activity):

These auto-log without a version bump:
- Project created → 
  "Project initialised — v1.0.0"
- Status changed → 
  "Status changed from [old] to [new]"
- Phase changed → 
  "Phase updated to [new phase]"
- Prototype status changed → 
  "Prototype [name] marked as [status]"
- Feature metric value updated → 
  "Metric updated: [feature] — 
  Current: [value] — Status: [status]"
- Usability test recommendation 
  marked done → 
  "Recommendation resolved: [short text]"
- Meeting logged → 
  "Meeting logged: [date] — [title]"
- Heuristic audit completed → 
  "Heuristic audit completed. 
  Score: [X]/50. 
  [N] critical issues identified."

These entries show with an INFO badge 
(grey, no version number shown).

CHANGELOG DISPLAY:
Each entry shows:
- Version number OR INFO badge
- Date and time
- Change type badge
- Category label
- Description
- Screens affected (if applicable)
Entries shown newest first.
Cannot be deleted or edited.
Total entries count shown at top.

---

VERSIONING RULES SUMMARY

Format: v<major>.<minor>.<patch>
Starting version: v1.0.0

PATCH bump → v1.0.0 to v1.0.1
Spacing, color, typography, icon, 
copy, minor polish, CSS, annotations

MINOR bump → v1.0.0 to v1.1.0
New screen, new flow, new prototype,
UI enhancement, new component, 
new interaction, updated existing screen

MAJOR bump → v1.0.0 to v2.0.0
Full redesign, new design system, 
breaking change, major UX shift, 
phase completion

MAJOR bump resets minor and patch to 0.
MINOR bump resets patch to 0.
Version only changes when user explicitly 
logs a design change via the modal.
Auto-logged activity entries 
do not change version.

---

DATA PERSISTENCE

Store all data in localStorage 
under key: "uxHub_projects"
as a JSON array of project objects.

Each project object contains:
- id (unique string)
- name
- owner
- status
- phase
- version (semantic: major.minor.patch)
- createdAt
- lastUpdated
- progress (auto-calculated)
- All 13 section data as nested objects
- changelog array

On every change:
- Write to localStorage immediately 
  for dropdowns and selections
- Write with 800ms debounce 
  for text inputs
- Update lastUpdated timestamp
- Recalculate progress
- Update version badge in topbar
- Update project card on dashboard

On page load:
- Read from localStorage
- Restore all data exactly as saved
- Render dashboard with all project cards
- No data loss on refresh or reopen

---

TECHNICAL REQUIREMENTS

Single HTML file with all CSS and JS inline.
No external libraries or frameworks.
No backend, no API calls except iframes.
Works on latest Chrome, Firefox, Safari.
Responsive down to 1280px wide minimum.
All modals closable with Escape key.
Enter key submits forms where appropriate.
Tab key navigates between form fields.
All iframes for Figma embeds use:
allow="fullscreen" attribute.
Figma embed URLs should use the format:
https://www.figma.com/embed?embed_host=share&url=[url]