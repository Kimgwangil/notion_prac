import { Extension } from '@tiptap/core'

export const BlockSelection = Extension.create({
  name: 'blockSelection',

  addKeyboardShortcuts() {
    return {
      Escape: ({ editor }) => {
        const { state } = editor
        const { selection } = state
        const { $from } = selection
        
        // 현재 블록 전체 선택
        const start = $from.start($from.depth)
        const end = $from.end($from.depth)
        
        editor.commands.setTextSelection({ from: start, to: end })
        return true
      },
    }
  },
})