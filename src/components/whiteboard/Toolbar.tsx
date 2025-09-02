"use client";

import React from "react";
import { useWhiteboardCanvas } from "@/hooks/useWhiteboard";
import { TOOLS, STROKE_WIDTHS } from "@/lib/constants/tools";
import { Undo, Redo, Save, Upload, Download, Trash2 } from "lucide-react";

export const Toolbar: React.FC = () => {
  const { tools, setTool, setStrokeWidth, undo, redo, clearCanvas } =
    useWhiteboardCanvas();

  return (
    <div className="bg-white border-b border-neutral-200 p-6 flex items-center justify-between shadow-soft">
      <div className="flex items-center space-x-3">
        {/* 도구 버튼들 */}
        {Object.entries(TOOLS).map(([key, tool]) => (
          <button
            key={key}
            onClick={() => setTool(key)}
            className={`tool-btn ${tools.current === key ? "tool-btn-active" : ""}`}
            title={tool.description}
          >
            <span className="text-xl">{tool.icon}</span>
          </button>
        ))}
      </div>

      <div className="flex items-center space-x-6">
        {/* 선 굵기 선택 */}
        <div className="flex items-center space-x-3">
          <span className="text-sm font-medium text-neutral-600">선 굵기:</span>
          <select
            value={tools.strokeWidth}
            onChange={(e) => setStrokeWidth(Number(e.target.value))}
            className="input w-20 text-sm"
          >
            {STROKE_WIDTHS.map((width) => (
              <option key={width} value={width}>
                {width}px
              </option>
            ))}
          </select>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex items-center space-x-2">
          <button onClick={undo} className="tool-btn" title="실행 취소">
            <Undo size={20} />
          </button>
          <button onClick={redo} className="tool-btn" title="다시 실행">
            <Redo size={20} />
          </button>
          <button
            onClick={clearCanvas}
            className="tool-btn text-error-600 hover:bg-error-50 hover:text-error-700"
            title="캔버스 지우기"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* 파일 액션 */}
        <div className="flex items-center space-x-2">
          <button className="tool-btn" title="저장">
            <Save size={20} />
          </button>
          <button className="tool-btn" title="업로드">
            <Upload size={20} />
          </button>
          <button className="tool-btn" title="다운로드">
            <Download size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
