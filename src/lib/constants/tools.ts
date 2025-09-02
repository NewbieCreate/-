import { Tool } from "@/lib/types/whiteboard";

export const TOOLS: Record<
  Tool,
  { name: string; icon: string; description: string }
> = {
  pen: {
    name: "펜",
    icon: "✏️",
    description: "자유롭게 그리기",
  },
  eraser: {
    name: "지우개",
    icon: "🧽",
    description: "그림 지우기",
  },
  hand: {
    name: "손",
    icon: "✋",
    description: "화면 이동 및 선택",
  },
  text: {
    name: "텍스트",
    icon: "T",
    description: "텍스트 추가",
  },
  shape: {
    name: "도형",
    icon: "⬜",
    description: "도형 그리기",
  },
  image: {
    name: "이미지",
    icon: "🖼️",
    description: "이미지 추가",
  },
};

export const STROKE_WIDTHS = [1, 2, 4, 8, 16];

export const DEFAULT_TOOL: Tool = "pen";
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_COLOR = "#000000";
