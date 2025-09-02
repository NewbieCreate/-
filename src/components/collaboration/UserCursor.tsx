"use client";

import React from "react";
import { CollaborationUser } from "@/lib/types/collaboration";

interface UserCursorProps {
  user: CollaborationUser;
  position: { x: number; y: number };
}

export const UserCursor: React.FC<UserCursorProps> = ({ user, position }) => {
  return (
    <div
      className="absolute pointer-events-none z-30 transition-transform duration-100 ease-out"
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      {/* 커서 아이콘 */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        <path
          d="M0 0L20 10L12 12L10 20L0 0Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* 사용자 이름 라벨 */}
      <div
        className="absolute top-6 left-0 px-2 py-1 bg-white rounded shadow-lg border border-gray-200 whitespace-nowrap"
        style={{ borderLeftColor: user.color, borderLeftWidth: "3px" }}
      >
        <div className="flex items-center space-x-2">
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-semibold"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs font-medium text-gray-800">{user.name}</span>
        </div>
      </div>
    </div>
  );
};
