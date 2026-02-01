# Form Generator System

Dynamic form configuration system for Acutis. Create and manage forms through JSON configuration without writing code.

## What It Does

✅ **Dynamic Forms** - Forms driven by JSON configuration, not hardcoded  
✅ **Form Elements Library** - 26 reusable form components (drag & drop)  
✅ **Multi-Unit Support** - Different forms for alcohol, drugs, ladies, gambling  
✅ **Ad-hoc Forms** - Therapists create custom forms on the fly  
✅ **Mock Data** - Develop offline without backend dependency  

## Quick Start

1. **Place files in your project:**
   - Components → `src/configuration/form-generator/components/`
   - Services → `src/configuration/form-generator/services/`
   - Data → `src/configuration/form-generator/data/mock/`
   - API Routes → `src/app/api/` (create corresponding structure)

2. **Add to .env.local:**
   ```
   NEXT_PUBLIC_USE_MOCK_DATA=true
   ```

3. **Read the docs:**
   - Start with `QUICKSTART_MOCK.md`
   - Then `QUICKSTART_DYNAMIC_FORMS.md`

## Structure

```
form-generator/
├── components/
│   ├── DynamicFormRenderer.tsx       # Renders forms from config
│   ├── AdmissionIntakeFlow.tsx       # Multi-step admission flow
│   ├── AdmissionsFunctional.tsx      # Functional admission dashboard
│   └── AdmissionsRedesigned.tsx      # Redesigned dashboard
├── services/
│   ├── mockDataService.ts            # Mock data CRUD operations
│   ├── mockFormService.ts            # Form config management
│   └── formElementsLibraryService.ts # Form elements library
├── data/
│   └── mock/
│       ├── forms.json                # Form configurations
│       ├── form-elements-library.json # 26 reusable elements
│       ├── admissions.json           # Sample admissions
│       ├── sessions.json             # Session data
│       └── activity.json             # Activity log
├── api-routes/
│   ├── admissions/                   # Admission endpoints
│   ├── forms/                        # Form config endpoints
│   ├── elements-library/             # Library endpoints
│   └── stats/                        # Statistics endpoints
└── docs/
    ├── QUICKSTART_MOCK.md
    ├── QUICKSTART_DYNAMIC_FORMS.md
    ├── DYNAMIC_FORMS_GUIDE.md
    ├── MULTI_UNIT_FORMS_GUIDE.md
    ├── FORM_ELEMENTS_LIBRARY_GUIDE.md
    └── ... (10 comprehensive guides)
```

## Core Features

### 1. Dynamic Forms
Forms are JSON configurations, not hardcoded components.

**Example:**
```json
{
  "id": "form-detox-admission",
  "name": "Detox Admission",
  "steps": [
    {
      "title": "Personal Information",
      "sections": [
        {
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

### 2. Form Elements Library (26 Pre-Built Elements)
Build forms 10x faster using reusable elements.

**Categories:**
- Personal Info (6 elements)
- Medical (4 elements)
- Substance Use (4 elements)
- Assessments (4 elements)
- Consent (5 elements)
- Therapy (3 elements)

**Example:**
```json
{
  "elements": [
    "element-name-basic",        // First & Last name
    "element-contact-basic",     // Phone & Email
    "element-address-irish",     // Complete Irish address
    "element-emergency-contact"  // Emergency contact
  ]
}
```

### 3. Multi-Unit Support
One admission form adapts to all substance types:
- Alcohol → Shows CIWA protocol questions
- Drugs → Shows opioid substitution questions
- Ladies → Shows women's health questions
- Gambling → Shows financial impact questions

All go through detox first, then transfer to appropriate unit.

### 4. Mock Data System
Develop without backend dependency:
- File-based storage (survives restarts)
- CRUD operations
- Session management
- Activity logging
- Toggle between mock/real with one env variable

## File Placement in Your Project

```
your-project/
└── src/
    ├── configuration/
    │   └── form-generator/
    │       ├── components/
    │       │   ├── DynamicFormRenderer.tsx
    │       │   ├── AdmissionIntakeFlow.tsx
    │       │   ├── AdmissionsFunctional.tsx
    │       │   └── AdmissionsRedesigned.tsx
    │       ├── services/
    │       │   ├── mockDataService.ts
    │       │   ├── mockFormService.ts
    │       │   └── formElementsLibraryService.ts
    │       └── data/
    │           └── mock/
    │               ├── forms.json
    │               ├── form-elements-library.json
    │               ├── admissions.json
    │               ├── sessions.json
    │               └── activity.json
    └── app/
        └── api/
            ├── admissions/
            │   └── route.ts
            ├── forms/
            │   └── [unit]/
            │       └── route.ts
            ├── elements-library/
            │   └── route.ts
            └── stats/
                └── route.ts
