import { useCallback, useRef } from "react";
import { useWhiteboard } from "@/components/providers/WhiteboardProvider";
import { WhiteboardElement } from "@/lib/types/whiteboard";

export const useHistory = () => {
  const { state, dispatch } = useWhiteboard();
  const historyRef = useRef<WhiteboardElement[]>([]);

  const addToHistory = useCallback(
    (element: WhiteboardElement) => {
      historyRef.current.push(element);
      dispatch({ type: "ADD_TO_HISTORY", payload: element });
    },
    [dispatch]
  );

  const undo = useCallback(() => {
    if (state.history.past.length === 0) return null;

    const lastElement = state.history.past[state.history.past.length - 1];
    dispatch({ type: "UNDO" });
    return lastElement;
  }, [state.history.past.length, dispatch]);

  const redo = useCallback(() => {
    if (state.history.future.length === 0) return null;

    const nextElement = state.history.future[0];
    dispatch({ type: "REDO" });
    return nextElement;
  }, [state.history.future.length, dispatch]);

  const canUndo = state.history.past.length > 0;
  const canRedo = state.history.future.length > 0;

  const clearHistory = useCallback(() => {
    historyRef.current = [];
    // 히스토리 초기화 로직
  }, []);

  const getHistorySnapshot = useCallback(() => {
    return [...historyRef.current];
  }, []);

  const restoreFromSnapshot = useCallback((snapshot: WhiteboardElement[]) => {
    historyRef.current = [...snapshot];
    // 스냅샷에서 복원하는 로직
  }, []);

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    getHistorySnapshot,
    restoreFromSnapshot,
    history: state.history,
  };
};
