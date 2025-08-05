import { Node } from "@tiptap/core";

const ReadonlyText = Node.create({
  name: "readonlyText",

  group: "block",
  atom: true,

  addAttributes() {
    return {
      text: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "readonly-text" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["readonly-text", {}, HTMLAttributes.text];
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement("div");
      dom.textContent = node.attrs.text;
      dom.contentEditable = "false"; // <-- 수정 불가
      dom.style.fontWeight = "bold";
      dom.style.color = "#333";
      return { dom };
    };
  },
});

export default ReadonlyText;
