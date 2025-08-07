import React, { useState, useRef, useEffect } from "react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";

const TableWithButtons = ({ node, updateAttributes, editor, getPos }) => {
  const [showButtons, setShowButtons] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(-1);
  const [hoveredCol, setHoveredCol] = useState(-1);
  const [tableRows, setTableRows] = useState([]);
  const [tableCols, setTableCols] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    const tableElement = tableRef.current;
    if (!tableElement) return;

    const updateTableDimensions = () => {
      const table = tableElement.querySelector("table");
      if (table) {
        const rows = Array.from(table.querySelectorAll("tr"));
        const firstRow = rows[0];
        const cols = firstRow ? Array.from(firstRow.querySelectorAll("td, th")) : [];

        setTableRows(rows.map((_, index) => index));
        setTableCols(cols.map((_, index) => index));
      }
    };

    const handleMouseEnter = () => {
      setShowButtons(true);
      updateTableDimensions();
    };

    const handleMouseLeave = () => {
      setShowButtons(false);
      setHoveredRow(-1);
      setHoveredCol(-1);
    };

    tableElement.addEventListener("mouseenter", handleMouseEnter);
    tableElement.addEventListener("mouseleave", handleMouseLeave);

    // MutationObserver로 표 구조 변화 감지
    const observer = new MutationObserver(updateTableDimensions);
    observer.observe(tableElement, { childList: true, subtree: true });

    return () => {
      if (tableElement) {
        tableElement.removeEventListener("mouseenter", handleMouseEnter);
        tableElement.removeEventListener("mouseleave", handleMouseLeave);
      }
      observer.disconnect();
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

  const deleteRow = (rowIndex) => {
    const table = tableRef.current?.querySelector("table");
    const rows = table?.querySelectorAll("tr");

    if (rows && rows.length <= 1) {
      // 마지막 행이면 표 전체 삭제
      editor.chain().focus().deleteTable().run();
    } else {
      editor.chain().focus().deleteRow().run();
    }
  };

  const deleteColumn = () => {
    const table = tableRef.current?.querySelector("table");
    const firstRow = table?.querySelector("tr");
    const cells = firstRow?.querySelectorAll("td, th");

    if (cells && cells.length <= 1) {
      // 마지막 열이면 표 전체 삭제
      editor.chain().focus().deleteTable().run();
    } else {
      editor.chain().focus().deleteColumn().run();
    }
  };

  const handleCellMouseEnter = (event) => {
    const cell = event.target.closest("td, th");
    if (!cell) return;

    const row = cell.closest("tr");
    const table = cell.closest("table");

    if (row && table) {
      const rowIndex = Array.from(table.querySelectorAll("tr")).indexOf(row);
      const cellIndex = Array.from(row.children).indexOf(cell);

      setHoveredRow(rowIndex);
      setHoveredCol(cellIndex);
    }
  };

  return (
    <NodeViewWrapper className="table-with-buttons-wrapper">
      <div ref={tableRef} className="table-container" style={{ position: "relative" }} onMouseMove={handleCellMouseEnter}>
        <NodeViewContent />

        {/* 모든 행에 추가/삭제 버튼들 */}
        {showButtons &&
          tableRows.map((rowIndex) => (
            <React.Fragment key={`row-${rowIndex}`}>
              <button
                className="add-row-button"
                onClick={() => addRowAfter(rowIndex)}
                style={{
                  position: "absolute",
                  left: "-30px",
                  top: `${(rowIndex + 1) * 40}px`,
                  width: "20px",
                  height: "20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px dashed #ccc",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  zIndex: 10,
                  opacity: hoveredRow === rowIndex ? 1 : 0.5,
                }}
                title="행 추가"
              >
                +
              </button>
              <button
                className="delete-row-button"
                onClick={() => deleteRow(rowIndex)}
                style={{
                  position: "absolute",
                  left: "-55px",
                  top: `${(rowIndex + 1) * 40}px`,
                  width: "20px",
                  height: "20px",
                  backgroundColor: "transparent",
                  color: "#ccd123",
                  border: "1px dashed #ef4444",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  zIndex: 10,
                  opacity: hoveredRow === rowIndex ? 1 : 0.5,
                }}
                title="행 삭제"
              >
                −
              </button>
            </React.Fragment>
          ))}

        {/* 모든 열에 추가/삭제 버튼들 */}
        {showButtons &&
          tableCols.map((colIndex) => (
            <React.Fragment key={`col-${colIndex}`}>
              <button
                className="add-column-button"
                onClick={addColumnAfter}
                style={{
                  position: "absolute",
                  top: "-30px",
                  left: `${(colIndex + 1) * 120}px`,
                  width: "20px",
                  height: "20px",
                  backgroundColor: "transparent",
                  color: "#666",
                  border: "1px dashed #ccc",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  zIndex: 10,
                  opacity: hoveredCol === colIndex ? 1 : 0.5,
                }}
                title="열 추가"
              >
                +
              </button>
              <button
                className="delete-column-button"
                onClick={deleteColumn}
                style={{
                  position: "absolute",
                  top: "-55px",
                  left: `${(colIndex + 1) * 120}px`,
                  width: "20px",
                  height: "20px",
                  backgroundColor: "transparent",
                  color: "#ef4444",
                  border: "1px dashed #ef4444",
                  borderRadius: "50%",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  zIndex: 10,
                  opacity: hoveredCol === colIndex ? 1 : 0.5,
                }}
                title="열 삭제"
              >
                −
              </button>
            </React.Fragment>
          ))}
      </div>
    </NodeViewWrapper>
  );
};

export default TableWithButtons;
