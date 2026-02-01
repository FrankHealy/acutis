import React, { useState } from 'react';
import { Search, Filter, X, Calendar, User, MapPin, Pill, ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface SearchFilters {
  searchTerm: string;
  dateRange: {
    from: string;
    to: string;
  };
  units: string[];
  statuses: string[];
  addictionTypes: string[];
  assignedStaff: string[];
  ageRange: {
    min: number;
    max: number;
  };
  hasInsurance?: boolean;
  isPreviousResident?: boolean;
}

interface SearchResult {
  id: string;
  name: string;
  unit: string;
  roomNumber: string;
  admissionDate: string;
  status: 'complete' | 'incomplete' | 'needs-review';
  primaryAddiction: string;
  age: number;
  assignedDoctor: string;
}

const AdmissionSearch = () => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    searchTerm: '',
    dateRange: {
      from: '',
      to: ''
    },
    units: [],
    statuses: [],
    addictionTypes: [],
    assignedStaff: [],
    ageRange: {
      min: 18,
      max: 99
    },
    hasInsurance: undefined,
    isPreviousResident: undefined
  });

  // Mock search results
  const searchResults: SearchResult[] = [
    {
      id: '1',
      name: 'Michael O\'Brien',
      unit: 'Alcohol',
      roomNumber: 'A-205',
      admissionDate: '2026-01-15',
      status: 'complete',
      primaryAddiction: 'Alcohol',
      age: 40,
      assignedDoctor: 'Dr. Murphy'
    },
    {
      id: '2',
      name: 'Patrick Murphy',
      unit: 'Detox',
      roomNumber: 'D-103',
      admissionDate: '2026-01-15',
      status: 'needs-review',
      primaryAddiction: 'Alcohol',
      age: 35,
      assignedDoctor: 'Dr. O\'Connor'
    },
    {
      id: '3',
      name: 'John Fitzgerald',
      unit: 'Alcohol',
      roomNumber: 'A-112',
      admissionDate: '2026-01-14',
      status: 'complete',
      primaryAddiction: 'Alcohol',
      age: 52,
      assignedDoctor: 'Dr. Murphy'
    }
  ];

  const updateFilter = <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (filterKey: keyof SearchFilters, value: string) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(filterKey, newArray as any);
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      dateRange: { from: '', to: '' },
      units: [],
      statuses: [],
      addictionTypes: [],
      assignedStaff: [],
      ageRange: { min: 18, max: 99 },
      hasInsurance: undefined,
      isPreviousResident: undefined
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    if (filters.units.length > 0) count++;
    if (filters.statuses.length > 0) count++;
    if (filters.addictionTypes.length > 0) count++;
    if (filters.assignedStaff.length > 0) count++;
    if (filters.hasInsurance !== undefined) count++;
    if (filters.isPreviousResident !== undefined) count++;
    return count;
  };

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-gray-700">{title}</h4>
      {children}
    </div>
  );

  const CheckboxFilter = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-5 h-5 rounded border-2 border-gray-300"
      />
      <span className="font-medium text-gray-700">{label}</span>
    </label>
  );

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Search Admissions</h1>
        <p className="text-gray-500 mt-1">Find and filter admission records</p>
      </div>

      {/* Main Search Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-400" />
          <input
            type="text"
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
            placeholder="Search by name, room number, PPS number..."
            className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none text-lg"
          />
        </div>

        {/* Quick Filters & Advanced Toggle */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-semibold transition-all ${
                showAdvanced
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <SlidersHorizontal className="h-5 w-5" />
              <span>Advanced Filters</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Clear All</span>
              </button>
            )}
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">{searchResults.length}</span> results found
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvanced && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Date Range */}
            <FilterSection title="Date Range">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">From</label>
                  <input
                    type="date"
                    value={filters.dateRange.from}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, from: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">To</label>
                  <input
                    type="date"
                    value={filters.dateRange.to}
                    onChange={(e) => updateFilter('dateRange', { ...filters.dateRange, to: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </FilterSection>

            {/* Units */}
            <FilterSection title="Treatment Units">
              <div className="space-y-2">
                {['Alcohol', 'Detox', 'Drugs', 'Ladies'].map(unit => (
                  <CheckboxFilter
                    key={unit}
                    label={unit}
                    checked={filters.units.includes(unit)}
                    onChange={() => toggleArrayFilter('units', unit)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Status */}
            <FilterSection title="Admission Status">
              <div className="space-y-2">
                {[
                  { value: 'complete', label: 'Complete' },
                  { value: 'incomplete', label: 'Incomplete' },
                  { value: 'needs-review', label: 'Needs Review' }
                ].map(status => (
                  <CheckboxFilter
                    key={status.value}
                    label={status.label}
                    checked={filters.statuses.includes(status.value)}
                    onChange={() => toggleArrayFilter('statuses', status.value)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Addiction Types */}
            <FilterSection title="Primary Addiction">
              <div className="space-y-2">
                {['Alcohol', 'Cocaine', 'Heroin', 'Cannabis', 'Gambling', 'Prescription Drugs'].map(addiction => (
                  <CheckboxFilter
                    key={addiction}
                    label={addiction}
                    checked={filters.addictionTypes.includes(addiction)}
                    onChange={() => toggleArrayFilter('addictionTypes', addiction)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Assigned Staff */}
            <FilterSection title="Assigned Doctor">
              <div className="space-y-2">
                {['Dr. Murphy', 'Dr. O\'Connor', 'Dr. Ryan', 'Dr. Walsh'].map(doctor => (
                  <CheckboxFilter
                    key={doctor}
                    label={doctor}
                    checked={filters.assignedStaff.includes(doctor)}
                    onChange={() => toggleArrayFilter('assignedStaff', doctor)}
                  />
                ))}
              </div>
            </FilterSection>

            {/* Additional Filters */}
            <FilterSection title="Additional Criteria">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-2">Age Range</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <input
                        type="number"
                        value={filters.ageRange.min}
                        onChange={(e) => updateFilter('ageRange', { ...filters.ageRange, min: Number(e.target.value) })}
                        placeholder="Min"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={filters.ageRange.max}
                        onChange={(e) => updateFilter('ageRange', { ...filters.ageRange, max: Number(e.target.value) })}
                        placeholder="Max"
                        className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.hasInsurance === true}
                      onChange={(e) => updateFilter('hasInsurance', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-2 border-gray-300"
                    />
                    <span className="font-medium text-gray-700">Has Insurance</span>
                  </label>

                  <label className="flex items-center space-x-3 cursor-pointer p-3 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.isPreviousResident === true}
                      onChange={(e) => updateFilter('isPreviousResident', e.target.checked ? true : undefined)}
                      className="w-5 h-5 rounded border-2 border-gray-300"
                    />
                    <span className="font-medium text-gray-700">Previous Resident</span>
                  </label>
                </div>
              </div>
            </FilterSection>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {activeFilterCount > 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-blue-900 mb-2">Active Filters ({activeFilterCount})</h3>
              <div className="flex flex-wrap gap-2">
                {filters.units.length > 0 && filters.units.map(unit => (
                  <span key={unit} className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    <span>{unit} Unit</span>
                    <button onClick={() => toggleArrayFilter('units', unit)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.statuses.length > 0 && filters.statuses.map(status => (
                  <span key={status} className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    <span>Status: {status}</span>
                    <button onClick={() => toggleArrayFilter('statuses', status)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.addictionTypes.length > 0 && filters.addictionTypes.map(addiction => (
                  <span key={addiction} className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    <span>{addiction}</span>
                    <button onClick={() => toggleArrayFilter('addictionTypes', addiction)} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {filters.dateRange.from && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    <span>From: {new Date(filters.dateRange.from).toLocaleDateString('en-IE')}</span>
                    <button onClick={() => updateFilter('dateRange', { ...filters.dateRange, from: '' })} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {filters.dateRange.to && (
                  <span className="inline-flex items-center space-x-1 px-3 py-1 bg-white border border-blue-200 rounded-lg text-sm font-medium text-blue-700">
                    <span>To: {new Date(filters.dateRange.to).toLocaleDateString('en-IE')}</span>
                    <button onClick={() => updateFilter('dateRange', { ...filters.dateRange, to: '' })} className="hover:text-blue-900">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Results */}
      <div className="space-y-4">
        {searchResults.map(result => (
          <div
            key={result.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-7 w-7 text-blue-600" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{result.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{result.unit} - {result.roomNumber}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(result.admissionDate).toLocaleDateString('en-IE')}</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Pill className="h-4 w-4" />
                        <span>{result.primaryAddiction}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <ChevronRight className="h-6 w-6 text-gray-400" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {searchResults.length === 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No results found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your search criteria or filters</p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AdmissionSearch;
