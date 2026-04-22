import React from 'react';
import { CalendarRange, FolderKanban } from 'lucide-react';
import { getProjectAccessLabel, getProjectDatesText } from '../../utils/progressHelpers.js';

export function ProjectAssignmentSelector({ projects, selectedProjectId, onSelect }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => {
        const isSelected = project.id === selectedProjectId;

        return (
          <button
            key={project.id}
            type="button"
            onClick={() => onSelect(project.id)}
            className={`w-full rounded-[12px] border p-4 text-left transition ${isSelected ? 'border-[#1F4E79] bg-[#DCEAF7]/50 shadow-sm' : 'border-[#D1D5DB] bg-white hover:bg-[#F7F9FC]'}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">{project.code}</p>
                <p className="mt-1 text-sm font-semibold text-[#2F3A45]">{project.name}</p>
              </div>
              {isSelected ? <span className="rounded-full bg-[#1F4E79] px-3 py-1 text-xs font-semibold text-white">Actual</span> : null}
            </div>

            <div className="mt-3 grid gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <div className="inline-flex items-center gap-2">
                <FolderKanban size={14} className="text-[#1F4E79]" />
                {getProjectAccessLabel(project.accessMode)}
              </div>
              <div className="inline-flex items-center gap-2">
                <CalendarRange size={14} className="text-[#1F4E79]" />
                {getProjectDatesText(project)}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}