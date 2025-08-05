// client/src/utils/EnhancedToggle.js
import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import React, { useState, useEffect, useRef } from "react";

// 토글 컴포넌트
const ToggleComponent = ({ node, updateAttributes, editor }) => {
  console.log("editor", editor);
  console.log("node", node);
  console.log("updateAttributes", updateAttributes);
  const [isOpen, setIsOpen] = useState(node.attrs.isOpen ?? true);
  const [title, setTitle] = useState(node.attrs.title || "");

  const titleRef = useRef(null);

  // 노드 속성이 변경되면 상태 업데이트
  useEffect(() => {
    setIsOpen(node.attrs.isOpen ?? true);
  }, [node.attrs.isOpen]);

  useEffect(() => {
    const newTitle = node.attrs.title || "";
    if (newTitle !== title) {
      setTitle(newTitle);
      console.log("토글 제목 업데이트:", newTitle);
    }
  }, [node.attrs.title]);

  // 상태 변경을 노드 속성에 동기화
  useEffect(() => {
    if (node.attrs.isOpen !== isOpen) {
      updateAttributes({ isOpen });
    }
  }, [isOpen, node.attrs.isOpen, updateAttributes]);

  useEffect(() => {
    if (node.attrs.title !== title && title !== "") {
      updateAttributes({ title });
    }
  }, [title, node.attrs.title, updateAttributes]);

  // 토글 버튼만 클릭했을 때 접기/펼치기
  const toggleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("Enter 키 눌림");
      e.preventDefault();
      console.log("editor.commands", editor.commands);
      // 토글 내용 부분으로 포커스 이동
      setTimeout(() => {
        editor.commands.focus();
      }, 10);
    } else if (e.key === "ArrowDown") {
      console.log("ArrowDown 키 눌림");
      e.preventDefault();
      // 토글 내용 부분으로 포커스 이동
      setTimeout(() => {
        editor.commands.focus();
      }, 10);
    }
  };

  const handleContentKeyDown = (e) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();

      const { state, view } = editor;
      const { $from } = state.selection;

      // 현재 토글 노드 탐색
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        if (node.type.name === "toggle") {
          const pos = $from.start(depth);

          // TipTap selection 이동
          view.dispatch(state.tr.setSelection(state.selection.constructor.near(state.doc.resolve(pos))));
          break;
        }
      }

      // React input 포커스
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
          titleRef.current.setSelectionRange(titleRef.current.value.length, titleRef.current.value.length);
        }
      }, 10);
    }
  };

  return (
    <NodeViewWrapper
      className="toggle-block"
      onClick={(e) => {
        // input 클릭이 아닌 경우에만 로그
        if (e.target.tagName !== "INPUT") {
          console.log("NodeViewWrapper 클릭됨", e.target);
        }
      }}
    >
      <div
        className="toggle-header"
        onClick={(e) => {
          // input 클릭이 아닌 경우에만 로그
          if (e.target.tagName !== "INPUT") {
            console.log("toggle-header 클릭됨", e.target);
          }
        }}
      >
        {/* 토글 버튼 (화살표) - 클릭 시에만 토글 */}
        <button
          className={`toggle-arrow ${isOpen ? "open" : ""}`}
          onClick={(e) => {
            console.log("토글 버튼 클릭됨");
            toggleOpen(e);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          type="button"
        >
          ▶
        </button>

        {/* 편집 가능한 제목 */}
        <input
          ref={titleRef}
          type="text"
          className="toggle-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
          }}
          onFocus={(e) => {
            e.stopPropagation();
          }}
          onBlur={(e) => {
            setTitle(e.target.value);
          }}
          onClick={(e) => {
            console.log("input 직접 클릭됨");
            e.stopPropagation();
          }}
          onMouseDown={(e) => {
            console.log("input 마우스 다운");
            e.stopPropagation();
          }}
          onKeyDown={handleTitleKeyDown}
          placeholder="토글 제목을 입력하세요"
          style={{
            outline: "none",
            minWidth: "50px",
            minHeight: "20px",
            display: "inline-block",
            flex: 1,
            border: "1px solid transparent",
            backgroundColor: "transparent",
            fontSize: "inherit",
            fontFamily: "inherit",
            color: "inherit",
            cursor: "text",
          }}
        />
      </div>

      {isOpen && (
        <div className="toggle-content" onKeyDown={handleContentKeyDown}>
          <NodeViewContent />
        </div>
      )}
    </NodeViewWrapper>
  );
};

