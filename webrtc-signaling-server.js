const WebSocket = require("ws");
const http = require("http");
const url = require("url");

// HTTP 서버 생성
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// 연결된 클라이언트들을 방별로 관리
const rooms = new Map();

console.log("🚀 WebRTC 시그널링 서버 시작...");

wss.on("connection", (ws, req) => {
  const { query } = url.parse(req.url, true);
  const roomName = query.room || "default-room";
  const userId = query.userId || "unknown-user";

  console.log(`📡 새로운 연결: ${userId} (방: ${roomName})`);

  // 방이 없으면 생성
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Map());
  }

  const room = rooms.get(roomName);

  // 클라이언트 정보 저장
  ws.userId = userId;
  ws.roomName = roomName;
  room.set(userId, ws);

  // 방의 다른 사용자들에게 새 사용자 입장 알림
  const joinMessage = {
    type: "user-join",
    from: userId,
    data: { userId, roomName },
  };

  console.log(`📢 사용자 입장 알림 전송: ${userId} (방: ${roomName})`);
  console.log(`📤 joinMessage:`, joinMessage);

  broadcastToRoom(roomName, joinMessage, userId);

  // 연결된 사용자 목록 전송
  const userList = Array.from(room.keys()).filter((id) => id !== userId);
  const userListMessage = {
    type: "user-list",
    from: "server",
    data: { users: userList },
  };

  console.log(`📤 사용자 목록 전송: ${userId}`, userListMessage);
  ws.send(JSON.stringify(userListMessage));

  console.log(
    `👥 방 ${roomName}의 사용자: ${Array.from(room.keys()).join(", ")}`
  );

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);
      console.log(
        `📨 메시지 수신: ${data.type} from ${data.from} to ${data.to || "all"}`
      );

      switch (data.type) {
        case "offer":
        case "answer":
        case "ice-candidate":
          // 특정 사용자에게 전달
          if (data.to) {
            const targetWs = room.get(data.to);
            if (targetWs && targetWs.readyState === WebSocket.OPEN) {
              targetWs.send(JSON.stringify(data));
              console.log(`📤 ${data.type} 전달: ${data.from} → ${data.to}`);
            }
          }
          break;

        case "ping":
          // 핑 응답
          ws.send(JSON.stringify({ type: "pong", from: "server" }));
          break;

        default:
          console.log(`❓ 알 수 없는 메시지 타입: ${data.type}`);
      }
    } catch (error) {
      console.error("❌ 메시지 파싱 오류:", error);
    }
  });

  ws.on("close", () => {
    console.log(`👋 연결 종료: ${userId} (방: ${roomName})`);

    // 방에서 사용자 제거
    if (room.has(userId)) {
      room.delete(userId);
    }

    // 방이 비어있으면 방 삭제
    if (room.size === 0) {
      rooms.delete(roomName);
      console.log(`🏠 빈 방 삭제: ${roomName}`);
    } else {
      // 다른 사용자들에게 퇴장 알림
      const leaveMessage = {
        type: "user-leave",
        from: userId,
        data: { userId, roomName },
      };
      broadcastToRoom(roomName, leaveMessage, userId);
      console.log(
        `👥 방 ${roomName}의 남은 사용자: ${Array.from(room.keys()).join(", ")}`
      );
    }
  });

  ws.on("error", (error) => {
    console.error(`❌ WebSocket 오류 (${userId}):`, error);
  });
});

// 방의 모든 사용자에게 메시지 브로드캐스트
function broadcastToRoom(roomName, message, excludeUserId = null) {
  const room = rooms.get(roomName);
  if (!room) {
    console.log(`❌ 방을 찾을 수 없음: ${roomName}`);
    return;
  }

  console.log(
    `📡 브로드캐스트 시작: 방 ${roomName}, 메시지 타입: ${message.type}`
  );
  console.log(`👥 방의 사용자들: ${Array.from(room.keys()).join(", ")}`);
  console.log(`🚫 제외할 사용자: ${excludeUserId || "없음"}`);

  let sentCount = 0;
  room.forEach((ws, userId) => {
    if (userId !== excludeUserId && ws.readyState === WebSocket.OPEN) {
      console.log(`📤 메시지 전송: ${userId}에게 ${message.type} 전송`);
      ws.send(JSON.stringify(message));
      sentCount++;
    } else {
      console.log(`⏭️ 메시지 건너뜀: ${userId} (제외됨 또는 연결 안됨)`);
    }
  });

  console.log(`✅ 브로드캐스트 완료: ${sentCount}명에게 전송됨`);
}

// 서버 시작
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🎯 WebRTC 시그널링 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📡 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`🌐 방 목록: ${Array.from(rooms.keys()).join(", ") || "없음"}`);
});

// 서버 종료 시 정리
process.on("SIGINT", () => {
  console.log("\n🛑 서버 종료 중...");
  wss.close(() => {
    console.log("✅ WebRTC 시그널링 서버가 안전하게 종료되었습니다.");
    process.exit(0);
  });
});
