import { Shield } from 'lucide-react';

const ContrabandSection = () => {
  const contrabandItems = ['Phone', 'Cash', 'Medication', 'Alcohol', 'Electronics', 'Sprays', 'Sharp Objects', 'Other'];

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Shield className="mr-2 h-5 w-5 text-red-500" />
        Contraband Check
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Items Found</span>
          <div className="flex items-center space-x-2">
            <input type="checkbox" className="rounded" />
            <span className="text-sm">None</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {contrabandItems.map((item) => (
            <label key={item} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">{item}</span>
            </label>
          ))}
        </div>
        <textarea 
          placeholder="Details of contraband found..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          rows={3}
        ></textarea>
      </div>
    </div>
  );
};

export default ContrabandSection;