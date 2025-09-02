"use client";

import React, { useState } from "react";
import { useWhiteboardCanvas } from "@/hooks/useWhiteboard";
import { useCollaborationSession } from "@/hooks/useCollaboration";
import { Users, MessageSquare, Share2, Settings, ClipboardList, UserCheck, Cog } from "lucide-react";

export const ActionPanel: React.FC = () => {
  const { elements, getBoundingBox } = useWhiteboardCanvas();
  const { users, comments, addCommentToBoard } = useCollaborationSession();
  const [activeTab, setActiveTab] = useState<
    "elements" | "collaboration" | "settings"
  >("elements");

  const tabs = [
    { id: "elements", label: "요소", icon: <ClipboardList size={16} /> },
    { id: "collaboration", label: "협업", icon: <UserCheck size={16} /> },
    { id: "settings", label: "설정", icon: <Cog size={16} /> },
  ];

  const renderElementsTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-800">캔버스 요소</h3>
        <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          {elements.length}개
        </span>
      </div>

      <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-thin">
        {elements.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-3 bg-neutral-100 rounded-full flex items-center justify-center">
              <ClipboardList size={24} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">아직 그린 요소가 없습니다.</p>
          </div>
        ) : (
          elements.map((element, index) => (
            <div
              key={element.id}
              className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg border border-neutral-200 hover:bg-neutral-100 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-neutral-700">
                  {index + 1}. {"points" in element ? element.tool : "도형"}
                </span>
              </div>
              <span className="text-xs text-neutral-500 bg-white px-2 py-1 rounded-md">
                {new Date(element.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))
        )}
      </div>

      {elements.length > 0 && (
        <div className="pt-4 border-t border-neutral-200">
          <button className="btn btn-primary btn-md w-full">
            모든 요소 선택
          </button>
        </div>
      )}
    </div>
  );

  const renderCollaborationTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-neutral-800">협업</h3>
        <span className="text-sm font-medium text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full">
          {users.length}명 참여
        </span>
      </div>

      {/* 참여자 목록 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
          <Users size={16} />
          참여자
        </h4>
        {users.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 bg-neutral-100 rounded-full flex items-center justify-center">
              <Users size={20} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">참여자가 없습니다.</p>
          </div>
        ) : (
          users.map((user: any) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: user.color }}
              />
              <span className="text-sm font-medium text-neutral-700">{user.name}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  user.isOnline
                    ? "bg-success-100 text-success-700"
                    : "bg-neutral-100 text-neutral-600"
                }`}
              >
                {user.isOnline ? "온라인" : "오프라인"}
              </span>
            </div>
          ))
        )}
      </div>

      {/* 댓글 목록 */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
          <MessageSquare size={16} />
          댓글
        </h4>
        {comments.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 mx-auto mb-2 bg-neutral-100 rounded-full flex items-center justify-center">
              <MessageSquare size={20} className="text-neutral-400" />
            </div>
            <p className="text-neutral-500 text-sm">댓글이 없습니다.</p>
          </div>
        ) : (
          comments.map((comment: any) => (
            <div key={comment.id} className="p-3 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs font-medium text-neutral-700">
                  {comment.author.name}
                </span>
                <span className="text-xs text-neutral-500 bg-white px-2 py-1 rounded-md">
                  {new Date(comment.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-neutral-700">{comment.text}</p>
            </div>
          ))
        )}
      </div>

      {/* 새 댓글 추가 */}
      <div className="pt-4 border-t border-neutral-200">
        <textarea
          placeholder="댓글을 입력하세요..."
          className="input resize-none"
          rows={3}
        />
        <button className="btn btn-primary btn-md w-full mt-3">
          댓글 추가
        </button>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="font-semibold text-neutral-800">설정</h3>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-2">
            그리드 크기
          </label>
          <select className="input w-full">
            <option value="10">10px</option>
            <option value="20">20px</option>
            <option value="50">50px</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-2">자동 저장</label>
          <div className="flex items-center">
            <input type="checkbox" className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" defaultChecked />
            <span className="ml-2 text-sm text-neutral-600">활성화</span>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-neutral-700 block mb-2">협업 알림</label>
          <div className="space-y-2">
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" defaultChecked />
              <span className="ml-2 text-sm text-neutral-600">새 참여자</span>
            </div>
            <div className="flex items-center">
              <input type="checkbox" className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" defaultChecked />
              <span className="ml-2 text-sm text-neutral-600">새 댓글</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* 탭 네비게이션 */}
      <div className="flex border-b border-neutral-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? "border-primary-500 text-primary-600 bg-primary-50"
                : "border-transparent text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* 탭 내용 */}
      <div className="flex-1 overflow-y-auto px-4 scrollbar-thin">
        {activeTab === "elements" && renderElementsTab()}
        {activeTab === "collaboration" && renderCollaborationTab()}
        {activeTab === "settings" && renderSettingsTab()}
      </div>
    </div>
  );
};
