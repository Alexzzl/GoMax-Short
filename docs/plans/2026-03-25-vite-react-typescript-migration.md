# GoMax Short Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Refactor the current Samsung TV widget from legacy HTML/CSS/JS into a Vite + React + TypeScript app while preserving all existing user-facing behavior.

**Architecture:** Keep the existing visual structure, CSS, assets, and data model, but replace global DOM mutation modules with React components, typed state, and focused hooks for navigation, remote control, and scaling. Build output should remain package-friendly for Tizen by copying `config.xml`, `icon.png`, and `assets/` into `dist/`.

**Tech Stack:** Vite, React, TypeScript, Vitest, Testing Library

---

### Task 1: Bootstrap Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `scripts/generate-mock-data.mjs`

**Step 1: Add Vite + React + TypeScript dependencies**

Write the package manifest with scripts for dev, build, test, and generated data refresh.

**Step 2: Add TypeScript and Vite configuration**

Create a strict TypeScript config and a Vite config that copies widget packaging assets into `dist/`.

**Step 3: Add mock-data generation script**

Create a script that evaluates the legacy `js/data/mock.js` file and emits typed static exports into `src/data/mock-data.generated.ts`.

**Step 4: Verify config files are valid**

Run: `npm install`
Expected: dependencies install with no manifest errors.

### Task 2: TDD the App State Layer

**Files:**
- Create: `src/core/app-state.test.ts`
- Create: `src/core/app-state.ts`
- Create: `src/data/media-library.test.ts`
- Create: `src/data/media-library.ts`

**Step 1: Write failing tests for navigation stack behavior**

Cover home initialization, push-on-navigate, and go-back semantics.

**Step 2: Run tests to confirm failures**

Run: `npm test`
Expected: failures because the modules do not exist yet.

**Step 3: Implement minimal typed reducers/helpers**

Add pure state helpers for navigation, favorites, and watch history.

**Step 4: Re-run tests**

Run: `npm test`
Expected: new state-layer tests pass.

### Task 3: TDD the React Shell

**Files:**
- Create: `src/App.test.tsx`
- Create: `src/App.tsx`
- Create: `src/main.tsx`
- Create: `src/test/setup.ts`

**Step 1: Write failing render tests**

Verify the app renders the loading overlay, navigation, and the initial Home page.

**Step 2: Run tests to confirm red**

Run: `npm test`
Expected: render tests fail because the app shell is not implemented yet.

**Step 3: Implement the main React shell**

Create the app root, load legacy CSS, and render the overall page chrome.

**Step 4: Re-run tests**

Run: `npm test`
Expected: app-shell tests pass.

### Task 4: Port Pages and Interactions

**Files:**
- Create: `src/components/*`
- Create: `src/hooks/*`
- Modify: `index.html`

**Step 1: Port Home, Discover, Detail, Player, History, and Categories pages**

Keep the current DOM structure and class names so the existing CSS remains valid.

**Step 2: Wire navigation, favorites, history, playback, and page header behavior**

Replace legacy globals with React state and typed handlers.

**Step 3: Port remote control and zoom behavior**

Implement focus management, Samsung key handling, and `1920x1080` scale behavior in hooks.

**Step 4: Re-run tests**

Run: `npm test`
Expected: page and interaction tests pass.

### Task 5: Final Verification

**Files:**
- Modify: `index.html`
- Verify: `dist/**`

**Step 1: Run the full test suite**

Run: `npm test`
Expected: all tests pass.

**Step 2: Run the production build**

Run: `npm run build`
Expected: Vite builds successfully and emits `dist/index.html`, `dist/config.xml`, `dist/icon.png`, and `dist/assets/**`.

**Step 3: Inspect packaging output**

Confirm that `config.xml` still points to `index.html` and that static asset paths remain compatible with the widget packaging flow.
