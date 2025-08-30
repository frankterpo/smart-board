# Brand-Neutral Kanban Board Clone - Design Specification

## Overview
This specification describes a generic Kanban board application reverse-engineered from Trello's UX patterns, without any proprietary branding, colors, or specific design elements.

## Component Architecture

### 1. Top Navigation Bar
- **Purpose**: Primary app navigation and user actions
- **Components**:
  - App switcher button (left)
  - Home/back navigation
  - Global search input
  - Create button
  - User notifications
  - User profile menu
- **Layout**: Horizontal flex layout, dark header bar
- **Spacing**: ~16px padding, ~8px between items

### 2. Board Header
- **Purpose**: Board-specific controls and metadata
- **Components**:
  - Editable board title
  - Views toggle button
  - Board member avatars (circular, ~32px)
  - Power-ups/Extensions button  
  - Automation button
  - Filter cards button
  - Star/favorite button
  - Visibility settings
  - Share button (primary CTA style)
  - Menu toggle
- **Layout**: Horizontal flex with left/right groups
- **Spacing**: ~12px between elements, ~16px from edges

### 3. Board Canvas
- **Purpose**: Main workspace containing lists
- **Layout**: Horizontal scrolling container
- **Background**: Gradient background (neutral colors)
- **Spacing**: ~12px gutters between lists
- **Dimensions**: Full viewport height minus headers

### 4. List Component
- **Purpose**: Vertical container for cards
- **Structure**:
  - List header with title (editable)
  - Collapse/expand toggle
  - Action menu (ellipsis)
  - Card container (vertical scroll)
  - "Add card" button
  - "Create from template" button
- **Styling**:
  - Background: Semi-transparent card background
  - Border radius: ~8px
  - Padding: ~12px
  - Min width: ~272px
  - Max width: ~300px
- **States**: Default, collapsed, dragging

### 5. Card Component
- **Purpose**: Individual task/item representation
- **Structure**:
  - Optional cover image/color
  - Card title (editable)
  - Optional badges (checklist progress, due date, comments, etc.)
  - Hover states and actions
- **Styling**:
  - Background: White/light background
  - Border radius: ~8px
  - Padding: ~8px-12px
  - Box shadow: Subtle elevation
  - Border: Minimal or none
- **Interactions**: Click to open, drag to reorder/move
- **States**: Default, hover, selected, dragging

### 6. Card Modal
- **Purpose**: Detailed card editing interface
- **Layout**: Overlay modal with multiple sections
- **Structure**:
  - Header with navigation breadcrumb
  - Cover image area
  - Main content area:
    - Card completion checkbox
    - Title (editable)
    - Quick action buttons (Add, Labels, Dates, Checklist, Members)
    - Description section with rich text
    - Attachments section
    - Checklists with progress indicators
  - Right sidebar:
    - Comments and activity feed
    - Activity timeline
- **Dimensions**: ~750px wide, responsive height
- **Navigation**: Tabs at bottom for different sections

## Design Tokens

### Spacing Scale
```css
--space-xs: 4px
--space-sm: 8px
--space-md: 12px
--space-lg: 16px
--space-xl: 24px
--space-2xl: 32px
```

### Border Radius Scale
```css
--radius-sm: 4px
--radius-md: 8px
--radius-lg: 12px
--radius-xl: 16px
```

### Elevation/Shadow Scale
```css
--shadow-sm: 0 1px 3px rgba(0,0,0,0.1)
--shadow-md: 0 2px 6px rgba(0,0,0,0.15)
--shadow-lg: 0 4px 12px rgba(0,0,0,0.2)
--shadow-xl: 0 8px 24px rgba(0,0,0,0.25)
```

### Color Palette (Brand Neutral)
```css
/* Neutral grays */
--color-gray-50: #f8fafc
--color-gray-100: #f1f5f9
--color-gray-200: #e2e8f0
--color-gray-300: #cbd5e1
--color-gray-400: #94a3b8
--color-gray-500: #64748b
--color-gray-600: #475569
--color-gray-700: #334155
--color-gray-800: #1e293b
--color-gray-900: #0f172a

/* Primary brand color (generic blue) */
--color-primary-50: #eff6ff
--color-primary-100: #dbeafe
--color-primary-500: #3b82f6
--color-primary-600: #2563eb
--color-primary-700: #1d4ed8

/* Status colors */
--color-success: #10b981
--color-warning: #f59e0b
--color-error: #ef4444
--color-info: --color-primary-500

/* Background gradients */
--bg-board: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
```

### Typography Scale
```css
--font-family-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
--font-size-xs: 0.75rem    /* 12px */
--font-size-sm: 0.875rem   /* 14px */
--font-size-base: 1rem     /* 16px */
--font-size-lg: 1.125rem   /* 18px */
--font-size-xl: 1.25rem    /* 20px */
--font-size-2xl: 1.5rem    /* 24px */

--font-weight-normal: 400
--font-weight-medium: 500
--font-weight-semibold: 600
--font-weight-bold: 700
```

### Animation/Transition Values
```css
--transition-fast: 150ms ease-out
--transition-normal: 250ms ease-out
--transition-slow: 350ms ease-out

/* Drag and drop specific */
--drag-transition: transform 200ms ease-out
--drop-zone-transition: background-color 150ms ease-out
```

## Component States & Behaviors

### Drag and Drop System
- **Draggable Items**: Cards, Lists
- **Drop Zones**: Lists (for cards), Board canvas (for lists)
- **Visual Feedback**: 
  - Dragged item: Reduced opacity, transform/scale
  - Drop zones: Highlighted background, border changes
  - Placeholder: Dotted outline or ghost element
- **Animations**: Smooth transitions, spring-like physics

### Keyboard Navigation
- **Tab order**: Logical flow through interactive elements
- **Shortcuts**: 
  - ESC: Close modals/cancel actions
  - Enter: Confirm/submit
  - Arrow keys: Navigate between cards/lists
  - Space: Select/activate
- **Focus indicators**: Clear visual focus rings

### Loading States
- **Initial load**: Skeleton placeholders
- **Card actions**: Inline spinners
- **Drag operations**: Optimistic updates

### Error States
- **Network errors**: Toast notifications
- **Validation errors**: Inline field errors
- **Fallback states**: Generic error boundaries

## Accessibility Requirements
- **Semantic HTML**: Proper heading hierarchy, landmarks
- **ARIA attributes**: Labels, descriptions, live regions
- **Color contrast**: WCAG AA compliance minimum
- **Focus management**: Proper focus trapping in modals
- **Screen reader support**: Meaningful descriptions for drag/drop

## Responsive Behavior
- **Desktop**: Full feature set, multi-column layout
- **Tablet**: Adjusted spacing, touch-optimized targets  
- **Mobile**: Single column view, bottom sheet modals, swipe gestures

## Performance Considerations
- **Virtual scrolling**: For large lists of cards
- **Lazy loading**: Images and non-critical content
- **Debounced actions**: Search, auto-save
- **Optimistic updates**: Immediate UI feedback