"use client";
import React from 'react';
import Header from '@/components/layout/Header';
import QuickActions from '@/components/dashboard/QuickActions';

export default function DetoxUnitPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Detox Dashboard</h1>
        <QuickActions setCurrentStep={() => { /* noop on detox landing */ }} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-500">
          This page is intentionally minimal. Add Detox widgets here.
        </div>
      </main>
    </div>
  );
}

