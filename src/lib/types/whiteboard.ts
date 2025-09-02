export type Tool = "pen" | "eraser" | "hand" | "text" | "shape" | "image";

export interface ToolState {
  current: Tool;
  strokeWidth: number;
  color: string;
}

export interface Point {
  x: number;
  y: number;
}

export interface Stroke {
  id: string;
  tool: Tool;
  points: Point[];
  strokeWidth: number;
  color: string;
  timestamp: number;
}

export interface Shape {
  id: string;
  type: "rectangle" | "circle" | "triangle" | "line";
  startPoint: Point;
  endPoint: Point;
  strokeWidth: number;
  color: string;
  timestamp: number;
}

export interface TextElement {
  id: string;
  text: string;
  position: Point;
  fontSize: number;
  color: string;
  timestamp: number;
}

export interface ImageElement {
  id: string;
  src: string;
  position: Point;
  width: number;
  height: number;
  timestamp: number;
}

export type WhiteboardElement = Stroke | Shape | TextElement | ImageElement;

export interface WhiteboardState {
  tools: ToolState;
  history: {
    past: WhiteboardElement[];
    future: WhiteboardElement[];
  };
  zoom: number;
  pan: Point;
}

export type WhiteboardAction =
  | { type: "SET_TOOL"; payload: Tool }
  | { type: "SET_STROKE_WIDTH"; payload: number }
  | { type: "SET_COLOR"; payload: string }
  | { type: "SET_ZOOM"; payload: number }
  | { type: "SET_PAN"; payload: Point }
  | { type: "ADD_TO_HISTORY"; payload: WhiteboardElement }
  | { type: "UNDO" }
  | { type: "REDO" };
