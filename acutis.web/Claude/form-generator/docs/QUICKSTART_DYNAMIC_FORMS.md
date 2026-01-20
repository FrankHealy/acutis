# Quick Start - Dynamic Form System

## You're Absolutely Right! 🎯

The admission forms are **driven by configuration** from the Form Designer, not hardcoded. Here's how it works:

## How It Works

```
Form Designer → forms.json → DynamicFormRenderer → Live Admission Form
```

### 1. Admin Configures Form (Form Designer)

```typescript
// Admin creates/edits form through Form Designer UI
{
  "unit": "detox",
  "steps": [
    {
      "title": "Personal Information",
      "sections": [
        {
          "title": "Basic Info",
          "fields": [
            {
              "id": "firstName",
              "type": "text",
              "label": "First Name",
              "required": true
            }
          ]
        }
      ]
    }
  ]
}
```

### 2. Configuration Saved to JSON

The form configuration is saved to `dat/mock/forms.json` with all field definitions, validation rules, and step order.

### 3. Dynamic Renderer Reads Config

When starting an admission:

```typescript
// AdmissionIntakeFlow.tsx
const formConfig = await fetch('/api/forms/detox').then(r => r.json());

// DynamicFormRenderer.tsx renders fields based on config
<DynamicFormRenderer
  step={formConfig.steps[currentStep]}
  data={formData}
  onChange={handleFieldChange}
/>
```

### 4. Form Updates Instantly

**Admin changes field** → **Saves in Form Designer** → **Users see new field immediately**

No code deployment needed!

## What's Included

### Dynamic Form Files

- **forms.json** - Form configurations for each unit (detox, drugs, ladies)
- **DynamicFormRenderer.tsx** - Renders any field type from config
- **AdmissionIntakeFlow.tsx** - Loads config & manages multi-step flow
- **mockFormService.ts** - CRUD operations for form configs
- **DYNAMIC_FORMS_GUIDE.md** - Complete integration guide

### Supported Field Types

The renderer supports all common field types:
- `text`, `email`, `tel` - Text inputs
- `date`, `datetime-local` - Date/time pickers
- `select` - Dropdowns
- `radio` - Radio button groups
- `checkbox` - Single checkboxes
- `textarea` - Multi-line text

### Example: Add Email Field

Edit `dat/mock/forms.json`:

```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "required": false,
  "placeholder": "your.email@example.ie",
  "helpText": "We'll send appointment reminders here"
}
```

Save file, restart server. **Field appears in admission form automatically.**

## Quick Test

### 1. View Current Form Config

```bash
cat dat/mock/forms.json
```

You'll see the complete form configuration for detox admissions.

### 2. Add a New Field

Edit `forms.json`, add to Personal Information section:

```json
{
  "id": "nickname",
  "type": "text",
  "label": "Preferred Name",
  "required": false,
  "placeholder": "What would you like us to call you?"
}
```

### 3. Restart & Test

```bash
npm run dev
# Start an admission - new field appears!
```

## Form Designer Integration

### Load Form for Editing

```typescript
// GET /api/forms/detox
const form = await fetch('/api/forms/detox').then(r => r.json());

// Pass to Form Designer component
<FormDesigner initialConfig={form} onSave={handleSave} />
```

### Save Changes

```typescript
// PUT /api/forms/detox
await fetch('/api/forms/detox', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatedConfig)
});
```

### Create New Form

```typescript
import { mockAdmissionsService } from '@/lib/mockDataService';

const newForm = mockAdmissionsService.createFormConfiguration({
  name: 'Drug Addiction Intake',
  unit: 'drugs',
  version: '1.0',
  status: 'active',
  steps: [/* ... */]
});
```

## Benefits

### For Admins
✅ **No code changes** - Edit forms through UI  
✅ **Instant updates** - Changes go live immediately  
✅ **Unit-specific** - Different forms for detox, drugs, ladies  
✅ **Version control** - Keep history of form changes  

### For Developers
✅ **No hardcoding** - All fields defined in config  
✅ **Reusable** - One renderer for all forms  
✅ **Type-safe** - Full TypeScript support  
✅ **Testable** - Easy to test with different configs  

### For Users
✅ **Consistent UI** - Same look across all forms  
✅ **Better validation** - Rules from config  
✅ **Faster updates** - No waiting for deployments  

## Validation from Config

### Example: Phone Number

```json
{
  "id": "phone",
  "type": "tel",
  "label": "Phone Number",
  "required": true,
  "placeholder": "087-1234567",
  "validation": {
    "pattern": "^\\d{3}-\\d{7}$"  // Irish format
  }
}
```

Renderer automatically validates based on pattern!

### Example: Age Restriction

```json
{
  "id": "dateOfBirth",
  "type": "date",
  "label": "Date of Birth",
  "required": true,
  "validation": {
    "maxDate": "today",
    "minAge": 18
  }
}
```

Renderer checks age automatically!

## Conditional Fields

Fields can depend on other fields:

```json
{
  "id": "hasMedications",
  "type": "radio",
  "label": "Currently taking medications?",
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "no", "label": "No" }
  ]
},
{
  "id": "medicationsList",
  "type": "textarea",
  "label": "Please list medications",
  "dependsOn": "hasMedications",  // Only shows if hasMedications has value
  "rows": 4
}
```

## Files You Need

```
your-project/
├── dat/
│   └── mock/
│       └── forms.json              ← Form configurations
├── src/
│   ├── lib/
│   │   ├── mockDataService.ts      ← Add form methods
│   │   └── mockFormService.ts      ← Form CRUD operations
│   └── units/
│       └── detox/
│           └── components/
│               ├── DynamicFormRenderer.tsx
│               └── AdmissionIntakeFlow.tsx
└── app/
    └── api/
        └── forms/
            └── [unit]/
                └── route.ts         ← API for form configs
```

## Integration Checklist

- [ ] Copy `forms.json` to `dat/mock/`
- [ ] Copy `DynamicFormRenderer.tsx` to your components
- [ ] Update `AdmissionIntakeFlow.tsx` to use dynamic renderer
- [ ] Add form methods to `mockDataService.ts`
- [ ] Create API route `/api/forms/[unit]`
- [ ] Test: edit forms.json and see changes
- [ ] Connect Form Designer UI (if you have it)
- [ ] Create forms for other units (drugs, ladies)

## Next Steps

1. ✅ Forms work from config
2. 📖 Read `DYNAMIC_FORMS_GUIDE.md` for details
3. 🎨 Integrate your Form Designer UI
4. 🧪 Test with different configurations
5. 🚀 Deploy and let admins customize forms

## Reference

- **DYNAMIC_FORMS_GUIDE.md** - Complete integration guide
- **forms.json** - Current form configuration
- **DynamicFormRenderer.tsx** - Field rendering logic
- **mockFormService.ts** - Form config operations

---

**The key insight:** Forms are data, not code. Change the data (JSON), change the form!
