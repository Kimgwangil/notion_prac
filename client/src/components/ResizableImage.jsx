import React, { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const ResizableImage = ({ node, updateAttributes, editor }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const imageRef = useRef(null);
  const modalRef = useRef(null);

  const { src, alt, title, width = 'auto', height = 'auto' } = node.attrs;

  // 이미지 크기 조절 시작
  const handleResizeStart = (event, direction) => {
    event.preventDefault();
    event.stopPropagation();
    
    const rect = imageRef.current.getBoundingClientRect();
    setIsResizing(direction);
    setDragStart({
      x: event.clientX,
      y: event.clientY,
      width: rect.width,
      height: rect.height
    });
  };

  // 이미지 크기 조절 중
  const handleResizeMove = (event) => {
    if (!isResizing) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;

    let newWidth = dragStart.width;
    let newHeight = dragStart.height;

    switch (isResizing) {
      case 'se': // 남동쪽 (오른쪽 아래)
        newWidth = Math.max(50, dragStart.width + deltaX);
        newHeight = Math.max(50, dragStart.height + deltaY);
        break;
      case 'e': // 동쪽 (오른쪽)
        newWidth = Math.max(50, dragStart.width + deltaX);
        break;
      case 's': // 남쪽 (아래)
        newHeight = Math.max(50, dragStart.height + deltaY);
        break;
      case 'sw': // 남서쪽 (왼쪽 아래)
        newWidth = Math.max(50, dragStart.width - deltaX);
        newHeight = Math.max(50, dragStart.height + deltaY);
        break;
      case 'w': // 서쪽 (왼쪽)
        newWidth = Math.max(50, dragStart.width - deltaX);
        break;
      case 'nw': // 북서쪽 (왼쪽 위)
        newWidth = Math.max(50, dragStart.width - deltaX);
        newHeight = Math.max(50, dragStart.height - deltaY);
        break;
      case 'n': // 북쪽 (위)
        newHeight = Math.max(50, dragStart.height - deltaY);
        break;
      case 'ne': // 북동쪽 (오른쪽 위)
        newWidth = Math.max(50, dragStart.width + deltaX);
        newHeight = Math.max(50, dragStart.height - deltaY);
        break;
    }

    updateAttributes({ 
      width: `${newWidth}px`, 
      height: `${newHeight}px` 
    });
  };

  // 이미지 크기 조절 종료
  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // 더블클릭으로 확대 보기
  const handleDoubleClick = () => {
    setShowModal(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setShowModal(false);
  };

  // 전역 마우스 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = getCursor(isResizing);
    }

    return () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeEnd);
      document.body.style.cursor = 'auto';
    };
  }, [isResizing, dragStart]);

  // 커서 스타일 결정
  const getCursor = (direction) => {
    switch (direction) {
      case 'n':
      case 's':
        return 'ns-resize';
      case 'e':
      case 'w':
        return 'ew-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      case 'nw':
      case 'se':
        return 'nwse-resize';
      default:
        return 'auto';
    }
  };

  // 모달 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  return (
    <>
      <NodeViewWrapper className="resizable-image-wrapper">
        <div 
          className="image-container"
          style={{ 
            display: 'inline-block', 
            position: 'relative',
            width: width === 'auto' ? 'auto' : width,
            height: height === 'auto' ? 'auto' : height,
            maxWidth: '100%'
          }}
        >
          <img
            ref={imageRef}
            src={src}
            alt={alt || ''}
            title={title || ''}
            onDoubleClick={handleDoubleClick}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              cursor: 'pointer',
              border: isResizing ? '2px solid #3b82f6' : 'none',
              borderRadius: '4px'
            }}
            draggable={false}
          />
          
          {/* 크기 조절 핸들들 */}
          {!isResizing && (
            <>
              {/* 모서리 핸들들 */}
              <div
                className="resize-handle nw"
                onMouseDown={(e) => handleResizeStart(e, 'nw')}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'nw-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle ne"
                onMouseDown={(e) => handleResizeStart(e, 'ne')}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'ne-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle sw"
                onMouseDown={(e) => handleResizeStart(e, 'sw')}
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'sw-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle se"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  right: '-5px',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'nw-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              
              {/* 변 중앙 핸들들 */}
              <div
                className="resize-handle n"
                onMouseDown={(e) => handleResizeStart(e, 'n')}
                style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'n-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle s"
                onMouseDown={(e) => handleResizeStart(e, 's')}
                style={{
                  position: 'absolute',
                  bottom: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 's-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle e"
                onMouseDown={(e) => handleResizeStart(e, 'e')}
                style={{
                  position: 'absolute',
                  right: '-5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'e-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
              <div
                className="resize-handle w"
                onMouseDown={(e) => handleResizeStart(e, 'w')}
                style={{
                  position: 'absolute',
                  left: '-5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '10px',
                  height: '10px',
                  backgroundColor: '#3b82f6',
                  cursor: 'w-resize',
                  borderRadius: '50%',
                  opacity: 0
                }}
              />
            </>
          )}
        </div>
      </NodeViewWrapper>

      {/* 확대 보기 모달 */}
      {showModal && (
        <div 
          className="image-modal"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer'
          }}
          onClick={closeModal}
        >
          <div 
            ref={modalRef}
            style={{
              position: 'relative',
              maxWidth: '90vw',
              maxHeight: '90vh',
              cursor: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={src}
              alt={alt || ''}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="닫기"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ResizableImage;