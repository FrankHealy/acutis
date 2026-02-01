"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/acutis-design-system/Card";
import { IconBadge } from "@/components/acutis-design-system/IconBadge";
import { designTokens } from "@/components/acutis-design-system/tokens";
import {
  AlertTriangle,
  Calendar,
  CheckSquare,
  CircleDot,
  ClipboardList,
  FileText,
  Hash,
  Heart,
  Image,
  List,
  Mail,
  MessageCircle,
  Phone,
  Shield,
  Type,
  User,
  ArrowLeft,
} from "lucide-react";

interface FormElement {
  id: string;
  name: string;
  description: string;
  category: string;
  fields: any[];
}

interface ElementCategory {
  id: string;
  name: string;
  description: string;
  elements: FormElement[];
}

export default function ElementsLibraryPage() {
  const router = useRouter();
  const [library, setLibrary] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const response = await fetch("/api/elements-library");
      if (!response.ok) {
        throw new Error("Elements library request failed");
      }
      const data = await response.json();
      setLibrary(data.categories || []);
      if (data.categories?.length > 0) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch elements library:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColorKey = (categoryId: string): keyof typeof designTokens.colors.primary => {
    const colors: Record<string, keyof typeof designTokens.colors.primary> = {
      "personal-info": "blue",
      medical: "green",
      "substance-use": "purple",
      assessments: "red",
      consent: "orange",
      therapy: "teal",
    };
    return colors[categoryId] || "blue";
  };

  const getCategoryColorValue = (categoryId: string): string => {
    return designTokens.colors.primary[getCategoryColorKey(categoryId)];
  };

  const categoryIcons = useMemo<Record<string, React.ReactNode>>(
    () => ({
      "personal-info": <User size={18} />,
      medical: <Heart size={18} />,
      "substance-use": <AlertTriangle size={18} />,
      assessments: <ClipboardList size={18} />,
      consent: <Shield size={18} />,
      therapy: <MessageCircle size={18} />,
    }),
    []
  );

  const fieldTypeIcons = useMemo<Record<string, React.ReactNode>>(
    () => ({
      text: <Type size={16} />,
      email: <Mail size={16} />,
      tel: <Phone size={16} />,
      select: <List size={16} />,
      radio: <CircleDot size={16} />,
      checkbox: <CheckSquare size={16} />,
      textarea: <FileText size={16} />,
      date: <Calendar size={16} />,
      "datetime-local": <Calendar size={16} />,
      number: <Hash size={16} />,
      file: <Image size={16} />,
    }),
    []
  );

  const filteredLibrary = library
    .map((category) => ({
      ...category,
      elements: category.elements.filter(
        (element) =>
          searchQuery === "" ||
          element.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          element.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          element.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.elements.length > 0);

  const selectedCategoryData = filteredLibrary.find((cat) => cat.id === selectedCategory);

  return (
    <div
      style={{
        padding: designTokens.spacing.xl,
        backgroundColor: designTokens.colors.neutral[50],
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div
        style={{
          maxWidth: "1600px",
          margin: "0 auto",
          marginBottom: designTokens.spacing.xl,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: designTokens.spacing.lg,
          }}
        >
          <div>
            <button
              onClick={() => router.push("/configuration/forms")}
              style={{
                background: "none",
                border: "none",
                color: designTokens.colors.primary.blue,
                fontSize: designTokens.typography.fontSize.sm,
                cursor: "pointer",
                marginBottom: designTokens.spacing.sm,
                display: "flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <ArrowLeft size={16} />
              Back to Forms
            </button>
            <h1
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "4px",
                color: designTokens.colors.neutral[900],
              }}
            >
              Form Elements Library
            </h1>
            <p style={{ color: designTokens.colors.neutral[600] }}>
              26 pre-built form elements across 6 categories
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: designTokens.spacing.lg }}>
          <input
            type="text"
            placeholder="Search elements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "600px",
              padding: designTokens.spacing.md,
              border: `1px solid ${designTokens.colors.neutral[300]}`,
              borderRadius: designTokens.borderRadius.md,
              fontSize: designTokens.typography.fontSize.base,
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: "1600px", margin: "0 auto", display: "flex", gap: designTokens.spacing.xl }}>
        {/* Categories Sidebar */}
        <div style={{ width: "280px", flexShrink: 0 }}>
          <Card>
            <CardHeader title="Categories" />
            <CardContent>
              <div style={{ display: "flex", flexDirection: "column", gap: designTokens.spacing.xs }}>
                {filteredLibrary.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: designTokens.spacing.sm,
                      padding: designTokens.spacing.md,
                      backgroundColor:
                        selectedCategory === category.id ? getCategoryColorValue(category.id) : "transparent",
                      color: selectedCategory === category.id ? "white" : designTokens.colors.neutral[700],
                      border: "none",
                      borderRadius: designTokens.borderRadius.md,
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: selectedCategory === category.id ? 600 : 400,
                      transition: "all 0.2s ease",
                    }}
                  >
                    <div style={{ opacity: selectedCategory === category.id ? 1 : 0.6 }}>
                      {categoryIcons[category.id] || <FileText size={18} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div>{category.name}</div>
                      <div
                        style={{
                          fontSize: designTokens.typography.fontSize.xs,
                          opacity: 0.8,
                        }}
                      >
                        {category.elements.length} elements
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Elements Grid */}
        <div style={{ flex: 1 }}>
          {loading ? (
            <Card>
              <CardContent>
                <div style={{ padding: designTokens.spacing.xl, textAlign: "center", color: designTokens.colors.neutral[500] }}>
                  Loading elements...
                </div>
              </CardContent>
            </Card>
          ) : selectedCategoryData ? (
            <>
              {/* Category Header */}
              <div style={{ marginBottom: designTokens.spacing.lg }}>
                <div style={{ display: "flex", alignItems: "center", gap: designTokens.spacing.md, marginBottom: designTokens.spacing.sm }}>
                  <IconBadge
                    icon={categoryIcons[selectedCategoryData.id] || <FileText size={18} />}
                    size="lg"
                    color={getCategoryColorKey(selectedCategoryData.id)}
                  />
                  <div>
                    <h2
                      style={{
                        fontSize: designTokens.typography.fontSize["2xl"],
                        fontWeight: 700,
                        marginBottom: "4px",
                      }}
                    >
                      {selectedCategoryData.name}
                    </h2>
                    <p style={{ color: designTokens.colors.neutral[600] }}>{selectedCategoryData.description}</p>
                  </div>
                </div>
              </div>

              {/* Elements Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
                  gap: designTokens.spacing.lg,
                }}
              >
                {selectedCategoryData.elements.map((element) => (
                  <Card key={element.id}>
                    <CardContent>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: designTokens.spacing.md }}>
                        <div style={{ flex: 1 }}>
                          <h4
                            style={{
                              fontSize: designTokens.typography.fontSize.lg,
                              fontWeight: 600,
                              marginBottom: "4px",
                            }}
                          >
                            {element.name}
                          </h4>
                          <p style={{ fontSize: designTokens.typography.fontSize.sm, color: designTokens.colors.neutral[600] }}>
                            {element.description}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: designTokens.borderRadius.full,
                            fontSize: designTokens.typography.fontSize.xs,
                            fontWeight: 600,
                            backgroundColor: getCategoryColorValue(selectedCategoryData.id),
                            color: "white",
                          }}
                        >
                          {element.fields.length} {element.fields.length === 1 ? "field" : "fields"}
                        </span>
                      </div>

                      {/* Element ID */}
                      <div
                        style={{
                          padding: designTokens.spacing.sm,
                          backgroundColor: designTokens.colors.neutral[100],
                          borderRadius: designTokens.borderRadius.md,
                          marginBottom: designTokens.spacing.md,
                          fontFamily: "monospace",
                          fontSize: designTokens.typography.fontSize.sm,
                          color: designTokens.colors.neutral[700],
                        }}
                      >
                        {element.id}
                      </div>

                      {/* Fields Preview */}
                      <div style={{ display: "flex", flexDirection: "column", gap: designTokens.spacing.sm }}>
                        {element.fields.map((field, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: designTokens.spacing.sm,
                              padding: designTokens.spacing.sm,
                              backgroundColor: designTokens.colors.neutral[50],
                              borderRadius: designTokens.borderRadius.sm,
                              fontSize: designTokens.typography.fontSize.sm,
                            }}
                          >
                            <span>{fieldTypeIcons[field.type] || <FileText size={16} />}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: 500 }}>
                                {field.label}
                                {field.required && <span style={{ color: designTokens.colors.status.danger }}> *</span>}
                              </div>
                              <div style={{ fontSize: designTokens.typography.fontSize.xs, color: designTokens.colors.neutral[500] }}>
                                {field.type}
                                {field.validation?.pattern && " - validated"}
                                {field.dependsOn && " - conditional"}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Usage Hint */}
                      <div
                        style={{
                          marginTop: designTokens.spacing.md,
                          padding: designTokens.spacing.sm,
                          backgroundColor: `${designTokens.colors.primary.blue}10`,
                          borderLeft: `3px solid ${designTokens.colors.primary.blue}`,
                          borderRadius: designTokens.borderRadius.sm,
                          fontSize: designTokens.typography.fontSize.xs,
                          color: designTokens.colors.neutral[600],
                        }}
                      >
                        Add to form by referencing:{" "}
                        <code style={{ fontFamily: "monospace" }}>"{element.id}"</code>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <Card>
              <CardContent>
                <div style={{ padding: designTokens.spacing.xl, textAlign: "center", color: designTokens.colors.neutral[500] }}>
                  No elements found
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
