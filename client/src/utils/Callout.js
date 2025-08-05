import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CalloutView } from "../components/CalloutView";

export const Callout = Node.create({
  name: "callout",

  group: "block",

  content: "block+",

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "callout" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutView);
  },

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-callout-type") || "info",
        renderHTML: (attributes) => ({
          "data-callout-type": attributes.type,
        }),
      },
      title: {
        default: "정보",
        parseHTML: (element) => element.getAttribute("data-callout-title") || "정보",
        renderHTML: (attributes) => ({
          "data-callout-title": attributes.title,
        }),
      },
    };
  },

  addCommands() {
    return {
      insertCallout:
        (options = { type: "info", title: "정보" }) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
            content: [
              {
                type: "paragraph",
              },
            ],
          });
        },
    };
  },
});