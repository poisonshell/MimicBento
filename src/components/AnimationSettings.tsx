'use client';

import { AnimationSettings as AnimationSettingsType } from '@/types/bento';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimationSettingsProps {
  settings: AnimationSettingsType;
  onUpdate: (settings: AnimationSettingsType) => void;
}

const defaultSettings: AnimationSettingsType = {
  enabled: true,
  pageTransition: 'fade',
  blockStagger: true,
  blockAnimation: 'fadeUp',
  hoverEffects: true,
  scrollAnimation: true,
  duration: 0.6,
  ease: 'easeOut',
};

export default function AnimationSettings({
  settings,
  onUpdate,
}: AnimationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState<AnimationSettingsType>({
    ...defaultSettings,
    ...settings,
  });

  const handleChange = <K extends keyof AnimationSettingsType>(
    key: K,
    value: AnimationSettingsType[K]
  ) => {
    const updatedSettings = { ...localSettings, [key]: value };
    setLocalSettings(updatedSettings);
    onUpdate(updatedSettings);
  };

  const previewVariants = {
    fadeUp: { y: 20, opacity: 0 },
    fadeIn: { opacity: 0 },
    scaleIn: { scale: 0.8, opacity: 0 },
    slideIn: { x: -20, opacity: 0 },
    bounce: { y: -10, opacity: 0 },
    none: {},
  };

  const previewAnimation = {
    y: 0,
    x: 0,
    scale: 1,
    opacity: 1,
    transition: {
      duration: localSettings.duration,
      ease:
        localSettings.ease === 'spring'
          ? ([0.25, 0.46, 0.45, 0.94] as const)
          : localSettings.ease === 'linear'
            ? ('linear' as const)
            : localSettings.ease === 'easeIn'
              ? ([0.4, 0, 1, 1] as const)
              : localSettings.ease === 'easeOut'
                ? ([0, 0, 0.2, 1] as const)
                : ([0.4, 0, 0.2, 1] as const),
    },
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors bg-purple-600 hover:bg-purple-700 text-white"
      >
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        <span className="hidden sm:inline">Animations</span>
        <span className="sm:hidden">Anim</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 p-3 sm:p-4 z-50"
          >
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Animation Settings
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {}
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Enable Animations
                </label>
                <button
                  onClick={() =>
                    handleChange('enabled', !localSettings.enabled)
                  }
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    localSettings.enabled ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      localSettings.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {localSettings.enabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Transition
                    </label>
                    <select
                      value={localSettings.pageTransition}
                      onChange={e =>
                        handleChange(
                          'pageTransition',
                          e.target
                            .value as AnimationSettingsType['pageTransition']
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="fade">Fade</option>
                      <option value="slide">Slide</option>
                      <option value="scale">Scale</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Block Animation
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(previewVariants).map(animation => (
                        <motion.button
                          key={animation}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() =>
                            handleChange(
                              'blockAnimation',
                              animation as AnimationSettingsType['blockAnimation']
                            )
                          }
                          className={`relative p-2 sm:p-3 text-xs rounded-md border transition-colors ${
                            localSettings.blockAnimation === animation
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex flex-col items-center space-y-1">
                            <motion.div
                              key={`${animation}-${Date.now()}`}
                              initial={
                                previewVariants[
                                  animation as keyof typeof previewVariants
                                ]
                              }
                              animate={previewAnimation}
                              className="w-4 h-4 bg-purple-400 rounded"
                            />
                            <span className="capitalize">{animation}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Stagger Animation
                    </label>
                    <button
                      onClick={() =>
                        handleChange(
                          'blockStagger',
                          !localSettings.blockStagger
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.blockStagger
                          ? 'bg-purple-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.blockStagger
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Hover Effects
                    </label>
                    <button
                      onClick={() =>
                        handleChange(
                          'hoverEffects',
                          !localSettings.hoverEffects
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.hoverEffects
                          ? 'bg-purple-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.hoverEffects
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      Scroll Animations
                    </label>
                    <button
                      onClick={() =>
                        handleChange(
                          'scrollAnimation',
                          !localSettings.scrollAnimation
                        )
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        localSettings.scrollAnimation
                          ? 'bg-purple-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          localSettings.scrollAnimation
                            ? 'translate-x-6'
                            : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration: {localSettings.duration}s
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="2"
                      step="0.1"
                      value={localSettings.duration}
                      onChange={e =>
                        handleChange('duration', parseFloat(e.target.value))
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>

                  {}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Easing
                    </label>
                    <select
                      value={localSettings.ease}
                      onChange={e =>
                        handleChange(
                          'ease',
                          e.target.value as AnimationSettingsType['ease']
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="linear">Linear</option>
                      <option value="easeIn">Ease In</option>
                      <option value="easeOut">Ease Out</option>
                      <option value="easeInOut">Ease In Out</option>
                      <option value="spring">Spring</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
