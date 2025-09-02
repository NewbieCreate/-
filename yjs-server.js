const WebSocket = require("ws");
const http = require("http");
const url = require("url");

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const rooms = new Map();

wss.on("connection", (ws, req) => {
  const { pathname } = url.parse(req.url);
  const roomName = pathname.slice(1); // '/' 제거

  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
  }

  const room = rooms.get(roomName);
  room.add(ws);

  console.log(
    `사용자가 ${roomName} 방에 연결되었습니다. 현재 사용자 수: ${room.size}`
  );

  ws.on("message", (message) => {
    // 같은 방의 다른 사용자들에게 메시지 브로드캐스트
    room.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  ws.on("close", () => {
    room.delete(ws);
    console.log(
      `사용자가 ${roomName} 방에서 연결 해제되었습니다. 현재 사용자 수: ${room.size}`
    );

    // 빈 방 정리
    if (room.size === 0) {
      rooms.delete(roomName);
      console.log(`${roomName} 방이 삭제되었습니다.`);
    }
  });

  ws.on("error", (error) => {
    console.error("WebSocket 오류:", error);
  });
});

const PORT = process.env.PORT || 1234;

server.listen(PORT, () => {
  console.log(`YJS 시그널링 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`사용 가능한 방: ${Array.from(rooms.keys()).join(", ")}`);
});

// 정기적으로 방 상태 출력
setInterval(() => {
  console.log("\n=== 현재 방 상태 ===");
  rooms.forEach((room, roomName) => {
    console.log(`${roomName}: ${room.size}명`);
  });
  console.log("==================\n");
}, 30000); // 30초마다