```

## API Endpoints

```typescript
// Forms
GET /api/forms/detox                      // Get form config
PUT /api/forms/detox                      // Update form config

// Admissions
GET /api/admissions                       // List admissions
POST /api/admissions                      // Create admission
GET /api/admissions/stats                 // Get statistics

// Elements Library
GET /api/elements-library                 // Get full library
GET /api/elements-library/category/personal-info
GET /api/elements-library/element/element-name-basic
GET /api/elements-library/search?q=address
POST /api/elements-library/custom         // Add custom element
POST /api/elements-library/expand         // Expand template
```

## Quick Examples

### Create Admission Form (3 minutes)
```typescript
{
  "steps": [
    {
      "title": "Personal Info",
      "sections": [{
        "elements": [
          "element-name-basic",
          "element-contact-basic",
          "element-address-irish",
          "element-emergency-contact"
        ]
      }]
    },
    {
      "title": "Medical",
      "sections": [{
        "elements": [
          "element-medications",
          "element-allergies"
        ]
      }]
    }
  ]
}
```

### Create Therapy Session Form (30 seconds)
```typescript
{
  "steps": [{
    "sections": [{
      "elements": [
        "element-session-details",
        "element-mood-scale",
        "element-session-notes"
      ]
    }]
  }]
}
```

## Environment Variables

```bash
# Use mock data (development)
NEXT_PUBLIC_USE_MOCK_DATA=true

# Use real API (production)
NEXT_PUBLIC_USE_MOCK_DATA=false
BACKEND_API_URL=https://your-backend.azurewebsites.net
SERVICE_ACCOUNT_TOKEN=your-token
```

## Documentation

Read the comprehensive guides in the `docs/` folder:

1. **QUICKSTART_MOCK.md** ⭐ Start here!
2. **QUICKSTART_DYNAMIC_FORMS.md** - Dynamic forms intro
3. **MULTI_UNIT_FORMS_GUIDE.md** - Your exact scenario (alcohol, drugs, ladies, gambling)
4. **FORM_ELEMENTS_LIBRARY_GUIDE.md** - Using the 26 pre-built elements
5. **FORM_ELEMENTS_QUICK_REFERENCE.md** - Quick reference card
6. **DYNAMIC_FORMS_GUIDE.md** - Complete forms guide
7. **MOCK_DATA_GUIDE.md** - Mock data system
8. **IMPLEMENTATION_GUIDE.md** - Step-by-step integration
9. **API_INTEGRATION.ts** - API patterns
10. **TRANSFORMATION_GUIDE.tsx** - Migration guide

## Benefits

### For Admins
✅ Create/edit forms through UI (Form Designer)  
✅ No code deployment needed  
✅ Different forms per unit  
✅ Version control for forms  

### For Therapists
✅ Create ad-hoc forms as needed  
✅ Use form templates  
✅ Save custom forms for reuse  

### For Developers
✅ No hardcoded forms  
✅ Single source of truth (JSON config)  
✅ Type-safe with TypeScript  
✅ Easy to test  
✅ Offline development with mock data  

## Next Steps

1. Place files in your project (see structure above)
2. Update import paths in services
3. Add environment variables
4. Read `docs/QUICKSTART_MOCK.md`
5. Start dev server: `npm run dev`
6. Test: Visit `/api/forms/detox`

## Support

All documentation is in the `docs/` folder. Start with the quickstart guides!
