/**
 * ElementsLibraryPanel.tsx
 * Floating sidebar panel with drag & drop elements
 * Integrates with FormDesigner
 */

import React, { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  CircleDot,
  FileText,
  GripVertical,
  Hash,
  Heart,
  List,
  Mail,
  Package,
  Phone,
  Search,
  Shield,
  Type,
  User,
  X,
} from "lucide-react";

interface FormField {
  id: string;
  fieldName: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "checkbox" | "textarea" | "email" | "phone" | "file" | "tel";
  required: boolean;
  placeholder?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    customMessage?: string;
  };
  helpText?: string;
  defaultValue?: string;
}

interface FormElement {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: FormField[];
}

interface ElementCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  elements: FormElement[];
}

interface ElementsLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onElementDrop: (element: FormElement, sectionId: string) => void;
}

const ElementsLibraryPanel: React.FC<ElementsLibraryPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const [library, setLibrary] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedElement, setDraggedElement] = useState<FormElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchLibrary();
    }
  }, [isOpen]);

  const fetchLibrary = async () => {
    try {
      const response = await fetch("/api/elements-library");
      const data = await response.json();
      setLibrary(data.categories || []);
      if (data.categories?.length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch elements library:", error);
      setLibrary(getMockLibrary());
      setSelectedCategory("personal-info");
    } finally {
      setLoading(false);
    }
  };

  const getMockLibrary = (): ElementCategory[] => {
    return [
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
  };

  const categoryIcons = useMemo<Record<string, React.ReactNode>>(
    () => ({
      "personal-info": <User size={20} />,
      medical: <Heart size={20} />,
      "substance-use": <AlertTriangle size={20} />,
      assessment: <FileText size={20} />,
      consent: <Shield size={20} />,
      therapy: <FileText size={20} />,
    }),
    []
  );

  const fieldTypeIcons = useMemo<Record<string, React.ReactNode>>(
    () => ({
      text: <Type size={14} />,
      email: <Mail size={14} />,
      phone: <Phone size={14} />,
      tel: <Phone size={14} />,
      select: <List size={14} />,
      radio: <CircleDot size={14} />,
      checkbox: <CheckSquare size={14} />,
      textarea: <FileText size={14} />,
      date: <Calendar size={14} />,
      "datetime-local": <Calendar size={14} />,
      number: <Hash size={14} />,
      file: <FileText size={14} />,
    }),
    []
  );

  const handleDragStart = (element: FormElement, e: React.DragEvent) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = "copy";
    const payload = JSON.stringify(element);
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.setData("text/plain", payload);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const filteredLibrary = library
    .map((category) => ({
      ...category,
      elements: category.elements.filter(
        (element) =>
          searchQuery === "" ||
          element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          element.description.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.elements.length > 0);

  const selectedCategoryData = filteredLibrary.find((cat) => cat.id === selectedCategory);

  return (
    <>
      {/* Overlay removed to keep drop targets visible/interactive */}

      <div
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Package className="h-5 w-5 text-white" />
              <h2 className="text-lg font-bold text-white">Elements Library</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <X className="h-5 w-5 text-white" />
            </button>
          </div>
          <p className="text-sm text-blue-100">Drag elements into sections to add fields</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex h-[calc(100%-140px)]">
          <div className="w-24 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-2 space-y-1">
              {filteredLibrary.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full p-3 rounded-lg text-center transition-all ${
                    selectedCategory === category.id ? "bg-blue-100 shadow-sm" : "hover:bg-gray-100"
                  }`}
                  title={category.name}
                >
                  <div className="mb-1">
                    {categoryIcons[category.id] || <FileText size={20} />}
                  </div>
                  <div className={`text-xs font-medium ${selectedCategory === category.id ? "text-blue-700" : "text-gray-600"}`}>
                    {category.elements.length}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading elements...</div>
            ) : selectedCategoryData ? (
              <div className="p-4 space-y-3">
                <div className="mb-4">
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{selectedCategoryData.name}</h3>
                  <p className="text-xs text-gray-500">{selectedCategoryData.description}</p>
                </div>

                {selectedCategoryData.elements.map((element) => (
                  <div
                    key={element.id}
                    draggable
                    onDragStart={(e) => handleDragStart(element, e)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white border-2 border-gray-200 rounded-lg p-3 cursor-move hover:border-blue-400 hover:shadow-md transition-all ${
                      draggedElement?.id === element.id ? "opacity-50 scale-95" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm mb-1">{element.name}</h4>
                        <p className="text-xs text-gray-500 mb-2">{element.description}</p>
                      </div>
                      <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {element.fields.length}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {element.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs bg-gray-50 rounded p-2">
                          <span>{fieldTypeIcons[field.type] || <FileText size={14} />}</span>
                          <span className="text-gray-700 font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500">*</span>}
                        </div>
                      ))}
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-center text-xs text-gray-400">
                      <GripVertical className="h-3 w-3 mr-1" />
                      Drag to add
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No elements found</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ElementsLibraryPanel;
