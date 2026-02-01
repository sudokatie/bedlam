'use client';

import { memo } from 'react';
import { GameState } from '../game/types';
import { ROOM_DEFS, STAFF_DEFS, DISEASES } from '../game/constants';

interface InfoPanelProps {
  state: GameState;
  selectedId: string | null;
}

function InfoPanel({ state, selectedId }: InfoPanelProps) {
  if (!selectedId) return null;
  
  // Determine type by ID prefix
  if (selectedId.startsWith('room_')) {
    const room = state.rooms.find(r => r.id === selectedId);
    if (!room) return null;
    
    const def = ROOM_DEFS[room.type];
    const staff = room.staffId ? state.staff.find(s => s.id === room.staffId) : null;
    const patient = room.patientId ? state.patients.find(p => p.id === room.patientId) : null;
    
    return (
      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm w-48">
        <h3 className="font-bold text-lg mb-2">{def.name}</h3>
        <div className="space-y-1">
          <p><span className="text-gray-400">Staff:</span> {staff?.name || 'None'}</p>
          <p><span className="text-gray-400">Patient:</span> {patient ? 'Yes' : 'Empty'}</p>
          <p><span className="text-gray-400">State:</span> {room.state}</p>
        </div>
      </div>
    );
  }
  
  if (selectedId.startsWith('staff_')) {
    const staff = state.staff.find(s => s.id === selectedId);
    if (!staff) return null;
    
    const def = STAFF_DEFS[staff.type];
    const room = staff.assignedRoomId 
      ? state.rooms.find(r => r.id === staff.assignedRoomId)
      : null;
    
    return (
      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm w-48">
        <h3 className="font-bold text-lg mb-2">{staff.name}</h3>
        <div className="space-y-1">
          <p><span className="text-gray-400">Type:</span> {def.name}</p>
          <p><span className="text-gray-400">Skill:</span> {staff.skill}%</p>
          <p><span className="text-gray-400">Stamina:</span> {staff.stamina}%</p>
          <p><span className="text-gray-400">Salary:</span> ${staff.salary}/mo</p>
          <p><span className="text-gray-400">Room:</span> {room ? ROOM_DEFS[room.type].name : 'Unassigned'}</p>
          <p><span className="text-gray-400">State:</span> {staff.state}</p>
        </div>
      </div>
    );
  }
  
  if (selectedId.startsWith('patient_')) {
    const patient = state.patients.find(p => p.id === selectedId);
    if (!patient) return null;
    
    const disease = DISEASES[patient.disease];
    
    return (
      <div className="bg-gray-800 p-3 rounded-lg text-white text-sm w-48">
        <h3 className="font-bold text-lg mb-2">Patient</h3>
        <div className="space-y-1">
          <p>
            <span className="text-gray-400">Disease:</span>{' '}
            {patient.diagnosed ? disease.name : 'Unknown'}
          </p>
          <div>
            <span className="text-gray-400">Diagnosis:</span>
            <div className="w-full bg-gray-700 rounded h-2 mt-1">
              <div 
                className="bg-blue-500 h-2 rounded" 
                style={{ width: `${patient.diagnosisProgress}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Health:</span>
            <div className="w-full bg-gray-700 rounded h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded" 
                style={{ width: `${patient.health}%` }}
              />
            </div>
          </div>
          <div>
            <span className="text-gray-400">Patience:</span>
            <div className="w-full bg-gray-700 rounded h-2 mt-1">
              <div 
                className={`h-2 rounded ${
                  patient.patience > 50 ? 'bg-yellow-500' 
                  : patient.patience > 25 ? 'bg-orange-500' 
                  : 'bg-red-500'
                }`}
                style={{ width: `${patient.patience}%` }}
              />
            </div>
          </div>
          <p><span className="text-gray-400">State:</span> {patient.state}</p>
        </div>
      </div>
    );
  }
  
  return null;
}

export default memo(InfoPanel);
