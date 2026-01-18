"use client";

import React from "react";
import { Settings } from "lucide-react";

const ConfigurationLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-gray-700" />
            <h1 className="text-2xl font-semibold text-gray-900">Configuration</h1>
          </div>
          <p className="mt-4 text-gray-600">Configuration area coming soon.</p>
        </div>
      </main>
    </div>
  );
};

export default ConfigurationLanding;
