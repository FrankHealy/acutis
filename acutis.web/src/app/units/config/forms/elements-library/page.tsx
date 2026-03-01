"use client";

import { useRouter } from "next/navigation";
import ElementsLibraryPanel from "@/areas/config/ElementsLibraryPanel";

export default function ElementsLibraryPage() {
  const router = useRouter();

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
      />
    </div>
  );
}
