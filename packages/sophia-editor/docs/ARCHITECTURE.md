# Sophia Editor Architecture

This document describes the architecture of the sophia-editor package, which provides content authoring UI for Sophia assessment content.

## Overview

sophia-editor is the content authoring counterpart to the sophia rendering package. It provides:

- **Editor components** for creating and modifying widget content
- **Mode-aware editing** that adapts UI based on assessment purpose (mastery, discovery, reflection)
- **Widget registration** system matching sophia's widget system
- **Subscale mapping UI** for discovery mode assessments

## Component Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                       EditorPage                                 │
│                                                                  │
│  Top-level container for the full editing experience            │
│  Includes preview, device framer, and diff views                │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────┐  ┌───────────────────────┐           │
│  │    ArticleEditor      │  │     ContentPreview    │           │
│  │                       │  │                       │           │
│  │  Multi-section        │  │  Live preview of      │           │
│  │  article editing      │  │  rendered content     │           │
│  └───────────────────────┘  └───────────────────────┘           │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                          Editor                            │  │
│  │                                                            │  │
│  │  Core content editor with markdown + widget support        │  │
│  │                                                            │  │
│  │  ┌────────────────────────────────────────────────────┐   │  │
│  │  │                    WidgetEditor                     │   │  │
│  │  │                                                     │   │  │
│  │  │  Per-widget editing container                       │   │  │
│  │  │  - Widget-specific editor (RadioEditor, etc.)       │   │  │
│  │  │  - Mode-aware extensions (subscale mappings)        │   │  │
│  │  │  - Static/alignment controls                        │   │  │
│  │  │                                                     │   │  │
│  │  │  ┌──────────────────────────────────────────────┐  │   │  │
│  │  │  │           Widget-Specific Editor             │  │   │  │
│  │  │  │           (e.g., RadioEditor)                │  │   │  │
│  │  │  └──────────────────────────────────────────────┘  │   │  │
│  │  │                                                     │   │  │
│  │  │  ┌──────────────────────────────────────────────┐  │   │  │
│  │  │  │       SubscaleMappingsEditor                 │  │   │  │
│  │  │  │       (discovery mode only)                  │  │   │  │
│  │  │  └──────────────────────────────────────────────┘  │   │  │
│  │  └─────────────────────────────────────────────────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Key Components

### EditorPage (`editor-page.tsx`)

Top-level container providing the full editing experience:
- Content editor panel
- Live preview panel
- Device frame selector (mobile, tablet, desktop)
- Save/validation controls

### Editor (`editor.tsx`)

Core markdown + widget content editor:
- Textarea for markdown content with widget placeholders
- Widget insertion UI
- Widget editing via WidgetEditor components
- Content validation and linting

### WidgetEditor (`components/widget-editor.tsx`)

Container for individual widget editing:
- Loads appropriate widget-specific editor
- Provides common controls (static, alignment, delete)
- **Mode-aware extensions**:
  - Discovery mode: Shows SubscaleMappingsEditor for radio/dropdown
  - Reflection mode: Shows "no scoring" notice
  - Mastery mode: Full scoring/correctness UI

### ItemEditor (`item-editor.tsx`)

Edits a complete Perseus item (question + hints):
- Question content via Editor
- Hint management via HintEditor
- Answer area configuration

### ArticleEditor (`article-editor.tsx`)

Multi-section article editing:
- Multiple content sections
- Section ordering and management
- Per-section widget editing

## Widget Editor Pattern

Each widget type has a corresponding editor in `widgets/`:

```
widgets/
├── radio/editor.tsx         # Radio button editor
├── dropdown-editor.tsx      # Dropdown editor
├── expression-editor.tsx    # Math expression editor
├── input-number-editor.tsx  # Numeric input editor
├── image-editor/            # Image widget (complex, multi-file)
├── interactive-graph-editor/ # Interactive graph (complex)
└── ...
```

### Widget Editor Interface

Each widget editor must implement:

```typescript
interface WidgetEditorExports {
    // Widget type this editor handles
    widgetName: string;

    // Editor component
    default: React.ComponentType<{
        // Widget options (varies by type)
        ...options: WidgetOptions;

        // Update handler
        onChange: (newOptions: Partial<WidgetOptions>) => void;

        // API configuration
        apiOptions: APIOptions;

        // Whether widget is static (non-interactive)
        static?: boolean;
    }>;
}
```

### Example: Adding a New Widget Editor

1. Create the editor file:

```typescript
// widgets/my-widget-editor.tsx
import * as React from "react";

type MyWidgetOptions = {
    // Define your widget's options
    value: string;
    showFeedback: boolean;
};

type Props = MyWidgetOptions & {
    onChange: (options: Partial<MyWidgetOptions>) => void;
    apiOptions: unknown;
    static?: boolean;
};

const MyWidgetEditor: React.FC<Props> = (props) => {
    const { value, showFeedback, onChange, static: isStatic } = props;

    return (
        <div className="my-widget-editor">
            <label>
                Value:
                <input
                    value={value}
                    onChange={(e) => onChange({ value: e.target.value })}
                    disabled={isStatic}
                />
            </label>
            <label>
                <input
                    type="checkbox"
                    checked={showFeedback}
                    onChange={(e) => onChange({ showFeedback: e.target.checked })}
                />
                Show feedback
            </label>
        </div>
    );
};

export default {
    widgetName: "my-widget",
    default: MyWidgetEditor,
};
```

2. Register in `all-editors.ts`:

```typescript
import MyWidgetEditor from "./widgets/my-widget-editor";

export default [
    // ... existing editors
    MyWidgetEditor,
];
```

