export interface WebRTCMessage {
  type: string;
  data: any;
  from: string;
  to?: string;
}

export interface WebRTCConfig {
  iceServers: RTCIceServer[];
  roomName: string;
  userId: string;
  userName: string;
}

export interface WebRTCConnection {
  peerId: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}
