import React from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

export const GridColumnView = () => {
  console.log("GridColumnView 렌더링됨");
  
  return (
    <NodeViewWrapper className="grid-column-item">
      <NodeViewContent />
    </NodeViewWrapper>
  );
};