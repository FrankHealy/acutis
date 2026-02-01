# Integration Guide: Adding Elements Library to FormDesigner

## Step 1: Add ElementsLibraryPanel to your project

Place `ElementsLibraryPanel.tsx` in the same directory as `FormDesigner.tsx`

---

## Step 2: Add these changes to your FormDesigner.tsx

### 1. Import the panel at the top:

```typescript
import ElementsLibraryPanel from './ElementsLibraryPanel';
```

### 2. Add state for the panel (after line 43):

```typescript
const [isPanelOpen, setIsPanelOpen] = useState(false);
```

### 3. Add the element drop handler (after line 198):

```typescript
const addFieldsFromElement = (element: any, sectionId: string) => {
  setSections(sections.map(section => {
    if (section.id === sectionId) {
      // Convert element fields to FormDesigner format
      const newFields = element.fields.map((field: any) => ({
        id: `field-${Date.now()}-${Math.random()}`,
        fieldName: field.fieldName || field.id,
        label: field.label,
        type: field.type,
        required: field.required,
        placeholder: field.placeholder,
        options: field.options,
        validation: field.validation,
        helpText: field.helpText,
        defaultValue: field.defaultValue
      }));

      return {
        ...section,
        fields: [...section.fields, ...newFields]
      };
    }
    return section;
  }));
};
```

### 4. Add drop zone handlers to sections (after line 198):

```typescript
const handleDragOver = (e: React.DragEvent) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
};

const handleDrop = (e: React.DragEvent, sectionId: string) => {
  e.preventDefault();
  const elementData = e.dataTransfer.getData('text/plain');
  
  if (elementData) {
    try {
      const element = JSON.parse(elementData);
      addFieldsFromElement(element, sectionId);
    } catch (error) {
      console.error('Failed to parse element data:', error);
    }
  }
};
```

### 5. Add library button to header (find line ~240 where you have the Designer/Preview buttons):

Add this button after the Preview button:

```typescript
<button
  onClick={() => setIsPanelOpen(true)}
  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
>
  <Package className="h-4 w-4" />
  <span>Elements Library</span>
</button>
```

Don't forget to import Package:
```typescript
import { 
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Settings, Copy, 
  ChevronDown, ChevronUp, Type, Hash, Calendar, CheckSquare, List, 
  FileText, Image as ImageIcon, Phone, Mail, MapPin, AlertCircle,
  Download, Upload, History, Package  // <-- Add Package here
} from 'lucide-react';
```

### 6. Make sections accept drops (find the section rendering around line 300):

Find where you render sections in the designer (the left sidebar with section list).

On each section card, add these drag & drop handlers:

```typescript
<div
  onDragOver={handleDragOver}
  onDrop={(e) => handleDrop(e, section.id)}
  className={`section-card-classes-here... ${
    /* Add a visual indicator when dragging over */
  }`}
>
  {/* existing section content */}
</div>
```

### 7. Add the panel component at the end (before closing div, around line 784):

```typescript
{/* Elements Library Panel */}
<ElementsLibraryPanel
  isOpen={isPanelOpen}
  onClose={() => setIsPanelOpen(false)}
  onElementDrop={addFieldsFromElement}
/>
```

---

## Complete Example of Changes

Here's what your FormDesigner should look like with all changes:

```typescript
import React, { useState } from 'react';
import { 
  ArrowLeft, Save, Eye, Plus, Trash2, GripVertical, Settings, Copy, 
  ChevronDown, ChevronUp, Type, Hash, Calendar, CheckSquare, List, 
  FileText, Image as ImageIcon, Phone, Mail, MapPin, AlertCircle,
  Download, Upload, History, Package  // <-- Added Package
} from 'lucide-react';
import ElementsLibraryPanel from './ElementsLibraryPanel';  // <-- Added import

const FormDesigner = () => {
  const [formName, setFormName] = useState('Admission Form v4');
  const [formVersion, setFormVersion] = useState(4);
  const [selectedUnit, setSelectedUnit] = useState('all');
  const [viewMode, setViewMode] = useState<'designer' | 'preview'>('designer');
  const [selectedSection, setSelectedSection] = useState<string | null>('personal-identity');
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);  // <-- Added state

  // ... existing state and sections ...

  // ... existing functions (addSection, deleteSection, etc.) ...

  // <-- Add these new functions:
  const addFieldsFromElement = (element: any, sectionId: string) => {
    setSections(sections.map(section => {
      if (section.id === sectionId) {
        const newFields = element.fields.map((field: any) => ({
          id: `field-${Date.now()}-${Math.random()}`,
          fieldName: field.fieldName || field.id,
          label: field.label,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
          options: field.options,
          validation: field.validation,
          helpText: field.helpText,
          defaultValue: field.defaultValue
        }));

        return {
          ...section,
          fields: [...section.fields, ...newFields]
        };
      }
      return section;
    }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const elementData = e.dataTransfer.getData('text/plain');
    
    if (elementData) {
      try {
        const element = JSON.parse(elementData);
        addFieldsFromElement(element, sectionId);
      } catch (error) {
        console.error('Failed to parse element data:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Add Elements Library button */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          {/* ... existing header content ... */}
          
          {/* Add this button next to Designer/Preview buttons: */}
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>Elements Library</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex">
        {/* Left Sidebar - Add drop zones to sections */}
        <div className="w-80 bg-white border-r border-gray-200">
          {/* ... */}
          {sections.map(section => (
            <div
              key={section.id}
              onDragOver={handleDragOver}  // <-- Add this
              onDrop={(e) => handleDrop(e, section.id)}  // <-- Add this
              className="section-card-classes..."
            >
              {/* existing section content */}
            </div>
          ))}
        </div>

        {/* ... rest of your component ... */}
      </div>

      {/* Add panel at the end */}
      <ElementsLibraryPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onElementDrop={addFieldsFromElement}
      />
    </div>
  );
};

export default FormDesigner;
```

---

## How It Works

1. **User clicks "Elements Library"** → Panel slides in from right
2. **User drags element** from panel → Element becomes semi-transparent
3. **User hovers over section** → Drop zone highlights
4. **User drops element** → All fields from element are added to section
5. **Example:** Drag "Name - Basic" → Adds "First Name" + "Last Name" fields

---

## Visual Indicator for Drop Zones (Optional Enhancement)

Add this CSS or className logic to highlight sections when dragging:

```typescript
const [isDragging, setIsDragging] = useState(false);

// In handleDragOver:
setIsDragging(true);

// In handleDrop and handleDragLeave:
setIsDragging(false);

// Then in section className:
className={`... ${isDragging ? 'ring-2 ring-blue-400 bg-blue-50' : ''}`}
```

---

## Testing

1. Place both files in your project
2. Click "Elements Library" button in header
3. Panel slides in from right
4. Drag "Name - Basic" element
5. Drop onto "Personal Identity" section
6. Watch as First Name + Last Name fields appear!

---

## Troubleshooting

**Panel doesn't slide in:**
- Check that `isPanelOpen` state is added
- Check that button sets `setIsPanelOpen(true)`

**Drop doesn't work:**
- Check that sections have `onDragOver` and `onDrop` handlers
- Check console for any JSON parse errors

**Fields have wrong format:**
- Check that `addFieldsFromElement` maps field properties correctly
- Compare element field structure with FormDesigner field structure

**API not loading:**
- Panel will fall back to mock data automatically
- Check that `/api/elements-library` endpoint exists
- Or just use the mock data (it's already included)
