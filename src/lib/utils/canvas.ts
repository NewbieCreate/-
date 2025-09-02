import { Point, Stroke, Shape } from "@/lib/types/whiteboard";

export const calculateDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
};

export const calculateMidpoint = (p1: Point, p2: Point): Point => {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
};

export const isPointInBounds = (
  point: Point,
  bounds: { x: number; y: number; width: number; height: number }
): boolean => {
  return (
    point.x >= bounds.x &&
    point.x <= bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y <= bounds.y + bounds.height
  );
};

export const smoothStroke = (points: Point[]): Point[] => {
  if (points.length < 3) return points;

  const smoothed: Point[] = [];
  for (let i = 0; i < points.length; i++) {
    if (i === 0 || i === points.length - 1) {
      smoothed.push(points[i]);
    } else {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      smoothed.push({
        x: (prev.x + curr.x + next.x) / 3,
        y: (prev.y + curr.y + next.y) / 3,
      });
    }
  }

  return smoothed;
};

export const createBoundingBox = (
  elements: (Stroke | Shape)[]
): { x: number; y: number; width: number; height: number } | null => {
  if (elements.length === 0) return null;

  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  elements.forEach((element) => {
    if ("points" in element) {
      // Stroke
      element.points.forEach((point) => {
        minX = Math.min(minX, point.x);
        minY = Math.min(minY, point.y);
        maxX = Math.max(maxX, point.x);
        maxY = Math.max(maxY, point.y);
      });
    } else {
      // Shape
      minX = Math.min(minX, element.startPoint.x, element.endPoint.x);
      minY = Math.min(minY, element.startPoint.y, element.endPoint.y);
      maxX = Math.max(maxX, element.startPoint.x, element.endPoint.x);
      maxY = Math.max(maxY, element.startPoint.y, element.endPoint.y);
    }
  });

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
};

export const applyTransform = (
  point: Point,
  transform: { scale: number; offsetX: number; offsetY: number }
): Point => {
  return {
    x: point.x * transform.scale + transform.offsetX,
    y: point.y * transform.scale + transform.offsetY,
  };
};