// 토글 노드 정의
const EnhancedToggle = Node.create({
  name: "toggle",
  group: "block",
  content: "block*",
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
      title: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-title") || "",
        renderHTML: (attributes) => {
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="toggle"]',
        getAttrs: (element) => ({
          isOpen: element.getAttribute("data-is-open") !== "false",
          title: element.getAttribute("data-title") || "",
        }),
      },
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, {
        "data-type": "toggle",
        "data-is-open": node.attrs.isOpen,
        "data-title": node.attrs.title,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleComponent);
  },

  // > 입력 시 토글 생성
  addInputRules() {
    return [
      {
        find: /^>\s/,
        handler: ({ state, range }) => {
          const { tr, schema } = state;
          const { $from } = state.selection;

          // 현재 문단 노드와 그 텍스트 가져오기
          const currentNode = $from.parent;
          const fullText = currentNode.textContent;
          console.log("토글 생성 전 - 전체 텍스트:", fullText);

          // "> " 이전의 텍스트가 제목이 됨
          const titleText = fullText.replace(/>\s/, "").trim();
          console.log("토글 생성 - 제목 텍스트:", titleText);

          tr.insertText("", range.from, range.to); // "> " 삭제

          // 현재 문단의 범위
          const nodeStart = $from.start($from.depth);
          const nodeEnd = $from.end($from.depth);

          // 토글 노드 생성 (빈 문단 포함)
          const toggleNode = this.type.create({ isOpen: true, title: titleText }, schema.nodes.paragraph.create());

          console.log("생성된 토글 노드:", toggleNode);

          // 문단을 토글로 교체
          tr.replaceWith(nodeStart, nodeEnd, toggleNode);

          // 토글 내부 문단으로 포커스 이동
          const toggleStart = nodeStart;
          const toggleContentStart = toggleStart + 1; // 토글 헤더 다음 위치

          // 토글 내부의 빈 문단 위치 찾기
          let contentPos = toggleContentStart;
          toggleNode.descendants((node, pos) => {
            if (node.type.name === "paragraph" && node.content.size === 0) {
              contentPos = toggleStart + pos + 1;
              return false; // 첫 번째 빈 문단에서 멈춤
            }
          });

          console.log("토글 내부 문단 위치:", contentPos);
          tr.setSelection(state.selection.constructor.near(tr.doc.resolve(contentPos)));

          return tr;
        },
      },
    ];
  },

  addCommands() {
    return {
      setToggle:
        (attributes = {}) =>
        ({ commands }) => {
          return commands.setNode(this.name, attributes);
        },

      toggleToggle:
        () =>
        ({ state, dispatch }) => {
          const { selection } = state;
          const { $from } = selection;

          // 현재 토글 노드 찾기
          let toggleNode = null;
          let togglePos = null;

          for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === "toggle") {
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
      // "Mod-Enter": () => this.editor.commands.toggleToggle(),
      // 토글 내에서 Backspace 처리
      Backspace: ({ editor }) => {
        const { state } = editor;
        const { selection, doc } = state;
        const { $from } = selection;

        // 커서가 문단 시작에 있고, 토글 내부에 있을 때
        if ($from.parentOffset === 0) {
          let toggleDepth = null;

          // 토글 노드 찾기
          for (let depth = $from.depth; depth >= 0; depth--) {
            if ($from.node(depth).type.name === "toggle") {
              toggleDepth = depth;
              break;
            }
          }

          if (toggleDepth !== null) {
            const toggleNode = $from.node(toggleDepth);
            const togglePos = $from.start(toggleDepth) - 1;

            // 토글이 비어있으면 토글을 문단으로 변경
            if (toggleNode.childCount === 1) {
              const firstChild = toggleNode.firstChild;
              if (firstChild && firstChild.type.name === "paragraph" && firstChild.content.size === 0) {
                return editor.chain().setTextSelection(togglePos).setNode("paragraph").run();
              }
            }
          }
        }

        return false;
      },
    };
  },
});

export default EnhancedToggle;
