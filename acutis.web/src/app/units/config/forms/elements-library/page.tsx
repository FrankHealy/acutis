"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Layers3 } from "lucide-react";
import { elementLibraryService, type LibraryCategory } from "@/services/elementLibraryService";
import { isAuthorizationDisabled } from "@/lib/authMode";

const badgeClassBySource: Record<string, string> = {
  canonical: "bg-emerald-100 text-emerald-800 border-emerald-200",
  json: "bg-blue-100 text-blue-800 border-blue-200",
  unbound: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function ElementsLibraryPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [library, setLibrary] = useState<LibraryCategory[]>([]);
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLibrary = async () => {
      const accessToken = session?.accessToken;
      if (!accessToken && !isAuthorizationDisabled) {
        setIsLoadingLibrary(false);
        return;
      }

      try {
        setError(null);
        setLibrary(await elementLibraryService.getLibrary(accessToken));
      } catch (error) {
        console.error("Failed to load elements library:", error);
        setError(error instanceof Error ? error.message : "Failed to load element library.");
      } finally {
        setIsLoadingLibrary(false);
      }
    };

    void loadLibrary();
  }, [session?.accessToken]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-8">
        <button
          type="button"
          onClick={() => router.push("/units/config/forms")}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Forms
        </button>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">
                <Layers3 className="h-3.5 w-3.5" />
                Element Library
              </div>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">Reusable element groups and definitions</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                Form Designer remains separate. This library stores reusable element groups and element definitions with visible source classification, canonical mapping metadata, and option-set linkage where applicable.
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-right">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Groups</p>
              <p className="mt-1 text-3xl font-semibold text-slate-900">{library.length}</p>
            </div>
          </div>
        </div>

        {isLoadingLibrary ? (
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            Loading element library...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-sm text-rose-700 shadow-sm">
            {error}
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {library.map((group) => (
              <section key={group.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">{group.name}</h2>
                    <p className="mt-2 max-w-3xl text-sm text-slate-600">{group.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">key: {group.id}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">version: {group.version}</span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">status: {group.status}</span>
                      {group.sourceDocumentReference && (
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1">source: {group.sourceDocumentReference}</span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Definitions</p>
                    <p className="mt-1 text-2xl font-semibold text-slate-900">
                      {group.elements.filter((element) => element.kind === "definition").length}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-2">
                  {group.elements.map((element) => (
                    <article key={element.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-base font-semibold text-slate-900">{element.name}</h3>
                          <p className="mt-1 text-sm text-slate-600">{element.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {element.kind === "group" ? "group pack" : "definition"}
                          </span>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${badgeClassBySource[element.sourceKind] ?? badgeClassBySource.unbound}`}>
                            {element.sourceKind}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">version: {element.version}</span>
                        <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">status: {element.status}</span>
                        {element.canonicalFieldKey && (
                          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">canonical: {element.canonicalFieldKey}</span>
                        )}
                        {element.optionSetKey && (
                          <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">option set: {element.optionSetKey}</span>
                        )}
                        {element.sourceDocumentReference && (
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1">source doc: {element.sourceDocumentReference}</span>
                        )}
                      </div>

                      <div className="mt-4 space-y-2">
                        {element.fields.map((field) => (
                          <div key={field.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                              <div>
                                <p className="text-sm font-semibold text-slate-900">{field.label}</p>
                                <p className="mt-1 text-xs text-slate-500">
                                  key: {field.fieldName} • type: {field.elementType}{field.required ? " • required" : ""}
                                </p>
                              </div>
                              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${badgeClassBySource[field.sourceKind] ?? badgeClassBySource.unbound}`}>
                                {field.sourceKind}
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                              {field.canonicalFieldKey && <span>canonical: {field.canonicalFieldKey}</span>}
                              {field.optionSetKey && <span>option set: {field.optionSetKey}</span>}
                              {field.sourceDocumentReference && <span>source: {field.sourceDocumentReference}</span>}
                            </div>
                            {field.helpText && <p className="mt-2 text-xs text-slate-600">{field.helpText}</p>}
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
