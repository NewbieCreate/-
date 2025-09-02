"use client";

import React, { useState } from "react";
import { useWebRTCConnection } from "@/hooks/useWebRTC";
import {
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Share,
} from "lucide-react";

export const VoiceCall: React.FC = () => {
  const {
    isConnected,
    localStream,
    remoteStreams,
    peers,
    isMuted,
    isVideoEnabled,
    initializeConnection,
    disconnect,
    startVideo,
    stopVideo,
    startAudio,
    stopAudio,
    toggleMute,
    toggleVideo,
    shareScreen,
  } = useWebRTCConnection();

  const [isIncoming, setIsIncoming] = useState(false);
  const [callerName, setCallerName] = useState("");

  const handleAnswerCall = async () => {
    await initializeConnection();
    setIsIncoming(false);
  };

  const handleRejectCall = () => {
    setIsIncoming(false);
  };

  const handleEndCall = () => {
    disconnect();
  };

  if (isIncoming) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">수신 전화</h3>
          <p className="text-gray-600 mb-4">
            {callerName}님이 전화를 걸고 있습니다
          </p>
          <div className="flex space-x-3">
            <button
              onClick={handleAnswerCall}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              받기
            </button>
            <button
              onClick={handleRejectCall}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              거절
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-40">
      <div className="flex items-center space-x-4 mb-4">
        <div className="text-center">
          <h4 className="font-medium text-gray-800">통화 중</h4>
          <p className="text-sm text-gray-600">{peers.length}명 참여</p>
        </div>
      </div>

      {/* 비디오 스트림 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {localStream && (
          <div className="relative">
            <video
              ref={(el) => {
                if (el) el.srcObject = localStream;
              }}
              autoPlay
              muted
              className="w-full h-24 bg-gray-200 rounded"
            />
            <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
              나
            </div>
          </div>
        )}
        {remoteStreams.map((stream, index) => (
          <div key={index} className="relative">
            <video
              ref={(el) => {
                if (el) el.srcObject = stream;
              }}
              autoPlay
              className="w-full h-24 bg-gray-200 rounded"
            />
            <div className="absolute bottom-1 left-1 text-xs bg-black bg-opacity-50 text-white px-1 rounded">
              참여자 {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* 컨트롤 버튼들 */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={toggleMute}
          className={`p-2 rounded-full ${
            isMuted ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-600"
          } hover:bg-opacity-80`}
          title={isMuted ? "음소거 해제" : "음소거"}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-2 rounded-full ${
            !isVideoEnabled
              ? "bg-red-100 text-red-600"
              : "bg-gray-100 text-gray-600"
          } hover:bg-opacity-80`}
          title={!isVideoEnabled ? "비디오 켜기" : "비디오 끄기"}
        >
          {!isVideoEnabled ? <VideoOff size={20} /> : <Video size={20} />}
        </button>

        <button
          onClick={shareScreen}
          className="p-2 rounded-full bg-gray-100 text-gray-600 hover:bg-opacity-80"
          title="화면 공유"
        >
          <Share size={20} />
        </button>

        <button
          onClick={handleEndCall}
          className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700"
          title="통화 종료"
        >
          <PhoneOff size={20} />
        </button>
      </div>
    </div>
  );
};
