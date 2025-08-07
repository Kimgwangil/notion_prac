// client/src/utils/EnhancedToggle.js
import { Node, mergeAttributes } from "@tiptap/core";
import {
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
} from "@tiptap/react";
import React, { useState, useEffect, useRef } from "react";

// 토글 컴포넌트
const ToggleComponent = ({ node, updateAttributes, editor, getPos }) => {
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

  // 상태 변경을 노드 속성에 동기화 (무한 루프 방지)
  useEffect(() => {
    if (node.attrs.isOpen !== isOpen) {
      updateAttributes({ isOpen });
    }
  }, [isOpen, updateAttributes]);

  useEffect(() => {
    if (node.attrs.title !== title && title !== "") {
      updateAttributes({ title });
    }
  }, [title, updateAttributes]);

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
      // 토글 내용으로 포커스 이동
      const pos = getPos() + 1;
      editor.commands.setTextSelection(pos);
      editor.commands.focus();
    } else if (e.key === "ArrowDown") {
      console.log("ArrowDown 키 눌림");
      e.preventDefault();
      // 토글 내용으로 포커스 이동
      const pos = getPos() + 1;
      editor.commands.setTextSelection(pos);
      editor.commands.focus();
    } else if (e.key === "ArrowUp") {
      console.log("ArrowUp 키 눌림");
      e.preventDefault();
      // 이전 블록으로 포커스 이동
      const pos = getPos();
      if (pos > 0) {
        editor.commands.setTextSelection(pos - 1);
        editor.commands.focus();
      }
    } else if (
      e.key === "ArrowLeft" &&
      titleRef.current &&
      titleRef.current.selectionStart === 0
    ) {
      console.log("ArrowLeft 키 눌림 (제목 맨 앞)");
      e.preventDefault();
      // 제목 맨 앞에서 왼쪽 화살표 시 이전 블록으로 이동
      const pos = getPos();
      if (pos > 0) {
        editor.commands.setTextSelection(pos - 1);
        editor.commands.focus();
      }
    } else if (
      e.key === "ArrowRight" &&
      titleRef.current &&
      titleRef.current.selectionEnd === title.length
    ) {
      console.log("ArrowRight 키 눌림 (제목 맨 끝)");
      e.preventDefault();
      // 제목 맨 끝에서 오른쪽 화살표 시 토글 내용으로 이동
      const pos = getPos() + 1;
      editor.commands.setTextSelection(pos);
      editor.commands.focus();
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
          view.dispatch(
            state.tr.setSelection(
              state.selection.constructor.near(state.doc.resolve(pos))
            )
          );
          break;
        }
      }

      // React input 포커스
      setTimeout(() => {
        if (titleRef.current) {
          titleRef.current.focus();
          titleRef.current.setSelectionRange(
            titleRef.current.value.length,
            titleRef.current.value.length
          );
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
      }}>
      <div
        className="toggle-header"
        onClick={(e) => {
          // input 클릭이 아닌 경우에만 로그
          if (e.target.tagName !== "INPUT") {
            console.log("toggle-header 클릭됨", e.target);
          }
        }}>
        {/* 토글 버튼 (화살표) - 클릭 시에만 토글 */}
        <button
          className={`toggle-arrow ${isOpen ? "open" : ""}`}
          onClick={(e) => {
            console.log("토글 버튼 클릭됨");
            toggleOpen(e);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          type="button">
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

  // > 입력 시 토글 생성 (리스트에서도 동작)
  addInputRules() {
    return [
      {
        find: />\s$/,
        handler: ({ state, range }) => {
          const { tr, schema } = state;
          const { $from } = state.selection;

          // 현재 노드와 전체 텍스트 가져오기
          const currentNode = $from.parent;
          const fullText = currentNode.textContent;
          console.log("토글 생성 전 - 전체 텍스트:", fullText);

          // "> " 이전의 텍스트가 제목이 됨 (리스트 마커 제외)
          let titleText = fullText.replace(/>\s$/, "").trim();

          // 리스트 마커 제거 (-, 1., 2. 등)
          titleText = titleText
            .replace(/^[-*+]?\s*/, "")
            .replace(/^\d+\.\s*/, "");
          console.log("토글 생성 - 제목 텍스트:", titleText);

          // 리스트 항목인지 확인
          const currentList = $from.node($from.depth - 1);
          const isInList = currentList && currentList.type.name === "listItem";

          if (isInList) {
            // 리스트에서 토글 생성: 리스트 항목을 토글로 교체
            const listItemStart = $from.start($from.depth - 1);
            const listItemEnd = $from.end($from.depth - 1);

            // 토글 노드 생성
            const toggleNode = this.type.create(
              { isOpen: true, title: titleText },
              schema.nodes.paragraph.create()
            );

            // 리스트 항목을 토글로 교체
            tr.replaceWith(listItemStart, listItemEnd, toggleNode);

            // 토글 내부로 커서 이동
            const toggleContentPos = listItemStart + 1;
            tr.setSelection(
              state.selection.constructor.near(tr.doc.resolve(toggleContentPos))
            );
          } else {
            // 일반 문단에서 토글 생성
            tr.insertText("", range.from, range.to); // "> " 삭제

            const nodeStart = $from.start($from.depth);
            const nodeEnd = $from.end($from.depth);

            // 토글 노드 생성
            const toggleNode = this.type.create(
              { isOpen: true, title: titleText },
              schema.nodes.paragraph.create()
            );

            // 문단을 토글로 교체
            tr.replaceWith(nodeStart, nodeEnd, toggleNode);

            // 토글 내부로 커서 이동
            const toggleContentPos = nodeStart + 1;
            tr.setSelection(
              state.selection.constructor.near(tr.doc.resolve(toggleContentPos))
            );
          }

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
        const { selection } = state;
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
              if (
                firstChild &&
                firstChild.type.name === "paragraph" &&
                firstChild.content.size === 0
              ) {
                return editor
                  .chain()
                  .setTextSelection(togglePos)
                  .setNode("paragraph")
                  .run();
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