## Mode-Aware Editing

Sophia extends Perseus editing with mode-aware UI that adapts based on `AssessmentPurpose`.

### ModeAwareEditorProps

```typescript
interface ModeAwareEditorProps {
    purpose?: AssessmentPurpose;  // "mastery" | "discovery" | "reflection"
    onPurposeChange?: (purpose: AssessmentPurpose) => void;
    subscaleMappings?: SubscaleMappings;
    onSubscaleMappingsChange?: (mappings: SubscaleMappings) => void;
    subscaleNames?: string[];
}
```

### PurposeSelector

Component for selecting assessment purpose:

```tsx
import { PurposeSelector } from "@ethosengine/sophia-editor";

<PurposeSelector
    value={purpose}
    onChange={setPurpose}
/>
```

### SubscaleMappingsEditor

Component for mapping widget choices to subscales (discovery mode):

```tsx
import { SubscaleMappingsEditor } from "@ethosengine/sophia-editor";

<SubscaleMappingsEditor
    widgetId="radio 1"
    choices={[
        { id: "0", label: "Option A" },
        { id: "1", label: "Option B" },
    ]}
    mappings={subscaleMappings["radio 1"] ?? {}}
    onChange={(mappings) => updateMappings("radio 1", mappings)}
    subscaleNames={["openness", "conscientiousness"]}
/>
```

### Predefined Subscale Sets

Common psychometric subscale sets are provided:

```typescript
import { PREDEFINED_SUBSCALE_SETS } from "@ethosengine/sophia-editor";

// Big Five personality traits
PREDEFINED_SUBSCALE_SETS.bigFive
// ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"]

// Holland RIASEC career interests
PREDEFINED_SUBSCALE_SETS.hollandCodes
// ["realistic", "investigative", "artistic", "social", "enterprising", "conventional"]

// Learning styles (VARK)
PREDEFINED_SUBSCALE_SETS.learningStyles
// ["visual", "auditory", "reading", "kinesthetic"]

// Elohim Protocol domains
PREDEFINED_SUBSCALE_SETS.elohimDomains
// ["governance", "care", "economic"]
```

## State Management

### Local Component State

Most editor state is managed locally via React component state:
- Widget options stored in each widget editor
- Editor aggregates widget state on serialize

### Serialization Pattern

Editors use a serialize/deserialize pattern:

```typescript
// Editor component provides serialize method
class Editor extends React.Component {
    serialize() {
        return {
            content: this.state.content,
            widgets: this.serializeWidgets(),
            images: this.state.images,
        };
    }

    serializeWidgets() {
        const widgets = {};
        for (const [id, ref] of Object.entries(this.widgetRefs)) {
            widgets[id] = ref.current?.serialize();
        }
        return widgets;
    }
}
```

### Lifting State for Mode-Aware Features

Mode-aware state (purpose, subscale mappings) is lifted to parent:

```tsx
function MyEditorPage() {
    const [purpose, setPurpose] = useState<AssessmentPurpose>("mastery");
    const [subscaleMappings, setSubscaleMappings] = useState<SubscaleMappings>({});

    return (
        <EditorPage
            purpose={purpose}
            onPurposeChange={setPurpose}
            subscaleMappings={subscaleMappings}
            onSubscaleMappingsChange={setSubscaleMappings}
        />
    );
}
```

## CSS Architecture

Styles are organized in `styles/`:

```
styles/
├── perseus-editor.css      # Main editor styles
└── ...
```

Styles are imported via the main index.ts and bundled with the package.

## Package Exports

```typescript
// Main components
export { ArticleEditor, Editor, EditorPage, ItemEditor };

// Preview/diff components
export { ContentPreview, DeviceFramer, ViewportResizer };
export { ArticleDiff, ItemDiff };

// Mode-aware components (Sophia extensions)
export { PurposeSelector, SubscaleMappingsEditor };
export type { ModeAwareEditorProps, PredefinedSubscaleSet };
export { PREDEFINED_SUBSCALE_SETS };

// Widget editors (auto-registered)
export { AllEditors, widgets };
```

## Integration Example

```tsx
import {
    EditorPage,
    PurposeSelector,
    PREDEFINED_SUBSCALE_SETS,
} from "@ethosengine/sophia-editor";
import type { AssessmentPurpose, SubscaleMappings } from "@ethosengine/sophia-core";

function ContentEditor() {
    const [purpose, setPurpose] = useState<AssessmentPurpose>("mastery");
    const [subscaleMappings, setSubscaleMappings] = useState<SubscaleMappings>({});
    const [content, setContent] = useState(initialContent);

    return (
        <div>
            <PurposeSelector value={purpose} onChange={setPurpose} />

            <EditorPage
                content={content}
                onChange={setContent}
                purpose={purpose}
                subscaleMappings={subscaleMappings}
                onSubscaleMappingsChange={setSubscaleMappings}
                subscaleNames={
                    purpose === "discovery"
                        ? PREDEFINED_SUBSCALE_SETS.elohimDomains
                        : undefined
                }
            />
        </div>
    );
}
```

## Dependencies

```
sophia (widgets, rendering)
    │
    └── sophia-editor (this package)
            │
            ├── sophia-core (types)
            └── perseus-core (widget types)
```

## Future Improvements

- [ ] Convert class components to functional components with hooks
- [ ] Improve TypeScript coverage (reduce `any` types)
- [ ] Add unit tests for mode-aware editing components
- [ ] Create Storybook stories for all editor components
- [ ] Document keyboard shortcuts and accessibility features
