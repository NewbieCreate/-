"use client";

import React from "react";
import { VoiceCall } from "./VoiceCall";
import { VoiceCallButton } from "./VoiceCallButton";
import { WebRTCPanel } from "./WebRTCPanel";

export const WebRTCWrapper: React.FC = () => {
  return (
    <>
      <VoiceCall />
      <VoiceCallButton />
      <WebRTCPanel />
    </>
  );
};
