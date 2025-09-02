"use client";

import React from "react";
import { useWhiteboardCanvas } from "@/hooks/useWhiteboard";
import { COLOR_PALETTE } from "@/lib/constants/colors";

export const ColorPalette: React.FC = () => {
  const { tools, setColor } = useWhiteboardCanvas();

  return (
    <div className="space-y-6 p-4">
      <h3 className="text-sm font-semibold text-neutral-800 text-center">색상</h3>

      <div className="grid grid-cols-4 gap-3">
        {COLOR_PALETTE.map((color) => (
          <button
            key={color}
            onClick={() => setColor(color)}
            className={`w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-110 hover:shadow-medium ${
              tools.color === color
                ? "border-neutral-800 scale-110 shadow-medium ring-2 ring-primary-200"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>

      {/* 커스텀 색상 선택 */}
      <div className="space-y-3">
        <label className="text-xs font-medium text-neutral-600 text-center block">
          커스텀 색상
        </label>
        <div className="flex justify-center">
          <input
            type="color"
            value={tools.color}
            onChange={(e) => setColor(e.target.value)}
            className="w-12 h-12 rounded-xl border-2 border-neutral-300 cursor-pointer hover:border-neutral-400 transition-colors shadow-soft"
          />
        </div>
      </div>

      {/* 색상 히스토리 */}
      <div className="space-y-3">
        <h4 className="text-xs font-medium text-neutral-600 text-center">최근 사용</h4>
        <div className="grid grid-cols-4 gap-2">
          {COLOR_PALETTE.slice(0, 8).map((color) => (
            <button
              key={color}
              onClick={() => setColor(color)}
              className="w-8 h-8 rounded-lg border border-neutral-300 hover:scale-110 hover:border-neutral-400 transition-all duration-200 shadow-soft"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
