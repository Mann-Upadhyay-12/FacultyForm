# Padh.ai Development Plan

This file outlines the tasks to transform this project into a full-featured, reusable AI website template.

## Phase 1: Core Functionality & Bug Fixes

- [x] **Fix `auth_service` Restart Loop**
  - [x] Inspect `auth_service` container logs to identify the crash reason.
  - [x] Analyze the service's source code and configuration based on the error.
  - [x] Apply a fix to stabilize the service.
  - [x] Verify the `auth_service` is running and healthy.

## Phase 2: UI/UX Refinement (Based on User Vision)

- [x] **Replace Sidebar with Tabbed Interface**
  - [x] Identify and remove the old sidebar component from the main layout.
  - [x] Integrate a tab component into the right-hand pane.
  - [x] Move the "Chat/Summary" view into the first tab.
  - [x] Create placeholder tabs for "Notes," "Quiz," "Flash Cards," etc.

- [ ] **Improve Layout and Flow**
  - [ ] Implement a true "mode-based" layout (Focus, Work, Test).
  - [ ] Create a dedicated dashboard for logged-in users.
  - [ ] Design and implement the "study flow" (e.g., triggering a quiz after N topics).

## Phase 3: Foundational Template Features

- [ ] **Enhance User Management**
- [ ] **Implement Billing & Subscriptions**
- [ ] **Add Vector Database for RAG (Retrieval-Augmented Generation)**

## Phase 4: Advanced Features & Polish

- [ ] **Build an Analytics Dashboard**
- [ ] **Modularize AI Services**
