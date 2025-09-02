"use client";

import React from "react";
import { FigJamWhiteboard } from "@/components/whiteboard";
import { WebRTCWrapper } from "@/components/communication";
import { CommentSystem, SharePanel } from "@/components/collaboration";
import { StatusBar } from "@/components/layout";

export default function Home() {
  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* 헤더 - 최소화된 디자인 */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 bg-white/95 backdrop-blur-sm shadow-sm z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-neutral-800">
            Untitled Jam
          </h1>

          {/* 저장 상태 - 간단하게 */}
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-700 rounded-md">
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
              </svg>
              <span className="text-xs">Saved</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* 공유 버튼 */}
          <button className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-blue-600 transition-colors">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 256 256">
              <path d="M216,88a32,32,0,0,0-32-32c-1.2,0-2.39.08-3.56.21L148.83,28.71A8,8,0,0,0,144,24H56A16,16,0,0,0,40,40V216a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88ZM160,208H72V48h72V88a16,16,0,0,0,16,16h40V208Z"></path>
            </svg>
            <span>Share</span>
          </button>
        </div>
      </header>

      {/* 메인 콘텐츠 - 화이트보드 중심 */}
      <main className="flex-1 flex overflow-hidden">
        {/* 왼쪽 도구 사이드바 - 주요 도구 선택 */}
        <aside className="w-[70px] h-[296px] bg-white rounded-[10px] shadow-lg flex flex-col items-center justify-between p-[18px_10px] shrink-0 ml-4 mt-4">
          {/* 펜 도구 - 선택된 상태 */}
          <button className="w-[50px] h-[50px] flex items-center justify-center bg-[#ebf0ff] rounded-[5px] transition-all duration-200">
            <svg
              className="w-6 h-6 text-blue-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M169.64,134.33l44.77-19.46A16,16,0,0,0,213,85.07L52.92,32.8A16,16,0,0,0,32.8,52.92L85.07,213a15.83,15.83,0,0,0,14.41,11l.79,0a15.83,15.83,0,0,0,14.6-9.59h0l19.46-44.77L184,219.31a16,16,0,0,0,22.63,0l12.68-12.68a16,16,0,0,0,0-22.63Zm-69.48,73.76.06-.05Zm95.15-.09-49.66-49.67a16,16,0,0,0-26,4.94l-19.42,44.65L48,48l159.87,52.21-44.64,19.41a16,16,0,0,0-4.94,26L208,195.31ZM88,24V16a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0ZM8,96a8,8,0,0,1,8-8h8a8,8,0,0,1,0,16H16A8,8,0,0,1,8,96Zm112.85-67.58l8-16a8,8,0,0,1,14.31,7.16l-8,16a8,8,0,1,1-14.31-7.16Zm-81.69,96a8,8,0,0,1-3.58,10.74l-16,8a8,8,0,0,1-7.16-14.31l16-8A8,8,0,0,1,39.16,124.42Z"></path>
            </svg>
          </button>

          {/* 지우개 도구 */}
          <button className="w-[50px] h-[50px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40ZM200,200H56V56H200V200ZM184,184H72V72H184V184Z"></path>
            </svg>
          </button>

          {/* 실행 취소 */}
          <button className="w-[50px] h-[50px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,128Z"></path>
            </svg>
          </button>

          {/* 다시 실행 */}
          <button className="w-[50px] h-[50px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
            <svg
              className="w-6 h-6 text-neutral-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-88a8,8,0,0,1-8,8H96a8,8,0,0,1,0-16h64A8,8,0,0,1,168,128Z"></path>
            </svg>
          </button>
        </aside>

        {/* 펜 도구 옵션 사이드바 - 팝업 형태 */}
        <aside className="w-[54px] h-[388px] bg-white rounded-[5px] shadow-lg ml-[25px] mt-0 p-[10px_7px] shrink-0 relative">
          {/* 화살표 포인터 */}
          <div className="absolute left-0 top-[13%] w-0 h-0 border-[17px] border-transparent border-b-[10px] border-t-[10px] border-r-white border-l-0 -mt-[17px] -ml-[17px]"></div>

          {/* 선 굵기/스타일 옵션 */}
          <div className="flex flex-col justify-between items-center border-b border-[#d7d7d7] pb-[14px] w-[36px] h-[124px]">
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-full h-[2px] bg-neutral-400 rounded-full"></div>
            </button>
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-full h-[4px] bg-neutral-400 rounded-full"></div>
            </button>
            <button className="w-[30px] h-[30px] flex items-center justify-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-full h-[6px] bg-neutral-600 rounded-full"></div>
            </button>
          </div>

          {/* 색상 선택 옵션 */}
          <div className="flex flex-col items-center justify-between w-[36px] h-[244px] pt-[19px] pb-[5px]">
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-black rounded-full"></div>
            </div>
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-white rounded-full border border-[#646464]"></div>
            </div>
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-[#CF3F41] rounded-full"></div>
            </div>
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-[#2D66CB] rounded-full"></div>
            </div>
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-[#E6B649] rounded-full"></div>
            </div>
            <div className="w-[30px] h-[30px] flex justify-center items-center hover:bg-[#ededed] rounded-[5px] transition-all duration-200">
              <div className="w-[20px] h-[20px] bg-[#479734] rounded-full"></div>
            </div>
          </div>
        </aside>

        {/* 메인 화이트보드 영역 */}
        <div className="flex-1 grid-bg">
          <FigJamWhiteboard />
        </div>

        {/* 우측 정보 패널 - 고정된 위치 */}
        <aside className="w-64 bg-white border-l border-neutral-200 shadow-sm p-4 shrink-0">
          {/* 상태 정보 */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-neutral-600">연결 안됨</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,56a72,72,0,1,0,72,72A72.08,72.08,0,0,0,128,56Zm0,128a56,56,0,1,1,56-56A56.06,56.06,0,0,1,128,184Z"></path>
              </svg>
              <span className="text-neutral-600">1명 참여</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg
                className="w-4 h-4 text-neutral-500"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm16-40a8,8,0,0,1-8,8,64.07,64.07,0,0,1-64-64,8,8,0,0,1,16,0,48.05,48.05,0,0,0,48,48A8,8,0,0,1,144,176Z"></path>
              </svg>
              <span className="text-neutral-600">댓글 0개</span>
            </div>
          </div>

          {/* 버전 정보 */}
          <div className="text-xs text-neutral-500 border-t border-neutral-200 pt-3">
            FigJam Clone v1.0.0
          </div>
        </aside>
      </main>

      {/* 하단 푸터 - 투명하게 */}
      <footer className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 p-2 bg-white/80 backdrop-blur-sm border border-neutral-200/50 rounded-xl shadow-lg z-10">
        {/* 줌 컨트롤 */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-neutral-200/50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
            <svg
              className="w-4 h-4 text-neutral-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
          <button className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-neutral-200/50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
            <svg
              className="w-4 h-4 text-neutral-700"
              fill="currentColor"
              viewBox="0 0 256 256"
            >
              <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z"></path>
            </svg>
          </button>
        </div>

        <div className="h-6 w-px bg-neutral-200/50"></div>
        <span className="text-sm font-medium text-neutral-700 px-2">100%</span>
        <div className="h-6 w-px bg-neutral-200/50"></div>

        {/* 확대/축소 버튼 */}
        <button className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-neutral-200/50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
          <svg
            className="w-4 h-4 text-neutral-700"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,157.66a8,8,0,0,1-11.32,0L128,147.31l-34.34,34.35a8,8,0,0,1-11.32-11.32l40-40a8,8,0,0,1,11.32,0l40,40A8,8,0,0,1,173.66,181.66ZM93.66,85.66a8,8,0,0,1,11.32,0L128,108.69l22.34-23.03a8,8,0,0,1,11.32,11.32l-28,28a8,8,0,0,1-11.32,0l-32-32A8,8,0,0,1,93.66,85.66Z"></path>
          </svg>
        </button>

        {/* 도움말 버튼 */}
        <button className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-white border border-neutral-200/50 rounded-lg shadow-sm transition-all duration-200 hover:shadow-md">
          <svg
            className="w-4 h-4 text-neutral-700"
            fill="currentColor"
            viewBox="0 0 256 256"
          >
            <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
          </svg>
        </button>
      </footer>

      {/* 상태 바 - 투명하게 */}
      <StatusBar />

      {/* 오버레이 컴포넌트들 */}
      <WebRTCWrapper />
      <CommentSystem />
      <SharePanel />
    </div>
  );
}
