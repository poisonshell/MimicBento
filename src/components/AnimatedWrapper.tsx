'use client';

import { motion, Variants, useInView } from 'framer-motion';
import { AnimationSettings } from '@/types/bento';
import { ReactNode, useRef } from 'react';

interface AnimatedWrapperProps {
  children: ReactNode;
  animations?: AnimationSettings;
  index?: number;
  className?: string;
  style?: React.CSSProperties;
  layout?: boolean;
}
const defaultAnimations: AnimationSettings = {
  enabled: true,
  pageTransition: 'fade',
  blockStagger: true,
  blockAnimation: 'fadeUp',
  hoverEffects: true,
  scrollAnimation: true,
  duration: 0.6,
  ease: 'easeOut',
};

export function AnimatedWrapper({
  children,
  animations = defaultAnimations,
  index = 0,
  className = '',
  style,
  layout = false,
}: AnimatedWrapperProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once: true,
    margin: '-50px 0px -50px 0px',
    amount: 0.3,
  });

  const scrollDelay = animations.scrollAnimation ? Math.random() * 0.1 : 0;

  if (!animations.enabled) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }
  const getEaseFunction = (ease: string) => {
    switch (ease) {
      case 'spring':
        return { type: 'spring' as const, damping: 25, stiffness: 300 };
      case 'linear':
        return { ease: 'linear' as const };
      case 'easeIn':
        return { ease: [0.4, 0, 1, 1] as const };
      case 'easeOut':
        return { ease: [0, 0, 0.2, 1] as const };
      case 'easeInOut':
        return { ease: [0.4, 0, 0.2, 1] as const };
      default:
        return { ease: [0, 0, 0.2, 1] as const };
    }
  };

  const blockVariants: Variants = {
    hidden: (() => {
      switch (animations.blockAnimation) {
        case 'fadeUp':
          return { opacity: 0, y: 30 };
        case 'fadeIn':
          return { opacity: 0 };
        case 'scaleIn':
          return { opacity: 0, scale: 0.8 };
        case 'slideIn':
          return { opacity: 0, x: -30 };
        case 'bounce':
          return { opacity: 0, y: -20, scale: 0.8 };
        default:
          return {};
      }
    })(),
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      transition: {
        duration: animations.duration,
        delay: animations.blockStagger
          ? animations.scrollAnimation
            ? index * 0.05 + scrollDelay
            : index * 0.1
          : scrollDelay,
        ...getEaseFunction(animations.ease),
      },
    },
  };

  const hoverVariants = animations.hoverEffects
    ? {
        scale: 1.02,
        y: -2,
        transition: {
          duration: 0.2,
          ease: [0, 0, 0.2, 1] as const,
        },
      }
    : {};

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      variants={blockVariants}
      initial="hidden"
      animate={
        animations.scrollAnimation
          ? isInView
            ? 'visible'
            : 'hidden'
          : 'visible'
      }
      whileHover={hoverVariants}
      layout={layout}
      layoutId={layout ? `block-${index}` : undefined}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({
  children,
  animations = defaultAnimations,
}: {
  children: ReactNode;
  animations?: AnimationSettings;
}) {
  if (!animations.enabled || animations.pageTransition === 'none') {
    return <>{children}</>;
  }

  const getPageVariants = (): Variants => {
    switch (animations.pageTransition) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'slide':
        return {
          initial: { opacity: 0, x: 50 },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -50 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.9 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 1.1 },
        };
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
    }
  };

  const getEaseFunction = (ease: string) => {
    switch (ease) {
      case 'spring':
        return { type: 'spring' as const, damping: 25, stiffness: 300 };
      case 'linear':
        return { ease: 'linear' as const };
      case 'easeIn':
        return { ease: [0.4, 0, 1, 1] as const };
      case 'easeOut':
        return { ease: [0, 0, 0.2, 1] as const };
      case 'easeInOut':
        return { ease: [0.4, 0, 0.2, 1] as const };
      default:
        return { ease: [0, 0, 0.2, 1] as const };
    }
  };

  return (
    <motion.div
      variants={getPageVariants()}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{
        duration: animations.duration,
        ...getEaseFunction(animations.ease),
      }}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedGrid({
  children,
  animations = defaultAnimations,
}: {
  children: ReactNode;
  animations?: AnimationSettings;
}) {
  if (!animations.enabled) {
    return <>{children}</>;
  }

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: animations.blockStagger ? 0.1 : 0,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
