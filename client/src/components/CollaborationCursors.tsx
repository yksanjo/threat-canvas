import React from 'react';
import { Collaborator } from '../types';

interface CollaborationCursorsProps {
  collaborators: Collaborator[];
}

const CollaborationCursors: React.FC<CollaborationCursorsProps> = ({ collaborators }) => {
  return (
    <>
      {collaborators.map((collaborator) => {
        if (!collaborator.isOnline || !collaborator.cursor) return null;

        return (
          <div
            key={collaborator.id}
            className="fixed pointer-events-none z-50 transition-all duration-100"
            style={{
              left: collaborator.cursor.x,
              top: collaborator.cursor.y,
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="drop-shadow-lg"
              style={{
                filter: `drop-shadow(0 0 8px ${collaborator.color})`,
              }}
            >
              <path
                d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
                fill={collaborator.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            {/* Name label */}
            <div
              className="absolute left-4 top-4 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap"
              style={{
                backgroundColor: collaborator.color,
                boxShadow: `0 0 10px ${collaborator.color}40`,
              }}
            >
              {collaborator.name}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default CollaborationCursors;
