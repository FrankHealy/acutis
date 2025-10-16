"use client";
import { useEffect, useState } from 'react';
import { Building, AlertTriangle, User } from 'lucide-react';

const Header = () => {
  const [today, setToday] = useState<string>("");
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    // Compute on client to avoid SSR/client mismatch
    const update = () => {
      const d = new Date();
      setToday(
        d.toLocaleDateString("en-IE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
      setNow(
        d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })
      );
    };
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Acutis</h1>
                <p className="text-xs text-gray-500">Bruree Treatment Center</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-600">
              <span>Capacity: 92/120</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>{today || "\u00A0"}</span>
              <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
              <span>Current Time: {now || "\u00A0"}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute -top-1 -right-1"></div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <AlertTriangle className="h-5 w-5" />
              </button>
            </div>
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
