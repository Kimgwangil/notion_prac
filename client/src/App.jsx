// client/src/App.jsx
import React, { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Collaboration from "@tiptap/extension-collaboration";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";
import "./editor.css";
import "./placeholder.css";
import Placeholder from "@tiptap/extension-placeholder";
import Image from "@tiptap/extension-image";

// 색상 관련 확장
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";

// todo
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";

//table
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { ReactNodeViewRenderer } from "@tiptap/react";
import TableWithButtons from "./components/TableWithButtons";
import ResizableImage from "./components/ResizableImage";

import SlashCommand from "./SlashCommand";
import ReadonlyText from "./utils/ReadonlyText";
import EnhancedToggle from "./utils/Toggle.jsx";
import Indent from "./utils/Indent";
import MoveCursorToStart from "./utils/MoveCursorToStart";
import KeyMap from "./utils/KeyMap";
import TableContextMenu from "./components/TableContextMenu";
import { GridColumns, GridColumn } from "./utils/GridColumns";
import { Callout } from "./utils/Callout";
import { snowflakeAPI } from "./utils/SnowflakeAPI";
import { BlockSelection } from "./utils/BlockSelection";
import { NotionToggle } from "./utils/NotionToggle.jsx";

// 색상 선택 팝업 컴포넌트
const ColorPicker = ({ editor, show, position, onClose }) => {
  const colors = [
    { name: "기본", text: "#374151", bg: "transparent" },
    { name: "회색", text: "#6B7280", bg: "#F3F4F6" },
    { name: "갈색", text: "#92400E", bg: "#FEF3C7" },
    { name: "빨강", text: "#DC2626", bg: "#FEE2E2" },
    { name: "주황", text: "#EA580C", bg: "#FED7AA" },
    { name: "노랑", text: "#D97706", bg: "#FEF3C7" },
    { name: "초록", text: "#059669", bg: "#D1FAE5" },
    { name: "파랑", text: "#2563EB", bg: "#DBEAFE" },
    { name: "보라", text: "#7C3AED", bg: "#E9D5FF" },
    { name: "분홍", text: "#DB2777", bg: "#FCE7F3" },
  ];

  if (!show) return null;

  return (
    <div
      className="color-picker"
      style={{
        position: "fixed",
        left: position.x,
        top: position.y + 20,
        zIndex: 1000,
        backgroundColor: "white",
        border: "1px solid #e5e7eb",
        borderRadius: "8px",
        padding: "12px",
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        minWidth: "240px",
      }}
    >
      {/* 글자 색상 */}
      <div style={{ marginBottom: "12px" }}>
        <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "8px", color: "#6b7280" }}>텍스트 색상</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
          {colors.map((color, index) => (
            <button
              key={`text-${index}`}
              onClick={() => {
                editor.chain().focus().setColor(color.text).run();
                onClose();
              }}
              style={{
                width: "32px",
                height: "32px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "white",
              }}
              title={color.name}
            >
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: color.text,
                  borderRadius: "2px",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 배경 색상 */}
      <div>
        <div style={{ fontSize: "12px", fontWeight: "500", marginBottom: "8px", color: "#6b7280" }}>배경 색상</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
          {colors.map((color, index) => (
            <button
              key={`bg-${index}`}
              onClick={() => {
                if (color.bg === "transparent") {
                  editor.chain().focus().unsetHighlight().run();
                } else {
                  editor.chain().focus().setHighlight({ color: color.bg }).run();
                }
                onClose();
              }}
              style={{
                width: "32px",
                height: "32px",
                border: "1px solid #e5e7eb",
                borderRadius: "4px",
                cursor: "pointer",
                backgroundColor: color.bg === "transparent" ? "white" : color.bg,
                position: "relative",
              }}
              title={`${color.name} 배경`}
            >
              {color.bg === "transparent" && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    width: "16px",
                    height: "1px",
                    backgroundColor: "#ef4444",
                    transform: "translate(-50%, -50%) rotate(45deg)",
                  }}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [ydoc] = useState(() => new Y.Doc());
  const [colorPicker, setColorPicker] = useState({ show: false, position: { x: 0, y: 0 } });
  const [tableMenu, setTableMenu] = useState({ show: false, position: { x: 0, y: 0 } });

  // Snowflake 데이터 템플릿 삽입 함수
  const insertDataTemplate = async (templateName) => {
    if (!editor) return;

    try {
      // 로딩 표시
      const loadingCallout = {
        type: "callout",
        attrs: { type: "info", title: "데이터 로딩 중..." },
        content: [{ type: "paragraph", content: [{ type: "text", text: "데이터를 가져오는 중입니다..." }] }],
      };

      editor.chain().focus().insertContent(loadingCallout).run();

      // Snowflake 데이터 가져오기
      const data = await snowflakeAPI.getTemplateData(templateName);

      // 2열 레이아웃 생성
      editor.chain().focus().insertGridColumns({ columns: 2 }).run();

      // 왼쪽 열: Callout 요약
      const summary = snowflakeAPI.formatAsCalloutSummary(data, "success");
      const summaryCallout = {
        type: "callout",
        attrs: { type: summary.type, title: summary.title },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: summary.content }],
          },
        ],
      };

      // 오른쪽 열: 테이블 데이터
      const tableData = snowflakeAPI.formatAsTable(data);
      if (tableData) {
        const tableRows = tableData.rows.slice(0, 10); // 최대 10행만 표시

        const tableNode = editor.schema.nodes.table.create({}, [
          // 헤더 행
          editor.schema.nodes.tableRow.create(
            {},
            tableData.headers.map((header) => editor.schema.nodes.tableHeader.create({}, editor.schema.nodes.paragraph.create({}, editor.schema.text(header))))
          ),
          // 데이터 행들
          ...tableRows.map((row) =>
            editor.schema.nodes.tableRow.create(
              {},
              row.map((cell) => editor.schema.nodes.tableCell.create({}, editor.schema.nodes.paragraph.create({}, editor.schema.text(String(cell || "")))))
            )
          ),
        ]);

        // 기존 로딩 callout 제거하고 새 내용 삽입
        const currentPos = editor.state.selection.anchor;
        const transaction = editor.state.tr
          .delete(currentPos - 50, currentPos) // 로딩 callout 제거
          .insert(currentPos - 50, summaryCallout)
          .insert(currentPos - 25, tableNode);

        editor.view.dispatch(transaction);
      }
    } catch (error) {
      console.error("데이터 템플릿 삽입 오류:", error);

      // 오류 callout 표시
      const errorCallout = {
        type: "callout",
        attrs: { type: "error", title: "데이터 로딩 실패" },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: `오류: ${error.message}` }],
          },
        ],
      };

      editor.chain().focus().insertContent(errorCallout).run();
    }
  };

  useEffect(() => {
    const provider = new WebsocketProvider("ws://localhost:3001", "my-room", ydoc);
    return () => {
      provider.destroy();
    };
  }, [ydoc]);

  function toggleBulletListAndMoveToStart(editor) {
    editor.chain().focus().toggleBulletList().run();

    const { state, view } = editor;
    const { $from } = state.selection;
    const pos = $from.start($from.depth);
    editor.commands.setTextSelection(pos);
    view.focus();
  }

  const placeholderText = {
    heading: "Heading",
    paragraph: "명령어 사용 시에는 '/'키를 눌러주세요.",
    bulletList: "리스트",
    orderedList: "리스트",
    taskList: "할일",
  };

  const placeholderMarginLevel = {
    heading: 0,
    paragraph: 0,
    bulletList: 0,
    orderedList: 0,
    taskList: 1,
  };

  const editor = useEditor({
    extensions: [
      Collaboration.configure({ document: ydoc }),
      StarterKit.configure({
        history: false, // Collaboration과 충돌하므로 비활성화
      }),

      // 색상 관련 확장 추가
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: "highlight",
        },
      }),

      TaskList,
      TaskItem.configure({
        nested: true,
      }),

      // 표 설정 개선 - 작은 크기로 제한
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "compact-table",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "compact-cell",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "compact-header",
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            style: {
              default: null,
              parseHTML: element => element.getAttribute('style'),
              renderHTML: attributes => {
                if (!attributes.style) {
                  return {};
                }
                return {
                  style: attributes.style,
                };
              },
            },
          };
        },
      }),

      Placeholder.configure({
        placeholder: ({ node }) => {
          const text = placeholderText[node.type.name] || "내용을 입력하세요...";
          const marginLevel = placeholderMarginLevel[node.type.name] || 0;

          // 마진 레벨을 텍스트에 숨겨진 마커로 추가
          return text;
        },
        emptyEditorClass: "is-empty",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: 'resizable-image',
        },
      }).extend({
        addNodeView() {
          return ReactNodeViewRenderer(ResizableImage);
        },
        
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: 'auto',
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width || attributes.width === 'auto') {
                  return {};
                }
                return {
                  width: attributes.width,
                };
              },
            },
            height: {
              default: 'auto',
              parseHTML: element => element.getAttribute('height'),
              renderHTML: attributes => {
                if (!attributes.height || attributes.height === 'auto') {
                  return {};
                }
                return {
                  height: attributes.height,
                };
              },
            },
          };
        },
      }),
      SlashCommand,
      ReadonlyText,
      EnhancedToggle,
      Indent,
      MoveCursorToStart,
      KeyMap,
      GridColumns,
      GridColumn,
      Callout,
      BlockSelection,
      // NotionToggle,
    ],
    content: "",
    editorProps: {
      handlePaste(view, event) {
        // 엑셀 붙여넣기
        const text = event.clipboardData?.getData("text/plain");
        if (text.includes("\t")) {
          const rows = text
            .split(/\r?\n/)
            .filter((r) => r.trim() !== "")
            .map((row) => row.split("\t"));

          const { schema } = editor;

          const table = schema.nodes.table.create(
            {},
            rows.map((row) =>
              schema.nodes.tableRow.create(
                {},
                row.map((cell) => schema.nodes.tableCell.create({}, schema.nodes.paragraph.create({}, schema.text(cell || ""))))
              )
            )
          );

          const tr = view.state.tr.replaceSelectionWith(table);
          view.dispatch(tr);
          return true;
        }

        // 이미지 붙여넣기 처리
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (const item of items) {
          if (item.type.indexOf("image") === 0) {
            const file = item.getAsFile();
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              editor.chain().focus().setImage({ src: readerEvent.target.result }).run();
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },

      handleDrop(view, event, slice, moved) {
        const files = event.dataTransfer?.files;
        if (!files || files.length === 0) return false;

        for (const file of files) {
          if (file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (readerEvent) => {
              editor.chain().focus().setImage({ src: readerEvent.target.result }).run();
            };
            reader.readAsDataURL(file);
            return true;
          }
        }
        return false;
      },

      // 우클릭 컨텍스트 메뉴 처리
      handleContextMenu(view, event) {
        const { target } = event;

        // 표 셀에서 우클릭한 경우
        if (target.closest("td, th")) {
          event.preventDefault();
          setTableMenu({
            show: true,
            position: {
              x: event.clientX,
              y: event.clientY,
            },
          });
          return true;
        }

        return false;
      },

      handleKeyDown(view, event) {
        const { $from } = view.state.selection;

        if (event.key === "Tab") {
          event.preventDefault();
          const { $from } = view.state.selection;
          const parent = $from.node($from.depth - 1);

          if (parent.type.name === "listItem") {
            if (event.shiftKey) {
              editor.chain().focus().liftListItem("listItem").run();
            } else {
              editor.chain().focus().sinkListItem("listItem").run();
            }
          } else {
            if (event.shiftKey) {
              editor.chain().focus().outdent().run();
            } else {
              editor.chain().focus().indent().run();
            }
          }
          return true;
        }

        if (event.key === "Backspace" && $from.parentOffset === 0) {
          const parentType = $from.parent.type.name;

          if (["heading", "bulletList", "orderedList", "toggle", "taskList", "paragraph"].includes(parentType)) {
            event.preventDefault();
            return editor.chain().focus().setParagraph().run();
          }
        }

        return false;
      },
    },

    // 선택 영역 변경 시 색상 팝업 표시
    onSelectionUpdate: ({ editor }) => {
      const { selection } = editor.state;

      // 텍스트가 선택된 경우만 처리
      if (!selection.empty) {
        // 약간의 지연을 두어 마우스 업 이벤트 이후에 실행
        setTimeout(() => {
          const { from, to } = selection;
          const start = editor.view.coordsAtPos(from);
          const end = editor.view.coordsAtPos(to);

          setColorPicker({
            show: true,
            position: {
              x: (start.left + end.left) / 2, // 팝업 가운데 정렬
              y: Math.max(start.top, end.top),
            },
          });
        }, 100);
      } else {
        setColorPicker({ show: false, position: { x: 0, y: 0 } });
      }
    },
  });

  // 외부 클릭 시 팝업들 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (colorPicker.show && !event.target.closest(".color-picker")) {
        setColorPicker({ show: false, position: { x: 0, y: 0 } });
      }
      if (tableMenu.show && !event.target.closest(".table-context-menu")) {
        setTableMenu({ show: false, position: { x: 0, y: 0 } });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorPicker.show, tableMenu.show]);

  // 테이블 호버 시 간단한 + 버튼 표시 (디버깅용)
  useEffect(() => {
    if (!editor) return;

    const handleTableHover = (e) => {
      if (e.target.closest('.compact-table')) {
        console.log('테이블 호버됨!');
        
        // 기존 버튼들 제거
        document.querySelectorAll('.debug-table-button').forEach(btn => btn.remove());
        
        const table = e.target.closest('.compact-table');
        const tableRect = table.getBoundingClientRect();
        
        // 테스트 버튼 생성
        const testButton = document.createElement('button');
        testButton.className = 'debug-table-button';
        testButton.innerHTML = '+';
        testButton.style.cssText = `
          position: fixed;
          left: ${tableRect.left - 30}px;
          top: ${tableRect.top}px;
          width: 25px;
          height: 25px;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          font-size: 14px;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        `;
        
        testButton.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('테스트 버튼 클릭됨!');
          editor.chain().focus().addRowAfter().run();
        });
        
        document.body.appendChild(testButton);
        
        console.log('테스트 버튼 생성됨');
      }
    };

    const handleTableLeave = (e) => {
      if (!e.relatedTarget || !e.relatedTarget.closest('.compact-table')) {
        console.log('테이블 벗어남');
        document.querySelectorAll('.debug-table-button').forEach(btn => btn.remove());
      }
    };

    document.addEventListener('mouseenter', handleTableHover, true);
    document.addEventListener('mouseleave', handleTableLeave, true);
    
    return () => {
      document.removeEventListener('mouseenter', handleTableHover, true);
      document.removeEventListener('mouseleave', handleTableLeave, true);
      document.querySelectorAll('.debug-table-button').forEach(btn => btn.remove());
    };
  }, [editor]);

  useEffect(() => {
    if (editor && ydoc.getXmlFragment("default").length === 0) {
      // 초기 로딩 중 표시
      editor.commands.setContent({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "📊 실시간 대시보드" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "데이터를 불러오는 중..." }],
          },
        ],
      });

      // 실제 Snowflake 데이터 로드
      loadDashboardData();
    }
  }, [editor]);

  // 대시보드 데이터 로드 함수
  const loadDashboardData = async () => {
    try {
      // 여러 쿼리를 병렬로 실행
      const [salesResult, multiRowResult] = await Promise.all([
        // 요약 데이터 (1행)
        snowflakeAPI.executeQuery(`
          SELECT  
            '1억' as total_sales,
            500 as order_count,
            200000 as avg_order_value,
            250 as new_customers
        `),
        // 다중 행 데이터 (여러 행)
        snowflakeAPI.executeQuery(`
          SELECT category, sales, customers FROM ( 
            SELECT '전자제품' as category, '5000만원' as sales, 120 as customers
            UNION ALL 
            SELECT '의류', '3000만원', 85
            UNION ALL 
            SELECT '식품', '2000만원', 95
            UNION ALL 
            SELECT '도서', '1000만원', 60
            UNION ALL
            SELECT '기타', '1억', 140
          )
        `),
      ]);

      console.log("salesResult:", salesResult);
      console.log("multiRowResult:", multiRowResult);

      // 요약 데이터 추출 (소문자 키 사용)
      const totalSales = salesResult.data.rows[0]?.total_sales || "0";
      const orderCount = salesResult.data.rows[0]?.order_count || 0;
      const avgOrderValue = salesResult.data.rows[0]?.avg_order_value || 0;
      const newCustomers = salesResult.data.rows[0]?.new_customers || 0;

      // 다중 행 데이터 추출
      const multiRowData = multiRowResult.data.rows || [];

      // 실제 데이터로 화면 업데이트 (요약 테이블 + 상세 테이블)
      editor.commands.setContent({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "📊 실시간 대시보드" }],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "💼 핵심 지표 요약" }],
          },

          // 🏆 요약 테이블 (핵심 지표)
          {
            type: "table",
            content: [
              // 헤더 행
              {
                type: "tableRow",
                content: [
                  {
                    type: "tableHeader",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "지표" }] }],
                  },
                  {
                    type: "tableHeader",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "값" }] }],
                  },
                ],
              },
              // 데이터 행들
              {
                type: "tableRow",
                content: [
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "💰 총 매출" }] }],
                  },
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: totalSales }] }],
                  },
                ],
              },
              {
                type: "tableRow",
                content: [
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "📦 주문 수" }] }],
                  },
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: `${orderCount.toLocaleString()}건` }] }],
                  },
                ],
              },
              {
                type: "tableRow",
                content: [
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: "👥 신규 고객" }] }],
                  },
                  {
                    type: "tableCell",
                    content: [{ type: "paragraph", content: [{ type: "text", text: `${newCustomers.toLocaleString()}명` }] }],
                  },
                ],
              },
            ],
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: " " }], // 공백 문자
          },
          {
            type: "paragraph",
            content: [{ type: "text", text: "📈 상세 데이터" }],
          },
          // 🔍 상세 데이터 테이블 (다중 행 쿼리 결과)
          {
            type: "table",
            content: [
              // 헤더 행
              {
                type: "tableRow",
                content: [
                  { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "카테고리" }] }] },
                  { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "매출" }] }] },
                  { type: "tableHeader", content: [{ type: "paragraph", content: [{ type: "text", text: "고객수" }] }] },
                ],
              },
              // 다중 행 데이터
              ...multiRowData.map((row) => ({
                type: "tableRow",
                content: [
                  { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: row.category || "" }] }] },
                  { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: row.sales || "" }] }] },
                  { type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: `${row.customers || 0}명` }] }] },
                ],
              })),
            ],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `🔄 마지막 업데이트: ${new Date().toLocaleString("ko-KR")}`,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.error("대시보드 데이터 로드 실패:", error);

      // 오류 시 오류 메시지 표시
      editor.commands.setContent({
        type: "doc",
        content: [
          {
            type: "heading",
            attrs: { level: 1 },
            content: [{ type: "text", text: "📊 대시보드 (오프라인)" }],
          },
          {
            type: "callout",
            attrs: { type: "error", title: "데이터 로드 실패" },
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: `Snowflake 연결 오류: ${error.message}` }],
              },
            ],
          },
          {
            type: "readonlyText",
            attrs: { text: "매출: 데이터 없음" },
          },
        ],
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <header style={{ height: "60px", borderBottom: "1px solid #ddd" }}>
        헤더
        {/* 표 추가 버튼 (테스트용) */}
        <button
          onClick={() => {
            editor?.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
          }}
          style={{ marginLeft: "10px", padding: "4px 8px" }}
        >
          표 추가
        </button>
        {/* 열나누기 버튼 */}
        <button
          onClick={() => {
            console.log("2열 버튼 클릭, editor:", editor);
            if (editor) {
              // 새 줄에 삽입하기 위해 먼저 새 문단 생성
              editor.chain().focus().insertContent({ type: "paragraph" }).run();
              console.log("insertGridColumns 실행 중...");
              const result = editor.chain().focus().insertGridColumns({ columns: 2 }).run();
              console.log("insertGridColumns 결과:", result);
            }
          }}
          style={{ marginLeft: "10px", padding: "4px 8px" }}
        >
          2열
        </button>
        <button
          onClick={() => {
            console.log("3열 버튼 클릭, editor:", editor);
            if (editor) {
              console.log("insertGridColumns 실행 중...");
              const result = editor.chain().focus().insertGridColumns({ columns: 3 }).run();
              console.log("insertGridColumns 결과:", result);
            }
          }}
          style={{ marginLeft: "10px", padding: "4px 8px" }}
        >
          3열
        </button>
        {/* Callout 버튼 */}
        <button
          onClick={() => {
            editor?.chain().focus().insertCallout({ type: "info", title: "정보" }).run();
          }}
          style={{ marginLeft: "10px", padding: "4px 8px" }}
        >
          💡 Callout
        </button>
        {/* Snowflake 데이터 템플릿 버튼들 */}
        <button onClick={() => insertDataTemplate("salesDashboard")} style={{ marginLeft: "10px", padding: "4px 8px", backgroundColor: "#e0f2fe" }}>
          📊 매출 대시보드
        </button>
        <button onClick={() => insertDataTemplate("productPerformance")} style={{ marginLeft: "10px", padding: "4px 8px", backgroundColor: "#f0fdf4" }}>
          🛍️ 제품 성과
        </button>
        <button onClick={() => insertDataTemplate("salesByRegion")} style={{ marginLeft: "10px", padding: "4px 8px", backgroundColor: "#fef3c7" }}>
          🌍 지역별 매출
        </button>
        {/* 디버깅용 초기화 버튼 */}
        <button
          onClick={() => {
            if (editor) {
              editor.commands.clearContent();
              console.log("에디터 내용 초기화됨");
            }
          }}
          style={{ marginLeft: "10px", padding: "4px 8px", backgroundColor: "#fecaca" }}
        >
          🗑️ 초기화
        </button>
      </header>

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          width: "100%",
          height: "100%",
        }}
      >
        <div
          onClick={() => editor?.commands.focus()}
          style={{
            flex: 1,
            cursor: "text",
            overflowY: "auto",
            width: "100%",
            height: "100%",
          }}
        >
          <EditorContent editor={editor} className="tiptap" />
        </div>
      </main>

      {/* 색상 선택 팝업 */}
      <ColorPicker editor={editor} show={colorPicker.show} position={colorPicker.position} onClose={() => setColorPicker({ show: false, position: { x: 0, y: 0 } })} />

      {/* 표 컨텍스트 메뉴 */}
      <TableContextMenu editor={editor} show={tableMenu.show} position={tableMenu.position} onClose={() => setTableMenu({ show: false, position: { x: 0, y: 0 } })} />
    </div>
  );
}
