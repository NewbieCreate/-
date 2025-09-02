"use client";

import React, { useState } from "react";
import { useCollaborationSession } from "@/hooks/useCollaboration";
import { Comment } from "@/lib/types/collaboration";
import { MessageSquare, Reply, Check, X } from "lucide-react";

export const CommentSystem: React.FC = () => {
  const { comments, addCommentToBoard } = useCollaborationSession();
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleAddComment = () => {
    if (!newCommentText.trim()) return;

    // 실제로는 마우스 위치나 선택된 요소 위치를 사용해야 함
    const position = { x: 100, y: 100 };
    addCommentToBoard(newCommentText, position, "current-user-id");

    setNewCommentText("");
    setIsAddingComment(false);
  };

  const handleReply = (commentId: string) => {
    setReplyTo(replyTo === commentId ? null : commentId);
  };

  const handleResolveComment = (commentId: string) => {
    // 댓글 해결 로직
    console.log("댓글 해결:", commentId);
  };

  const handleDeleteComment = (commentId: string) => {
    // 댓글 삭제 로직
    console.log("댓글 삭제:", commentId);
  };

  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-40">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <MessageSquare size={20} className="mr-2" />
            댓글 ({comments.length})
          </h3>
          <button
            onClick={() => setIsAddingComment(!isAddingComment)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {isAddingComment ? "취소" : "댓글 추가"}
          </button>
        </div>

        {/* 새 댓글 입력 */}
        {isAddingComment && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="댓글을 입력하세요..."
              className="w-full p-2 border border-gray-300 rounded text-sm resize-none mb-2"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={handleAddComment}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                추가
              </button>
              <button
                onClick={() => setIsAddingComment(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                취소
              </button>
            </div>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              아직 댓글이 없습니다
            </p>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onReply={() => handleReply(comment.id)}
                onResolve={() => handleResolveComment(comment.id)}
                onDelete={() => handleDeleteComment(comment.id)}
                isReplying={replyTo === comment.id}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

interface CommentItemProps {
  comment: Comment;
  onReply: () => void;
  onResolve: () => void;
  onDelete: () => void;
  isReplying: boolean;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onReply,
  onResolve,
  onDelete,
  isReplying,
}) => {
  const [replyText, setReplyText] = useState("");

  const handleSubmitReply = () => {
    if (!replyText.trim()) return;
    // 답글 추가 로직
    setReplyText("");
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      {/* 댓글 헤더 */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-6 h-6 rounded-full object-cover"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              {comment.author.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-sm font-medium text-gray-800">
            {comment.author.name}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(comment.createdAt).toLocaleTimeString()}
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            onClick={onResolve}
            className="p-1 text-green-600 hover:text-green-700"
            title="해결됨으로 표시"
          >
            <Check size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-700"
            title="댓글 삭제"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 댓글 내용 */}
      <p className="text-sm text-gray-700 mb-2">{comment.text}</p>

      {/* 댓글 액션 */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onReply}
          className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
        >
          <Reply size={14} className="mr-1" />
          답글
        </button>
        {comment.replies.length > 0 && (
          <span className="text-xs text-gray-500">
            답글 {comment.replies.length}개
          </span>
        )}
      </div>

      {/* 답글 입력 */}
      {isReplying && (
        <div className="mt-3 p-2 bg-white rounded border border-gray-200">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="답글을 입력하세요..."
            className="w-full p-2 border border-gray-300 rounded text-sm resize-none mb-2"
            rows={2}
          />
          <div className="flex space-x-2">
            <button
              onClick={handleSubmitReply}
              className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
            >
              답글 추가
            </button>
            <button
              onClick={() => setReplyText("")}
              className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* 답글 목록 */}
      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-2">
          {comment.replies.map((reply) => (
            <div
              key={reply.id}
              className="ml-4 p-2 bg-white rounded border-l-2 border-blue-200"
            >
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-xs font-medium text-gray-800">
                  {reply.author.name}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(reply.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-xs text-gray-700">{reply.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
