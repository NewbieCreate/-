"use client";

import React, { useState, useEffect } from "react";
import { useWebRTC, WebRTCControls, VideoGrid } from "../app/_webRTC";

interface WebRTCPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebRTCPanel({ isOpen, onClose }: WebRTCPanelProps) {
  const [isClient, setIsClient] = useState(false);
  const [webRTCConfig, setWebRTCConfig] = useState(() => ({
    roomName: `room-${Math.floor(Math.random() * 1000)}`,
    userId: `user-${Math.floor(Math.random() * 1000)}`,
    userName: `사용자_${Math.floor(Math.random() * 1000)}`,
    serverUrl: "wss://your-signaling-server.com", // 실제 시그널링 서버 URL로 변경 필요
  }));

  useEffect(() => {
    setIsClient(true);
  }, []);

  // WebRTC 훅 사용 (클라이언트에서만)
  const {
    isConnected,
    localStream,
    remoteStreams,
    connect,
    disconnect,
    sendMessage,
  } = useWebRTC({
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ],
    roomName: webRTCConfig.roomName,
    userId: webRTCConfig.userId,
    userName: webRTCConfig.userName,
  });

  const handleRoomNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebRTCConfig((prev) => ({
      ...prev,
      roomName: e.target.value,
    }));
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWebRTCConfig((prev) => ({
      ...prev,
      userName: e.target.value,
    }));
  };

  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("WebRTC 연결 실패:", error);
    }
  };

  if (!isOpen || !isClient) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-11/12 h-5/6 max-w-4xl flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">비디오 채팅</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* 컨텐츠 */}
        <div className="flex-1 flex">
          {/* 설정 및 컨트롤 패널 */}
          <div className="w-1/3 p-4 border-r border-gray-200 flex flex-col">
            {/* 설정 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">설정</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    사용자 이름
                  </label>
                  <input
                    type="text"
                    value={webRTCConfig.userName}
                    onChange={handleUserNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="사용자 이름을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    방 이름
                  </label>
                  <input
                    type="text"
                    value={webRTCConfig.roomName}
                    onChange={handleRoomNameChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="방 이름을 입력하세요"
                  />
                </div>
              </div>
            </div>

            {/* 연결 상태 */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                연결 상태
              </h3>
              <div className="flex items-center space-x-2 mb-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConnected ? "bg-green-500" : "bg-red-500"
                  }`}
                />
                <span className="text-sm text-gray-600">
                  {isConnected ? "연결됨" : "연결 안됨"}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                참가자: {remoteStreams.size}명
              </div>
            </div>

            {/* 컨트롤 */}
            <div className="flex-1">
              <WebRTCControls />
            </div>
          </div>

          {/* 비디오 그리드 */}
          <div className="flex-1 p-4">
            <VideoGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
