"use client";

import React, { useState } from "react";
import { CollaborationStatus, ConnectionTest } from "../app/_yjs";

// WebRTC 래퍼 컴포넌트
const WebRTCWrapper = React.lazy(() => import("./WebRTCWrapper"));

interface ClientWrapperProps {
  collaborationConfig: {
    roomName: string;
    userId: string;
    userName: string;
    serverUrl: string;
  };
}

const ClientWrapper: React.FC<ClientWrapperProps> = ({
  collaborationConfig,
}) => {
  return (
    <>
      {/* 실시간 협업 상태 표시 */}
      <CollaborationStatus
        roomName={collaborationConfig.roomName}
        userId={collaborationConfig.userId}
        userName={collaborationConfig.userName}
      />

      {/* YJS 연결 테스트 컴포넌트 */}
      <ConnectionTest
        roomName={collaborationConfig.roomName}
        userId={collaborationConfig.userId}
        userName={collaborationConfig.userName}
      />

      {/* WebRTC 래퍼 */}
      <WebRTCWrapper />
    </>
  );
};

export default ClientWrapper;
