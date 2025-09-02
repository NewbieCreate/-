"use client";

import React from "react";
import { useCollaborationSession } from "@/hooks/useCollaboration";
import { useWebRTCConnection } from "@/hooks/useWebRTC";
import { Wifi, WifiOff, Users, Clock, Save, MessageCircle } from "lucide-react";

export const StatusBar: React.FC = () => {
  const { users, isConnected: isCollaborationConnected } =
    useCollaborationSession();
  const { isConnected: isWebRTCConnected } = useWebRTCConnection();
  const [lastSaved, setLastSaved] = React.useState<Date | null>(null);
  const [currentTime, setCurrentTime] = React.useState<Date | null>(null);
  const [isClient, setIsClient] = React.useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // 클라이언트에서만 시간 초기화 및 업데이트
  React.useEffect(() => {
    setIsClient(true);
    setLastSaved(new Date());
    setCurrentTime(new Date());

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getConnectionStatus = () => {
    if (isCollaborationConnected && isWebRTCConnected) {
      return { 
        status: "connected", 
        text: "모든 연결 활성화", 
        icon: "🟢",
        color: "text-success-600",
        bgColor: "bg-success-50"
      };
    } else if (isCollaborationConnected || isWebRTCConnected) {
      return { 
        status: "partial", 
        text: "부분 연결", 
        icon: "🟡",
        color: "text-warning-600",
        bgColor: "bg-warning-50"
      };
    } else {
      return { 
        status: "disconnected", 
        text: "연결 안됨", 
        icon: "🔴",
        color: "text-error-600",
        bgColor: "bg-error-50"
      };
    }
  };

  const connectionInfo = getConnectionStatus();

  return (
    <div className="bg-white border-t border-neutral-200 px-6 py-3 flex items-center justify-between text-sm text-neutral-600 shadow-soft">
      <div className="flex items-center space-x-8">
        {/* 연결 상태 */}
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg ${connectionInfo.bgColor}`}>
          <span className="text-lg">{connectionInfo.icon}</span>
          <span className={`font-medium ${connectionInfo.color}`}>
            {connectionInfo.text}
          </span>
        </div>

        {/* 협업 참여자 */}
        <div className="flex items-center space-x-2 text-neutral-700">
          <Users size={16} className="text-neutral-500" />
          <span className="font-medium">{users.length}명 참여</span>
        </div>

        {/* 댓글 수 */}
        <div className="flex items-center space-x-2 text-neutral-700">
          <MessageCircle size={16} className="text-neutral-500" />
          <span className="font-medium">댓글 0개</span>
        </div>

        {/* 마지막 저장 시간 */}
        <div className="flex items-center space-x-2 text-neutral-700">
          <Save size={16} className="text-neutral-500" />
          <span>
            마지막 저장:{" "}
            {isClient && lastSaved ? formatTime(lastSaved) : "--:--:--"}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* 현재 시간 */}
        <div className="flex items-center space-x-2 text-neutral-700">
          <Clock size={16} className="text-neutral-500" />
          <span className="font-medium">
            {isClient && currentTime ? formatTime(currentTime) : "--:--:--"}
          </span>
        </div>

        {/* 버전 정보 */}
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-neutral-100 px-3 py-1.5 rounded-full text-neutral-600 font-medium border border-neutral-200">
            FigJam Clone v1.0.0
          </span>
        </div>
      </div>
    </div>
  );
};
