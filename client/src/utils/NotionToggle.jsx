import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState, useEffect } from "react";

// 노션 스타일 토글 컴포넌트
const NotionToggleComponent = ({ node, updateAttributes, editor, getPos }) => {
  const [isOpen, setIsOpen] = useState(node.attrs.isOpen ?? true);

  // 상태 변경을 노드 속성에 동기화
  useEffect(() => {
    if (node.attrs.isOpen !== isOpen) {
      updateAttributes({ isOpen });
    }
  }, [isOpen, node.attrs.isOpen, updateAttributes]);

  // 토글 버튼 클릭
  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <NodeViewWrapper className={`notion-toggle-wrapper ${isOpen ? 'open' : 'closed'}`}>
      {/* 토글 헤더 영역 - 화살표만 별도 처리 */}
      <div className="notion-toggle-header">
        <button
          className={`notion-toggle-arrow ${isOpen ? "open" : ""}`}
          onClick={toggleOpen}
          onMouseDown={(e) => e.stopPropagation()}
          type="button"
          contentEditable={false}
        >
          ▶
        </button>
      </div>
      
      {/* 모든 내용을 TipTap으로 렌더링 - CSS로 제목/내용 분리 */}
      <div className="notion-toggle-content-wrapper">
        <NodeViewContent />
      </div>
    </NodeViewWrapper>
  );
};

// 노션 스타일 토글 노드 정의
export const NotionToggle = Node.create({
  name: "notionToggle",
  group: "block",
  content: "block+", // 제목 문단 + 내용 블록들
  defining: true,
  isolating: true,

  addAttributes() {
    return {
      isOpen: {
        default: true,
        parseHTML: (element) => {
          const isOpen = element.getAttribute("data-is-open");
          return isOpen === "false" ? false : true;
        },
        renderHTML: (attributes) => {
          return {
            "data-is-open": attributes.isOpen,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="notion-toggle"]',
        getAttrs: (element) => ({
          isOpen: element.getAttribute("data-is-open") !== "false",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "notion-toggle",
        "data-is-open": node.attrs.isOpen,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NotionToggleComponent);
  },

  // > 입력 시 토글 생성
  addInputRules() {
    return [
      {
        find: /^>\s(.*)$/,
        handler: ({ state, range, match }) => {
          const { tr, schema } = state;
          const { $from } = state.selection;
          
          // 매칭된 텍스트 (> 이후의 텍스트)
          const titleText = match[1] || "";
          console.log("토글 생성 - 제목:", titleText);

          // 현재 문단의 범위
          const nodeStart = $from.start($from.depth);
          const nodeEnd = $from.end($from.depth);
          
          // 제목 문단 생성 (첫 번째 자식)
          const titleParagraph = schema.nodes.paragraph.create(
            { class: "notion-toggle-title" },
            titleText ? schema.text(titleText) : undefined
          );
          
          // 빈 내용 문단 생성 (두 번째 자식)
          const contentParagraph = schema.nodes.paragraph.create();
          
          // 토글 노드 생성 (제목 문단 + 내용 문단)
          const toggleNode = this.type.create(
            { isOpen: true },
            [titleParagraph, contentParagraph]
          );

          console.log("생성된 토글 노드:", toggleNode);

          // 문단을 토글로 교체
          tr.replaceWith(nodeStart, nodeEnd, toggleNode);
          
          // 제목이 있으면 내용으로, 없으면 제목으로 커서 이동
          const toggleStart = nodeStart;
          let targetPos;
          
          if (titleText) {
            // 제목이 있으면 내용 문단으로 이동
            targetPos = toggleStart + titleParagraph.nodeSize + 1;
          } else {
            // 제목이 없으면 제목 문단으로 이동
            targetPos = toggleStart + 1;
          }
          
          console.log("커서 이동 위치:", targetPos);
          tr.setSelection(state.selection.constructor.near(tr.doc.resolve(targetPos)));
          
          return tr;
        },
      },
    ];
  },

  addCommands() {
    return {
      setNotionToggle:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },

      toggleNotionToggle:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;

          // 현재 토글 노드 찾기
          let toggleNode = null;
          let togglePos = null;

          for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === "notionToggle") {
              toggleNode = node;
              togglePos = $from.start(depth) - 1;
              break;
            }
          }

          if (!toggleNode) return false;

          if (dispatch) {
            const tr = state.tr.setNodeMarkup(togglePos, null, {
              ...toggleNode.attrs,
              isOpen: !toggleNode.attrs.isOpen,
            });
            dispatch(tr);
          }

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      // Cmd/Ctrl + Enter로 토글 상태 변경
      "Mod-Enter": () => this.editor.commands.toggleNotionToggle(),

      // 방향키 네비게이션 - 제목과 내용 간 이동
      ArrowDown: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // 토글 내부에 있는지 확인
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === "notionToggle") {
            // 첫 번째 문단(제목)에서 아래 방향키 - 두 번째 문단(내용)으로 이동
            const currentChild = $from.node($from.depth);
            const toggleStart = $from.start(depth);
            
            // 현재 위치가 첫 번째 자식(제목)이고 커서가 끝에 있으면
            if ($from.parentOffset === currentChild.content.size) {
              const firstChild = node.firstChild;
              if (firstChild && currentChild === firstChild) {
                const secondChildPos = toggleStart + firstChild.nodeSize + 1;
                return editor.commands.setTextSelection(secondChildPos);
              }
            }
            break;
          }
        }
        
        return false;
      },

      ArrowUp: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // 토글 내부에 있는지 확인
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === "notionToggle") {
            // 두 번째 문단(내용)에서 위 방향키 - 첫 번째 문단(제목)으로 이동
            const currentChild = $from.node($from.depth);
            const toggleStart = $from.start(depth);
            
            // 현재 위치가 두 번째 자식이고 커서가 시작에 있으면
            if ($from.parentOffset === 0) {
              const firstChild = node.firstChild;
              const secondChild = node.maybeChild(1);
              if (secondChild && currentChild === secondChild) {
                const firstChildEndPos = toggleStart + firstChild.nodeSize;
                return editor.commands.setTextSelection(firstChildEndPos);
              }
            }
            break;
          }
        }
        
        return false;
      },

      // 토글 내에서 Backspace 처리
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection } = state;
        const { $from } = selection;

        // 커서가 문단 시작에 있고, 토글 내부에 있을 때
        if ($from.parentOffset === 0) {
          for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === "notionToggle") {
              // 첫 번째 문단(제목)이 비어있으면 토글을 일반 문단으로 변경
              const firstChild = node.firstChild;
              const currentChild = $from.node($from.depth);
              
              if (firstChild && currentChild === firstChild && firstChild.content.size === 0) {
                const togglePos = $from.start(depth) - 1;
                return editor.commands.setTextSelection(togglePos)
                  .setNode("paragraph");
              }
              break;
            }
          }
        }

        return false;
      },
    };
  },
});