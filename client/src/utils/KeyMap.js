import { Extension } from "@tiptap/core";

const KeyMap = Extension.create({
  name: "notionKeymap",

  addKeyboardShortcuts() {
    return {
      Space: ({ editor }) => {
        const { $from } = editor.state.selection;
        const textBefore = $from.parent.textBetween(0, $from.parentOffset);

        // 불렛 리스트: "- "
        if (textBefore === "-") {
          const { $from } = editor.state.selection;
          const currentList = $from.node($from.depth - 1);

          if (currentList && currentList.type.name === "listItem") {
            const parentList = $from.node($from.depth - 2);
            if (parentList && parentList.type.name === "orderedList") {
              // 순서 리스트 항목을 불렛 리스트 항목으로 변경 (현재 항목만)
              editor
                .chain()
                .focus()
                .deleteRange({ from: $from.start(), to: $from.pos })
                .splitListItem("listItem") // 현재 항목을 분리
                .liftListItem("listItem") // 리스트에서 빼내기
                .toggleBulletList() // 불렛 리스트로 만들기
                .run();
            } else {
              // 이미 불렛 리스트이거나 일반 문단
              editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).toggleBulletList().run();
            }
          } else {
            // 일반 문단에서 불렛 리스트 생성
            editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).toggleBulletList().run();
          }
          return true;
        }

        // 순서 리스트: "1. "
        if (textBefore === "1.") {
          const { $from } = editor.state.selection;
          const currentList = $from.node($from.depth - 1);

          if (currentList && currentList.type.name === "listItem") {
            const parentList = $from.node($from.depth - 2);
            if (parentList && parentList.type.name === "bulletList") {
              // 불렛 리스트 항목을 순서 리스트 항목으로 변경 (현재 항목만)
              editor
                .chain()
                .focus()
                .deleteRange({ from: $from.start(), to: $from.pos })
                .splitListItem("listItem") // 현재 항목을 분리
                .liftListItem("listItem") // 리스트에서 빼내기
                .toggleOrderedList() // 순서 리스트로 만들기
                .run();
            } else {
              // 이미 순서 리스트이거나 일반 문단
              editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).toggleOrderedList().run();
            }
          } else {
            // 일반 문단에서 순서 리스트 생성
            editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).toggleOrderedList().run();
          }
          return true;
        }

        // 인용구: "| "
        if (textBefore === "|") {
          editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).setBlockquote().run();
          return true;
        }

        // 헤딩 1: "# "
        if (textBefore === "#") {
          editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).setHeading({ level: 1 }).run();
          return true;
        }

        // 헤딩 2: "## "
        if (textBefore === "##") {
          editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).setHeading({ level: 2 }).run();
          return true;
        }

        // 헤딩 3: "### "
        if (textBefore === "###") {
          editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).setHeading({ level: 3 }).run();
          return true;
        }

        // 태스크 리스트: "[] "
        if (textBefore === "[]") {
          editor.chain().focus().deleteRange({ from: $from.start(), to: $from.pos }).toggleTaskList().run();
          return true;
        }

        // 토글 처리는 Toggle.jsx의 InputRules에서 담당하므로 여기서는 제거

        return false;
      },

      Backspace: ({ editor }) => {
        const { $from } = editor.state.selection;

        // 커서가 블록 맨 앞일 때
        if ($from.parentOffset === 0) {
          const parentType = $from.parent.type.name;

          // 토글도 포함해서 백스페이스 시 일반 문단으로 변경
          if (["heading", "bulletList", "orderedList", "blockquote", "toggle"].includes(parentType)) {
            return editor.chain().focus().setParagraph().run();
          }
        }
        return false;
      },
    };
  },
});

export default KeyMap;
