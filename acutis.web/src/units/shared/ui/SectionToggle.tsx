import React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { LucideProps } from 'lucide-react';

interface SectionToggleProps {
  icon: React.ComponentType<LucideProps>;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  iconColor?: string;
}

const SectionToggle: React.FC<SectionToggleProps> = ({ 
  icon: Icon, 
  title, 
  isExpanded, 
  onToggle, 
  iconColor = "text-blue-500" 
}) => {
  return (
    <button 
      onClick={onToggle}
      className="flex items-center justify-between w-full text-left"
    >
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Icon className={`mr-2 h-5 w-5 ${iconColor}`} />
        {title}
      </h3>
      {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
    </button>
  );
};

export default SectionToggle;