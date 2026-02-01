# Form Elements Library Guide

## Overview

The Form Elements Library is a **reusable component catalog** that makes form creation incredibly fast. Instead of defining common fields repeatedly, you drag and drop pre-built elements.

## 🎯 The Problem This Solves

**Before (Manual):**
```json
// Creating a form - defining EVERY field manually
{
  "fields": [
    {
      "id": "firstName",
      "type": "text",
      "label": "First Name",
      "required": true,
      "placeholder": "Enter first name",
      "validation": { "minLength": 2, "maxLength": 50 }
    },
    {
      "id": "lastName",
      "type": "text",
      "label": "Last Name",
      "required": true,
      "placeholder": "Enter last name",
      "validation": { "minLength": 2, "maxLength": 50 }
    },
    // ... 20 more fields to define manually
  ]
}
```

**After (Library):**
```json
// Just reference pre-built elements
{
  "elements": [
    "element-name-basic",           // ← First & Last name
    "element-contact-basic",        // ← Phone & email
    "element-address-irish",        // ← Complete Irish address
    "element-emergency-contact"     // ← Emergency contact
  ]
}
```

**Result:** Create forms **10x faster** with consistent, validated fields!

## Library Categories

### 📋 Personal Information
- **Basic Name** - First & Last name
- **Full Name** - First, Middle, Last name
- **Basic Contact** - Phone & Email
- **Date of Birth** - With age validation (18+)
- **Irish Address** - Street, City, County (all 26 counties), Eircode
- **Emergency Contact** - Name, Relationship, Phone

### 🏥 Medical Information
- **Current Medications** - Medication list textarea
- **Allergies** - Drug/food allergies
- **Medical Conditions** - Chronic conditions
- **GP Information** - GP name, practice, phone

### 💊 Substance Use
- **Alcohol Use Assessment** - Drinks/day, last drink, withdrawal history
- **Drug Use Assessment** - Drug type, route, frequency, last use
- **Gambling Assessment** - Type, financial impact, last gamble
- **Treatment History** - Previous treatment details

### 📊 Assessment Scales
- **Mood Rating (1-10)** - Standard mood scale
- **Craving Intensity (1-10)** - Craving severity
- **Risk Assessment** - Low/Medium/High risk levels
- **Sleep Assessment** - Hours, quality, disturbances

### 📝 Consent & Legal
- **Treatment Consent** - Standard treatment agreement
- **Privacy & GDPR Consent** - GDPR-compliant privacy
- **Emergency Treatment Consent** - Medical emergency consent
- **Photography Consent** - ID photo consent
- **GP Information Sharing** - Consent to share with GP

### 🗣️ Therapy & Sessions
- **Session Details** - Date, type, duration
- **Session Notes** - Issues, interventions, response, next steps
- **Progress Rating** - Excellent to Concerning scale

## How to Use

### Method 1: Form Designer UI (Drag & Drop)

```
┌─────────────────────────────────────┐
│   Form Elements Library             │
│                                     │
│   📋 Personal Information           │
│   ├─ Basic Name          [+ Add]   │
│   ├─ Basic Contact       [+ Add]   │
│   └─ Irish Address       [+ Add]   │
│                                     │
│   🏥 Medical Information            │
│   ├─ Medications         [+ Add]   │
│   └─ Allergies           [+ Add]   │
│                                     │
│   💊 Substance Use                  │
│   ├─ Alcohol Assessment  [+ Add]   │
│   └─ Drug Assessment     [+ Add]   │
└─────────────────────────────────────┘

        ↓ Click [+ Add]

┌─────────────────────────────────────┐
│   Your Form (Building)              │
│                                     │
│   Step 1: Personal Information      │
│   ├─ Basic Name ✓                  │
│   ├─ Basic Contact ✓               │
│   └─ Irish Address ✓               │
│                                     │
│   Step 2: Medical Screening         │
│   ├─ Medications ✓                 │
│   └─ Allergies ✓                   │
└─────────────────────────────────────┘
```

### Method 2: Programmatic (API)

```typescript
// Load element from library
const library = await fetch('/api/forms/elements-library').then(r => r.json());

// Find the element you want
const nameElement = library.categories
  .find(c => c.id === 'personal-info')
  .elements
  .find(e => e.id === 'element-name-basic');

// Add to your form
form.steps[0].sections[0].fields.push(...nameElement.fields);
```

### Method 3: Template Expansion

```typescript
// Define form with element references
const formTemplate = {
  name: "Quick Intake Form",
  steps: [
    {
      title: "Personal Info",
      sections: [
        {
          title: "Basic Information",
          elements: [
            "element-name-basic",
            "element-contact-basic",
            "element-dob"
          ]
        }
      ]
    }
  ]
};

// Expand template → Full form
const expandedForm = expandFormTemplate(formTemplate, library);

// Result: Full form with all field definitions
```

