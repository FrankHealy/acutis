"use client";

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
import {
  type LibraryCategory,
  type LibraryElement,
} from "@/services/elementLibraryService";

interface ElementsLibraryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onElementDrop: (element: LibraryElement, sectionId: string) => void;
  library?: LibraryCategory[];
  isLoadingLibrary?: boolean;
}

const ElementsLibraryPanel: React.FC<ElementsLibraryPanelProps> = ({
  isOpen,
  onClose,
  library: providedLibrary,
  isLoadingLibrary = false,
}) => {
  const [library, setLibrary] = useState<LibraryCategory[]>(providedLibrary ?? []);
  const [loading, setLoading] = useState(!providedLibrary && isOpen);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [draggedElement, setDraggedElement] = useState<LibraryElement | null>(null);

  useEffect(() => {
    if (providedLibrary) {
      setLibrary(providedLibrary);
      setSelectedCategory((current) => current ?? providedLibrary[0]?.id ?? null);
      setLoading(false);
      return;
    }

    if (isOpen) {
      setLoading(true);
      fetchLibrary();
    }
  }, [isOpen, providedLibrary]);

  const fetchLibrary = async () => {
    try {
      setLibrary([]);
      setSelectedCategory(null);
    } catch (error) {
      console.error("Failed to fetch elements library:", error);
    } finally {
      setLoading(false);
    }
  };

  const categoryIcons = useMemo<Record<string, React.ReactNode>>(
    () => ({
      "personal-info": <User size={20} />,
      medical: <Heart size={20} />,
      "substance-use": <AlertTriangle size={20} />,
      "hse-caller-details": <User size={20} />,
      "hse-alcohol-use": <AlertTriangle size={20} />,
      "hse-stability-safety": <Shield size={20} />,
      "hse-follow-up": <FileText size={20} />,
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

  const handleDragStart = (element: LibraryElement, e: React.DragEvent) => {
    setDraggedElement(element);
    e.dataTransfer.effectAllowed = "copy";
    const payload = JSON.stringify(element);
    e.dataTransfer.setData("application/json", payload);
    e.dataTransfer.setData("text/plain", payload);
  };

  const handleDragEnd = () => {
    setDraggedElement(null);
  };

  const availableElementTypes = useMemo(
    () =>
      Array.from(
        new Set(
          library.flatMap((category) =>
            category.elements.flatMap((element) => element.fields.map((field) => field.elementType))
          )
        )
      ).sort((a, b) => a.localeCompare(b)),
    [library]
  );

  const filteredLibrary = library
    .map((category) => ({
      ...category,
      elements: category.elements.filter((element) => {
        const normalizedQuery = searchQuery.toLowerCase();
        const matchesSearch =
          searchQuery === "" ||
          element.name.toLowerCase().includes(normalizedQuery) ||
          element.description.toLowerCase().includes(normalizedQuery) ||
          element.categoryName.toLowerCase().includes(normalizedQuery) ||
          element.fields.some((field) => {
            return (
              field.label.toLowerCase().includes(normalizedQuery) ||
              field.fieldName.toLowerCase().includes(normalizedQuery) ||
              field.elementType.toLowerCase().includes(normalizedQuery) ||
              (field.canonicalFieldKey ?? "").toLowerCase().includes(normalizedQuery) ||
              (field.optionSetKey ?? "").toLowerCase().includes(normalizedQuery) ||
              (field.sourceDocumentReference ?? "").toLowerCase().includes(normalizedQuery)
            );
          });
        const matchesType =
          typeFilter === "all" || element.fields.some((field) => field.elementType === typeFilter);
        const matchesSource = sourceFilter === "all" || element.sourceKind === sourceFilter;
        return matchesSearch && matchesType && matchesSource;
      }),
    }))
    .filter((category) => category.elements.length > 0);

  useEffect(() => {
    if (!filteredLibrary.some((category) => category.id === selectedCategory)) {
      setSelectedCategory(filteredLibrary[0]?.id ?? null);
    }
  }, [filteredLibrary, selectedCategory]);

  const selectedCategoryData = filteredLibrary.find((cat) => cat.id === selectedCategory);

  return (
    <>
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
          <p className="text-sm text-blue-100">Browse real library definitions and drag them into the form.</p>
        </div>

        <div className="p-4 border-b border-gray-200">
          <div className="space-y-3">
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
            <div className="grid grid-cols-2 gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All types</option>
                {availableElementTypes.map((elementType) => (
                  <option key={elementType} value={elementType}>
                    {elementType}
                  </option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="all">All sources</option>
                <option value="canonical">Canonical</option>
                <option value="json">JSON</option>
                <option value="unbound">Unbound</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100%-176px)]">
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
            {loading || isLoadingLibrary ? (
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
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-600">
                            {element.kind}
                          </span>
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                            {element.sourceKind}
                          </span>
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            {element.categoryName}
                          </span>
                          {element.canonicalFieldKey && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                              {element.canonicalFieldKey}
                            </span>
                          )}
                          {element.optionSetKey && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                              {element.optionSetKey}
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-[11px] text-gray-500">
                          <p>
                            Group: <span className="font-medium text-gray-700">{element.categoryName}</span>
                          </p>
                          {element.sourceDocumentReference && (
                            <p>
                              Source: <span className="font-medium text-gray-700">{element.sourceDocumentReference}</span>
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {element.fields.length}
                      </div>
                    </div>

                    <div className="space-y-1">
                      {element.fields.map((field, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-xs bg-gray-50 rounded p-2">
                          <span>{fieldTypeIcons[field.type] || <FileText size={14} />}</span>
                          <div className="min-w-0 flex-1">
                            <span className="text-gray-700 font-medium">{field.label}</span>
                            <div className="text-[10px] text-gray-500">
                              <div className="truncate">
                                {field.fieldName} | {field.elementType} | {field.sourceKind}
                              </div>
                              <div className="truncate">
                                {field.canonicalFieldKey ? `Canonical: ${field.canonicalFieldKey}` : "Canonical: none"}
                                {field.optionSetKey ? ` | Option set: ${field.optionSetKey}` : ""}
                              </div>
                            </div>
                          </div>
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
