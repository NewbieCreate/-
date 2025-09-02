"use client";

import React, { useState, useEffect } from "react";
import { useWebRTC, WebRTCMessage } from "../app/_webRTC";

interface VoiceCallButtonProps {
  targetUserId?: string;
  targetUserName?: string;
}

export default function VoiceCallButton({
  targetUserId,
  targetUserName,
}: VoiceCallButtonProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [isRinging, setIsRinging] = useState(false);
  const [callStatus, setCallStatus] = useState<
    "idle" | "calling" | "connected" | "ended"
  >("idle");
  const [isClient, setIsClient] = useState(false);

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
    roomName: "default-room",
    userId: "user-1",
    userName: "사용자",
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // 통화 시작
  const handleStartCall = async () => {
    if (!targetUserId) return;

    try {
      setCallStatus("calling");
      setIsRinging(true);

      // WebRTC 연결
      await connect();

      // 통화 요청 메시지 전송
      sendMessage({
        type: "call-request",
        data: { targetUserId, action: "start-call" },
        from: "user-1",
        to: targetUserId,
      });

      // 30초 후 자동 종료
      setTimeout(() => {
        if (callStatus === "calling") {
          handleEndCall();
        }
      }, 30000);
    } catch (error) {
      console.error("통화 시작 실패:", error);
      setCallStatus("idle");
      setIsRinging(false);
    }
  };

  // 통화 종료
  const handleEndCall = () => {
    setCallStatus("ended");
    setIsRinging(false);
    setIsInCall(false);

    // WebRTC 연결 해제
    disconnect();

    // 통화 종료 메시지 전송
    if (targetUserId) {
      sendMessage({
        type: "call-end",
        data: { action: "end-call" },
        from: "user-1",
        to: targetUserId,
      });
    }

    // 상태 초기화
    setTimeout(() => {
      setCallStatus("idle");
    }, 1000);
  };

  // 통화 수락
  const handleAcceptCall = async () => {
    try {
      setCallStatus("connected");
      setIsInCall(true);
      setIsRinging(false);

      // WebRTC 연결
      await connect();

      // 통화 수락 메시지 전송
      if (targetUserId) {
        sendMessage({
          type: "call-accept",
          data: { action: "accept-call" },
          from: "user-1",
          to: targetUserId,
        });
      }
    } catch (error) {
      console.error("통화 수락 실패:", error);
      handleEndCall();
    }
  };

  // 통화 거절
  const handleRejectCall = () => {
    setCallStatus("ended");
    setIsRinging(false);

    // 통화 거절 메시지 전송
    if (targetUserId) {
      sendMessage({
        type: "call-reject",
        data: { action: "reject-call" },
        from: "user-1",
        to: targetUserId,
      });
    }

    setTimeout(() => {
      setCallStatus("idle");
    }, 1000);
  };

  // 메시지 수신 처리
  useEffect(() => {
    if (!isClient) return;

    const handleMessage = (message: WebRTCMessage) => {
      if (message.type === "data" && message.from === targetUserId) {
        const data = message.data as Record<string, unknown>;

        if (data.type === "call-request") {
          setCallStatus("calling");
          setIsRinging(true);
          // 벨소리 재생
          playRingtone();
        } else if (data.type === "call-accept") {
          setCallStatus("connected");
          setIsInCall(true);
          setIsRinging(false);
          stopRingtone();
        } else if (data.type === "call-reject") {
          setCallStatus("ended");
          setIsRinging(false);
          stopRingtone();
          setTimeout(() => setCallStatus("idle"), 1000);
        } else if (data.type === "call-end") {
          handleEndCall();
        }
      }
    };

    // 메시지 핸들러는 현재 구현되지 않음
    // 실제 구현에서는 WebSocket이나 다른 메시징 시스템 사용
  }, [isClient, targetUserId]);

  // 벨소리 재생
  const playRingtone = () => {
    // 실제 구현에서는 오디오 파일 재생
    console.log("벨소리 재생");
  };

  // 벨소리 정지
  const stopRingtone = () => {
    // 실제 구현에서는 오디오 정지
    console.log("벨소리 정지");
  };

  if (!isClient) return null;

  return (
    <div className="fixed top-6 left-6 z-40">
      {/* 통화 상태 표시 */}
      {callStatus !== "idle" && (
        <div className="mb-2 bg-white rounded-lg shadow-lg p-3 border">
          <div className="text-sm font-medium text-gray-900">
            {callStatus === "calling" && isRinging
              ? "수신 중..."
              : callStatus === "calling"
              ? "발신 중..."
              : callStatus === "connected"
              ? "통화 중"
              : callStatus === "ended"
              ? "통화 종료"
              : ""}
          </div>
          {targetUserName && (
            <div className="text-xs text-gray-600">{targetUserName}</div>
          )}
        </div>
      )}

      {/* 통화 버튼들 */}
      <div className="flex space-x-2">
        {/* 발신 버튼 */}
        {callStatus === "idle" && (
          <button
            onClick={handleStartCall}
            className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
            title="음성 통화 시작"
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
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </button>
        )}

        {/* 수신 중일 때 수락/거절 버튼 */}
        {callStatus === "calling" && isRinging && (
          <>
            <button
              onClick={handleAcceptCall}
              className="bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
              title="통화 수락"
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
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </button>
            <button
              onClick={handleRejectCall}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
              title="통화 거절"
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
          </>
        )}

        {/* 통화 중일 때 종료 버튼 */}
        {callStatus === "connected" && (
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
            title="통화 종료"
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
                d="M16 8l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M5 3a2 2 0 00-2 2v1c0 8.284 6.716 15 15 15h1a2 2 0 002-2v-3.28a1 1 0 00-.684-.948l-4.493-1.498a1 1 0 00-1.21.502l-1.13 2.257a11.042 11.042 0 01-5.516-5.517l2.257-1.13a1 1 0 00.502-1.21L9.228 3.683A1 1 0 008.28 3H5z"
              />
            </svg>
          </button>
        )}

        {/* 발신 중일 때 취소 버튼 */}
        {callStatus === "calling" && !isRinging && (
          <button
            onClick={handleEndCall}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105"
            title="통화 취소"
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
        )}
      </div>
    </div>
  );
}
