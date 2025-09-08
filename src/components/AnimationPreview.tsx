'use client';

import { motion } from 'framer-motion';
import { AnimationSettings } from '@/types/bento';
import { useState } from 'react';

interface AnimationPreviewProps {
  settings: AnimationSettings;
}

export default function AnimationPreview({ settings }: AnimationPreviewProps) {
  const [isVisible, setIsVisible] = useState(false);

  const getVariant = () => {
    switch (settings.blockAnimation) {
      case 'fadeUp':
        return { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
      case 'fadeIn':
        return { hidden: { opacity: 0 }, visible: { opacity: 1 } };
      case 'scaleIn':
        return {
          hidden: { opacity: 0, scale: 0.8 },
          visible: { opacity: 1, scale: 1 },
        };
      case 'slideIn':
        return {
          hidden: { opacity: 0, x: -30 },
          visible: { opacity: 1, x: 0 },
        };
      case 'bounce':
        return {
          hidden: { opacity: 0, y: -20, scale: 0.8 },
          visible: { opacity: 1, y: 0, scale: 1 },
        };
      default:
        return { hidden: {}, visible: {} };
    }
  };

  const getEase = () => {
    switch (settings.ease) {
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

  const variants = getVariant();

  return (
    <div className="flex flex-col items-center space-y-4 p-4">
      <motion.div
        variants={variants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
        transition={{
          duration: settings.duration,
          ...getEase(),
        }}
        whileHover={settings.hoverEffects ? { scale: 1.05, y: -2 } : undefined}
        className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center"
      >
        <span className="text-white text-xs font-bold">Test</span>
      </motion.div>

      <button
        onClick={() => setIsVisible(!isVisible)}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
      >
        {isVisible ? 'Hide' : 'Show'} Animation
      </button>
    </div>
  );
}