## Quick Examples

### Example 1: Create Admission Form (1 minute)

```typescript
const admissionForm = {
  name: "Detox Admission",
  steps: [
    {
      title: "Personal Information",
      sections: [
        {
          title: "Basic Info",
          elements: [
            "element-name-basic",           // First & Last name
            "element-dob",                  // DOB with age check
            "element-contact-basic",        // Phone & email
            "element-address-irish",        // Irish address
            "element-emergency-contact"     // Emergency contact
          ]
        }
      ]
    },
    {
      title: "Medical",
      sections: [
        {
          title: "Medical History",
          elements: [
            "element-medications",
            "element-allergies",
            "element-medical-conditions",
            "element-gp-details"
          ]
        }
      ]
    },
    {
      title: "Substance Assessment",
      sections: [
        {
          title: "Use History",
          elements: [
            "element-alcohol-use",          // Or "element-drug-use"
            "element-previous-treatment"
          ]
        }
      ]
    },
    {
      title: "Consents",
      sections: [
        {
          title: "Required Consents",
          elements: [
            "element-treatment-consent",
            "element-privacy-consent",
            "element-emergency-treatment",
            "element-photo-consent"
          ]
        }
      ]
    }
  ]
};

// Expand and save
const fullForm = expandFormTemplate(admissionForm);
saveForm(fullForm);
```

**Result:** Complete admission form in **60 seconds**!

### Example 2: Create Therapy Session Form (30 seconds)

```typescript
const therapyForm = {
  name: "Therapy Session Notes",
  steps: [
    {
      title: "Session",
      sections: [
        {
          title: "Session Information",
          elements: [
            "element-session-details",      // Date, type, duration
            "element-mood-scale",            // Client mood
            "element-session-notes",         // Notes fields
            "element-progress-rating",       // Progress assessment
            "element-risk-assessment"        // Risk level
          ]
        }
      ]
    }
  ]
};
```

### Example 3: Create Custom Assessment (45 seconds)

```typescript
const cravingsForm = {
  name: "Cravings Check-in",
  steps: [
    {
      title: "Cravings",
      sections: [
        {
          title: "Current Status",
          elements: [
            "element-craving-intensity",     // 1-10 scale
            // Add custom field
            {
              id: "triggers",
              type: "textarea",
              label: "What triggered the craving?",
              rows: 4
            },
            {
              id: "copingStrategies",
              type: "textarea",
              label: "What coping strategies did you use?",
              rows: 4
            }
          ]
        }
      ]
    }
  ]
};
```

**Mix library elements with custom fields!**

## Adding Custom Elements to Library

### Step 1: Create the Element

```typescript
const customElement = {
  id: "element-family-involvement",
  name: "Family Involvement",
  description: "Questions about family support",
  fields: [
    {
      id: "familySupport",
      type: "radio",
      label: "Family aware of treatment?",
      required: true,
      options: [
        { value: "yes", label: "Yes - supportive" },
        { value: "yes_unsupportive", label: "Yes - unsupportive" },
        { value: "no", label: "No - not aware" }
      ]
    },
    {
      id: "familyInvolvement",
      type: "checkbox",
      label: "Would like family involved in treatment",
      required: false
    }
  ]
};
```

### Step 2: Add to Library

```typescript
// Add to custom elements
library.customElements.push(customElement);

// Or add to a category
library.categories
  .find(c => c.id === 'therapy')
  .elements.push(customElement);

// Save library
saveFormElementsLibrary(library);
```

### Step 3: Use It

```typescript
// Now available in Form Designer
const form = {
  sections: [
    {
      elements: [
        "element-family-involvement"  // ← Your custom element
      ]
    }
  ]
};
```

## API Endpoints

```typescript
// Get full library
GET /api/forms/elements-library
→ Returns complete library with all categories

// Get category
GET /api/forms/elements-library/personal-info
→ Returns just personal info elements

// Get single element
GET /api/forms/elements-library/element/element-name-basic
→ Returns specific element definition

// Add custom element
POST /api/forms/elements-library/custom
{
  "id": "element-my-custom",
  "name": "My Custom Element",
  "fields": [...]
}
→ Adds to customElements array

// Search library
GET /api/forms/elements-library/search?q=address
→ Returns elements matching "address"
```

## Form Designer Integration

### UI Mockup

