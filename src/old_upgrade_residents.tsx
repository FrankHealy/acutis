const [currentUnit, setCurrentUnit] = useState('alcohol');
const [rollCallView, setRollCallView] = useState(false);
const [sortBy, setSortBy] = useState('surname');
const [sortOrder, setSortOrder] = useState('asc');
const [absentResident, setAbsentResident] = useState(null);
const [absenceReason, setAbsenceReason] = useState('');
const [absenceDescription, setAbsenceDescription] = useState('');
const [attendanceData, setAttendanceData] = useState({});

const alcoholResidents = [
  { id: 1, firstName: 'Michael', surname: 'OSullivan', nationality: 'Irish', age: 34, weekNumber: 3, roomNumber: 'A-201', photo: null, present: null },
  { id: 2, firstName: 'Sarah', surname: 'Murphy', nationality: 'Irish', age: 28, weekNumber: 7, roomNumber: 'A-105', photo: null, present: null },
  { id: 3, firstName: 'David', surname: 'Kelly', nationality: 'Irish', age: 45, weekNumber: 2, roomNumber: 'A-103', photo: null, present: null },
  { id: 4, firstName: 'Emma', surname: 'Walsh', nationality: 'Irish', age: 31, weekNumber: 9, roomNumber: 'A-207', photo: null, present: null },
  { id: 5, firstName: 'James', surname: 'Byrne', nationality: 'Irish', age: 52, weekNumber: 4, roomNumber: 'A-112', photo: null, present: null },
  { id: 6, firstName: 'Lisa', surname: 'Connor', nationality: 'Irish', age: 29, weekNumber: 6, roomNumber: 'A-204', photo: null, present: null },
  { id: 7, firstName: 'Patrick', surname: 'Doyle', nationality: 'Irish', age: 38, weekNumber: 8, roomNumber: 'A-118', photo: null, present: null },
  { id: 8, firstName: 'Mary', surname: 'Ryan', nationality: 'Irish', age: 41, weekNumber: 5, roomNumber: 'A-209', photo: null, present: null },
  { id: 9, firstName: 'John', surname: 'McCarthy', nationality: 'Irish', age: 33, weekNumber: 10, roomNumber: 'A-115', photo: null, present: null },
  { id: 10, firstName: 'Claire', surname: 'Fitzgerald', nationality: 'Irish', age: 27, weekNumber: 3, roomNumber: 'A-202', photo: null, present: null },
  { id: 11, firstName: 'Robert', surname: 'Smith', nationality: 'British', age: 39, weekNumber: null, roomNumber: 'A-120', photo: null, present: null, extra: true },
  { id: 12, firstName: 'Anna', surname: 'Kowalski', nationality: 'Polish', age: 35, weekNumber: null, roomNumber: 'A-125', photo: null, present: null, extra: true },
  { id: 13, firstName: 'Thomas', surname: 'Anderson', nationality: 'Swedish', age: 42, weekNumber: 2, roomNumber: 'A-108', photo: null, present: null },
  { id: 14, firstName: 'Grace', surname: 'OBrien', nationality: 'Irish', age: 26, weekNumber: 7, roomNumber: 'A-213', photo: null, present: null },
  { id: 15, firstName: 'William', surname: 'Casey', nationality: 'Irish', age: 48, weekNumber: 4, roomNumber: 'A-110', photo: null, present: null }
];

const getCurrentTimeContext = () => {
  const hour = new Date().getHours();
  return hour < 12 ? 'Morning' : 'Evening';
};

