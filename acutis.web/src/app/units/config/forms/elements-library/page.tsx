"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ElementsLibraryPanel from "@/areas/config/ElementsLibraryPanel";
import { getActiveForm, type FormDefinitionDto } from "@/areas/screening/forms/ApiClient";
import {
  getFallbackScreeningElementsLibrary,
  getScreeningElementsLibraryFromForm,
  type LibraryCategory,
} from "@/areas/config/screeningFormLibrary";

export default function ElementsLibraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [library, setLibrary] = useState<LibraryCategory[]>(getFallbackScreeningElementsLibrary());
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);

  useEffect(() => {
    const loadLibrary = async () => {
      const accessToken = session?.accessToken;
      if (!accessToken) {
        setIsLoadingLibrary(false);
        return;
      }

      try {
        const response = await getActiveForm(accessToken, "en-IE", "anonymous_call", null, "alcohol_screening_call");
        setLibrary(getScreeningElementsLibraryFromForm(response.form as FormDefinitionDto));
      } catch (error) {
        console.error("Failed to load screening elements library:", error);
        setLibrary(getFallbackScreeningElementsLibrary());
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    void loadLibrary();
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-semibold text-gray-900">Elements Library</h1>
        <p className="text-sm text-gray-600 mt-2">
          Browse reusable bound elements. To drag and drop into a form, open Form Designer.
        </p>
      </div>

      <ElementsLibraryPanel
        isOpen
        onClose={() => router.push("/units/config/forms")}
        onElementDrop={() => {}}
        library={library}
        isLoadingLibrary={isLoadingLibrary}
      />
    </div>
  );
}
