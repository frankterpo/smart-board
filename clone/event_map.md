# Event Map - User Flows & Interaction Patterns

## Overview
This document maps the key user interactions and event flows observed in the Kanban board application.

## Core User Flows

### 1. Board Navigation
**Flow:** User loads board → Board renders → Lists display → Cards populate

**Events Observed:**
- `DOMContentLoaded` → Initial board load
- Network requests for board data, lists, cards
- Progressive rendering of UI components
- Focus management for accessibility

**UI State Changes:**
- Loading skeleton → Populated lists
- URL updates to board route
- Navigation breadcrumbs update

### 2. Card Interaction Flow
**Flow:** User clicks card → Modal opens → Card details display → Editable interface

**Events:**
- `click` on card link → Navigation to `/c/{cardId}/{cardSlug}`
- Modal dialog renders with:
  - Card metadata (title, description, attachments)
  - Action buttons (Labels, Dates, Checklist, Members)
  - Comments and activity feed
  - Inline editing capabilities

**Key Interactions:**
- **Card Title Editing**: Click → contenteditable → blur/enter to save
- **Checkbox Completion**: Click checkbox → optimistic UI update → API call
- **Modal Navigation**: ESC key → close modal → return to board
- **Breadcrumb Navigation**: List name click → board context

**Accessibility Features:**
- Modal focus trapping
- Keyboard navigation (Tab, Enter, ESC)
- ARIA labels and live regions
- Screen reader announcements

### 3. List Management
**Flow:** User manages lists → Create/Edit/Reorder → Board updates

**Observed Patterns:**
- **List Title Editing**: Inline contenteditable fields
- **List Actions**: Dropdown menu with collapse, archive, move options
- **List Creation**: "Add another list" button → inline form
- **List Reordering**: Horizontal drag and drop

**Events:**
- `dragstart` → `dragover` → `dragend` for list reordering
- `input` events for title editing with debounced saves
- `click` events for expand/collapse states

### 4. Card Management Within Lists
**Flow:** User manages cards → Add/Edit/Move/Delete → List updates

**Card Creation Pattern:**
- "Add a card" button → Inline text input appears
- Type title → Enter/click save → Card created
- ESC → Cancel creation

**Card Reordering:**
- Drag handle on hover
- `dragstart` on card → visual placeholder
- `dragover` on drop zones → highlight valid targets
- `drop` → position update → API call → UI update

**Quick Actions:**
- Hover → Edit pencil icon appears
- Click completion checkbox → Toggle state
- Click card → Open detail modal

### 5. Card Detail Modal Interactions
**Flow:** Modal opens → Multiple interaction contexts → Save states → Close

**Primary Actions:**
- **Add Button**: Dropdown with Attachment, Checklist, Label, Member options
- **Labels**: Color-coded tags with hover states
- **Dates**: Due date picker with calendar widget
- **Checklist**: Expandable list with progress bar
- **Members**: Avatar selection with search

**Checklist Interaction Pattern:**
```
User clicks "Add checklist" → 
Checklist section appears → 
"Add an item" button → 
Inline text input → 
Type item text → 
Enter/Save → 
New checkbox item created →
Click checkbox → Toggle complete state → Progress bar updates
```

**Comments & Activity:**
- Comment text area with formatting options
- Real-time activity feed with timestamps
- User attribution with avatars
- Action history (card moved, checklist completed, etc.)

## Event Types & Handlers

### DOM Events
| Event | Element | Handler Action | State Change |
|-------|---------|---------------|---------------|
| `click` | Card link | Navigate to card modal | URL change, modal open |
| `click` | Add card button | Show inline form | Form state active |
| `input` | Card title | Debounced auto-save | Title update |
| `keydown` | Modal (ESC) | Close modal | Return to board view |
| `dragstart` | Card/List | Initialize drag operation | Drag state active |
| `dragover` | Drop zone | Highlight valid target | Visual feedback |
| `drop` | List/Position | Update item position | Reorder animation |

### Custom Events (Inferred)
| Event | Purpose | Payload | Response |
|-------|---------|---------|----------|
| `card:created` | New card added | `{listId, title, position}` | UI update, API call |
| `card:moved` | Card repositioned | `{cardId, fromList, toList, position}` | Optimistic update |
| `checklist:updated` | Checklist progress | `{cardId, completed, total}` | Progress bar update |
| `board:updated` | Board state change | `{boardId, changes}` | Global state sync |

### Network Request Patterns

**Observed API Endpoints:**
- Board data: `GET /1/boards/{boardId}`
- Card operations: `PUT /1/cards/{cardId}`
- List operations: `PUT /1/lists/{listId}`
- Real-time updates: WebSocket connections (inferred)

**Request Characteristics:**
- RESTful pattern with resource-based URLs
- Optimistic UI updates before API confirmation
- Error handling with rollback capability
- Batch operations for multiple changes

## Keyboard Shortcuts & Accessibility

### Keyboard Navigation
| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Board/Modal | Navigate between interactive elements |
| `Enter` | Card/Button | Activate/Open item |
| `Escape` | Modal/Form | Cancel/Close |
| `Arrow Keys` | Card focus | Navigate between cards |
| `Space` | Checkbox | Toggle completion state |

### Focus Management
- **Modal Opening**: Focus trapped within modal
- **Modal Closing**: Focus returns to triggering element
- **Form Creation**: Focus moves to new input field
- **Drag Operations**: Keyboard alternatives provided

### ARIA Implementation
- **Live Regions**: Status updates announced
- **Labels**: All interactive elements labeled
- **Roles**: Proper semantic roles (dialog, button, checkbox)
- **States**: Dynamic state changes communicated

## Performance Considerations

### Optimistic Updates
- Card completion: Immediate checkbox update
- Card movement: Immediate visual repositioning
- Text edits: Real-time preview with debounced saves

### Loading States
- Skeleton placeholders during initial load
- Inline spinners for individual operations
- Progress indicators for long-running tasks

### Error Handling
- Network failures: Toast notifications
- Validation errors: Inline field errors
- Conflict resolution: User choice prompts

## Real-time Collaboration (Inferred)
Based on observed behavior, the system likely includes:
- WebSocket connections for live updates
- Operational transformation for concurrent edits
- User presence indicators
- Conflict resolution strategies
- Activity feed updates in real-time

## State Management Patterns
- **Local State**: Component-specific UI states
- **Global State**: Board, lists, cards data
- **Optimistic Updates**: Immediate UI feedback
- **Error Boundaries**: Graceful failure handling
- **Persistence**: Local storage for preferences
