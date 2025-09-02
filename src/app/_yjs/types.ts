export interface SharedDocument {
  id: string;
  name: string;
  users: any;
  lines: any;
  shapes: any;
  texts: any;
  pdfImage?: PdfImageData;
}

export interface PdfImageData {
  id: string;
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export interface UserData {
  id: string;
  name: string;
  color: string;
  cursor: { x: number; y: number };
  lastSeen: number;
}

export interface LineData {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth: number;
  opacity: number;
  globalCompositeOperation: string;
  mode: string;
}

export interface ShapeData {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
}

export interface TextData {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  color: string;
}

export const createSharedDocument = (
  id: string,
  name: string
): SharedDocument => ({
  id,
  name,
  users: new Map(),
  lines: [],
  shapes: [],
  texts: [],
});
