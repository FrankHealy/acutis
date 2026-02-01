# Dynamic Form System Integration Guide

## Overview

The admission intake forms are **dynamically driven by configuration** from the Form Designer. This means:

- ✅ Admins can customize forms without code changes
- ✅ Different units can have different forms
- ✅ Forms automatically adapt to configuration changes
- ✅ No hardcoded form fields

## How It Works

```
Form Designer (Config) → JSON Configuration → Dynamic Renderer → Live Form
```

### 1. Form Designer Creates Configuration

Admins use the Form Designer to:
- Define form steps (Personal Info, Medical, Consents, etc.)
- Add/remove/reorder fields
- Set field types (text, select, checkbox, etc.)
- Configure validation rules
- Set required fields

### 2. Configuration Stored as JSON

The configuration is saved to `dat/mock/forms.json`:

```json
{
  "formConfigurations": [
    {
      "id": "form-detox-admission",
      "name": "Detox Admission Form",
      "unit": "detox",
      "steps": [
        {
          "title": "Personal Information",
          "sections": [
            {
              "title": "Basic Information",
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
  ]
}
```

### 3. Dynamic Renderer Reads Configuration

When a user starts an admission:
1. System loads form configuration for that unit
2. `DynamicFormRenderer` component reads the configuration
3. Form fields are rendered based on configuration
4. Validation rules are applied from configuration

### 4. Data Saved Dynamically

Form data is saved as key-value pairs:
```json
{
  "firstName": "Michael",
  "lastName": "O'Brien",
  "address.street": "123 Main St",
  "emergencyContact.name": "John Doe"
}
```

Nested objects are automatically handled with dot notation.

## File Structure

```
acutis-design-system/
├── DynamicFormRenderer.tsx        # Renders fields from config
├── AdmissionIntakeFlow.tsx        # Loads config & manages flow
├── mockFormService.ts             # Form config CRUD operations
├── dat/mock/forms.json            # Form configurations
└── api-routes/forms/[unit]/route.ts # API for form config
```

## Key Components

### DynamicFormRenderer

Renders form fields based on configuration:

```typescript
<DynamicFormRenderer
  step={currentStepConfig}
  data={formData}
  onChange={handleFieldChange}
  errors={errors}
/>
```

**Supported Field Types:**
- `text` - Single line text input
- `email` - Email input with validation
- `tel` - Phone number input
- `date` - Date picker
- `datetime-local` - Date and time picker
- `select` - Dropdown menu
- `radio` - Radio buttons
- `checkbox` - Single checkbox
- `textarea` - Multi-line text

### AdmissionIntakeFlow

Manages the multi-step flow:
- Loads form configuration for the unit
- Handles step navigation
- Validates fields based on config
- Saves progress to session

### Form Validation

Validation rules from configuration:

```typescript
{
  "id": "phone",
  "type": "tel",
  "required": true,
  "validation": {
    "pattern": "^\\d{3}-\\d{7}$"  // Irish format
  }
}
```

```typescript
{
  "id": "dateOfBirth",
  "type": "date",
  "required": true,
  "validation": {
    "maxDate": "today",
    "minAge": 18
  }
}
```

## Integration Steps

### 1. Copy Files to Your Project

```bash
# Form system files
cp DynamicFormRenderer.tsx src/units/detox/components/
cp AdmissionIntakeFlow.tsx src/units/detox/components/
cp mockFormService.ts src/lib/

# Mock data
cp dat/mock/forms.json dat/mock/

# API routes
mkdir -p app/api/forms/[unit]
cp api-routes/forms/[unit]/route.ts app/api/forms/[unit]/
```

### 2. Update Mock Service

Add form configuration methods to your `mockDataService.ts`:

```typescript
// Add imports and types from mockFormService.ts
// Add methods: getFormConfiguration, getFormConfigurationByUnit, etc.
```

### 3. Update Admissions Flow

Replace your hardcoded `AdmissionsPage` with the dynamic version:

```typescript
// src/units/detox/components/AdmissionsPage.tsx
import { AdmissionIntakeFlow } from './AdmissionIntakeFlow';

// When starting admission:
router.push(`/detox/admissions/${admissionId}/intake?sessionId=${session.id}`);
```

### 4. Create Intake Route

```typescript
// app/detox/admissions/[id]/intake/page.tsx
import { AdmissionIntakeFlow } from '@/units/detox/components/AdmissionIntakeFlow';

export default function IntakePage({ params }: { params: { id: string } }) {
  return <AdmissionIntakeFlow admissionId={params.id} />;
}
```

