import React, { useState } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

const calloutTypes = {
  info: { icon: "💡", color: "#3b82f6", bg: "#eff6ff", title: "정보" },
  warning: { icon: "⚠️", color: "#f59e0b", bg: "#fffbeb", title: "경고" },
  error: { icon: "❌", color: "#ef4444", bg: "#fef2f2", title: "오류" },
  success: { icon: "✅", color: "#22c55e", bg: "#f0fdf4", title: "성공" },
  note: { icon: "📝", color: "#6b7280", bg: "#f9fafb", title: "메모" },
};

export const CalloutView = ({ node, updateAttributes }) => {
  const { type, title } = node.attrs;
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);

  const calloutStyle = calloutTypes[type] || calloutTypes.info;

  const handleTitleEdit = () => {
    setIsEditing(true);
  };

  const handleTitleSave = () => {
    updateAttributes({ title: tempTitle });
    setIsEditing(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleTitleSave();
    }
    if (e.key === "Escape") {
      setTempTitle(title);
      setIsEditing(false);
    }
  };

  const handleTypeChange = (newType) => {
    updateAttributes({ 
      type: newType, 
      title: tempTitle || calloutTypes[newType].title 
    });
  };

  return (
    <NodeViewWrapper>
      <div
        style={{
          border: `1px solid ${calloutStyle.color}`,
          borderLeft: `4px solid ${calloutStyle.color}`,
          backgroundColor: calloutStyle.bg,
          borderRadius: "6px",
          padding: "16px",
          margin: "8px 0",
          position: "relative",
        }}
      >
        {/* 헤더 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "8px",
            fontSize: "14px",
            fontWeight: "600",
            color: calloutStyle.color,
          }}
        >
          {/* 타입 선택 드롭다운 */}
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "16px",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {Object.entries(calloutTypes).map(([key, style]) => (
              <option key={key} value={key}>
                {style.icon}
              </option>
            ))}
          </select>

          {/* 제목 편집 */}
          {isEditing ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              style={{
                border: "none",
                background: "transparent",
                fontSize: "14px",
                fontWeight: "600",
                color: calloutStyle.color,
                outline: "none",
                flex: 1,
              }}
            />
          ) : (
            <span
              onClick={handleTitleEdit}
              style={{
                cursor: "pointer",
                flex: 1,
              }}
            >
              {title}
            </span>
          )}
        </div>

        {/* 내용 */}
        <div
          style={{
            color: "#374151",
            lineHeight: "1.5",
          }}
        >
          <NodeViewContent />
        </div>
      </div>
    </NodeViewWrapper>
  );
};