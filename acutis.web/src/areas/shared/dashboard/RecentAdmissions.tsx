import { User } from 'lucide-react';

type RecentAdmissionsProps = {
  unitName: string;
};

const admissionsByUnit: Record<string, Array<{ id: number; name: string; unit: string; room: string; status: string; time: string }>> = {
  Alcohol: [
    { id: 1, name: 'Michael R.', unit: 'Alcohol', room: 'A-205', status: 'Complete', time: '08:15' },
    { id: 2, name: 'David H.', unit: 'Alcohol', room: 'A-114', status: 'Medical Pending', time: '10:05' },
    { id: 3, name: 'Paul C.', unit: 'Alcohol', room: 'A-321', status: 'Documentation', time: '11:40' },
  ],
  Detox: [
    { id: 1, name: 'Sarah M.', unit: 'Detox', room: 'D-101', status: 'Medical Pending', time: '09:30' },
    { id: 2, name: 'John T.', unit: 'Detox', room: 'D-204', status: 'Complete', time: '07:55' },
    { id: 3, name: 'Niall B.', unit: 'Detox', room: 'D-310', status: 'Documentation', time: '12:10' },
  ],
  Drugs: [
    { id: 1, name: 'Ahmed L.', unit: 'Drugs', room: 'DR-110', status: 'Complete', time: '08:35' },
    { id: 2, name: 'Sean F.', unit: 'Drugs', room: 'DR-216', status: 'Medical Pending', time: '10:55' },
    { id: 3, name: 'Liam O.', unit: 'Drugs', room: 'DR-302', status: 'Documentation', time: '13:20' },
  ],
  Ladies: [
    { id: 1, name: 'Emma K.', unit: 'Ladies', room: 'L-103', status: 'Documentation', time: '07:45' },
    { id: 2, name: 'Aisling D.', unit: 'Ladies', room: 'L-211', status: 'Complete', time: '09:10' },
    { id: 3, name: 'Ruth P.', unit: 'Ladies', room: 'L-320', status: 'Medical Pending', time: '11:25' },
  ],
};

const RecentAdmissions = ({ unitName }: RecentAdmissionsProps) => {
  const recentAdmissions = admissionsByUnit[unitName] ?? [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-800';
      case 'Medical Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">{unitName} Recent Admissions</h2>
      <div className="space-y-3">
        {recentAdmissions.map((admission) => (
          <div key={admission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{admission.name}</p>
                <p className="text-sm text-gray-600">{admission.unit} - {admission.room}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(admission.status)}`}>
                {admission.status}
              </span>
              <p className="text-xs text-gray-500 mt-1">{admission.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentAdmissions;