### 5. Connect Form Designer

Update the "Form Configuration" quick action:

```typescript
const handleFormConfig = () => {
  router.push('/detox/admissions/form-designer');
};
```

## Customizing Forms

### Add New Field Type

Edit `DynamicFormRenderer.tsx`:

```typescript
case 'custom-type':
  return (
    <div>
      <label>{field.label}</label>
      <YourCustomInput
        value={value}
        onChange={onChange}
      />
    </div>
  );
```

### Add Validation Rule

Edit `validateField` function:

```typescript
if (field.validation?.customRule) {
  // Your validation logic
  if (!isValid) {
    return 'Custom validation failed';
  }
}
```

### Change Form Layout

Edit `FormSection` in `DynamicFormRenderer.tsx`:

```typescript
// Current: 2-column grid
gridTemplateColumns: '1fr 1fr'

// Change to 3 columns:
gridTemplateColumns: '1fr 1fr 1fr'

// Or single column:
gridTemplateColumns: '1fr'
```

## Form Designer Integration

### Loading Form in Designer

```typescript
// GET /api/forms/detox
const form = await fetch('/api/forms/detox').then(r => r.json());
```

### Saving Changes from Designer

```typescript
// PUT /api/forms/detox
await fetch('/api/forms/detox', {
  method: 'PUT',
  body: JSON.stringify(updatedFormConfig)
});
```

### Creating New Form

```typescript
const newForm = mockAdmissionsService.createFormConfiguration({
  name: 'New Admission Form',
  unit: 'detox',
  version: '1.0',
  status: 'draft',
  steps: [...]
});
```

## Testing

### Test Form Rendering

1. Edit `dat/mock/forms.json`
2. Add a new field to a section
3. Restart dev server
4. Start an admission
5. New field should appear automatically

### Example: Add Email Field

```json
{
  "id": "email",
  "type": "email",
  "label": "Email Address",
  "required": false,
  "placeholder": "your.email@example.ie",
  "helpText": "We'll use this to send appointment reminders"
}
```

### Test Validation

```json
{
  "id": "eircode",
  "type": "text",
  "label": "Eircode",
  "required": false,
  "validation": {
    "pattern": "^[A-Z0-9]{3}\\s?[A-Z0-9]{4}$"
  }
}
```

Try entering invalid format - should show error.

## Conditional Fields

Fields can depend on other fields:

```json
{
  "id": "previousTreatment",
  "type": "radio",
  "label": "Previous Treatment?",
  "options": [
    { "value": "yes", "label": "Yes" },
    { "value": "no", "label": "No" }
  ]
},
{
  "id": "previousTreatmentDetails",
  "type": "textarea",
  "label": "Please provide details",
  "dependsOn": "previousTreatment"  // Only shows if previousTreatment has value
}
```

## Benefits

### For Developers
- ✅ No code changes for form updates
- ✅ Consistent validation logic
- ✅ Type-safe with TypeScript
- ✅ Reusable across units

### For Admins
- ✅ Customize forms without IT
- ✅ Different forms per unit
- ✅ Version control for forms
- ✅ Test changes before activating

### For Users
- ✅ Consistent UI across forms
- ✅ Better validation messages
- ✅ Faster form updates
- ✅ Unit-specific workflows

## Troubleshooting

### Form not loading
**Check:**
1. Is `forms.json` in `dat/mock/`?
2. Is the unit name correct?
3. Is form status set to 'active'?
4. Check browser console for errors

### Field not showing
**Check:**
1. Is field in the correct section?
2. Does it have a `dependsOn` that's not satisfied?
3. Is the field ID unique?

### Validation not working
**Check:**
1. Is `required: true` set correctly?
2. Is validation pattern valid regex?
3. Check error state in DevTools

### Changes not appearing
**Solution:**
1. Restart Next.js dev server
2. Hard refresh browser (Ctrl+Shift+R)
3. Check file was saved properly

## Next Steps

1. ✅ Integrate form designer UI
2. ✅ Add form versioning
3. ✅ Implement form templates
4. ✅ Add field conditional logic editor
5. ✅ Create form preview mode
6. ✅ Add form duplication
7. ✅ Implement form audit log

## Reference

- **DynamicFormRenderer.tsx** - Field rendering logic
- **AdmissionIntakeFlow.tsx** - Flow management
- **forms.json** - Configuration schema
- **FORM_DESIGNER.md** - Form Designer documentation (if you have it)
