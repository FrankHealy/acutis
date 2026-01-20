# Multi-Unit & Ad-hoc Forms Guide

## Your Scenario - Perfectly Solved! 🎯

You have:
1. **Multiple substance types** (Ladies, Drugs, Alcohol & Gambling)
2. **All go through Detox first**
3. **Need for ad-hoc therapist forms**

The dynamic form system handles all of this elegantly.

## How It Works

### 1. Universal Detox Admission

**Everyone goes to detox first, regardless of substance type:**

```
┌─────────────────────────────────────────┐
│    Alcohol, Drugs, Ladies, Gambling     │
│                  ↓                       │
│           DETOX FIRST                    │
│    (Universal Admission Form)            │
│                  ↓                       │
│     Complete Detox Program               │
│                  ↓                       │
│    Transfer to Specific Unit             │
│  (Mens Alcohol, Mens Drugs, Ladies)      │
└─────────────────────────────────────────┘
```

### 2. One Admission Form Adapts

The detox admission form includes a field for substance type:

```json
{
  "id": "primarySubstance",
  "type": "select",
  "label": "Primary Substance/Issue",
  "options": [
    { "value": "alcohol", "label": "Alcohol" },
    { "value": "drugs", "label": "Drugs" },
    { "value": "gambling", "label": "Gambling" },
    { "value": "ladies", "label": "Ladies Program" }
  ]
}
```

Then a follow-up field:

```json
{
  "id": "intendedProgram",
  "type": "select",
  "label": "Intended Program After Detox",
  "options": [
    { "value": "mens-alcohol-gambling", "label": "Men's (Alcohol & Gambling)" },
    { "value": "mens-drugs", "label": "Men's (Drugs)" },
    { "value": "ladies-program", "label": "Ladies Program" }
  ]
}
```

### 3. Substance-Specific Questions (Optional)

Use conditional fields to show additional questions based on selection:

```json
{
  "id": "drugType",
  "type": "select",
  "label": "Drug Type (if applicable)",
  "dependsOn": "primarySubstance",
  "showWhen": "primarySubstance === 'drugs'",
  "options": [
    { "value": "opioids", "label": "Opioids" },
    { "value": "cocaine", "label": "Cocaine" }
  ]
}
```

**If they select "Drugs"** → Drug-specific questions appear  
**If they select "Alcohol"** → Alcohol-specific questions appear  
**Same form, different fields based on substance type!**

## Admission Flow Example

### Alcohol Admission to Detox

```typescript
// 1. User selects "Alcohol" for primary substance
primarySubstance: "alcohol"

// 2. Alcohol-specific fields appear
{
  "drinksPerDay": 8,
  "lastDrink": "2026-01-18T06:00:00",
  "withdrawalHistory": "mild",
  "ciwaRequired": true  // CIWA protocol for alcohol withdrawal
}

// 3. Intended program after detox
intendedProgram: "mens-alcohol-gambling"

// 4. Assigned to detox building
building: "A"
room: "12"

// 5. After detox completion → Transfer to Mens Alcohol & Gambling unit
```

### Drug Admission to Detox

```typescript
// 1. User selects "Drugs" for primary substance
primarySubstance: "drugs"

// 2. Drug-specific fields appear
{
  "drugType": "opioids",
  "routeOfAdministration": "injection",
  "lastUse": "2026-01-18T08:00:00",
  "substitutionTherapy": "yes"  // Methadone consideration
}

// 3. Intended program after detox
intendedProgram: "mens-drugs"

// 4. Assigned to detox building
building: "B"
room: "8"

// 5. After detox completion → Transfer to Mens Drugs unit
```

### Ladies Program Admission

```typescript
// 1. User selects substance type
primarySubstance: "alcohol"  // or "drugs" or "both"

// 2. Gender-specific fields appear
{
  "pregnant": "no",
  "childcare": "yes",  // Ladies-specific concern
  "childcareNotes": "2 children, ages 3 and 5"
}

// 3. Intended program after detox
intendedProgram: "ladies-program"

// 4. After detox → Transfer to Ladies unit
```

## Ad-hoc Therapist Forms

Therapists can create custom forms for any purpose:

### Built-in Therapist Forms

```javascript
// 1. Therapy Session Notes
const sessionForm = getForm('form-therapy-session');

// 2. Cravings Assessment
const cravingsForm = getForm('form-cravings-assessment');

// 3. Crisis Intervention
const crisisForm = getForm('form-crisis-intervention');
```

