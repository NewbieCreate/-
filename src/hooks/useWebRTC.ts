import { useCallback, useEffect, useRef, useState } from "react";
import { useWebRTC } from "@/components/providers/WebRTCProvider";

export const useWebRTCConnection = () => {
  const {
    isConnected,
    localStream,
    remoteStreams,
    connect,
    disconnect,
    startVideo,
    stopVideo,
    startAudio,
    stopAudio,
  } = useWebRTC();

  const [peers, setPeers] = useState<string[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const initializeConnection = useCallback(async () => {
    try {
      await connect();
      console.log("WebRTC 연결 초기화됨");
    } catch (error) {
      console.error("WebRTC 연결 초기화 실패:", error);
    }
  }, [connect]);

  const toggleMute = useCallback(async () => {
    if (localStream) {
      const audioTracks = localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  }, [localStream, isMuted]);

  const toggleVideo = useCallback(async () => {
    if (localStream) {
      const videoTracks = localStream.getVideoTracks();
      videoTracks.forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  }, [localStream, isVideoEnabled]);

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });
      // 화면 공유 로직 구현
      return screenStream;
    } catch (error) {
      console.error("화면 공유 실패:", error);
      return null;
    }
  }, []);

  const addPeer = useCallback((peerId: string) => {
    setPeers((prev) => [...prev, peerId]);
  }, []);

  const removePeer = useCallback((peerId: string) => {
    setPeers((prev) => prev.filter((id) => id !== peerId));
  }, []);

  useEffect(() => {
    if (localStream) {
      setIsVideoEnabled(
        localStream.getVideoTracks().some((track) => track.enabled)
      );
      setIsMuted(!localStream.getAudioTracks().some((track) => track.enabled));
    }
  }, [localStream]);

  return {
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
    addPeer,
    removePeer,
  };
};
