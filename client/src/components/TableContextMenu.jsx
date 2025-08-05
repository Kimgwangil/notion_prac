// client/src/components/TableContextMenu.jsx
import React, { useEffect, useRef, useState } from "react";

const TableContextMenu = ({ editor, show, position, onClose }) => {
  const menuRef = useRef(null);
  const [showColorMenu, setShowColorMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [show, onClose]);

  if (!show) return null;

  const colors = [
    { name: "기본", bg: "transparent", color: "#374151" },
    { name: "회색", bg: "#f3f4f6", color: "#374151" },
    { name: "빨강", bg: "#fecaca", color: "#7f1d1d" },
    { name: "주황", bg: "#fed7aa", color: "#9a3412" },
    { name: "노랑", bg: "#fef3c7", color: "#92400e" },
    { name: "초록", bg: "#d1fae5", color: "#14532d" },
    { name: "파랑", bg: "#dbeafe", color: "#1e3a8a" },
    { name: "보라", bg: "#e9d5ff", color: "#581c87" },
  ];

  const setCellColor = (bgColor, textColor) => {
    try {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      
      console.log('setCellColor 호출됨:', { bgColor, textColor });
      
      // 현재 셀 찾기
      for (let depth = $from.depth; depth >= 0; depth--) {
        const node = $from.node(depth);
        console.log(`Depth ${depth}, node type:`, node.type.name);
        
        if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
          const cellPos = $from.start(depth) - 1;
          console.log('셀 위치:', cellPos);
          
          // 기존 스타일 파싱
          const existingStyle = node.attrs.style || '';
          const styleObj = {};
          
          // 기존 스타일을 객체로 파싱
          if (existingStyle) {
            existingStyle.split(';').forEach(rule => {
              const [prop, value] = rule.split(':').map(s => s.trim());
              if (prop && value) {
                styleObj[prop] = value;
              }
            });
          }
          
          // 색상 업데이트
          if (bgColor !== 'transparent') {
            styleObj['background-color'] = bgColor;
          } else {
            delete styleObj['background-color'];
          }
          styleObj['color'] = textColor;
          
          // 스타일 문자열로 변환
          const newStyle = Object.entries(styleObj)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
          
          const attrs = {
            ...node.attrs,
            style: newStyle
          };
          
          console.log('새 속성:', attrs);
          
          editor.view.dispatch(
            state.tr.setNodeMarkup(cellPos, null, attrs)
          );
          
          break;
        }
      }
    } catch (error) {
      console.error('setCellColor 오류:', error);
    }
    onClose();
  };

  const setRowColor = (bgColor, textColor) => {
    try {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      
      console.log('setRowColor 호출됨:', { bgColor, textColor });
      
      // 선택된 행이 있는지 확인
      const selectedRow = document.querySelector('.selected-row');
      if (selectedRow) {
        // 선택된 행의 모든 셀에 색상 적용
        const cells = selectedRow.querySelectorAll('td, th');
        cells.forEach(cell => {
          // 기존 스타일 파싱
          const existingStyle = cell.getAttribute('style') || '';
          const styleObj = {};
          
          if (existingStyle) {
            existingStyle.split(';').forEach(rule => {
              const [prop, value] = rule.split(':').map(s => s.trim());
              if (prop && value) {
                styleObj[prop] = value;
              }
            });
          }
          
          // 색상 업데이트
          if (bgColor !== 'transparent') {
            styleObj['background-color'] = bgColor;
          } else {
            delete styleObj['background-color'];
          }
          styleObj['color'] = textColor;
          
          // 스타일 문자열로 변환
          const newStyle = Object.entries(styleObj)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
          
          cell.setAttribute('style', newStyle);
        });
      } else {
        // 선택된 행이 없으면 현재 행 색상 변경
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'tableRow') {
            const rowPos = $from.start(depth) - 1;
            
            // 행의 모든 셀에 색상 적용
            const tr = state.tr;
            node.forEach((cell, offset, index) => {
              if (cell.type.name === 'tableCell' || cell.type.name === 'tableHeader') {
                const cellPos = rowPos + offset + 1;
                
                // 기존 스타일 파싱
                const existingStyle = cell.attrs.style || '';
                const styleObj = {};
                
                if (existingStyle) {
                  existingStyle.split(';').forEach(rule => {
                    const [prop, value] = rule.split(':').map(s => s.trim());
                    if (prop && value) {
                      styleObj[prop] = value;
                    }
                  });
                }
                
                // 색상 업데이트
                if (bgColor !== 'transparent') {
                  styleObj['background-color'] = bgColor;
                } else {
                  delete styleObj['background-color'];
                }
                styleObj['color'] = textColor;
                
                // 스타일 문자열로 변환
                const newStyle = Object.entries(styleObj)
                  .map(([prop, value]) => `${prop}: ${value}`)
                  .join('; ');
                
                const attrs = {
                  ...cell.attrs,
                  style: newStyle
                };
                
                tr.setNodeMarkup(cellPos, null, attrs);
              }
            });
            
            editor.view.dispatch(tr);
            break;
          }
        }
      }
    } catch (error) {
      console.error('setRowColor 오류:', error);
    }
    onClose();
  };

  const setColumnColor = (bgColor, textColor) => {
    try {
      const { state } = editor;
      const { selection } = state;
      const { $from } = selection;
      
      console.log('setColumnColor 호출됨:', { bgColor, textColor });
      
      // 선택된 열이 있는지 확인
      const selectedCols = document.querySelectorAll('.selected-col');
      if (selectedCols.length > 0) {
        // 선택된 열의 모든 셀에 색상 적용
        selectedCols.forEach(cell => {
          // 기존 스타일 파싱
          const existingStyle = cell.getAttribute('style') || '';
          const styleObj = {};
          
          if (existingStyle) {
            existingStyle.split(';').forEach(rule => {
              const [prop, value] = rule.split(':').map(s => s.trim());
              if (prop && value) {
                styleObj[prop] = value;
              }
            });
          }
          
          // 색상 업데이트
          if (bgColor !== 'transparent') {
            styleObj['background-color'] = bgColor;
          } else {
            delete styleObj['background-color'];
          }
          styleObj['color'] = textColor;
          
          // 스타일 문자열로 변환
          const newStyle = Object.entries(styleObj)
            .map(([prop, value]) => `${prop}: ${value}`)
            .join('; ');
          
          cell.setAttribute('style', newStyle);
        });
      } else {
        // 선택된 열이 없으면 현재 열 색상 변경
        // 현재 열 인덱스 찾기
        let columnIndex = 0;
        let cellNode = null;
        
        for (let depth = $from.depth; depth >= 0; depth--) {
          const node = $from.node(depth);
          if (node.type.name === 'tableCell' || node.type.name === 'tableHeader') {
            cellNode = node;
            // 현재 행에서 셀의 위치 계산
            const row = $from.node(depth - 1);
            let index = 0;
            row.forEach((child, offset) => {
              if (offset < $from.start(depth) - $from.start(depth - 1) - 1) {
                index++;
              }
            });
            columnIndex = index;
            break;
          }
        }
        
        if (cellNode) {
          // 테이블 찾기
          for (let depth = $from.depth; depth >= 0; depth--) {
            const node = $from.node(depth);
            if (node.type.name === 'table') {
              const tablePos = $from.start(depth);
              const tr = state.tr;
              
              // 모든 행의 해당 열에 색상 적용
              node.forEach((row, rowOffset) => {
                if (row.type.name === 'tableRow') {
                  let cellIndex = 0;
                  row.forEach((cell, cellOffset) => {
                    if (cellIndex === columnIndex) {
                      const cellPos = tablePos + rowOffset + cellOffset + 1;
                      
                      // 기존 스타일 파싱
                      const existingStyle = cell.attrs.style || '';
                      const styleObj = {};
                      
                      if (existingStyle) {
                        existingStyle.split(';').forEach(rule => {
                          const [prop, value] = rule.split(':').map(s => s.trim());
                          if (prop && value) {
                            styleObj[prop] = value;
                          }
                        });
                      }
                      
                      // 색상 업데이트
                      if (bgColor !== 'transparent') {
                        styleObj['background-color'] = bgColor;
                      } else {
                        delete styleObj['background-color'];
                      }
                      styleObj['color'] = textColor;
                      
                      // 스타일 문자열로 변환
                      const newStyle = Object.entries(styleObj)
                        .map(([prop, value]) => `${prop}: ${value}`)
                        .join('; ');
                      
                      const attrs = {
                        ...cell.attrs,
                        style: newStyle
                      };
                      
                      tr.setNodeMarkup(cellPos, null, attrs);
                    }
                    cellIndex++;
                  });
                }
              });
              
              editor.view.dispatch(tr);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('setColumnColor 오류:', error);
    }
    onClose();
  };

  const menuItems = [
    {
      label: "위에 행 추가",
      action: () => {
        editor.chain().focus().addRowBefore().run();
        onClose();
      },
    },
    {
      label: "아래에 행 추가",
      action: () => {
        editor.chain().focus().addRowAfter().run();
        onClose();
      },
    },
    {
      label: "왼쪽에 열 추가",
      action: () => {
        editor.chain().focus().addColumnBefore().run();
        onClose();
      },
    },
    {
      label: "오른쪽에 열 추가",
      action: () => {
        editor.chain().focus().addColumnAfter().run();
        onClose();
      },
    },
    { type: "separator" },
    {
      label: "🎨 색상 설정",
      action: () => setShowColorMenu(!showColorMenu),
      hasSubmenu: true,
    },
    { type: "separator" },
    {
      label: "행 삭제",
      action: () => {
        editor.chain().focus().deleteRow().run();
        onClose();
      },
      className: "delete-action",
    },
    {
      label: "열 삭제",
      action: () => {
        editor.chain().focus().deleteColumn().run();
        onClose();
      },
      className: "delete-action",
    },
    {
      label: "표 삭제",
      action: () => {
        editor.chain().focus().deleteTable().run();
        onClose();
      },
      className: "delete-action",
    },
  ];

  return (
    <div
      ref={menuRef}
      className="table-context-menu"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      {menuItems.map((item, index) => {
        if (item.type === "separator") {
          return <div key={index} className="menu-separator" />;
        }

        return (
          <div key={index} style={{ position: 'relative' }}>
            <button 
              onClick={item.action} 
              className={item.className} 
              style={item.className === "delete-action" ? { color: "#dc2626" } : {}}
            >
              {item.label}
              {item.hasSubmenu && <span style={{ float: 'right' }}>▶</span>}
            </button>
            
            {/* 색상 서브메뉴 */}
            {item.hasSubmenu && showColorMenu && (
              <div className="color-submenu" style={{
                position: 'absolute',
                left: '100%',
                top: 0,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                padding: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                minWidth: '200px',
                zIndex: 1001
              }}>
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  셀 색상
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
                  {colors.map((color, colorIndex) => (
                    <button
                      key={`cell-${colorIndex}`}
                      onClick={() => setCellColor(color.bg, color.color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color.bg === 'transparent' ? '#ffffff' : color.bg,
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title={`셀 - ${color.name}`}
                    >
                      {color.bg === 'transparent' && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '12px',
                          height: '1px',
                          backgroundColor: '#ef4444',
                          transform: 'translate(-50%, -50%) rotate(45deg)'
                        }} />
                      )}
                    </button>
                  ))}
                </div>
                
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  행 색상
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginBottom: '12px' }}>
                  {colors.map((color, colorIndex) => (
                    <button
                      key={`row-${colorIndex}`}
                      onClick={() => setRowColor(color.bg, color.color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color.bg === 'transparent' ? '#ffffff' : color.bg,
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title={`행 - ${color.name}`}
                    >
                      {color.bg === 'transparent' && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '12px',
                          height: '1px',
                          backgroundColor: '#ef4444',
                          transform: 'translate(-50%, -50%) rotate(45deg)'
                        }} />
                      )}
                    </button>
                  ))}
                </div>
                
                <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '600', color: '#6b7280' }}>
                  열 색상
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                  {colors.map((color, colorIndex) => (
                    <button
                      key={`col-${colorIndex}`}
                      onClick={() => setColumnColor(color.bg, color.color)}
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: color.bg === 'transparent' ? '#ffffff' : color.bg,
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      title={`열 - ${color.name}`}
                    >
                      {color.bg === 'transparent' && (
                        <div style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          width: '12px',
                          height: '1px',
                          backgroundColor: '#ef4444',
                          transform: 'translate(-50%, -50%) rotate(45deg)'
                        }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TableContextMenu;
