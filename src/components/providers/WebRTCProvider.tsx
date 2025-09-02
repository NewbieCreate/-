"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface WebRTCContextType {
  isConnected: boolean;
  localStream: MediaStream | null;
  remoteStreams: MediaStream[];
  connect: () => Promise<void>;
  disconnect: () => void;
  startVideo: () => Promise<void>;
  stopVideo: () => void;
  startAudio: () => Promise<void>;
  stopAudio: () => void;
}

const WebRTCContext = createContext<WebRTCContextType | null>(null);

export const useWebRTC = () => {
  const context = useContext(WebRTCContext);
  if (!context) {
    throw new Error("useWebRTC must be used within a WebRTCProvider");
  }
  return context;
};

interface WebRTCProviderProps {
  children: ReactNode;
}

export const WebRTCProvider: React.FC<WebRTCProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<MediaStream[]>([]);

  const connect = async () => {
    try {
      setIsConnected(true);
    } catch (error) {
      console.error("WebRTC 연결 실패:", error);
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    setRemoteStreams([]);
  };

  const startVideo = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setLocalStream(stream);
    } catch (error) {
      console.error("비디오 시작 실패:", error);
    }
  };

  const stopVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
  };

  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream((prev) =>
        prev
          ? new MediaStream([...prev.getTracks(), ...stream.getAudioTracks()])
          : stream
      );
    } catch (error) {
      console.error("오디오 시작 실패:", error);
    }
  };

  const stopAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => track.stop());
    }
  };

  const value: WebRTCContextType = {
    isConnected,
    localStream,
    remoteStreams,
    connect,
    disconnect,
    startVideo,
    stopVideo,
    startAudio,
    stopAudio,
  };

  return (
    <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
  );
};
