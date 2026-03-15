import { NextResponse } from "next/server";

const categories = [
  {
    id: "personal-info",
    name: "Personal Information",
    description: "Basic contact and identity fields",
    icon: "user",
    elements: [
      {
        id: "element-name-basic",
        name: "Name - Basic",
        description: "First and Last name",
        category: "personal-info",
        fields: [
          {
            id: "firstName",
            fieldName: "firstName",
            label: "First Name",
            type: "text",
            required: true,
            placeholder: "Enter first name",
            validation: { min: 2, max: 50 },
          },
          {
            id: "lastName",
            fieldName: "lastName",
            label: "Last Name",
            type: "text",
            required: true,
            placeholder: "Enter last name",
            validation: { min: 2, max: 50 },
          },
        ],
      },
      {
        id: "element-contact-basic",
        name: "Contact - Basic",
        description: "Phone and Email",
        category: "personal-info",
        fields: [
          {
            id: "phone",
            fieldName: "phoneNumber",
            label: "Phone Number",
            type: "phone",
            required: true,
            placeholder: "087-1234567",
            validation: { pattern: "^\\d{3}-\\d{7}$" },
          },
          {
            id: "email",
            fieldName: "email",
            label: "Email Address",
            type: "email",
            required: false,
            placeholder: "email@example.com",
          },
        ],
      },
      {
        id: "element-dob",
        name: "Date of Birth",
        description: "Date of birth with age validation",
        category: "personal-info",
        fields: [
          {
            id: "dateOfBirth",
            fieldName: "dateOfBirth",
            label: "Date of Birth",
            type: "date",
            required: true,
            helpText: "Must be 18 or older",
          },
        ],
      },
    ],
  },
  {
    id: "medical",
    name: "Medical Information",
    description: "Health and medical history",
    icon: "heart",
    elements: [
      {
        id: "element-medications",
        name: "Current Medications",
        description: "List of current medications",
        category: "medical",
        fields: [
          {
            id: "currentMedications",
            fieldName: "currentMedications",
            label: "Current Medications",
            type: "textarea",
            required: false,
            placeholder: "List all current medications",
            helpText: "Include dosage and frequency",
          },
        ],
      },
      {
        id: "element-allergies",
        name: "Allergies",
        description: "Drug and food allergies",
        category: "medical",
        fields: [
          {
            id: "allergies",
            fieldName: "allergies",
            label: "Allergies",
            type: "textarea",
            required: false,
            placeholder: "List any known allergies",
            helpText: "Include drug and food allergies",
          },
        ],
      },
    ],
  },
  {
    id: "substance-use",
    name: "Substance Use",
    description: "Substance use history and assessment",
    icon: "alert-triangle",
    elements: [
      {
        id: "element-alcohol-use",
        name: "Alcohol Use Assessment",
        description: "Detailed alcohol use history",
        category: "substance-use",
        fields: [
          {
            id: "drinksPerDay",
            fieldName: "drinksPerDay",
            label: "Drinks Per Day",
            type: "number",
            required: true,
            placeholder: "0",
            validation: { min: 0, max: 100 },
          },
          {
            id: "yearsHeavyDrinking",
            fieldName: "yearsHeavyDrinking",
            label: "Years of Heavy Drinking",
            type: "number",
            required: true,
            placeholder: "0",
            validation: { min: 0, max: 80 },
          },
          {
            id: "withdrawalHistory",
            fieldName: "withdrawalHistory",
            label: "Withdrawal History",
            type: "select",
            required: false,
            options: ["None", "Mild", "Moderate", "Severe"],
          },
        ],
      },
    ],
  },
];

export async function GET() {
  return NextResponse.json({ categories });
}