```
┌─────────────────────────────────────────────────────────┐
│  Form Designer                                  [Save]  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────┐  ┌──────────────────────────────┐ │
│  │ Elements Library│  │  Your Form                   │ │
│  ├─────────────────┤  ├──────────────────────────────┤ │
│  │                 │  │                              │ │
│  │ 📋 Personal     │  │  Step 1: Personal Info       │ │
│  │  • Basic Name   │  │  ├─ Basic Name      [×]      │ │
│  │    [+Add]       │  │  ├─ Contact Info    [×]      │ │
│  │  • Contact      │  │  └─ Irish Address   [×]      │ │
│  │    [+Add]       │  │                              │ │
│  │  • Address      │  │  [+ Add Element]             │ │
│  │    [+Add]       │  │  [+ Add Custom Field]        │ │
│  │                 │  │                              │ │
│  │ 🏥 Medical      │  │  Step 2: Medical             │ │
│  │  • Medications  │  │  (empty)                     │ │
│  │    [+Add]       │  │                              │ │
│  │  • Allergies    │  │  [+ Add Section]             │ │
│  │    [+Add]       │  │                              │ │
│  │                 │  │  [+ Add Step]                │ │
│  └─────────────────┘  └──────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Workflow

1. **Browse Library** → See all available elements by category
2. **Click [+Add]** → Element added to current section
3. **Customize** → Modify labels, validation, etc. if needed
4. **Mix & Match** → Combine library elements with custom fields
5. **Save** → Form ready to use

## Benefits

### For Form Creators

✅ **10x faster** - Build forms in minutes, not hours  
✅ **Consistent** - Same fields across all forms  
✅ **Validated** - Pre-tested validation rules  
✅ **Irish-specific** - County dropdown, Eircode validation, phone format  
✅ **GDPR-compliant** - Privacy consents built-in  

### For Developers

✅ **DRY principle** - Don't repeat field definitions  
✅ **Type-safe** - Predefined TypeScript types  
✅ **Version control** - Track library changes  
✅ **Extensible** - Easy to add new elements  

### For Users

✅ **Familiar** - Same fields everywhere  
✅ **Reliable** - Tested validation  
✅ **Accessible** - Consistent labels and help text  

## Common Patterns

### Pattern 1: Standard Admission

```typescript
[
  "element-name-basic",
  "element-dob",
  "element-contact-basic",
  "element-address-irish",
  "element-emergency-contact",
  "element-medications",
  "element-allergies",
  "element-medical-conditions",
  "element-alcohol-use",          // OR "element-drug-use"
  "element-previous-treatment",
  "element-treatment-consent",
  "element-privacy-consent",
  "element-emergency-treatment"
]
```

### Pattern 2: Quick Therapy Session

```typescript
[
  "element-session-details",
  "element-mood-scale",
  "element-session-notes",
  "element-progress-rating"
]
```

### Pattern 3: Weekly Check-in

```typescript
[
  "element-mood-scale",
  "element-craving-intensity",
  "element-sleep-quality",
  // Add custom question
  {
    id: "weekHighlights",
    type: "textarea",
    label: "What went well this week?",
    rows: 3
  }
]
```

## Customization

### Modify Element Before Adding

```typescript
// Get element from library
const nameElement = getElement('element-name-basic');

// Customize it
nameElement.fields[0].label = "Client First Name";
nameElement.fields[0].helpText = "Legal name only";

// Add to form
addToForm(nameElement);
```

### Override Validation

```typescript
const phoneElement = getElement('element-contact-basic');

// Change phone validation for different format
phoneElement.fields[0].validation.pattern = "^\\d{10}$";  // US format

addToForm(phoneElement);
```

## File Structure

```
dat/mock/
└── form-elements-library.json    ← The library file

Categories:
├── personal-info          (6 elements)
├── medical               (4 elements)
├── substance-use         (4 elements)
├── assessments           (4 elements)
├── consent               (5 elements)
└── therapy               (3 elements)

Total: 26 pre-built elements
```

## Migration Strategy

### Phase 1: Use Library for New Forms (Week 1)
- ✅ All new forms use library elements
- ✅ Train staff on drag-and-drop

### Phase 2: Refactor Existing Forms (Week 2)
- ✅ Update detox admission to use library
- ✅ Update therapy forms to use library
- ✅ Test thoroughly

### Phase 3: Add Custom Elements (Week 3+)
- ✅ Teams add facility-specific elements
- ✅ Share useful elements between units
- ✅ Build comprehensive library

## Best Practices

1. **Start with library elements** - Check library before creating custom
2. **Name consistently** - Use `element-category-description` format
3. **Add descriptions** - Future you will thank you
4. **Test validation** - Ensure patterns work
5. **Version control** - Track library changes
6. **Document custom elements** - Explain why you created them
7. **Share useful elements** - Add to library for others

## Future Enhancements

### Coming Soon

- **Element versioning** - Track changes to elements
- **Element preview** - See what element looks like
- **Element analytics** - Which elements are most used
- **Element templates** - Create elements from existing forms
- **Element marketplace** - Share elements between facilities
- **Smart suggestions** - AI suggests relevant elements

---

**The key insight:** Build a library once, use it everywhere. Create forms in minutes instead of hours!
