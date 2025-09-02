"use client";

import React, { useState } from "react";
import { Share2, Copy, Mail, Link, Users, Lock, Globe, Eye, Edit, MessageSquare, X, Check } from "lucide-react";

export const SharePanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [shareLink, setShareLink] = useState(
    "https://figjam-clone.com/board/123"
  );
  const [permissions, setPermissions] = useState<"view" | "edit" | "comment">(
    "view"
  );
  const [inviteEmail, setInviteEmail] = useState("");

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // 복사 성공 알림
      alert("링크가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("링크 복사 실패:", error);
    }
  };

  const handleInviteUser = () => {
    if (!inviteEmail.trim()) return;

    // 사용자 초대 로직
    console.log("사용자 초대:", inviteEmail);
    setInviteEmail("");
  };

  const permissionOptions = [
    {
      value: "view",
      label: "보기만 가능",
      icon: <Eye size={20} />,
      description: "보기만 가능합니다",
      color: "text-neutral-600"
    },
    {
      value: "edit",
      label: "편집 가능",
      icon: <Edit size={20} />,
      description: "보기 및 편집이 가능합니다",
      color: "text-primary-600"
    },
    {
      value: "comment",
      label: "댓글 가능",
      icon: <MessageSquare size={20} />,
      description: "보기, 편집, 댓글이 가능합니다",
      color: "text-success-600"
    },
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-6 right-6 bg-primary-500 text-white p-4 rounded-full shadow-strong hover:bg-primary-600 transition-all duration-200 z-40 hover:scale-110"
        title="공유하기"
      >
        <Share2 size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-strong w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-neutral-800">공유하기</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* 링크 공유 */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <Link size={16} />
              링크로 공유
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="input flex-1 bg-neutral-50 text-neutral-600"
              />
              <button
                onClick={handleCopyLink}
                className="btn btn-secondary btn-md px-3"
                title="링크 복사"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          {/* 권한 설정 */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <Lock size={16} />
              권한 설정
            </h3>
            <div className="space-y-3">
              {permissionOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    permissions === option.value
                      ? "border-primary-500 bg-primary-50 ring-2 ring-primary-100"
                      : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="permissions"
                    value={option.value}
                    checked={permissions === option.value}
                    onChange={(e) => setPermissions(e.target.value as any)}
                    className="w-4 h-4 text-primary-600 border-neutral-300 focus:ring-primary-500"
                  />
                  <div className="flex-1 ml-3">
                    <div className="flex items-center gap-3">
                      <div className={`${option.color}`}>
                        {option.icon}
                      </div>
                      <span className="font-semibold text-neutral-800">
                        {option.label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 사용자 초대 */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3 flex items-center gap-2">
              <Users size={16} />
              사용자 초대
            </h3>
            <div className="flex gap-2">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="input flex-1"
              />
              <button
                onClick={handleInviteUser}
                className="btn btn-primary btn-md px-4"
              >
                초대
              </button>
            </div>
          </div>

          {/* 공유 옵션 */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-neutral-700 mb-4 flex items-center gap-2">
              <Globe size={16} />
              공유 옵션
            </h3>
            <div className="space-y-4">
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" 
                  defaultChecked 
                />
                <span className="ml-3 text-sm text-neutral-700">
                  링크를 가진 모든 사용자가 보기 가능
                </span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" 
                />
                <span className="ml-3 text-sm text-neutral-700">비밀번호 보호</span>
              </label>
              <label className="flex items-center">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-primary-600 bg-neutral-100 border-neutral-300 rounded focus:ring-primary-500" 
                />
                <span className="ml-3 text-sm text-neutral-700">만료일 설정</span>
              </label>
            </div>
          </div>

          {/* 액션 버튼들 */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-secondary btn-md flex-1"
            >
              취소
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="btn btn-primary btn-md flex-1"
            >
              공유하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
