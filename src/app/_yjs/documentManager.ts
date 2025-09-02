import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import { IndexeddbPersistence } from "y-indexeddb";
import {
  SharedDocument,
  UserData,
  LineData,
  ShapeData,
  TextData,
  PdfImageData,
} from "./types";

export class DocumentManager {
  private ydoc: Y.Doc;
  private provider: WebsocketProvider | null = null;
  private persistence: IndexeddbPersistence | null = null;
  private roomName: string;
  private userId: string;
  private userName: string;
  private userColor: string;
  private isConnected: boolean = false;
  private usersChangeCallback: ((event: Y.YMapEvent<UserData>) => void) | null =
    null;

  // YJS 공유 데이터
  public users: Y.Map<UserData>;
  public lines: Y.Array<LineData>;
  public shapes: Y.Array<ShapeData>;
  public texts: Y.Array<TextData>;
  public pdfImage: Y.Map<PdfImageData>;

  constructor(roomName: string, userId: string, userName: string) {
    this.roomName = roomName;
    this.userId = userId;
    this.userName = userName;
    this.userColor = this.generateRandomColor();

    // YJS 문서 생성
    this.ydoc = new Y.Doc();

    // 공유 데이터 초기화
    this.users = this.ydoc.getMap("users");
    this.lines = this.ydoc.getArray("lines");
    this.shapes = this.ydoc.getArray("shapes");
    this.texts = this.ydoc.getArray("texts");
    this.pdfImage = this.ydoc.getMap("pdfImage");

    // 사용자 정보 설정
    this.setupUser();
  }

  private generateRandomColor(): string {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private setupUser(): void {
    const userData: UserData = {
      id: this.userId,
      name: this.userName,
      color: this.userColor,
      cursor: { x: 0, y: 0 },
      lastSeen: Date.now(),
    };

    this.users.set(this.userId, userData);

    // 주기적으로 사용자 상태 업데이트
    setInterval(() => {
      const currentUser = this.users.get(this.userId);
      if (currentUser) {
        currentUser.lastSeen = Date.now();
        this.users.set(this.userId, currentUser);
      }
    }, 30000); // 30초마다 업데이트
  }

  public connectWebSocket(serverUrl: string): void {
    try {
      this.provider = new WebsocketProvider(
        serverUrl,
        this.roomName,
        this.ydoc
      );

      this.provider.on("status", (event: any) => {
        this.isConnected = event.status === "connected";
      });

      this.provider.on("sync", () => {
        this.isConnected = true;
      });

      // IndexedDB 지속성 설정
      this.persistence = new IndexeddbPersistence(this.roomName, this.ydoc);
    } catch (error) {
      console.error("WebSocket 연결 실패:", error);
      this.isConnected = false;
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  public getDocument(): Y.Doc {
    return this.ydoc;
  }

  public getSharedDocument(): SharedDocument {
    return {
      id: this.roomName,
      name: this.roomName,
      users: this.users,
      lines: this.lines,
      shapes: this.shapes,
      texts: this.texts,
      pdfImage: this.pdfImage.get("image") || undefined,
    };
  }

  public onUsersChange(callback: (event: Y.YMapEvent<UserData>) => void): void {
    this.usersChangeCallback = callback;
    this.users.observe(callback);
  }

  public addLine(lineData: LineData, origin: any): void {
    this.lines.push([lineData]);
  }

  public addShape(shapeData: ShapeData, origin: any): void {
    this.shapes.push([shapeData]);
  }

  public addText(textData: TextData, origin: any): void {
    this.texts.push([textData]);
  }

  public setPdfImage(pdfData: PdfImageData): void {
    this.pdfImage.set("image", pdfData);
  }

  public updateCursor(x: number, y: number): void {
    const currentUser = this.users.get(this.userId);
    if (currentUser) {
      currentUser.cursor = { x, y };
      currentUser.lastSeen = Date.now();
      this.users.set(this.userId, currentUser);
    }
  }

  public removeLine(lineId: string, origin: any): void {
    const index = this.lines.toArray().findIndex((line) => line.id === lineId);
    if (index !== -1) {
      this.lines.delete(index);
    }
  }

  public removeShape(shapeId: string, origin: any): void {
    const index = this.shapes
      .toArray()
      .findIndex((shape) => shape.id === shapeId);
    if (index !== -1) {
      this.shapes.delete(index);
    }
  }

  public removeText(textId: string, origin: any): void {
    const index = this.texts.toArray().findIndex((text) => text.id === textId);
    if (index !== -1) {
      this.texts.delete(index);
    }
  }

  public clearAll(origin: any): void {
    this.lines.delete(0, this.lines.length);
    this.shapes.delete(0, this.shapes.length);
    this.texts.delete(0, this.texts.length);
  }

  public updateLine(lineId: string, newPoints: number[]): void {
    const index = this.lines.toArray().findIndex((line) => line.id === lineId);
    if (index !== -1) {
      const line = this.lines.get(index);
      if (line) {
        const updatedLine = { ...line, points: newPoints };
        this.lines.delete(index);
        this.lines.insert(index, [updatedLine]);
      }
    }
  }

  public updateShape(shapeId: string, newX: number, newY: number): void {
    const index = this.shapes
      .toArray()
      .findIndex((shape) => shape.id === shapeId);
    if (index !== -1) {
      const shape = this.shapes.get(index);
      if (shape) {
        const updatedShape = { ...shape, x: newX, y: newY };
        this.shapes.delete(index);
        this.shapes.insert(index, [updatedShape]);
      }
    }
  }

  public disconnect(): void {
    if (this.provider) {
      this.provider.disconnect();
      this.provider = null;
    }

    if (this.persistence) {
      this.persistence.destroy();
      this.persistence = null;
    }

    this.isConnected = false;
  }
}
