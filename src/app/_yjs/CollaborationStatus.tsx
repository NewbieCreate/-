"use client";

import React from "react";
import { useCollaboration } from "./useCollaboration";

interface CollaborationStatusProps {
  roomName: string;
  userId: string;
  userName: string;
}

export const CollaborationStatus: React.FC<CollaborationStatusProps> = ({
  roomName,
  userId,
  userName,
}) => {
  const { isConnected, connectionStatus, users } = useCollaboration({
    roomName,
    userId,
    userName,
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">협업 상태</h3>

      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-sm">
            {connectionStatus === "connected"
              ? "연결됨"
              : connectionStatus === "connecting"
              ? "연결 중..."
              : "연결 안됨"}
          </span>
        </div>

        <div className="text-sm text-gray-600">방: {roomName}</div>

        <div className="text-sm text-gray-600">사용자: {users.size}명</div>
      </div>
    </div>
  );
};
