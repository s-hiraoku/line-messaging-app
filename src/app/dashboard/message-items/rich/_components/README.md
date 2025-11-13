# RichMessageEditor Component

This directory contains the imagemap editor implementation for LINE rich messages (imagemap messages).

## Overview

The RichMessageEditor is adapted from the existing rich menu visual editor components but specifically designed for imagemap messages with the following key differences:

- **Fixed size**: 1040x1040 pixels (LINE API standard for imagemap messages)
- **Limited actions**: Only URI and Message actions (no postback, datetimepicker, etc.)
- **Coordinate system**: Uses 1040x1040 base coordinates consistently

## Component Structure

```
_components/
├── editor.tsx                      # Main editor component
├── imagemap-canvas.tsx             # Canvas display and interaction
├── imagemap-area-list.tsx          # List of areas
├── imagemap-area-item.tsx          # Individual area item
├── hooks/
│   ├── use-imagemap-scale.ts       # Canvas scaling hook
│   ├── use-imagemap-area-selection.ts  # Area selection/manipulation
│   └── use-imagemap-canvas-drawing.ts  # Canvas drawing logic
└── utils/
    ├── imagemap-canvas-utils.ts    # Canvas coordinate utilities
    └── imagemap-drawing-utils.ts   # Drawing functions
```

## Usage

```tsx
import { RichMessageEditor, type ImagemapArea } from "./_components/editor";

function MyComponent() {
  const [areas, setAreas] = useState<ImagemapArea[]>([]);

  return (
    <RichMessageEditor
      imageUrl="https://example.com/image.jpg"
      areas={areas}
      onAreasChange={setAreas}
    />
  );
}
```

## Features

### Area Creation
- Drag on the canvas to create new rectangular areas
- Minimum size constraint: 50x50 pixels
- Areas constrained to image boundaries (1040x1040)

### Area Selection
- Click on an area to select it
- Selected areas show resize handles
- Only one area can be selected at a time

### Area Movement
- Click and drag selected area to move it
- Movement constrained to image boundaries
- Position snaps to pixel boundaries

### Area Resizing
- Drag resize handles (corners and edges) to resize
- Minimum size enforced (50x50 pixels)
- Constrained to image boundaries

### Area Actions
Each area can have one of two action types:
- **URI**: Opens a URL when tapped (linkUri field)
- **Message**: Sends a message when tapped (text field)

### Keyboard Shortcuts
- **Escape**: Delete currently selected area

## Data Types

```typescript
interface ImagemapArea {
  x: number;          // X coordinate (0-1040)
  y: number;          // Y coordinate (0-1040)
  width: number;      // Width in pixels
  height: number;     // Height in pixels
  action: {
    type: "uri" | "message";
    linkUri?: string;  // For URI actions
    text?: string;     // For message actions
  };
}
```

## Implementation Details

### Coordinate System
- All coordinates are stored in 1040x1040 base (LINE API standard)
- Canvas may be displayed at different sizes (responsive)
- Scale factor is calculated dynamically: `scale = displaySize / 1040`
- Conversions happen automatically in the hooks

### Reused Components
The editor leverages existing patterns from the rich menu editor:
- Color scheme and styling from `@/constants/richmenu`
- Similar mouse event handling patterns
- Adapted hooks and utilities for imagemap-specific requirements

### Differences from Rich Menu Editor
1. **Fixed Size**: Imagemap is always 1040x1040 (not variable like rich menus)
2. **Action Types**: Only URI and Message (no postback, datetimepicker, etc.)
3. **Coordinate Storage**: Coordinates stored directly in area object (not nested in bounds)
4. **Simpler Interface**: No size selection, always fixed dimensions

## Testing

Tests are included in `editor.test.tsx`:
```bash
npm test -- src/app/dashboard/message-items/rich/_components/editor.test.tsx
```

## Integration with LINE API

When sending to LINE API, the areas are used directly in the imagemap message:

```typescript
const message = {
  type: "imagemap",
  baseUrl: imageUrl,
  altText: "Image map",
  baseSize: {
    width: 1040,
    height: 1040,
  },
  actions: areas.map(area => ({
    type: area.action.type,
    area: {
      x: area.x,
      y: area.y,
      width: area.width,
      height: area.height,
    },
    ...(area.action.type === "uri" && { linkUri: area.action.linkUri }),
    ...(area.action.type === "message" && { text: area.action.text }),
  })),
};
```

## Future Enhancements

Potential improvements:
- [ ] Undo/redo functionality
- [ ] Area duplication
- [ ] Grid snapping
- [ ] Alignment guides
- [ ] Area templates
- [ ] Import/export area definitions
