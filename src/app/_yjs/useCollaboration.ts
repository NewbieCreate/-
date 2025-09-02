"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { DocumentManager } from "./documentManager";
import { SharedDocument, PdfImageData, UserData } from "./types";
import * as Y from "yjs";

export interface UseCollaborationOptions {
  roomName: string;
  userId: string;
  userName: string;
  serverUrl?: string;
  autoConnect?: boolean;
}

export interface UseCollaborationReturn {
  documentManager: DocumentManager | null;
  isConnected: boolean;
  connectionStatus: string;
  users: Map<
    string,
    {
      id: string;
      name: string;
      color: string;
      cursor: { x: number; y: number };
    }
  >;
  connect: () => void;
  disconnect: () => void;
  addLine: (lineData: {
    id: string;
    points: number[];
    stroke: string;
    strokeWidth: number;
    opacity: number;
    globalCompositeOperation: string;
    mode: string;
  }) => void;
  addShape: (shapeData: {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    strokeWidth: number;
  }) => void;
  addText: (textData: {
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    color: string;
  }) => void;
  setPdfImage: (pdfData: PdfImageData) => void;
  updateCursor: (x: number, y: number) => void;
  removeLine: (lineId: string) => void;
  removeShape: (shapeId: string) => void;
  removeText: (textId: string) => void;
  clearAll: () => void;
  updateLine: (lineId: string, newPoints: number[]) => void;
  updateShape: (shapeId: string, newX: number, newY: number) => void;
  undoManager: Y.UndoManager | null;
  localOrigin: object;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useCollaboration({
  roomName,
  userId,
  userName,
  serverUrl = "ws://localhost:1234",
  autoConnect = true,
}: UseCollaborationOptions): UseCollaborationReturn {
  const [documentManager, setDocumentManager] =
    useState<DocumentManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [users, setUsers] = useState<
    Map<
      string,
      {
        id: string;
        name: string;
        color: string;
        cursor: { x: number; y: number };
      }
    >
  >(new Map());

  const docManagerRef = useRef<DocumentManager | null>(null);
  const originRef = useRef<object>({});

  const ydoc = documentManager?.getDocument();
  const { yTexts, yLines, yShapes } = useMemo(() => {
    if (!ydoc)
      return { yTexts: undefined, yLines: undefined, yShapes: undefined };
    return {
      yTexts: ydoc.getArray("texts"),
      yLines: ydoc.getArray("lines"),
      yShapes: ydoc.getArray("shapes"),
    };
  }, [ydoc]);

  const [undoManager, setUndoManager] = useState<Y.UndoManager | null>(null);

  useEffect(() => {
    if (!yTexts || !yLines || !yShapes) {
      return;
    }

    try {
      if (
        typeof yTexts.toArray !== "function" ||
        typeof yLines.toArray !== "function" ||
        typeof yShapes.toArray !== "function"
      ) {
        console.log("UndoManager 생성 실패: Yjs 배열 메서드가 준비되지 않음");
        return;
      }

      console.log("UndoManager 생성 성공");
      const newUndoManager = new Y.UndoManager([yTexts, yLines, yShapes], {
        trackedOrigins: new Set([originRef.current]),
        captureTimeout: 500,
      });

      setUndoManager(newUndoManager);
    } catch (error) {
      console.error("UndoManager 생성 중 오류 발생:", error);
    }
  }, [yTexts, yLines, yShapes]);

  useEffect(() => {
    return () => {
      undoManager?.destroy();
    };
  }, [undoManager]);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  useEffect(() => {
    if (!undoManager) return;

    const updateUndoRedoState = () => {
      const canUndoState = undoManager.canUndo();
      const canRedoState = undoManager.canRedo();
      setCanUndo(canUndoState);
      setCanRedo(canRedoState);
    };

    updateUndoRedoState();
    undoManager.on("stack-item-added", updateUndoRedoState);
    undoManager.on("stack-item-popped", updateUndoRedoState);

    return () => {
      undoManager.off("stack-item-added", updateUndoRedoState);
      undoManager.off("stack-item-popped", updateUndoRedoState);
    };
  }, [undoManager]);

  const undo = useCallback(() => {
    if (!undoManager) {
      console.log("Undo 실패: UndoManager가 없음");
      return;
    }
    console.log("Undo 실행");
    undoManager.undo();
  }, [undoManager]);

  const redo = useCallback(() => {
    if (!undoManager) {
      console.log("Redo 실패: UndoManager가 없음");
      return;
    }
    console.log("Redo 실행");
    undoManager.redo();
  }, [undoManager]);

  useEffect(() => {
    const manager = new DocumentManager(roomName, userId, userName);
    docManagerRef.current = manager;
    setDocumentManager(manager);

    if (autoConnect) {
      setTimeout(() => {
        try {
          manager.connectWebSocket(serverUrl);
          setConnectionStatus("connecting");
        } catch (error) {
          console.warn("초기 WebSocket 연결 실패:", error);
          setConnectionStatus("local");
        }
      }, 100);
    }

    const handleBeforeUnload = () => {
      if (docManagerRef.current) {
        try {
          docManagerRef.current.disconnect();
        } catch (error) {
          console.warn("사용자 데이터 정리 중 오류:", error);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    manager.onUsersChange((event: Y.YMapEvent<UserData>) => {
      try {
        const usersMap = new Map();
        const currentTime = Date.now();
        const timeoutThreshold = 60000;

        const usersData = manager.getSharedDocument().users;

        if (usersData && typeof usersData.forEach === "function") {
          usersData.forEach((user: any, key: any) => {
            if (user && typeof user === "object" && "id" in user) {
              const lastSeen = user.lastSeen || 0;
              if (currentTime - lastSeen <= timeoutThreshold) {
                if (!usersMap.has(user.id)) {
                  usersMap.set(user.id, user);
                } else {
                  const existingUser = usersMap.get(user.id);
                  if (user.lastSeen > existingUser.lastSeen) {
                    usersMap.set(user.id, user);
                  }
                }
              }
            }
          });
        } else {
          console.warn("usersData is not a valid YMap:", usersData);
        }

        setUsers(usersMap);
      } catch (error) {
        console.error("Error processing users change:", error);
      }
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      manager.disconnect();
    };
  }, [roomName, userId, userName, autoConnect, serverUrl]);

  const connect = useCallback(() => {
    if (docManagerRef.current) {
      try {
        docManagerRef.current.connectWebSocket(serverUrl);
        setConnectionStatus("connecting");

        const checkConnection = () => {
          if (docManagerRef.current?.isWebSocketConnected()) {
            setIsConnected(true);
            setConnectionStatus("connected");
          } else {
            setTimeout(checkConnection, 1000);
          }
        };

        checkConnection();
      } catch (error) {
        console.warn("WebSocket 연결 실패, 로컬 모드로 실행:", error);
        setIsConnected(false);
        setConnectionStatus("local");

        setTimeout(() => {
          if (
            docManagerRef.current &&
            !docManagerRef.current.isWebSocketConnected()
          ) {
            try {
              docManagerRef.current?.connectWebSocket(serverUrl);
            } catch (retryError) {
              console.warn("재연결 시도 실패:", retryError);
            }
          }
        }, 5000);
      }
    }
  }, [serverUrl]);

  const disconnect = useCallback(() => {
    if (docManagerRef.current) {
      docManagerRef.current.disconnect();
      setIsConnected(false);
      setConnectionStatus("disconnected");
    }
  }, []);

  useEffect(() => {
    if (autoConnect && documentManager) {
      connect();
    }
  }, [autoConnect, documentManager, connect]);

  useEffect(() => {
    if (documentManager) {
      const interval = setInterval(() => {
        if (docManagerRef.current) {
          const isConnected = docManagerRef.current.isWebSocketConnected();
          const status = isConnected ? "connected" : "disconnected";

          if (status !== connectionStatus) {
            setConnectionStatus(status);
            setIsConnected(isConnected);
          }
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [documentManager, connectionStatus]);

  const addLine = useCallback(
    (lineData: {
      id: string;
      points: number[];
      stroke: string;
      strokeWidth: number;
      opacity: number;
      globalCompositeOperation: string;
      mode: string;
    }) => {
      if (docManagerRef.current) {
        docManagerRef.current.addLine(lineData, originRef.current);
      }
    },
    []
  );

  const addShape = useCallback(
    (shapeData: {
      id: string;
      type: string;
      x: number;
      y: number;
      width: number;
      height: number;
      fill: string;
      stroke: string;
      strokeWidth: number;
    }) => {
      if (docManagerRef.current) {
        docManagerRef.current.addShape(shapeData, originRef.current);
      }
    },
    []
  );

  const addText = useCallback(
    (textData: {
      id: string;
      x: number;
      y: number;
      text: string;
      fontSize: number;
      color: string;
    }) => {
      if (docManagerRef.current) {
        docManagerRef.current.addText(textData, originRef.current);
      }
    },
    []
  );

  const setPdfImage = useCallback((pdfData: PdfImageData) => {
    if (docManagerRef.current) {
      docManagerRef.current.setPdfImage(pdfData);
    }
  }, []);

  const updateCursor = useCallback((x: number, y: number) => {
    if (docManagerRef.current) {
      docManagerRef.current.updateCursor(x, y);
    }
  }, []);

  const removeLine = useCallback((lineId: string) => {
    if (docManagerRef.current) {
      docManagerRef.current.removeLine(lineId, originRef.current);
    }
  }, []);

  const removeShape = useCallback((shapeId: string) => {
    if (docManagerRef.current) {
      docManagerRef.current.removeShape(shapeId, originRef.current);
    }
  }, []);

  const removeText = useCallback((textId: string) => {
    if (docManagerRef.current) {
      docManagerRef.current.removeText(textId, originRef.current);
    }
  }, []);

  const clearAll = useCallback(() => {
    if (docManagerRef.current) {
      docManagerRef.current.clearAll(originRef.current);
    }
  }, []);

  const updateLine = useCallback((lineId: string, newPoints: number[]) => {
    if (docManagerRef.current) {
      docManagerRef.current.updateLine(lineId, newPoints);
    }
  }, []);

  const updateShape = useCallback(
    (shapeId: string, newX: number, newY: number) => {
      if (docManagerRef.current) {
        docManagerRef.current.updateShape(shapeId, newX, newY);
      }
    },
    []
  );

  return {
    documentManager,
    isConnected,
    connectionStatus,
    users,
    connect,
    disconnect,
    addLine,
    addShape,
    addText,
    setPdfImage,
    updateCursor,
    removeLine,
    removeShape,
    removeText,
    clearAll,
    updateLine,
    updateShape,
    undoManager,
    localOrigin: originRef.current,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
