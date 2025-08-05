import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';

const TableWithButtons = ({ node, updateAttributes, editor, getPos }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(-1);
  const [hoveredCol, setHoveredCol] = useState(-1);
  const tableRef = useRef(null);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const handleMouseEnter = () => setShowButtons(true);
    const handleMouseLeave = () => {
      setShowButtons(false);
      setHoveredRow(-1);
      setHoveredCol(-1);
    };

    tableElement.addEventListener('mouseenter', handleMouseEnter);
    tableElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      if (tableElement) {
        tableElement.removeEventListener('mouseenter', handleMouseEnter);
        tableElement.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  const addRowAfter = (rowIndex) => {
    const pos = getPos();
    if (pos === undefined) return;

    // 특정 행 이후에 행 추가
    editor.chain().focus().addRowAfter().run();
  };

  const addColumnAfter = () => {
    editor.chain().focus().addColumnAfter().run();
  };

  const handleCellMouseEnter = (event) => {
    const cell = event.target.closest('td, th');
    if (!cell) return;

    const row = cell.closest('tr');
    const table = cell.closest('table');
    
    if (row && table) {
      const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(cell);
      
      setHoveredRow(rowIndex);
      setHoveredCol(cellIndex);
    }
  };

  return (
    <NodeViewWrapper className="table-with-buttons-wrapper">
      <div 
        ref={tableRef}
        className="table-container"
        style={{ position: 'relative' }}
        onMouseMove={handleCellMouseEnter}
      >
        <NodeViewContent />
        
        {/* 행 추가 버튼들 */}
        {showButtons && hoveredRow >= 0 && (
          <button
            className="add-row-button"
            onClick={() => addRowAfter(hoveredRow)}
            style={{
              position: 'absolute',
              left: '-25px',
              top: `${(hoveredRow + 1) * 40}px`, // 대략적인 행 높이
              width: '20px',
              height: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              zIndex: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="행 추가"
          >
            +
          </button>
        )}
        
        {/* 열 추가 버튼 */}
        {showButtons && hoveredCol >= 0 && (
          <button
            className="add-column-button"
            onClick={addColumnAfter}
            style={{
              position: 'absolute',
              top: '-25px',
              left: `${(hoveredCol + 1) * 120}px`, // 대략적인 열 너비
              width: '20px',
              height: '20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              zIndex: 10,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            title="열 추가"
          >
            +
          </button>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default TableWithButtons;