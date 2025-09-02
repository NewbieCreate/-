import { useCallback, useRef, useState } from "react";
import { useWhiteboard } from "@/components/providers/WhiteboardProvider";
import {
  Point,
  Stroke,
  Shape,
  WhiteboardElement,
} from "@/lib/types/whiteboard";
import {
  TOOLS,
  DEFAULT_STROKE_WIDTH,
  DEFAULT_COLOR,
} from "@/lib/constants/tools";
import { smoothStroke, createBoundingBox } from "@/lib/utils/canvas";

export const useWhiteboardCanvas = () => {
  const { state, dispatch } = useWhiteboard();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [elements, setElements] = useState<WhiteboardElement[]>([]);

  const startDrawing = useCallback(
    (point: Point) => {
      if (state.tools.current === "hand") return;

      setIsDrawing(true);
      const stroke: Stroke = {
        id: Date.now().toString(),
        tool: state.tools.current,
        points: [point],
        strokeWidth: state.tools.strokeWidth,
        color: state.tools.color,
        timestamp: Date.now(),
      };
      setCurrentStroke(stroke);
    },
    [state.tools.current, state.tools.strokeWidth, state.tools.color]
  );

  const draw = useCallback(
    (point: Point) => {
      if (!isDrawing || !currentStroke) return;

      setCurrentStroke((prev) =>
        prev
          ? {
              ...prev,
              points: [...prev.points, point],
            }
          : null
      );
    },
    [isDrawing, currentStroke]
  );

  const stopDrawing = useCallback(() => {
    if (!currentStroke) return;

    setIsDrawing(false);

    // 스트로크 스무딩 적용
    const smoothedPoints = smoothStroke(currentStroke.points);
    const finalStroke: Stroke = {
      ...currentStroke,
      points: smoothedPoints,
    };

    setElements((prev) => [...prev, finalStroke]);
    dispatch({ type: "ADD_TO_HISTORY", payload: finalStroke });
    setCurrentStroke(null);
  }, [currentStroke, dispatch]);

  const clearCanvas = useCallback(() => {
    setElements([]);
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      }
    }
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, [dispatch]);

  const setTool = useCallback(
    (tool: string) => {
      if (tool in TOOLS) {
        dispatch({ type: "SET_TOOL", payload: tool as any });
      }
    },
    [dispatch]
  );

  const setStrokeWidth = useCallback(
    (width: number) => {
      dispatch({ type: "SET_STROKE_WIDTH", payload: width });
    },
    [dispatch]
  );

  const setColor = useCallback(
    (color: string) => {
      dispatch({ type: "SET_COLOR", payload: color });
    },
    [dispatch]
  );

  const getBoundingBox = useCallback(() => {
    return createBoundingBox(
      elements.filter(
        (el): el is Stroke | Shape => "points" in el || "startPoint" in el
      )
    );
  }, [elements]);

  return {
    canvasRef,
    isDrawing,
    currentStroke,
    elements,
    startDrawing,
    draw,
    stopDrawing,
    clearCanvas,
    undo,
    redo,
    setTool,
    setStrokeWidth,
    setColor,
    getBoundingBox,
    tools: state.tools,
  };
};
