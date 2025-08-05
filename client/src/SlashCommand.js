import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";

const SlashCommand = Extension.create({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        startOfLine: true,
        command: ({ editor, range, props }) => {
          props.command(editor);
        },
        items: () => [
          {
            title: "Heading 1",
            command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            title: "Paragraph",
            command: (editor) => editor.chain().focus().setParagraph().run(),
          },
          {
            title: "Todo",
            command: (editor) => editor.chain().focus().toggleTaskList().run(),
          },
          {
            title: "2열 레이아웃",
            command: (editor) => editor.chain().focus().insertGridColumns({ columns: 2 }).run(),
          },
          {
            title: "3열 레이아웃",
            command: (editor) => editor.chain().focus().insertGridColumns({ columns: 3 }).run(),
          },
          {
            title: "💡 Callout",
            command: (editor) => editor.chain().focus().insertCallout({ type: "info", title: "정보" }).run(),
          },
          {
            title: "⚠️ 경고 Callout",
            command: (editor) => editor.chain().focus().insertCallout({ type: "warning", title: "경고" }).run(),
          },
          {
            title: "To-do List",
            command: ({ editor }) => {
              editor.chain().focus().toggleTaskList().run();
            },
          },
          {
            title: "Toggle",
            command: ({ editor }) => {
              if (!editor) return false;
              return editor
                .chain()
                .focus()
                .insertContent({
                  type: "toggle",
                  content: [{ type: "paragraph", content: [{ type: "text", text: "토글 내용" }] }],
                })
                .run();
            },
          },
        ],
        render: () => {
          let component, popup;

          return {
            onStart: (props) => {
              component = document.createElement("div");
              component.className = "slash-menu";
              component.style.position = "absolute";
              component.style.background = "white";
              component.style.border = "1px solid #ccc";
              component.style.padding = "4px";

              props.items.forEach((item, index) => {
                const el = document.createElement("div");
                el.textContent = item.title;
                el.style.padding = "4px 8px";
                el.style.cursor = "pointer";
                el.addEventListener("click", () => {
                  props.command(item);
                });
                component.appendChild(el);
              });

              document.body.appendChild(component);
              popup = component;
            },
            onUpdate: () => {},
            onKeyDown: () => false,
            onExit: () => {
              popup?.remove();
            },
          };
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommand;
