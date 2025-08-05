import { Extension } from "@tiptap/core";

const Indent = Extension.create({
  name: "indentWithList",

  addGlobalAttributes() {
    return [
      {
        types: ["paragraph", "heading"], // 리스트 제외
        attributes: {
          indent: {
            default: 0,
            renderHTML: (attributes) => {
              if (!attributes.indent) return {};
              return {
                style: `margin-left: ${attributes.indent * 2}em`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      indent:
        () =>
        ({ commands, state }) => {
          const { selection } = state;
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === "paragraph" || node.type.name === "heading") {
              const current = node.attrs.indent || 0;
              commands.updateAttributes(node.type.name, { indent: current + 1 });
            }
          });
          return true;
        },
      outdent:
        () =>
        ({ commands, state }) => {
          const { selection } = state;
          const { from, to } = selection;
          state.doc.nodesBetween(from, to, (node) => {
            if (node.type.name === "paragraph" || node.type.name === "heading") {
              const current = node.attrs.indent || 0;
              commands.updateAttributes(node.type.name, {
                indent: Math.max(0, current - 1),
              });
            }
          });
          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Tab: ({ editor }) => {
        const { $from } = editor.state.selection;
        const parent = $from.node($from.depth - 1);

        if (parent.type.name === "listItem") {
          // 리스트 안 → 계층 이동
          return editor.chain().focus().sinkListItem("listItem").run();
        } else {
          // 문단/헤딩 → indent
          return editor.chain().focus().indent().run();
        }
      },
      "Shift-Tab": ({ editor }) => {
        const { $from } = editor.state.selection;
        const parent = $from.node($from.depth - 1);

        if (parent.type.name === "listItem") {
          return editor.chain().focus().liftListItem("listItem").run();
        } else {
          return editor.chain().focus().outdent().run();
        }
      },
      Backspace: ({ editor }) => {
        const { $from } = editor.state.selection;
        const node = $from.node();
        const indent = node.attrs.indent || 0;

        // 문단 앞에서 Backspace → indent 감소
        if (($from.parent.type.name === "paragraph" || $from.parent.type.name === "heading") && $from.parentOffset === 0 && indent > 0) {
          return editor.commands.updateAttributes(node.type.name, {
            indent: indent - 1,
          });
        }

        return false;
      },
    };
  },
});

export default Indent;
