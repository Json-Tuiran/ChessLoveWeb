import React, { useState, useEffect, useRef } from 'react';
import { MessageCircleHeart } from 'lucide-react';

interface FloatingChatBubbleProps {
  unreadCount: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const FloatingChatBubble: React.FC<FloatingChatBubbleProps> = ({
  unreadCount,
  isOpen,
  onToggle,
}) => {
  // Coordinates for freely moving the bubble
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const saved = localStorage.getItem('chesslove_bubble_pos');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    // Default position: bottom right above navigation bar
    const defaultX = typeof window !== 'undefined' ? Math.max(20, window.innerWidth - 76) : 280;
    const defaultY = typeof window !== 'undefined' ? Math.max(20, window.innerHeight - 150) : 500;
    return { x: defaultX, y: defaultY };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number }>({
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });
  const hasMovedRef = useRef(false);

  // Clamp within viewport
  const clamp = (x: number, y: number) => {
    const margin = 8;
    const size = 58;
    const minX = margin;
    const maxX = window.innerWidth - size - margin;
    const minY = margin;
    const maxY = window.innerHeight - size - margin;

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    };
  };

  // Keep within bounds on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        const clamped = clamp(prev.x, prev.y);
        return clamped;
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  // Touch Drag Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    hasMovedRef.current = false;
    const touch = e.touches[0];
    dragStartRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      origX: position.x,
      origY: position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStartRef.current.startX;
      const dy = e.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }
      const newPos = clamp(dragStartRef.current.origX + dx, dragStartRef.current.origY + dy);
      setPosition(newPos);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (e.cancelable) e.preventDefault();
      const touch = e.touches[0];
      const dx = touch.clientX - dragStartRef.current.startX;
      const dy = touch.clientY - dragStartRef.current.startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        hasMovedRef.current = true;
      }
      const newPos = clamp(dragStartRef.current.origX + dx, dragStartRef.current.origY + dy);
      setPosition(newPos);
    };

    const handleEnd = () => {
      setIsDragging(false);
      localStorage.setItem('chesslove_bubble_pos', JSON.stringify(position));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, position]);

  const handleClick = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.stopPropagation();
      return;
    }
    onToggle();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Abrir Chat de Pareja"
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onClick={handleClick}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 9999, // Ensure on top of all screens
        width: '58px',
        height: '58px',
        borderRadius: '50%',
        backgroundColor: 'var(--velvet-card)',
        border: '2px solid var(--rose-gold-primary)',
        boxShadow: isDragging
          ? '0 12px 30px rgba(229, 115, 136, 0.65), 0 0 16px var(--rose-gold-primary)'
          : '0 8px 24px rgba(229, 115, 136, 0.45), 0 4px 12px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        transform: isDragging
          ? 'scale(1.15)'
          : isOpen
          ? 'rotate(90deg) scale(0.92)'
          : 'scale(1)',
        transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
      title="Chat de Pareja (Arrastra para mover a cualquier posición)"
    >
      <MessageCircleHeart
        size={28}
        color={isOpen ? 'var(--rose-gold-secondary)' : 'var(--rose-gold-primary)'}
        className={unreadCount > 0 ? 'pulse-heart' : ''}
        style={{ pointerEvents: 'none' }}
      />

      {/* Unread Message Badge */}
      {unreadCount > 0 && !isOpen && (
        <span
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            backgroundColor: 'var(--rose-gold-primary)',
            color: '#FFFFFF',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '999px',
            minWidth: '20px',
            height: '20px',
            padding: '0 5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--velvet-dark)',
            boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
            pointerEvents: 'none',
          }}
        >
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </div>
  );
};
