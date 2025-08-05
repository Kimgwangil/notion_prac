import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const GridColumnsView = ({ node }) => {
  const columnCount = node.content.size;
  console.log("GridColumnsView 렌더링됨 - columnCount:", columnCount, "node:", node);
  console.log("Grid 스타일:", `repeat(${columnCount}, 1fr)`);
  
  return (
    <NodeViewWrapper 
      className="grid-columns-container"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: '12px',
        margin: '16px 0',
        minHeight: '120px',
        border: '2px solid #3b82f6',
        borderRadius: '6px',
        padding: '12px',
        backgroundColor: '#f0f9ff',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      <NodeViewContent />
    </NodeViewWrapper>
  );
};