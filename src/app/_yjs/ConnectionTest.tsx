"use client";

import React, { useState } from "react";
import { useCollaboration } from "./useCollaboration";

interface ConnectionTestProps {
  roomName: string;
  userId: string;
  userName: string;
}

export const ConnectionTest: React.FC<ConnectionTestProps> = ({
  roomName,
  userId,
  userName,
}) => {
  const { isConnected, connectionStatus, connect, disconnect, users } =
    useCollaboration({
      roomName,
      userId,
      userName,
    });

  const [testMessage, setTestMessage] = useState("");

  const handleConnect = () => {
    connect();
    setTestMessage("연결 시도 중...");
  };

  const handleDisconnect = () => {
    disconnect();
    setTestMessage("연결 해제됨");
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">연결 테스트</h3>

      <div className="space-y-3">
        <div className="flex space-x-2">
          <button
            onClick={handleConnect}
            disabled={isConnected}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            연결
          </button>
          <button
            onClick={handleDisconnect}
            disabled={!isConnected}
            className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            연결 해제
          </button>
        </div>

        <div className="text-sm">상태: {connectionStatus}</div>

        <div className="text-sm">사용자 수: {users.size}명</div>

        {testMessage && (
          <div className="text-sm text-blue-600">{testMessage}</div>
        )}
      </div>
    </div>
  );
};
