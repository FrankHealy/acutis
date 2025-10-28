"use client";
import React from 'react';
import Header from '@/components/layout/Header';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DrugsUnitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Drugs Dashboard</h1>
        <QuickActions setCurrentStep={() => { /* noop */ }} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-600">
          Coming Soon...
        </div>
      </main>
    </div>
  );
}

