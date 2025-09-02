"use client";

import React from "react";
import { useCollaborationSession } from "@/hooks/useCollaboration";
import { CollaborationUser } from "@/lib/types/collaboration";

export const UserList: React.FC = () => {
  const { users } = useCollaborationSession();

  if (users.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>참여자가 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {users.map((user) => (
        <UserItem key={user.id} user={user} />
      ))}
    </div>
  );
};

interface UserItemProps {
  user: CollaborationUser;
}

const UserItem: React.FC<UserItemProps> = ({ user }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      {/* 사용자 아바타 */}
      <div className="relative">
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* 사용자 정보 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
        </div>
      </div>

      {/* 사용자 액션 */}
      <div className="flex items-center space-x-1">
        <button
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="메시지 보내기"
        >
          💬
        </button>
        <button
          className="p-1 text-gray-400 hover:text-gray-600 rounded"
          title="사용자 정보 보기"
        >
          ℹ️
        </button>
      </div>
    </div>
  );
};
