#!/usr/bin/env python3
"""
React Native Project Structure Generator for Acutis Healthcare App
Creates a complete folder structure with starter files
"""

import os
from pathlib import Path

# Base project name
PROJECT_NAME = "acutis-mobile"

# Directory structure
DIRECTORIES = [
    "src/api/endpoints",
    "src/api/types",
    "src/assets/images",
    "src/assets/fonts",
    "src/assets/icons",
    "src/components/common",
    "src/components/forms",
    "src/components/schedule",
    "src/components/admissions",
    "src/screens/Dashboard/components",
    "src/screens/Dashboard/hooks",
    "src/screens/Admissions/components",
    "src/screens/Therapy/components",
    "src/screens/Schedule/components",
    "src/screens/Residents",
    "src/navigation",
    "src/hooks",
    "src/store/slices",
    "src/store/types",
    "src/services",
    "src/utils",
    "src/types",
    "src/theme",
    "__tests__/components",
    "__tests__/screens",
    "__tests__/utils",
]

# Files to create with their content
FILES = {
    # Environment files
    ".env.example": """# API Configuration
API_URL=https://api.acutis.ie
API_TIMEOUT=30000

# Feature Flags
ENABLE_OFFLINE_MODE=true
ENABLE_BIOMETRIC_AUTH=true

# Analytics
ANALYTICS_ENABLED=false
""",
    
    ".gitignore": """# OSX
.DS_Store

# Node
node_modules/
npm-debug.log
yarn-error.log

# Fastlane
fastlane/report.xml
fastlane/Preview.html
fastlane/screenshots
fastlane/test_output

# Bundle artifacts
*.jsbundle

# CocoaPods
ios/Pods/

# Expo
.expo/
.expo-shared/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# Android
android/app/build/
android/.gradle/

# iOS
ios/build/
""",

    # TypeScript config
    "tsconfig.json": """{
  "compilerOptions": {
    "target": "esnext",
    "module": "commonjs",
    "lib": ["es2017"],
    "allowJs": true,
    "jsx": "react-native",
    "noEmit": true,
    "isolatedModules": true,
    "strict": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@components/*": ["src/components/*"],
      "@screens/*": ["src/screens/*"],
      "@utils/*": ["src/utils/*"],
      "@types/*": ["src/types/*"],
      "@api/*": ["src/api/*"],
      "@hooks/*": ["src/hooks/*"],
      "@theme/*": ["src/theme/*"]
    }
  },
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
""",

    # Package.json
    "package.json": """{
  "name": "acutis-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.74.1",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/stack": "^6.3.20",
    "@react-navigation/bottom-tabs": "^6.5.11",
    "react-native-gesture-handler": "~2.16.1",
    "react-native-reanimated": "~3.10.1",
    "react-native-screens": "~3.31.1",
    "react-native-safe-area-context": "4.10.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "@tanstack/react-query": "^5.0.0",
    "axios": "^1.6.0",
    "date-fns": "^3.0.0",
    "zustand": "^4.4.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.73.0",
    "typescript": "^5.1.3",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint": "^8.0.0",
    "jest": "^29.2.1",
    "@testing-library/react-native": "^12.0.0"
  }
}
""",

    # API Client
    "src/api/client.ts": """import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.API_URL || 'https://api.acutis.ie';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await AsyncStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);
""",

    # API Types
    "src/api/types/api.types.ts": """export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
""",

    # Admissions API
    "src/api/endpoints/admissions.ts": """import { apiClient } from '../client';
import { ApiResponse } from '../types/api.types';
import { Admission, CreateAdmissionDto } from '@/types/admission.types';

export const admissionsApi = {
  getExpected: async () => {
    const response = await apiClient.get<ApiResponse<Admission[]>>('/admissions/expected');
    return response.data;
  },

  create: async (data: CreateAdmissionDto) => {
    const response = await apiClient.post<ApiResponse<Admission>>('/admissions', data);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get<ApiResponse<Admission>>(`/admissions/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateAdmissionDto>) => {
    const response = await apiClient.patch<ApiResponse<Admission>>(`/admissions/${id}`, data);
    return response.data;
  },
};
""",

    # Types
    "src/types/admission.types.ts": """export interface Admission {
  id: string;
  name: string;
  expectedTime?: string;
  addictionType: string;
  hasPhoneEval: boolean;
  hasPreReg: boolean;
  isPreviousResident: boolean;
  status: 'pending' | 'arrived' | 'admitted';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdmissionDto {
  firstName: string;
  middleName?: string;
  surname: string;
  alias?: string;
  sex?: string;
  dateOfBirth?: string;
  ppsNumber?: string;
  isPreviousResident: boolean;
  primaryAddiction: string;
  // Add other fields as needed
}
""",

    "src/types/resident.types.ts": """export interface Resident {
  id: string;
  name: string;
  initials: string;
  roomNumber: string;
  unit: string;
  admissionDate: string;
  status: 'active' | 'discharged' | 'on-leave';
}
""",

    "src/types/therapy.types.ts": """export interface TherapyParticipant {
  id: string;
  name: string;
  initials: string;
  hasSpoken: boolean;
}

export interface TherapySession {
  id: string;
  title: string;
  date: string;
  participants: TherapyParticipant[];
  notes: string;
}

export interface ObservationTerm {
  id: string;
  term: string;
  description: string;
  frequency: 'Frequent' | 'Common' | 'Occasional' | 'Rare';
}
""",

    "src/types/schedule.types.ts": """export interface ScheduleEvent {
  time: string;
  timeMinutes: number;
  title: string;
  color: string;
  description?: string;
  days?: string;
  endTime?: string;
}
""",

    # Theme
    "src/theme/colors.ts": """export const colors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  secondary: {
    50: '#f5f3ff',
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    600: '#16a34a',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    600: '#dc2626',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
};
""",

    "src/theme/spacing.ts": """export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
""",

    "src/theme/typography.ts": """export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};
""",

    "src/theme/index.ts": """export { colors } from './colors';
export { spacing } from './spacing';
export { typography } from './typography';

export const theme = {
  colors,
  spacing,
  typography,
};

export type Theme = typeof theme;
""",

    # Navigation
    "src/navigation/types.ts": """import type { StackScreenProps } from '@react-navigation/stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

export type RootStackParamList = {
  MainTabs: undefined;
  NewAdmission: { admissionId?: string };
  AdmissionForm: { admissionId: string };
  GroupTherapy: { sessionId: string };
  ResidentDetail: { residentId: string };
};

export type MainTabParamList = {
  Dashboard: undefined;
  Schedule: undefined;
  Residents: undefined;
  More: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  StackScreenProps<RootStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;
""",

    # Hooks
    "src/hooks/useAuth.ts": """import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (token: string) => {
    await AsyncStorage.setItem('auth_token', token);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('auth_token');
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, login, logout };
};
""",

    # Utils
    "src/utils/date.utils.ts": """import { format, parseISO } from 'date-fns';

export const formatDate = (date: string | Date, formatStr: string = 'PPP'): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};
""",

    "src/utils/validation.utils.ts": """export const validateEmail = (email: string): boolean => {
  const re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return re.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const re = /^[\\d\\s\\-\\+\\(\\)]+$/;
  return re.test(phone) && phone.replace(/\\D/g, '').length >= 10;
};

export const validatePPS = (pps: string): boolean => {
  // Irish PPS format: 7 digits followed by 1-2 letters
  const re = /^\\d{7}[A-Za-z]{1,2}$/;
  return re.test(pps);
};
""",

    # Components
    "src/components/common/Button.tsx": """import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary[500],
  },
  secondary: {
    backgroundColor: colors.gray[500],
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary[500],
  },
});
""",

    "src/components/common/Card.tsx": """import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ children, style }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
""",

    # Main App
    "src/App.tsx": """import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';

const queryClient = new QueryClient();

export default function App() {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          {/* Your navigation will go here */}
        </NavigationContainer>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
""",

    # README
    "README.md": """# Acutis Mobile

Healthcare management system for addiction treatment facilities.

## Features

- 📋 Admissions Management
- 👥 Resident Tracking
- 🗓️ Daily Schedule & Timeline
- 💬 Group Therapy Sessions
- 📊 Medical Records Management

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- React Native development environment

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm start
   ```

### Running the App

- iOS: `npm run ios`
- Android: `npm run android`

## Project Structure

```
src/
├── api/          # API client and endpoints
├── components/   # Reusable components
├── screens/      # Screen components
├── navigation/   # Navigation configuration
├── hooks/        # Custom React hooks
├── store/        # State management
├── services/     # Business logic services
├── utils/        # Utility functions
├── types/        # TypeScript type definitions
└── theme/        # Design system
```

## Testing

```bash
npm test
```

## License

Proprietary - All rights reserved
""",
}


