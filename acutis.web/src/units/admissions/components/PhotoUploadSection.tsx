import { useRef } from 'react';
import { Camera } from 'lucide-react';

const PhotoUploadSection = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="p-6 border-b border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center mb-4">
        <Camera className="mr-2 h-5 w-5 text-blue-500" />
        Resident Photo
      </h3>
      <div className="flex items-center space-x-4">
        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
          <Camera className="h-8 w-8 text-gray-400" />
        </div>
        <div className="space-y-2">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Take Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" />
          <p className="text-sm text-gray-500">or upload an existing photo</p>
        </div>
      </div>
    </div>
  );
};

export default PhotoUploadSection;