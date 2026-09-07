'use client';

import { useState } from 'react';
import { PatientData } from '@/lib/firebase';

interface PatientSelectorProps {
  patients: PatientData[];
  selected: PatientData;
  onSelect: (patient: PatientData) => void;
}

export function PatientSelector({ patients, selected, onSelect }: PatientSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
      >
        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
          <span className="text-sm">👤</span>
        </div>
        <span className="font-medium text-gray-700">{selected.name}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-2">
              <p className="px-3 py-1 text-xs text-gray-500 font-medium">Select Patient</p>
              {patients.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => {
                    onSelect(patient);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    selected.id === patient.id
                      ? 'bg-green-50 text-green-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm">{patient.name}</p>
                    <p className="text-xs text-gray-500">Age: {patient.age} • Score: {patient.overallScore}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
