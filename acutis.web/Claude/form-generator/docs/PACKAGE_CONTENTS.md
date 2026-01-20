# Acutis Design System - Complete Package

## 📦 What's Included

This package contains everything you need for a functional admissions system with mock data persistence.

### 🎨 Design System (15 files)
- **tokens.ts** - Colors, spacing, typography tokens
- **styles.css** - CSS custom properties version
- **Card.tsx** - Base card component
- **IconBadge.tsx** - Circular icon badges
- **StatCard.tsx** - Stat cards with icons
- **QuickAction.tsx** - Action cards
- **index.ts** - Central exports

### 💼 Functional Components (3 files)
- **AdmissionsFunctional.tsx** - Working admissions dashboard
- **AdmissionIntakeFlow.tsx** - Multi-step admission form
- **AdmissionsRedesigned.tsx** - Visual example (original)

### 🗄️ Mock Data System (7 files)
- **mockDataService.ts** - File-based data persistence service
- **dat/mock/admissions.json** - Admission records & stats
- **dat/mock/sessions.json** - Session tracking data
- **dat/mock/activity.json** - Activity log
- **api-routes/*.ts** - Next.js API route templates
- **setup-mock.sh** - Automated setup script

### 📚 Documentation (6 files)
- **QUICKSTART_MOCK.md** - Get started in 5 minutes ⭐ START HERE
- **MOCK_DATA_GUIDE.md** - Complete mock system guide
- **IMPLEMENTATION_GUIDE.md** - Integration instructions
- **API_INTEGRATION.ts** - Backend integration examples
- **TRANSFORMATION_GUIDE.tsx** - Before/after patterns
- **README.md** - Design system documentation

## 🚀 Quick Start

### 1. Extract & Setup
```bash
unzip acutis-design-system.zip
cd your-project-root
chmod +x acutis-design-system/setup-mock.sh
./acutis-design-system/setup-mock.sh
```

### 2. Enable Mock Mode
Add to `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### 3. Start Developing
```bash
npm run dev
# Visit http://localhost:3000/detox/admissions
```

## 📋 File Structure

```
acutis-design-system/
├── 📖 QUICKSTART_MOCK.md          ⭐ START HERE
├── 📖 MOCK_DATA_GUIDE.md
├── 📖 IMPLEMENTATION_GUIDE.md
├── 📖 README.md
├── 📄 setup-mock.sh               🔧 Run this first
│
├── 🎨 Design System Components
│   ├── tokens.ts
│   ├── styles.css
│   ├── Card.tsx
│   ├── IconBadge.tsx
│   ├── StatCard.tsx
│   ├── QuickAction.tsx
│   └── index.ts
│
├── 💼 Functional Components
│   ├── AdmissionsFunctional.tsx   ✨ Real logic
│   ├── AdmissionIntakeFlow.tsx    ✨ Multi-step form
│   └── AdmissionsRedesigned.tsx
│
├── 🗄️ Mock Data System
│   ├── mockDataService.ts
│   ├── dat/
│   │   └── mock/
│   │       ├── admissions.json
│   │       ├── sessions.json
│   │       └── activity.json
│   └── api-routes/
│       ├── stats/route.ts
│       ├── admissions/route.ts
│       └── sessions/route.ts
│
└── 📚 Reference Docs
    ├── API_INTEGRATION.ts
    └── TRANSFORMATION_GUIDE.tsx
```

## ✨ Key Features

### Mock Data System
✅ **File-based persistence** - Changes saved to JSON files  
✅ **Full CRUD** - Create, read, update, delete operations  
✅ **Session tracking** - Multi-step form progress  
✅ **Activity logging** - Automatic feed updates  
✅ **Easy toggle** - Switch mock/real with one env var  

### Functional Components
✅ **Real state management** - Not just UI mockups  
✅ **Navigation flows** - Actual routing between pages  
✅ **Error handling** - Loading states, error messages  
✅ **Form validation** - Multi-step admission process  
✅ **API integration** - Ready to connect to C# backend  

### Design System
✅ **Circular icon badges** - Dashboard visual style  
✅ **Consistent colors** - Systematic color usage  
✅ **Reusable components** - Cards, stats, actions  
✅ **TypeScript types** - Full type safety  
✅ **CSS & JS versions** - Use either approach  

## 🎯 What You Can Do

### Development Mode (Mock Data)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

- ✅ Build UI without backend
- ✅ Test admission workflows
- ✅ Customize test scenarios
- ✅ Work offline
- ✅ Fast iteration
- ✅ Data persists between restarts

### Production Mode (Real API)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
BACKEND_API_URL=https://your-backend.azurewebsites.net
```

- ✅ Connect to C# backend
- ✅ Use real database
- ✅ Production authentication
- ✅ Live data

## 📖 Documentation Guide

**Start Here:**
1. **QUICKSTART_MOCK.md** - 5-minute setup guide

**For Development:**
2. **MOCK_DATA_GUIDE.md** - How to use mock system
3. **IMPLEMENTATION_GUIDE.md** - Integrate into your project

**For Backend Integration:**
4. **API_INTEGRATION.ts** - Connect to C# API
5. **README.md** - Design system reference

**For Understanding:**
6. **TRANSFORMATION_GUIDE.tsx** - Before/after patterns

## 🛠️ Technology Stack

- **Next.js 14+** - App router
- **TypeScript** - Full type safety
- **React** - Component architecture
- **Node.js fs** - File persistence
- **JSON** - Data storage

## 🔄 Development Workflow

### Phase 1: Mock Development (Week 1-2)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```
- Build UI components
- Test workflows
- Iterate quickly

### Phase 2: Hybrid Testing (Week 3)
```bash
# Some endpoints mock, some real
```
- Connect one API at a time
- Compare mock vs real data
- Validate integration

### Phase 3: Production (Week 4+)
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```
- Full backend integration
- Keep mock for testing
- Deploy to production

## 💡 Common Use Cases

### 1. Add Walk-in Admission
Edit `dat/mock/admissions.json` or use API:
```typescript
await fetch('/api/admissions', {
  method: 'POST',
  body: JSON.stringify({ firstName: 'John', ... })
});
```

### 2. Track Admission Progress
```typescript
// Start session
const session = await fetch('/api/admissions/adm-001/start', { 
  method: 'POST' 
});

// Update progress
await fetch(`/api/admissions/adm-001/sessions/${session.id}`, {
  method: 'PATCH',
  body: JSON.stringify({ currentStep: 2, data: {...} })
});
```

### 3. View Activity Log
```typescript
const activities = await fetch('/api/admissions/activity?limit=10');
// Returns recent activities with automatic timestamps
```

### 4. Customize Test Scenarios
Edit JSON files directly:
- Add edge cases
- Test different statuses
- Simulate various admission types
- Create realistic test data

## 📞 Support

**Issues with setup?**
1. Check `QUICKSTART_MOCK.md` troubleshooting
2. Verify file structure matches guide
3. Ensure `.env.local` is configured
4. Restart dev server after env changes

**Need help integrating?**
- See `IMPLEMENTATION_GUIDE.md` for step-by-step
- Check `API_INTEGRATION.ts` for backend examples
- Review example components for patterns

## 🎓 Learning Path

**Beginner:**
1. Run `setup-mock.sh`
2. Start dev server
3. View admissions dashboard
4. Edit JSON files and see changes

**Intermediate:**
5. Add new admission via API
6. Track session through multi-step form
7. Customize mock data scenarios
8. Build new features using design system

**Advanced:**
9. Integrate with C# backend
10. Implement real authentication
11. Add new API endpoints
12. Deploy to production

## 📊 What's Working

✅ Stats dashboard with real data  
✅ Admission list with filtering  
✅ Start/continue admission flows  
✅ Multi-step intake forms  
✅ Session persistence  
✅ Activity logging  
✅ Walk-in admissions  
✅ Status updates  
✅ File persistence  
✅ Easy mock/real toggle  

## 🚧 What You'll Build

- Room assignment system
- Medical screening forms
- Consent management
- PDF generation
- Email notifications
- Calendar integration
- Reports & analytics
- Staff management
- More unit types (drugs, ladies, gambling)

## 📦 Package Info

- **Version:** 1.0.0
- **Size:** 53KB compressed
- **Files:** 32 total
- **License:** Use for Acutis project
- **Updated:** January 2026

---

**Ready to start?** Open `QUICKSTART_MOCK.md` and follow the 5-minute setup guide!


## 🎨 Dynamic Form System (NEW!)

The admission forms are now **driven by configuration** from the Form Designer:

- **forms.json** - Form configurations for each unit
- **DynamicFormRenderer.tsx** - Renders fields from config
- **AdmissionIntakeFlow.tsx** - Updated to use dynamic forms
- **mockFormService.ts** - Form config CRUD operations
- **DYNAMIC_FORMS_GUIDE.md** - Complete integration guide

Admins can customize admission forms through the Form Designer without touching code!
