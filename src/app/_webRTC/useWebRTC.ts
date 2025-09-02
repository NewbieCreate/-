"use client";

import { useState, useEffect, useCallback } from "react";
import { WebRTCConfig, WebRTCMessage } from "./types";

export const useWebRTC = (config: WebRTCConfig) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map()
  );

  const connect = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      setIsConnected(true);
    } catch (error) {
      console.error("WebRTC 연결 실패:", error);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setIsConnected(false);
  }, [localStream]);

  const sendMessage = useCallback((message: WebRTCMessage) => {
    // 메시지 전송 로직
    console.log("메시지 전송:", message);
  }, []);

  return {
    isConnected,
    localStream,
    remoteStreams,
    connect,
    disconnect,
    sendMessage,
  };
};
