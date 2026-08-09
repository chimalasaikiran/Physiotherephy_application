import React from 'react';
import { ChevronRight } from 'lucide-react';
import kabirAvatar from '@/assets/kabir-singh.png';
import sarahAvatar from '@/assets/sarah-chen.png';

interface Patient {
  id: string;
  name: string;
  patientCode: string;
  avatar: string;
}

export const RecentPatientsWidget: React.FC = () => {
  const patients: Patient[] = [
    {
      id: 'p-1',
      name: 'Kabir Singh',
      patientCode: '#OM-192',
      avatar: kabirAvatar,
    },
    {
      id: 'p-2',
      name: 'Anita Desai',
      patientCode: '#OM-241',
      avatar: sarahAvatar,
    },
    {
      id: 'p-3',
      name: 'Rohan Verma',
      patientCode: '#OM-115',
      avatar: kabirAvatar,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs">
      <h4 className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-4">
        Recent Patients
      </h4>

      <div className="divide-y divide-slate-50">
        {patients.map((pt) => (
          <div
            key={pt.id}
            className="py-3 first:pt-0 last:pb-0 flex items-center justify-between group cursor-pointer hover:bg-slate-50/80 px-2 -mx-2 rounded-xl transition-colors"
          >
            <div className="flex items-center space-x-3">
              <img
                src={pt.avatar}
                alt={pt.name}
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-2xs"
              />
              <div>
                <h5 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                  {pt.name}
                </h5>
                <p className="text-xs text-slate-400 font-medium">{`Patient ID: ${pt.patientCode}`}</p>
              </div>
            </div>
            <button className="text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
