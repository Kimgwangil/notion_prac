import { Extension } from "@tiptap/core";
import { TextSelection } from "prosemirror-state";

const MoveCursorToStart = Extension.create({
  name: "moveCursorToStart",

  onUpdate({ editor }) {
    const { $from } = editor.state.selection;
    const parentType = $from.parent.type.name;

    if (["listItem", "toggle"].includes(parentType)) {
      const pos = $from.start($from.depth);
      editor.commands.setTextSelection(pos);
    }
  },
});

export default MoveCursorToStart;
