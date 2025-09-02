import { useCallback, useEffect, useState } from "react";
import { useCollaborationContext } from "@/components/providers/CollaborationProvider";
import {
  CollaborationUser,
  Comment,
  UserCursor,
} from "@/lib/types/collaboration";

export const useCollaborationSession = () => {
  const {
    users,
    comments,
    addUser,
    removeUser,
    addComment,
    removeComment,
    updateUserPosition,
  } = useCollaborationContext();
  const [sessionId, setSessionId] = useState<string>("");
  const [isConnected, setIsConnected] = useState(false);

  const joinSession = useCallback(
    (sessionId: string, user: Omit<CollaborationUser, "id">) => {
      const newUser: CollaborationUser = {
        ...user,
        id: Date.now().toString(),
      };
      addUser(newUser);
      setSessionId(sessionId);
      setIsConnected(true);
      return newUser;
    },
    [addUser]
  );

  const leaveSession = useCallback(
    (userId: string) => {
      removeUser(userId);
      setIsConnected(false);
    },
    [removeUser]
  );

  const addCommentToBoard = useCallback(
    (text: string, position: { x: number; y: number }, authorId: string) => {
      const comment: Comment = {
        id: Date.now().toString(),
        text,
        position,
        author: {
          id: authorId,
          name: users.find((u) => u.id === authorId)?.name || "Unknown",
          avatar: users.find((u) => u.id === authorId)?.avatar,
        },
        createdAt: new Date(),
        replies: [],
        isResolved: false,
      };
      addComment(comment);
    },
    [addComment, users]
  );

  const resolveComment = useCallback((commentId: string) => {
    // 댓글 해결 로직
  }, []);

  const updateCursorPosition = useCallback(
    (userId: string, x: number, y: number) => {
      updateUserPosition(userId, x, y);
    },
    [updateUserPosition]
  );

  return {
    sessionId,
    isConnected,
    users,
    comments,
    joinSession,
    leaveSession,
    addCommentToBoard,
    resolveComment,
    updateCursorPosition,
  };
};
