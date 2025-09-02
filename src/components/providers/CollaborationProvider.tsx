"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { CollaborationUser, Comment } from "@/lib/types/collaboration";
import { useCollaboration } from "@/app/_yjs";

interface CollaborationContextType {
  users: CollaborationUser[];
  comments: Comment[];
  addUser: (user: CollaborationUser) => void;
  removeUser: (userId: string) => void;
  addComment: (comment: Comment) => void;
  removeComment: (commentId: string) => void;
  updateUserPosition: (userId: string, x: number, y: number) => void;
  // YJS 관련 기능들
  isConnected: boolean;
  connectionStatus: string;
  connect: () => void;
  disconnect: () => void;
  addLine: (lineData: any) => void;
  addShape: (shapeData: any) => void;
  addText: (textData: any) => void;
  updateCursor: (x: number, y: number) => void;
}

const CollaborationContext = createContext<CollaborationContextType | null>(
  null
);

export const useCollaborationContext = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error(
      "useCollaborationContext must be used within a CollaborationProvider"
    );
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
  roomName?: string;
  userId?: string;
  userName?: string;
  serverUrl?: string;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({
  children,
  roomName = "default-room",
  userId = `user-${Date.now()}`,
  userName = "사용자",
  serverUrl = "ws://localhost:1234",
}) => {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);

  // YJS 협업 훅 사용
  const yjsCollaboration = useCollaboration({
    roomName,
    userId,
    userName,
    serverUrl,
    autoConnect: true,
  });

  // YJS 사용자 데이터를 CollaborationUser 형식으로 변환
  useEffect(() => {
    const yjsUsers = Array.from(yjsCollaboration.users.values());
    const collaborationUsers: CollaborationUser[] = yjsUsers.map(
      (user: any) => ({
        id: user.id,
        name: user.name,
        color: user.color,
        position: user.cursor,
      })
    );
    setUsers(collaborationUsers);
  }, [yjsCollaboration.users]);

  const addUser = (user: CollaborationUser) => {
    setUsers((prev) => [...prev, user]);
  };

  const removeUser = (userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  };

  const addComment = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const removeComment = (commentId: string) => {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  const updateUserPosition = (userId: string, x: number, y: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, position: { x, y } } : user
      )
    );
  };

  const value: CollaborationContextType = {
    users,
    comments,
    addUser,
    removeUser,
    addComment,
    removeComment,
    updateUserPosition,
    // YJS 기능들
    isConnected: yjsCollaboration.isConnected,
    connectionStatus: yjsCollaboration.connectionStatus,
    connect: yjsCollaboration.connect,
    disconnect: yjsCollaboration.disconnect,
    addLine: yjsCollaboration.addLine,
    addShape: yjsCollaboration.addShape,
    addText: yjsCollaboration.addText,
    updateCursor: yjsCollaboration.updateCursor,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};
