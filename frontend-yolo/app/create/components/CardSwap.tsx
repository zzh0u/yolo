'use client';

import React, { useRef, useEffect, useState, useLayoutEffect, Children, cloneElement, forwardRef, useMemo, ReactElement } from 'react';
import gsap from "gsap";
import './CardSwap.css';
import { CardProps, CardSwapProps } from '../types';

// Card 组件
export const Card = forwardRef<HTMLDivElement, CardProps>(
  function Card({ children, style, className, ...rest }, ref) {
    return (
      <div
        ref={ref}
        {...rest}
        className={`card ${className || ''}`.trim()}
        style={{
          width: 420,
          minHeight: 280,
          background: '#000',
          color: 'white',
          borderRadius: '16px',
          border: '1px solid #fff',
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          padding: '32px',
          cursor: 'pointer',
          userSelect: 'none',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          transition: 'box-shadow 0.3s ease',
          ...style,
        }}
        onMouseEnter={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow: '0 16px 64px rgba(0,0,0,0.25)',
            duration: 0.3,
          });
        }}
        onMouseLeave={(e) => {
          gsap.to(e.currentTarget, {
            boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
            duration: 0.3,
          });
        }}
      >
        {children}
      </div>
    );
  }
);

// CardSwap 主组件
function CardSwap({
  children,
  cardDistance = 60,
  verticalDistance = 40,
  delay = 4000,
  pauseOnHover = true,
  width = 340,
  height = 320,
  skewAmount = 3,
  easing = "elastic",
  onCardClick,
}: CardSwapProps) {
  const cards = Children.toArray(children);
  const [active, setActive] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timer = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);

  const config = easing === "elastic" 
    ? { ease: "elastic.out(0.6,0.9)", duration: 1.2 }
    : { ease: "power2.inOut", duration: 0.8 };

  // 初始化动画
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!isInitialized && cardRefs.current.every(ref => ref !== null)) {
        cards.forEach((_, i) => {
          const el = cardRefs.current[i];
          if (!el) return;
          
          // 初始位置设置
          gsap.set(el, {
            opacity: 0,
            scale: 0.8,
            rotationY: 45,
            x: i * cardDistance,
            y: Math.abs(i) * verticalDistance,
            z: -Math.abs(i) * cardDistance * 0.5,
            transformOrigin: 'center center',
            zIndex: cards.length - Math.abs(i),
          });
          
          // 入场动画
          gsap.to(el, {
            opacity: i === 0 ? 1 : Math.max(0.6 - Math.abs(i) * 0.1, 0),
            scale: i === 0 ? 1 : 0.92 - Math.abs(i) * 0.03,
            rotationY: i * 2,
            skewY: i === 0 ? 0 : Math.min(Math.abs(i) * skewAmount, 8),
            duration: 0.8,
            delay: i * 0.1,
            ease: "back.out(1.7)",
            onComplete: () => {
              if (i === cards.length - 1) {
                setIsInitialized(true);
              }
            }
          });
        });
      }
    }, containerRef);
    return () => ctx.revert();
  }, [cards.length, cardDistance, verticalDistance, skewAmount, isInitialized]);

  // 自动切换
  useEffect(() => {
    if (!isInitialized || (pauseOnHover && isPaused.current)) return;
    
    timer.current = setTimeout(() => {
      setActive((prev) => (prev + 1) % cards.length);
    }, delay);
    
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [active, delay, cards.length, pauseOnHover, isInitialized]);

  // 动画效果
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (!isInitialized) return;
      
      cards.forEach((_, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        
        const offset = i - active;
        const abs = Math.abs(offset);
        const isActive = offset === 0;
        
        // 停止之前的浮动动画
        gsap.killTweensOf(el);
        
        // 主要动画
        gsap.to(el, {
          x: offset * cardDistance,
          y: abs * verticalDistance,
          z: -abs * cardDistance * 0.5,
          scale: isActive ? 1 : 0.92 - abs * 0.03,
          opacity: isActive ? 1 : Math.max(0.6 - abs * 0.1, 0),
          skewY: isActive ? 0 : Math.min(abs * skewAmount, 8),
          rotationY: offset * 2,
          zIndex: cards.length - abs,
          filter: isActive ? 'blur(0px)' : `blur(${Math.min(abs, 2)}px)`,
          transformOrigin: 'center center',
          ...config,
          onComplete: () => {
            // 为非活跃卡片添加轻微浮动
            if (!isActive && abs <= 2) {
              gsap.to(el, {
                y: `+=${Math.sin(Date.now() * 0.001 + i) * 3}`,
                duration: 2 + Math.random(),
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
              });
            }
          }
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [active, cardDistance, verticalDistance, cards.length, skewAmount, config, isInitialized]);

  // 悬停处理
  const handleMouseEnter = () => {
    if (pauseOnHover) {
      isPaused.current = true;
      if (timer.current) clearTimeout(timer.current);
      
      // 高亮当前活跃卡片
      const activeEl = cardRefs.current[active];
      if (activeEl) {
        gsap.to(activeEl, {
          scale: 1.05,
          boxShadow: '0 20px 80px rgba(0,0,0,0.3)',
          duration: 0.3,
        });
      }
    }
  };

  const handleMouseLeave = () => {
    if (pauseOnHover) {
      isPaused.current = false;
      setActive((prev) => prev);
      
      // 恢复正常状态
      const activeEl = cardRefs.current[active];
      if (activeEl) {
        gsap.to(activeEl, {
          scale: 1,
          boxShadow: '0 12px 48px rgba(0,0,0,0.15)',
          duration: 0.3,
        });
      }
    }
  };

  const handleCardClick = (index: number) => {
    const el = cardRefs.current[index];
    if (el) {
      // 点击动画
      gsap.to(el, {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
      });
    }
    onCardClick?.(index);
    setActive(index);
  };

  type CardElement = ReactElement<CardSwapProps>;
  const childArr: CardElement[] = useMemo(
    () => Children.toArray(children) as CardElement[],
    [children]
  );

  return (
    <div
      ref={containerRef}
      className="card-swap-container"
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {childArr.map((child, i) => {
        const cardProps = {
          ref: (el: HTMLDivElement | null) => {
            cardRefs.current[i] = el;
          },
          key: i,
          onClick: () => handleCardClick(i),
          style: {
            ...((child as any).props?.style || {}),
            width: typeof width === 'number' ? Math.min(width - 40, 420) : 420,
            height: typeof height === 'number' ? Math.min(height - 40, 280) : 280,
          },
          children: (child as any).props?.children,
        };

        return cloneElement(child as CardElement, cardProps);
      })}
    </div>
  );
}

export default CardSwap;