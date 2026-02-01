"use client";

import Link from "next/link";

type HeaderProps = {
  showCapacity?: boolean;
};

export default function Header({ showCapacity = true }: HeaderProps) {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-blue-600 text-sm font-semibold text-white grid place-items-center">
            A
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-gray-900">Acutis</div>
            <div className="text-xs text-gray-500">Screening</div>
          </div>
        </div>
        <nav className="flex items-center gap-3 text-sm font-semibold">
          <Link className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50" href="/">
            Home
          </Link>
          {showCapacity && (
            <Link
              className="rounded-lg px-3 py-2 text-gray-600 hover:bg-gray-50"
              href="/units/screening?tab=capacity"
            >
              Capacity
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
