"use client";

import React from "react";
import dynamic from "next/dynamic";

// WebRTC 패널을 동적으로 로드 (에러 바운더리 포함)
const WebRTCPanel = dynamic(() => import("./WebRTCPanel"), {
  ssr: false,
  loading: () => null,
});

// 음성 통화 버튼을 동적으로 로드
const VoiceCallButton = dynamic(() => import("./VoiceCallButton"), {
  ssr: false,
  loading: () => null,
});

export default function WebRTCWrapper() {
  const [isWebRTCOpen, setIsWebRTCOpen] = React.useState(false);
  const [isClient, setIsClient] = React.useState(false);

  React.useEffect(() => {
    // 브라우저 환경 확인
    if (typeof window !== "undefined") {
      setIsClient(true);
    }
  }, []);

  const handleToggleWebRTC = () => {
    if (typeof window !== "undefined") {
      setIsWebRTCOpen(!isWebRTCOpen);
    }
  };

  const handleCloseWebRTC = () => {
    setIsWebRTCOpen(false);
  };

  // 서버사이드 렌더링 시 아무것도 렌더링하지 않음
  if (typeof window === "undefined" || !isClient) {
    return null;
  }

  return (
    <>
      {/* 음성 통화 버튼 */}
      <VoiceCallButton targetUserId="user-2" targetUserName="상대방 사용자" />

      {/* WebRTC 토글 버튼 */}
      <button
        onClick={handleToggleWebRTC}
        className="fixed bottom-6 right-6 z-40 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
        title="비디오 채팅 열기"
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
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      </button>

      {/* WebRTC 패널 */}
      {isWebRTCOpen && (
        <WebRTCPanel isOpen={isWebRTCOpen} onClose={handleCloseWebRTC} />
      )}
    </>
  );
}
