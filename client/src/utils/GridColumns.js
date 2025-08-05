import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { GridColumnsView } from "../components/GridColumnsView";
import { GridColumnView } from "../components/GridColumnView";

// Grid 컨테이너
export const GridColumns = Node.create({
  name: "gridColumns",

  group: "block",

  content: "gridColumn+",

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="grid-columns"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "grid-columns" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GridColumnsView);
  },

  addCommands() {
    return {
      insertGridColumns:
        (options = { columns: 2 }) =>
        ({ commands }) => {
          console.log("insertGridColumns 명령 실행, options:", options);
          const columns = [];
          for (let i = 0; i < options.columns; i++) {
            columns.push({
              type: "gridColumn",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: `Column ${i + 1}` }],
                },
              ],
            });
          }
          console.log("생성된 columns:", columns);

          return commands.insertContent({
            type: this.name,
            content: columns,
          });
        },
    };
  },
});

// Grid 개별 열
export const GridColumn = Node.create({
  name: "gridColumn",

  content: "block+",

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="grid-column"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "grid-column" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(GridColumnView);
  },
});