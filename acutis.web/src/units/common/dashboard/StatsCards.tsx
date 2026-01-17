
const StatsCards = () => {
  const units = [
    { name: 'Detox', occupancy: '8/12', color: 'bg-red-500' },
    { name: 'Alcohol', occupancy: '32/40', color: 'bg-blue-500' },
    { name: 'Ladies', occupancy: '15/25', color: 'bg-purple-500' },
    { name: 'Drugs', occupancy: '18/25', color: 'bg-orange-500' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {units.map((unit, index) => (
        <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{unit.name} Unit</p>
              <p className="text-2xl font-bold text-gray-900">{unit.occupancy}</p>
            </div>
            <div className={`w-3 h-3 rounded-full ${unit.color}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;