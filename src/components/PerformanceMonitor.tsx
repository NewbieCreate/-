"use client";

import { useEffect } from "react";

// 성능 측정 함수 (간단한 버전)
const reportWebVitals = (onPerfEntry?: (metric: unknown) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // 간단한 성능 측정 (Web Vitals 대신 기본 성능 API 사용)
    try {
      // 페이지 로드 시간 측정
      const loadTime = performance.now();
      onPerfEntry({ name: "page-load", value: loadTime });

      // 메모리 사용량 측정 (가능한 경우)
      if ("memory" in performance) {
        const memory = (performance as Record<string, unknown>)
          .memory as Record<string, number>;
        onPerfEntry({ name: "memory-usage", value: memory.usedJSHeapSize });
      }
    } catch (error) {
      console.warn("성능 측정 중 오류:", error);
    }
  }
};

export default function PerformanceMonitor() {
  // 성능 측정 시작 (개발 환경에서만)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      reportWebVitals(console.log);
    }
  }, []);

  return null; // 이 컴포넌트는 UI를 렌더링하지 않음
}