### Creating Custom Forms On-The-Fly

```typescript
// Therapist creates custom check-in form
const weeklyCheckIn = {
  name: "Weekly Progress Check-in",
  formType: "assessment",
  createdBy: "Dr. Murphy",
  steps: [
    {
      title: "This Week's Progress",
      sections: [
        {
          title: "Mood & Cravings",
          fields: [
            {
              id: "moodRating",
              type: "select",
              label: "Average Mood This Week",
              options: [
                { value: "1", label: "1 - Very Poor" },
                { value: "5", label: "5 - Neutral" },
                { value: "10", label: "10 - Excellent" }
              ]
            },
            {
              id: "cravingsCount",
              type: "number",
              label: "Number of Cravings Episodes"
            },
            {
              id: "notes",
              type: "textarea",
              label: "Notes",
              rows: 6
            }
          ]
        }
      ]
    }
  ]
};

// Save to forms.json
mockAdmissionsService.createFormConfiguration(weeklyCheckIn);

// Now therapist can use this form for all clients
```

### Form Templates for Common Scenarios

```javascript
// Use a template to quickly create new forms
const templates = [
  {
    id: "template-weekly-checkin",
    name: "Weekly Check-in",
    type: "assessment"
  },
  {
    id: "template-crisis",
    name: "Crisis Intervention",
    type: "therapy"
  },
  {
    id: "template-family-session",
    name: "Family Session",
    type: "therapy"
  }
];

// Therapist picks a template
const newForm = createFromTemplate('template-weekly-checkin', {
  name: "John's Weekly Check-in",
  customFields: [/* add client-specific fields */]
});
```

## Real-World Usage Patterns

### Pattern 1: Admission Processing

```typescript
// 1. Admission coordinator starts intake
startAdmission(admissionId) {
  // Load universal detox admission form
  const form = await getForm('form-detox-admission');
  
  // Form adapts based on answers:
  // - Shows substance-specific questions
  // - Determines intended program
  // - Assigns detox accommodation
}

// 2. After detox completion
completeDetox(admissionId) {
  const admission = getAdmission(admissionId);
  
  // Transfer based on intendedProgram
  if (admission.intendedProgram === 'mens-alcohol-gambling') {
    transferTo('mens-alcohol-gambling-unit');
  } else if (admission.intendedProgram === 'mens-drugs') {
    transferTo('mens-drugs-unit');
  } else if (admission.intendedProgram === 'ladies-program') {
    transferTo('ladies-unit');
  }
}
```

### Pattern 2: Therapy Sessions

```typescript
// Therapist starts session with client
startTherapySession(clientId) {
  // Choose form type
  const formType = selectFormType([
    'Therapy Session Notes',
    'Cravings Assessment',
    'Crisis Intervention',
    'Custom Form...'
  ]);
  
  if (formType === 'Custom Form...') {
    // Create ad-hoc form
    const customForm = createCustomForm({
      name: "Anger Management Check-in",
      fields: [/* ... */]
    });
  } else {
    // Use existing form
    const form = await getForm(formType);
  }
}
```

### Pattern 3: Group Therapy

```typescript
// Use ad-hoc form for group session
const groupForm = {
  name: "Group Therapy Session - Triggers & Coping",
  formType: "group",
  steps: [
    {
      title: "Group Session Notes",
      sections: [
        {
          title: "Participants",
          fields: [
            {
              id: "attendees",
              type: "textarea",
              label: "Attendees (names)"
            },
            {
              id: "topic",
              type: "text",
              label: "Session Topic"
            },
            {
              id: "keyDiscussions",
              type: "textarea",
              label: "Key Discussion Points",
              rows: 8
            }
          ]
        }
      ]
    }
  ]
};
```

## Form Designer Integration

### For Admins (Form Designer UI)

```typescript
// Admin opens Form Designer
<FormDesigner 
  forms={allForms} 
  onSave={saveForm}
/>

// Admin can:
// 1. Edit detox admission form
// 2. Add/remove substance-specific fields
// 3. Change intended program options
// 4. Update validation rules

// Changes save to forms.json → Live immediately
```

### For Therapists (Ad-hoc Form Creator)

```typescript
// Simple form creation interface
<AdHocFormCreator
  templates={formTemplates}
  onCreateForm={saveCustomForm}
/>

// Therapist can:
// 1. Start from template
// 2. Add custom fields
// 3. Save for reuse
// 4. Share with other therapists
```

