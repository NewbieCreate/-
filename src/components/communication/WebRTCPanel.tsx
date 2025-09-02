"use client";

import React, { useState } from "react";
import { useWebRTCConnection } from "@/hooks/useWebRTC";
import { AudioVisualizer } from "./AudioVisualizer";
import { Users, Settings, Phone, PhoneOff } from "lucide-react";

export const WebRTCPanel: React.FC = () => {
  const {
    isConnected,
    localStream,
    remoteStreams,
    peers,
    isMuted,
    isVideoEnabled,
    initializeConnection,
    disconnect,
    toggleMute,
    toggleVideo,
    shareScreen,
  } = useWebRTCConnection();

  const [isExpanded, setIsExpanded] = useState(false);

  const handleConnect = async () => {
    try {
      await initializeConnection();
    } catch (error) {
      console.error("WebRTC 연결 실패:", error);
    }
  };

  if (!isExpanded) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="WebRTC 패널 열기"
        >
          <Users size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">WebRTC 연결</h3>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* 연결 상태 */}
        <div className="mb-4">
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

          {!isConnected && (
            <button
              onClick={handleConnect}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              연결하기
            </button>
          )}
        </div>

        {/* 참여자 목록 */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            참여자 ({peers.length + 1})
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm">나 (로컬)</span>
            </div>
            {peers.map((peerId, index) => (
              <div
                key={peerId}
                className="flex items-center space-x-2 p-2 bg-gray-50 rounded"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-sm">참여자 {index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 오디오 시각화 */}
        {localStream && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              오디오 레벨
            </h4>
            <AudioVisualizer audioStream={localStream} isActive={isConnected} />
          </div>
        )}

        {/* 컨트롤 버튼들 */}
        {isConnected && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">컨트롤</h4>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={toggleMute}
                className={`p-2 rounded text-sm ${
                  isMuted
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isMuted ? "음소거 해제" : "음소거"}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded text-sm ${
                  !isVideoEnabled
                    ? "bg-red-100 text-red-600"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {!isVideoEnabled ? "비디오 켜기" : "비디오 끄기"}
              </button>
            </div>
            <button
              onClick={shareScreen}
              className="w-full p-2 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200"
            >
              화면 공유
            </button>
            <button
              onClick={disconnect}
              className="w-full p-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              연결 해제
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
