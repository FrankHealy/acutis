"use client";

import React, { useState } from 'react';
import { BedDouble, Users, TrendingUp, AlertTriangle, CheckCircle, Calendar, Filter } from 'lucide-react';

interface UnitCapacity {
  id: string;
  name: string;
  totalBeds: number;
  occupied: number;
  reserved: number;
  available: number;
  waitlist: number;
  expectedDischarges: number;
  expectedAdmissions: number;
  color: string;
}

interface ForecastData {
  date: string;
  available: number;
  reserved: number;
  occupied: number;
}

const CapacityManagement: React.FC = () => {
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'current' | 'forecast'>('current');
  const [forecastDays, setForecastDays] = useState(7);

  const units: UnitCapacity[] = [
    {
      id: 'detox',
      name: 'Detox Unit',
      totalBeds: 24,
      occupied: 18,
      reserved: 3,
      available: 3,
      waitlist: 8,
      expectedDischarges: 4,
      expectedAdmissions: 2,
      color: 'bg-green-500'
    },
    {
      id: 'alcohol',
      name: 'Alcohol & Gambling',
      totalBeds: 36,
      occupied: 28,
      reserved: 5,
      available: 3,
      waitlist: 12,
      expectedDischarges: 6,
      expectedAdmissions: 4,
      color: 'bg-blue-500'
    },
    {
      id: 'drugs',
      name: 'Drugs Unit',
      totalBeds: 28,
      occupied: 22,
      reserved: 4,
      available: 2,
      waitlist: 15,
      expectedDischarges: 3,
      expectedAdmissions: 5,
      color: 'bg-purple-500'
    },
    {
      id: 'ladies',
      name: 'Ladies Unit',
      totalBeds: 20,
      occupied: 14,
      reserved: 2,
      available: 4,
      waitlist: 6,
      expectedDischarges: 2,
      expectedAdmissions: 3,
      color: 'bg-pink-500'
    },
  ];

  // Generate forecast data
  const generateForecast = (unit: UnitCapacity): ForecastData[] => {
    const forecast: ForecastData[] = [];
    const today = new Date();
    
    for (let i = 0; i < forecastDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      
      // Simulate fluctuations
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      const baseOccupied = unit.occupied;
      const variance = isWeekend ? -2 : 1;
      const dailyChange = Math.floor(Math.random() * 3) - 1;
      
      const occupied = Math.max(0, Math.min(unit.totalBeds, baseOccupied + variance + dailyChange - i * 0.5));
      const reserved = Math.max(0, Math.min(unit.totalBeds - occupied, unit.reserved + i * 0.3));
      const available = unit.totalBeds - occupied - reserved;
      
      forecast.push({
        date: date.toLocaleDateString('en-IE', { weekday: 'short', month: 'short', day: 'numeric' }),
        available: Math.max(0, available),
        reserved: Math.max(0, reserved),
        occupied: Math.max(0, occupied),
      });
    }
    
    return forecast;
  };

  const getOccupancyRate = (unit: UnitCapacity) => {
    return Math.round((unit.occupied / unit.totalBeds) * 100);
  };

  const getCapacityStatus = (unit: UnitCapacity) => {
    const rate = getOccupancyRate(unit);
    if (rate >= 90) return { label: 'Critical', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (rate >= 75) return { label: 'High', color: 'text-orange-600', bgColor: 'bg-orange-100' };
    if (rate >= 50) return { label: 'Moderate', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { label: 'Good', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const totalBeds = units.reduce((sum, unit) => sum + unit.totalBeds, 0);
  const totalOccupied = units.reduce((sum, unit) => sum + unit.occupied, 0);
  const totalAvailable = units.reduce((sum, unit) => sum + unit.available, 0);
  const totalWaitlist = units.reduce((sum, unit) => sum + unit.waitlist, 0);

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalBeds}</p>
              <p className="text-sm text-gray-500 mt-1">Beds across all units</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <BedDouble className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Currently Occupied</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{totalOccupied}</p>
              <p className="text-sm text-gray-500 mt-1">{Math.round((totalOccupied / totalBeds) * 100)}% occupancy</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Available Beds</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{totalAvailable}</p>
              <p className="text-sm text-gray-500 mt-1">Ready for admission</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Waitlist</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{totalWaitlist}</p>
              <p className="text-sm text-gray-500 mt-1">Awaiting placement</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('current')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'current'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <BedDouble className="h-5 w-5" />
              <span>Current Status</span>
            </button>
            <button
              onClick={() => setViewMode('forecast')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                viewMode === 'forecast'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              <span>Forecast</span>
            </button>
          </div>
          
          {viewMode === 'forecast' && (
            <div className="flex items-center space-x-3">
              <Filter className="h-5 w-5 text-gray-600" />
              <select 
                value={forecastDays}
                onChange={(e) => setForecastDays(Number(e.target.value))}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
              >
                <option value={7}>7 Days</option>
                <option value={14}>14 Days</option>
                <option value={30}>30 Days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Current Status View */}
      {viewMode === 'current' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {units.map((unit) => {
            const status = getCapacityStatus(unit);
            const occupancyRate = getOccupancyRate(unit);
            
            return (
              <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${unit.color} rounded-xl flex items-center justify-center`}>
                      <BedDouble className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{unit.name}</h3>
                      <p className="text-sm text-gray-600">{unit.totalBeds} total beds</p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-full ${status.bgColor}`}>
                    <span className={`font-bold text-sm ${status.color}`}>{status.label}</span>
                  </div>
                </div>

                {/* Capacity Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">Occupancy Rate</span>
                    <span className="text-sm font-bold text-gray-900">{occupancyRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className={`h-4 rounded-full ${unit.color} transition-all duration-300`}
                      style={{ width: `${occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Bed Breakdown */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-blue-700">Occupied</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{unit.occupied}</p>
                  </div>
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-yellow-700">Reserved</p>
                    <p className="text-2xl font-bold text-yellow-900 mt-1">{unit.reserved}</p>
                  </div>
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-green-700">Available</p>
                    <p className="text-2xl font-bold text-green-900 mt-1">{unit.available}</p>
                  </div>
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4">
                    <p className="text-sm font-semibold text-orange-700">Waitlist</p>
                    <p className="text-2xl font-bold text-orange-900 mt-1">{unit.waitlist}</p>
                  </div>
                </div>

                {/* Forecast Indicators */}
                <div className="border-t-2 border-gray-100 pt-4">
                  <p className="text-sm font-semibold text-gray-700 mb-3">Next 7 Days</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {unit.expectedDischarges} Expected Discharges
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        {unit.expectedAdmissions} Expected Admissions
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Forecast View */}
      {viewMode === 'forecast' && (
        <div className="space-y-6">
          {units.map((unit) => {
            const forecast = generateForecast(unit);
            
            return (
              <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className={`w-12 h-12 ${unit.color} rounded-xl flex items-center justify-center`}>
                    <BedDouble className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{unit.name}</h3>
                    <p className="text-sm text-gray-600">{forecastDays}-Day Capacity Forecast</p>
                  </div>
                </div>

                {/* Forecast Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Occupied</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Reserved</th>
                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Available</th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Capacity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {forecast.map((day, index) => {
                        const dayOccupancyRate = Math.round((day.occupied / unit.totalBeds) * 100);
                        
                        return (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 font-medium text-gray-900">{day.date}</td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                                {Math.round(day.occupied)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                {Math.round(day.reserved)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                                {Math.round(day.available)}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right">
                              <div className="flex items-center justify-end space-x-2">
                                <div className="w-20 bg-gray-200 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${unit.color} transition-all`}
                                    style={{ width: `${dayOccupancyRate}%` }}
                                  />
                                </div>
                                <span className="text-sm font-bold text-gray-700 w-12 text-right">
                                  {dayOccupancyRate}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CapacityManagement;
