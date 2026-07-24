import { getDocs, query, where, collection, limit } from 'firebase/firestore'
import { db } from './firebase'
import { createCommand } from './db'

// Seeds COMMAND-001 (FleetFlow Repository Refactor) if no commands exist yet.
// Runs once per user on first load. Idempotent — checks before writing.

export async function seedCommandsIfEmpty(uid) {
  try {
    const snap = await getDocs(
      query(collection(db, 'users', uid, 'commands'), limit(1))
    )
    if (!snap.empty) return // already seeded
    await createCommand(uid, COMMAND_001)
  } catch (err) {
    console.warn('[seedCommands] failed:', err?.code || err)
  }
}

const COMMAND_001 = {
  commandNumber:    'COMMAND-001',
  title:            'FleetFlow Repository Refactor',
  targetSystem:     'FleetFlow',
  status:           'pending_approval',
  priority:         'high',
  risk:             'high',
  executionAgent:   'K.E.L.',

  state:
    'FleetFlow is a 20,425-line monolithic HTML file (v50, April 2026). ' +
    'The deployed app is the root index.html served directly by Netlify (publish = "."). ' +
    'A parallel React/Vite source structure exists in src/ but the compiled output is not in sync with the deployed file. ' +
    'Firebase project is movemastersos (production). ' +
    '11 Firestore collections in use. 14 distinct functional systems identified in the audit. ' +
    'Theme toggle, auth, job CRUD, payroll, calendar, notifications, warehouse, leads, and Stripe are all inline.',

  constraint:
    'Cannot safely iterate on features, fix bugs, or add integrations without decomposing the monolith. ' +
    'Any patch to index.html risks breaking adjacent systems — auth, Firebase config, payroll logic, and UI ' +
    'are entangled in a single file with no module boundaries. ' +
    'The Firebase SDK used inline (v8 compat CDN) does not match src/firebase.js (v10 modular), ' +
    'creating a split that blocks unified builds.',

  nextAction:
    'Begin Phase 1: Extract zero-dependency files. ' +
    'src/constants/collections.js (COL_* strings). ' +
    'src/styles/theme.css (CSS verbatim lift, lines 111–650 + 7243–7353). ' +
    'src/firebase.js (firebaseConfig migrated to v10 modular syntax). ' +
    'None of these have internal dependencies. Each can be extracted and verified independently.',

  successCondition:
    'All 15 parity checklist items pass after npm run build produces output ' +
    'matching current production behavior. ' +
    'Netlify deploys the built dist/ output. ' +
    'FleetFlow main shows real production data, theme toggle works, no demo code present.',

  proofRequired: 'Parity checklist complete — all 15 items verified against live production',

  phases: [
    {
      number: 1,
      name: 'Core Infrastructure',
      status: 'pending',
      tasks: [
        'Extract COL_* constants → src/constants/collections.js',
        'Lift CSS verbatim → src/styles/theme.css (lines 111–650 + 7243–7353)',
        'Migrate Firebase config to v10 modular → src/firebase.js',
      ],
    },
    {
      number: 2,
      name: 'State & Sync',
      status: 'pending',
      tasks: [
        'Extract STATE object + globals → src/state.js',
        'Extract 11 Firestore listeners + initFirestore → src/services/firestore-sync.js',
        'Verify debounce logic and DB_LOADED gate are preserved',
      ],
    },
    {
      number: 3,
      name: 'Auth & Session',
      status: 'pending',
      tasks: [
        'Extract doLogin, doLogout, session mgmt → src/auth.js',
        'Extract ROLE_TIER, canModifyUser, canDeleteUser → src/permissions.js',
        'Extract createAdminAccount, doPasswordRecovery → src/auth.js',
      ],
    },
    {
      number: 4,
      name: 'Core UI Shell',
      status: 'pending',
      tasks: [
        'Extract setTheme, _updateThemeBtns → src/theme.js',
        'Extract login/setup/recovery HTML → src/components/Login.jsx',
        'Extract topbar → src/components/Header.jsx',
        'Extract buildTabs, switchTab → src/components/Navigation.jsx',
        'BUILD and verify parity before Phase 5',
      ],
    },
    {
      number: 5,
      name: 'Feature Components',
      status: 'pending',
      tasks: [
        'Dashboard → src/components/Dashboard.jsx',
        'Jobs → src/components/Jobs.jsx',
        'Money → src/components/Money.jsx',
        'Calendar → src/components/Calendar.jsx',
        'Team → src/components/Team.jsx',
        'Warehouse → src/components/Warehouse.jsx',
        'Notifications → src/components/Notifications.jsx',
        'Leads → src/components/Leads.jsx',
        'Settings → src/components/Settings.jsx',
        'System → src/components/System.jsx',
      ],
    },
    {
      number: 6,
      name: 'Utilities & Services',
      status: 'pending',
      tasks: [
        'src/utils/date.js — getTodayStr, getDateOffset, getNextPayday',
        'src/utils/calculations.js — calcJobFuelCost, calcLoadScore, estimateDistance',
        'src/utils/ui.js — notify, openModal, closeModal, showLoadingOverlay',
        'src/services/payments.js — Stripe integration',
        'src/pwa.js — offline queue, PWA install banner',
      ],
    },
  ],

  parityChecklist: [
    { id: 'pc-01', item: 'Login with username + password',                        verified: false },
    { id: 'pc-02', item: 'Role-based tab visibility (driver ≠ owner ≠ creator)',   verified: false },
    { id: 'pc-03', item: 'Creator-only tabs appear only for joe',                  verified: false },
    { id: 'pc-04', item: 'Session persists on page refresh',                       verified: false },
    { id: 'pc-05', item: 'Real jobs load from movemastersos Firebase',             verified: false },
    { id: 'pc-06', item: 'Revenue figure matches sum of job revenue',              verified: false },
    { id: 'pc-07', item: 'Active job count matches Firestore',                     verified: false },
    { id: 'pc-08', item: 'Dark theme active by default, no flash on load',         verified: false },
    { id: 'pc-09', item: 'Light/dark/system toggle changes theme immediately',     verified: false },
    { id: 'pc-10', item: 'Theme choice persists after page refresh',               verified: false },
    { id: 'pc-11', item: 'Can create a new job — appears in Active Jobs',          verified: false },
    { id: 'pc-12', item: 'Receipt submission works (photo + amount)',               verified: false },
    { id: 'pc-13', item: 'Calendar month view shows jobs on correct dates',        verified: false },
    { id: 'pc-14', item: 'Notifications fire on new Firestore events',             verified: false },
    { id: 'pc-15', item: 'System health tab visible only to creator (joe)',        verified: false },
  ],

  risks: [
    {
      severity: 'high',
      description:
        'Firebase SDK mismatch: index.html uses v8 CDN compat (firebase.firestore()); ' +
        'src/firebase.js uses v10 modular. Different API surface — all 11 listeners need rewriting.',
    },
    {
      severity: 'high',
      description:
        '200+ inline onclick="functionName()" handlers. In ES modules, functions are not on window ' +
        'by default. Must expose to window explicitly during migration or convert to event listeners.',
    },
    {
      severity: 'high',
      description:
        'Global variable leakage: STATE, currentUser, COMPANY_ID, DB_LOADED are globals. ' +
        'In modules these must be imported — every consumer must be updated.',
    },
    {
      severity: 'medium',
      description:
        'Cross-component render calls: renderDashboard calls functions from what will become ' +
        'Jobs.jsx, Money.jsx, etc. Circular import risk if not scoped carefully.',
    },
    {
      severity: 'medium',
      description:
        'CSS global scope: variables in theme.css are on :root — must be imported at app root, ' +
        'not per-component, or variables will not cascade.',
    },
    {
      severity: 'medium',
      description:
        'Firebase v8 → v10 query syntax changes: db.collection().where().onSnapshot() becomes ' +
        'query(collection(), where(), onSnapshot()). All 11 listeners require rewriting.',
    },
    {
      severity: 'low',
      description:
        '"Today\'s Jobs = 0" date bug is pre-existing. Do not fix during refactor — ' +
        'document it and fix separately in Phase 5.',
    },
    {
      severity: 'low',
      description:
        'PWA offline queue uses localStorage — behavior must survive the module split. ' +
        'Test on degraded connection after Phase 6.',
    },
  ],

  artifacts: [
    {
      type: 'audit',
      title: 'Repository Scope Analysis',
      body:
        'File: index.html (FleetFlow v50) · 20,425 lines · ~1.1MB\n\n' +
        '14 distinct functional systems:\n' +
        '1. Firebase config + 15 Firestore collections (lines 1934–2000)\n' +
        '2. Global STATE + 11 real-time listeners (lines 5318–5574)\n' +
        '3. Auth + session + role system (lines 5981–6600)\n' +
        '4. Jobs CRUD + travel blocks (lines 15894–16616, 2009–2439)\n' +
        '5. Money: receipts, disbursements, payroll, P&L (lines 9526–18560)\n' +
        '6. Calendar + scheduling (lines 13542–14022)\n' +
        '7. Notifications + alerts (lines 13029–13179)\n' +
        '8. Warehouse + load sheets + BOL (lines 2939–3719, 14730)\n' +
        '9. Team + user management (lines 19764–19820)\n' +
        '10. Leads CRM + claims defense (lines 10274–10939)\n' +
        '11. Settings + company branding (lines 18851, 6324–6355)\n' +
        '12. System health — creator only (lines 4812, 5165)\n' +
        '13. Stripe + payments + paywall (lines 10022–10231)\n' +
        '14. PWA + offline queue (lines 6132–6208)\n\n' +
        'Firebase: movemastersos (production)\n' +
        'SDK: v8 compat CDN (inline) — must migrate to v10 modular\n' +
        'Netlify: publish = "." — serves root index.html directly\n' +
        'Deploy: peaceiris/actions-gh-pages@v3 (pushes to gh-pages from dist/)',
    },
    {
      type: 'file_structure',
      title: 'Proposed File Structure',
      body:
        'src/\n' +
        '├── firebase.js                ← firebaseConfig, db, storage (v10 modular)\n' +
        '├── constants/collections.js   ← all COL_* string constants\n' +
        '├── state.js                   ← STATE object, COMPANY_ID, DB_LOADED\n' +
        '├── auth.js                    ← doLogin, doLogout, session mgmt\n' +
        '├── permissions.js             ← ROLE_TIER, isAdmin, canModify/Delete\n' +
        '├── theme.js                   ← setTheme, _updateThemeBtns\n' +
        '├── services/\n' +
        '│   ├── firestore-sync.js      ← initFirestore, 11 listeners, debounce\n' +
        '│   └── payments.js            ← Stripe, openStripePayment\n' +
        '├── utils/\n' +
        '│   ├── date.js                ← getTodayStr, getDateOffset\n' +
        '│   ├── calculations.js        ← calcJobFuelCost, calcLoadScore\n' +
        '│   └── ui.js                  ← notify, openModal, closeModal\n' +
        '├── styles/theme.css           ← all CSS (lines 111–650, 7243–7353)\n' +
        '├── pwa.js                     ← offline queue, install banner\n' +
        '└── components/\n' +
        '    ├── Header.jsx             ← topbar, theme buttons\n' +
        '    ├── Login.jsx              ← login/setup/recovery\n' +
        '    ├── Navigation.jsx         ← buildTabs, switchTab\n' +
        '    ├── Dashboard.jsx          ← KPIs, alerts\n' +
        '    ├── Jobs.jsx               ← job CRUD, travel blocks\n' +
        '    ├── Money.jsx              ← receipts, payroll, P&L\n' +
        '    ├── Calendar.jsx           ← month/week views\n' +
        '    ├── Team.jsx               ← user mgmt, crew\n' +
        '    ├── Warehouse.jsx          ← load sheets, BOL, fleet\n' +
        '    ├── Notifications.jsx      ← panel, badge, push\n' +
        '    ├── Leads.jsx              ← CRM pipeline, claims defense\n' +
        '    ├── Settings.jsx           ← profile, company, plan\n' +
        '    └── System.jsx             ← system health (creator only)',
    },
  ],
}
