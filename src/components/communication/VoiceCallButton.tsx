"use client";

import React, { useState } from "react";
import { useWebRTCConnection } from "@/hooks/useWebRTC";
import { Phone, PhoneOff } from "lucide-react";

export const VoiceCallButton: React.FC = () => {
  const { isConnected, initializeConnection, disconnect } =
    useWebRTCConnection();
  const [isCalling, setIsCalling] = useState(false);

  const handleCallClick = async () => {
    if (isConnected) {
      disconnect();
    } else {
      setIsCalling(true);
      try {
        await initializeConnection();
        setIsCalling(false);
      } catch (error) {
        console.error("통화 연결 실패:", error);
        setIsCalling(false);
      }
    }
  };

  return (
    <button
      onClick={handleCallClick}
      disabled={isCalling}
      className={`fixed bottom-4 left-4 w-14 h-14 rounded-full shadow-lg border-2 transition-all duration-200 ${
        isConnected
          ? "bg-red-500 border-red-600 hover:bg-red-600 text-white"
          : isCalling
          ? "bg-yellow-500 border-yellow-600 text-white animate-pulse"
          : "bg-green-500 border-green-600 hover:bg-green-600 text-white"
      }`}
      title={
        isConnected ? "통화 종료" : isCalling ? "연결 중..." : "음성 통화 시작"
      }
    >
      {isCalling ? (
        <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto" />
      ) : isConnected ? (
        <PhoneOff size={24} className="mx-auto" />
      ) : (
        <Phone size={24} className="mx-auto" />
      )}
    </button>
  );
};