const getCurrentDate = () => {
  return new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const sortResidents = (residents) => {
  return [...residents].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'surname':
        aValue = a.surname.toLowerCase();
        bValue = b.surname.toLowerCase();
        break;
      case 'age':
        aValue = a.age;
        bValue = b.age;
        break;
      case 'weekNumber':
        aValue = a.weekNumber || 0;
        bValue = b.weekNumber || 0;
        break;
      case 'roomNumber':
        aValue = a.roomNumber;
        bValue = b.roomNumber;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

const handleSort = (column) => {
  if (sortBy === column) {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  } else {
    setSortBy(column);
    setSortOrder('asc');
  }
};

const getRollCallResidents = () => {
  return alcoholResidents.filter(resident => 
    (resident.weekNumber >= 2 && resident.weekNumber <= 10) || resident.extra
  );
};

const handleAttendanceChange = (residentId, isPresent) => {
  if (isPresent) {
    setAttendanceData(prev => ({
      ...prev,
      [residentId]: { present: true }
    }));
  } else {
    setAbsentResident(residentId);
  }
};

const handleAbsenceSubmit = () => {
  if (absentResident && absenceReason) {
    setAttendanceData(prev => ({
      ...prev,
      [absentResident]: { 
        present: false, 
        reason: absenceReason,
        description: absenceReason === 'Other' ? absenceDescription : ''
      }
    }));
    setAbsentResident(null);
    setAbsenceReason('');
    setAbsenceDescription('');
  }
};

onClick={() => setCurrentStep('residents')}



const ResidentsSection = () => {
  const residents = rollCallView ? getRollCallResidents() : alcoholResidents;
  const sortedResidents = sortResidents(residents);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-6 w-6 text-blue-500" />
              {rollCallView ? 'Roll Call' : 'Residents'} - Alcohol Unit
            </h2>
            <p className="text-gray-600 mt-1">
              {rollCallView 
                ? `${getCurrentDate()} - ${getCurrentTimeContext()} Roll Call (${sortedResidents.length} residents)`
                : `${alcoholResidents.length} total residents`
              }
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setRollCallView(!rollCallView)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                rollCallView
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {rollCallView ? 'Exit Roll Call' : 'Start Roll Call'}
            </button>
            {rollCallView && (
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                Save Attendance
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Unit Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex space-x-8">
            {['alcohol', 'drugs', 'ladies'].map((unit) => (
              <button
                key={unit}
                onClick={() => setCurrentUnit(unit)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors capitalize ${
                  currentUnit === unit
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {unit} Unit
                {unit === 'alcohol' && (
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {alcoholResidents.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Residents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('surname')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {sortBy === 'surname' && (
                      <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nationality
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('age')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Age</span>
                    {sortBy === 'age' && (
                      <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('weekNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Week</span>
                    {sortBy === 'weekNumber' && (
                      <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('roomNumber')}
                >
                  <div className="flex items-center space-x-1">
                    <span>Room</span>
                    {sortBy === 'roomNumber' && (
                      <ChevronDown className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </th>
                {rollCallView && (
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedResidents.map((resident) => {
                const attendance = attendanceData[resident.id];
                return (
                  <tr key={resident.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        {resident.photo ? (
                          <img src={resident.photo} alt="" className="w-12 h-12 rounded-full object-cover" />
                        ) : (
                          <User className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {resident.firstName} {resident.surname}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resident.nationality}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resident.age}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resident.weekNumber ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Week {resident.weekNumber}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Extra
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resident.roomNumber}
                    </td>
                    {rollCallView && (
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {attendance ? (
                          attendance.present ? (
                            <div className="flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <AlertTriangle className="h-5 w-5 text-red-500" />
                              <span className="text-xs text-red-600 mt-1">
                                {attendance.reason}
                              </span>
                            </div>
                          )
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => handleAttendanceChange(resident.id, true)}
                              className="w-6 h-6 rounded border-2 border-green-300 hover:bg-green-100 flex items-center justify-center"
                            >
                              <CheckCircle className="h-4 w-4 text-green-500 opacity-0 hover:opacity-100" />
                            </button>
                            <button
                              onClick={() => handleAttendanceChange(resident.id, false)}
                              className="w-6 h-6 rounded border-2 border-red-300 hover:bg-red-100 flex items-center justify-center"
                            >
                              <AlertTriangle className="h-4 w-4 text-red-500 opacity-0 hover:opacity-100" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Absence Modal */}
      {absentResident && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Record Absence - {alcoholResidents.find(r => r.id === absentResident)?.firstName} {alcoholResidents.find(r => r.id === absentResident)?.surname}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for absence</label>
                <div className="space-y-2">
                  {['Sick', 'At Gate', 'Working', 'Other'].map((reason) => (
                    <label key={reason} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="absence-reason"
                        value={reason}
                        checked={absenceReason === reason}
                        onChange={(e) => setAbsenceReason(e.target.value)}
                        className="text-blue-500"
                      />
                      <span className="text-sm">{reason}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {absenceReason === 'Other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={absenceDescription}
                    onChange={(e) => setAbsenceDescription(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                    placeholder="Please provide details..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setAbsentResident(null);
                  setAbsenceReason('');
                  setAbsenceDescription('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAbsenceSubmit}
                disabled={!absenceReason || (absenceReason === 'Other' && !absenceDescription.trim())}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Record Absence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


{currentStep === 'residents' && <ResidentsSection />}