def create_structure():
    """Create the complete project structure"""
    base_path = Path(PROJECT_NAME)
    
    # Create base directory
    base_path.mkdir(exist_ok=True)
    print(f"✓ Created base directory: {PROJECT_NAME}")
    
    # Create all directories
    for directory in DIRECTORIES:
        dir_path = base_path / directory
        dir_path.mkdir(parents=True, exist_ok=True)
        print(f"✓ Created: {directory}")
    
    # Create all files
    for file_path, content in FILES.items():
        full_path = base_path / file_path
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"✓ Created: {file_path}")
    
    # Create .gitkeep files for empty directories that need to be tracked
    empty_dirs = [
        "src/assets/images",
        "src/assets/fonts",
        "src/assets/icons",
    ]
    for directory in empty_dirs:
        gitkeep = base_path / directory / ".gitkeep"
        gitkeep.touch()
        print(f"✓ Created .gitkeep in: {directory}")
    
    print("\n" + "="*60)
    print("✅ Project structure created successfully!")
    print("="*60)
    print(f"\nProject location: ./{PROJECT_NAME}/")
    print_next_steps()


def print_next_steps():
    """Print suggested next steps"""
    print("\n📋 SUGGESTED NEXT STEPS:\n")
    
    steps = [
        ("1. Initialize React Native with Expo", [
            "cd acutis-mobile",
            "npx create-expo-app@latest . --template blank-typescript",
        ]),
        
        ("2. Install Dependencies", [
            "npm install",
        ]),
        
        ("3. Set Up Environment", [
            "cp .env.example .env",
            "# Edit .env with your actual API URL",
        ]),
        
        ("4. Configure Navigation", [
            "Create src/navigation/AppNavigator.tsx",
            "Set up stack and tab navigators",
        ]),
        
        ("5. Build Core Screens (Priority Order)", [
            "a) Dashboard - Main landing",
            "b) ExpectedAdmissions - Incoming admissions",
            "c) AdmissionForm - New admission workflow",
            "d) DailySchedule - Timeline view",
            "e) GroupTherapy - Session management",
        ]),
        
        ("6. State Management", [
            "Set up Zustand stores or Redux",
            "Configure React Query for API calls",
        ]),
        
        ("7. Authentication", [
            "Create login/logout screens",
            "Implement token management",
        ]),
        
        ("8. Testing & Security", [
            "Write unit tests",
            "Implement data encryption",
            "Add HIPAA/GDPR compliance",
        ]),
    ]
    
    for title, commands in steps:
        print(f"\n{title}")
        print("-" * 60)
        for cmd in commands:
            print(f"  {cmd}")
    
    print("\n" + "="*60)
    print("💡 PRIORITY FOCUS:")
    print("="*60)
    print("1. Navigation (connect screens)")
    print("2. API integration (backend connection)")
    print("3. Authentication (secure access)")
    print("4. Admission workflow (core feature)")
    print("\n" + "="*60)


if __name__ == "__main__":
    print("\n🚀 ACUTIS MOBILE - React Native Project Generator\n")
    
    try:
        create_structure()
    except Exception as e:
        print(f"\n❌ Error: {e}")