## API Endpoints

```typescript
// Get admission form (universal for all substance types)
GET /api/forms/detox
→ Returns universal detox admission form

// Get therapist forms
GET /api/forms?formType=therapy
→ Returns all therapy session forms

GET /api/forms?formType=assessment
→ Returns all assessment forms

// Create custom form
POST /api/forms
{
  "name": "Custom Assessment",
  "formType": "assessment",
  "createdBy": "therapistId",
  "steps": [...]
}
→ Creates new form, saves to forms.json

// Get form templates
GET /api/forms/templates
→ Returns available templates for quick form creation
```

## Data Model

### Admission Record

```typescript
{
  "id": "adm-001",
  "firstName": "Michael",
  "lastName": "O'Brien",
  "primarySubstance": "alcohol",      // What they're being treated for
  "intendedProgram": "mens-alcohol-gambling",  // Where they go after detox
  "currentUnit": "detox",              // Currently in detox
  "status": "in_progress",
  "detoxData": {
    "drinksPerDay": 8,
    "lastDrink": "2026-01-18T06:00:00",
    "ciwaRequired": true
  }
}

// After detox completion:
{
  "currentUnit": "mens-alcohol-gambling",  // Transferred
  "detoxCompletedAt": "2026-01-25T10:00:00",
  "status": "in_program"
}
```

### Therapy Session Record

```typescript
{
  "id": "sess-001",
  "clientId": "adm-001",
  "formId": "form-therapy-session",
  "formType": "therapy",
  "therapistId": "therapist-murphy",
  "data": {
    "sessionDate": "2026-01-20",
    "sessionType": "individual",
    "mood": "anxious",
    "sessionNotes": "Discussed triggers...",
    "actionItems": "Practice coping strategies",
    "nextSessionDate": "2026-01-27"
  }
}
```

## Benefits of This Approach

### For Admissions Staff
✅ **One form for all types** - No confusion about which form to use  
✅ **Automatic adaptation** - Form shows relevant fields based on answers  
✅ **Clear pathways** - System knows where to transfer after detox  
✅ **Consistent process** - Same workflow for everyone  

### For Therapists
✅ **Standard forms** - Built-in templates for common sessions  
✅ **Custom forms** - Create ad-hoc forms as needed  
✅ **Reusable** - Save custom forms for future use  
✅ **Flexible** - Adapt to any therapeutic need  

### For System
✅ **One source of truth** - forms.json drives everything  
✅ **Easy updates** - Admin changes form, everyone sees updates  
✅ **Auditable** - Track form versions and changes  
✅ **Scalable** - Add new substance types or programs easily  

## Example Scenarios

### Scenario 1: Alcohol Admission

1. Phone evaluation → Schedule admission
2. Arrive at facility → Start detox admission form
3. Select "Alcohol" → CIWA questions appear
4. Select "Mens Alcohol & Gambling" as intended program
5. Assigned to Detox Building A
6. Complete detox protocol → Transfer to Mens Alcohol & Gambling unit

### Scenario 2: Ladies Program (Drugs)

1. Phone evaluation → Schedule admission
2. Arrive at facility → Start detox admission form
3. Select "Drugs" → Drug-specific questions appear
4. Select "Ladies Program" as intended program
5. Women's health questions appear (pregnancy, childcare)
6. Assigned to Detox Building B
7. Complete detox → Transfer to Ladies unit

### Scenario 3: Therapist Creates Custom Form

1. Therapist needs anger management assessment
2. Opens ad-hoc form creator
3. Adds fields:
   - Anger triggers this week
   - Incidents count
   - Coping strategies used
   - Effectiveness rating
4. Saves as "Anger Management Weekly Check-in"
5. Uses with all anger management clients
6. Other therapists can use it too

## Migration Path

### Phase 1: Detox Admission (Week 1)
- ✅ Deploy universal detox admission form
- ✅ All substance types use same form
- ✅ Test with each substance type

### Phase 2: Therapist Forms (Week 2)
- ✅ Add standard therapy session forms
- ✅ Train therapists on ad-hoc form creation
- ✅ Create form templates

### Phase 3: Optimization (Week 3+)
- ✅ Refine forms based on feedback
- ✅ Add more templates
- ✅ Create program-specific follow-up forms

---

**The key:** One flexible system handles both structured admission workflows AND ad-hoc therapist needs!
