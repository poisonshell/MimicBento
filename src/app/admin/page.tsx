'use client';

import BentoGrid from '@/components/BentoGrid';
import EditableProfile from '@/components/EditableProfile';
import Toast from '@/components/Toast';
import BlockEditModal from '@/components/BlockEditModal';
import AddBlockModal from '@/components/AddBlockModal';
import AnimationSettings from '@/components/AnimationSettings';
import { getPortfolioData, savePortfolioData } from '@/services/portfolio';
import { useState, useEffect } from 'react';
import {
  BentoBlock,
  BentoData,
  AnimationSettings as AnimationSettingsType,
} from '@/types/bento';
import blockRegistry from '@/services/blockRegistry';
import { AdminPageSkeleton } from '@/components/BlockSkeleton';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMobile } from '@/hooks/useMobile';

export default function AdminPage() {
  const { isAuthenticated, isLoading, isAdminEnabled } = useAuth();
  const isMobile = useMobile(1024);
  const [portfolioData, setPortfolioData] = useState<BentoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [isRegistryReady, setIsRegistryReady] = useState(false);

  const [editingBlock, setEditingBlock] = useState<BentoBlock | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addPosition, setAddPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      window.location.href = '/admin/login';
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed. Please try again.', 'error');
    }
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAdminEnabled || !isAuthenticated) return;

    const initializeApp = async () => {
      try {
        await blockRegistry.initialize();

        const health = blockRegistry.healthCheck();
        if (!health.healthy) {
          console.warn('⚠️  Block registry health issues:', health.issues);
          showToast(
            `Block system partially loaded (${health.blockCount} blocks)`,
            'error'
          );
        }

        const status = blockRegistry.getStatus();
        console.log('📊 Admin Page Registry Status:', status);

        setIsRegistryReady(true);

        const data = await getPortfolioData();
        setPortfolioData(data);
      } catch (error) {
        console.error('💥 Failed to initialize admin page:', error);
        showToast('Failed to initialize application', 'error');

        setIsRegistryReady(true);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, [isLoading, isAdminEnabled, isAuthenticated]);

  const handleNameChange = async (name: string) => {
    if (!portfolioData) return;

    const updatedData: BentoData = {
      ...portfolioData,
      profile: {
        ...portfolioData.profile,
        name,
        bio: portfolioData.profile.bio || '',
        avatar: portfolioData.profile.avatar,
      },
      blocks: portfolioData.blocks,
    };

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Name updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save name change:', error);
      showToast('Failed to save name change', 'error');
    }
  };

  const handleBioChange = async (bio: string) => {
    if (!portfolioData) return;

    const updatedData: BentoData = {
      ...portfolioData,
      profile: {
        ...portfolioData.profile,
        bio,
        name: portfolioData.profile.name || 'Portfolio',
        avatar: portfolioData.profile.avatar,
      },
      blocks: portfolioData.blocks,
    };

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Bio updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save bio change:', error);
      showToast('Failed to save bio change', 'error');
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    if (!portfolioData) return;

    const updatedData: BentoData = {
      ...portfolioData,
      profile: {
        ...portfolioData.profile,
        avatar,
        name: portfolioData.profile.name || 'Portfolio',
        bio: portfolioData.profile.bio || '',
      },
      blocks: portfolioData.blocks,
    };

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Avatar updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save avatar change:', error);
      showToast('Failed to save avatar change', 'error');
    }
  };

  const handleBlockPositionChange = (
    blockId: string,
    newPosition: { x: number; y: number }
  ) => {
    setPortfolioData((prev: BentoData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((block: BentoBlock) =>
          block.id === blockId ? { ...block, position: newPosition } : block
        ),
      };
    });
  };

  const handleBlockSizeChange = (blockId: string, newSize: string) => {
    setPortfolioData((prev: BentoData | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        blocks: prev.blocks.map((block: BentoBlock) =>
          block.id === blockId
            ? { ...block, size: newSize as BentoBlock['size'] }
            : block
        ),
      };
    });
  };

  const handleBlockEdit = (block: BentoBlock) => {
    setEditingBlock(block);
    setIsBlockModalOpen(true);
  };

  const handleBlockDelete = async (blockId: string) => {
    const updatedData = {
      ...portfolioData,
      blocks: (portfolioData?.blocks || []).filter(
        (block: BentoBlock) => block.id !== blockId
      ),
    } as BentoData;

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Block deleted successfully!', 'success');
    } catch (error) {
      console.error('Failed to delete block:', error);
      showToast('Failed to delete block', 'error');
    }
  };

  const handleBlockSave = async (updatedBlock: BentoBlock) => {
    const updatedData = {
      ...portfolioData,
      blocks: (portfolioData?.blocks || []).map((block: BentoBlock) =>
        block.id === updatedBlock.id ? updatedBlock : block
      ),
    } as BentoData;

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Block updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save block changes:', error);
      showToast('Failed to save block changes', 'error');
    }

    setIsBlockModalOpen(false);
    setEditingBlock(null);
  };

  const handleBlockModalClose = () => {
    setIsBlockModalOpen(false);
    setEditingBlock(null);
  };

  const handleAddBlock = (position: { x: number; y: number }) => {
    setAddPosition(position);
    setIsAddModalOpen(true);
  };

  const handleAddBlockComplete = async (newBlock: BentoBlock) => {
    if (!portfolioData) return;

    const updatedData: BentoData = {
      ...portfolioData,
      profile: portfolioData.profile,
      blocks: [...portfolioData.blocks, newBlock],
    };

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Block added successfully!', 'success');
    } catch (error) {
      console.error('Failed to add block:', error);
      showToast('Failed to add block', 'error');
    }

    setIsAddModalOpen(false);
    setAddPosition(null);
  };

  const handleAddModalClose = () => {
    setIsAddModalOpen(false);
    setAddPosition(null);
  };

  const handleSave = async () => {
    if (!portfolioData) return;

    setSaving(true);
    try {
      const result = await savePortfolioData(portfolioData);

      if (result.success) {
        showToast('Changes saved successfully!', 'success');
      } else {
        showToast(`Failed to save: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('Save error:', error);
      showToast('Failed to save changes. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAnimationSettingsUpdate = async (
    newSettings: AnimationSettingsType
  ) => {
    if (!portfolioData) return;

    const updatedData: BentoData = {
      ...portfolioData,
      animations: newSettings,
    };

    setPortfolioData(updatedData);

    try {
      await savePortfolioData(updatedData);
      showToast('Animation settings updated!', 'success');
    } catch (error) {
      console.error('Failed to save animation settings:', error);
      showToast('Failed to save animation settings', 'error');
    }
  };

  if (isLoading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          {}
          <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>

          {}
          <div className="text-gray-600 text-lg font-medium">
            Verifying authentication...
          </div>

          {}
          <div className="text-gray-400 text-sm">
            Please wait while we check your credentials
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading || !isRegistryReady) {
    return <AdminPageSkeleton />;
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
        <div className="flex min-h-screen w-full max-w-[1728px] flex-col">
          <div className="relative flex min-h-screen w-full flex-1 flex-col items-center">
            {selectedDevice === 'desktop' ? (
              <>
                <div className="flex h-full w-full max-w-[428px] items-center justify-center p-6 pt-12 pb-0 md:max-w-[768px] lg:max-w-[1024px] xl:absolute xl:top-0 xl:max-w-[min(100vw,1728px)] xl:items-stretch xl:justify-start xl:p-16">
                  <div className="flex w-full flex-col px-4 xl:mr-20 xl:flex-1 xl:px-0">
                    <div className="relative xl:sticky xl:top-16">
                      <EditableProfile
                        name={portfolioData?.profile?.name || 'Portfolio'}
                        bio={portfolioData?.profile?.bio || ''}
                        avatar={portfolioData?.profile?.avatar}
                        onNameChange={handleNameChange}
                        onBioChange={handleBioChange}
                        onAvatarChange={handleAvatarChange}
                      />
                    </div>
                  </div>
                </div>

                <div
                  className="flex h-full w-full max-w-[428px] flex-1 flex-col p-6 pt-0 md:max-w-[768px] lg:max-w-[1024px] xl:max-w-[1728px] xl:flex-row xl:p-16 overflow-x-hidden"
                  data-bento-container="true"
                >
                  <div className="mb-10 flex flex-col px-4 lg:mb-0 xl:mb-0 xl:mr-20 xl:flex-1 xl:px-0"></div>

                  <div
                    className="relative flex-1 lg:max-w-[900px] lg:mx-auto xl:max-w-[1000px] 2xl:max-w-[1100px] xl:flex-none xl:mx-0 min-w-0"
                    data-grid-dropzone="true"
                  >
                    <BentoGrid
                      blocks={portfolioData?.blocks || []}
                      profile={portfolioData?.profile}
                      isMobile={isMobile}
                      isAdmin={true}
                      animations={portfolioData?.animations}
                      onBlockPositionChange={handleBlockPositionChange}
                      onBlockSizeChange={handleBlockSizeChange}
                      onBlockEdit={handleBlockEdit}
                      onBlockDelete={handleBlockDelete}
                      onAddBlock={handleAddBlock}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center min-h-screen p-8">
                <div className="relative">
                  {}
                  <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
                    {}
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                      {}
                      <div className="flex flex-col h-full bg-gray-50 pt-8 px-6 pb-6 overflow-y-auto">
                        {}
                        <div className="flex flex-col items-center text-center mb-8">
                          <EditableProfile
                            name={portfolioData?.profile?.name || 'Portfolio'}
                            bio={portfolioData?.profile?.bio || ''}
                            avatar={portfolioData?.profile?.avatar}
                            onNameChange={handleNameChange}
                            onBioChange={handleBioChange}
                            onAvatarChange={handleAvatarChange}
                          />
                        </div>

                        {}
                        <div className="flex-1">
                          <BentoGrid
                            blocks={portfolioData?.blocks || []}
                            profile={portfolioData?.profile}
                            isMobile={true}
                            isAdmin={true}
                            animations={portfolioData?.animations}
                            onBlockPositionChange={handleBlockPositionChange}
                            onBlockSizeChange={handleBlockSizeChange}
                            onBlockEdit={handleBlockEdit}
                            onBlockDelete={handleBlockDelete}
                            onAddBlock={handleAddBlock}
                          />
                        </div>
                      </div>
                    </div>

                    {}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="fixed bottom-4 left-2 right-2 sm:bottom-6 sm:left-1/2 sm:right-auto sm:transform sm:-translate-x-1/2 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-2 sm:px-3 py-2 flex flex-wrap items-center justify-center gap-1 sm:gap-2 w-full sm:w-auto min-h-[2.5rem]">
            <label className="text-xs font-medium hidden lg:block w-full text-center sm:w-auto">
              Admin Mode
            </label>

            {}
            <AnimationSettings
              settings={
                portfolioData?.animations || {
                  enabled: true,
                  pageTransition: 'fade',
                  blockStagger: true,
                  blockAnimation: 'fadeUp',
                  hoverEffects: true,
                  scrollAnimation: true,
                  duration: 0.6,
                  ease: 'easeOut',
                }
              }
              onUpdate={handleAnimationSettingsUpdate}
            />

            {}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`cursor-pointer px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

            {}
            <button
              onClick={handleLogout}
              className="cursor-pointer px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors bg-red-600 hover:bg-red-700 text-white"
            >
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {}
            <Link href="/">
              <button className="cursor-pointer px-2 sm:px-3 py-1 rounded-md text-xs font-medium transition-colors bg-black hover:bg-gray-800 text-white">
                Home
              </button>
            </Link>
            {}
            <div className="bg-black rounded-md p-0.5 flex items-center">
              <button
                onClick={() => setSelectedDevice('desktop')}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  selectedDevice === 'desktop'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z" />
                </svg>
              </button>
              <button
                onClick={() => setSelectedDevice('mobile')}
                className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                  selectedDevice === 'mobile'
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <svg
                  className="w-2.5 h-2.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M18.5 0h-9C8.12 0 7 1.12 7 2.5v19C7 22.88 8.12 24 9.5 24h9c1.38 0 2.5-1.12 2.5-2.5v-19C22 1.12 20.88 0 18.5 0zM14 23c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm4.5-4h-9V4h9v15z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {}
      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          isOpen={isBlockModalOpen}
          onClose={handleBlockModalClose}
          onSave={handleBlockSave}
          allBlocks={portfolioData?.blocks || []}
        />
      )}

      {}
      {addPosition && (
        <AddBlockModal
          isOpen={isAddModalOpen}
          position={addPosition}
          onClose={handleAddModalClose}
          onAddBlock={handleAddBlockComplete}
          allBlocks={portfolioData?.blocks || []}
        />
      )}
    </>
  );
}
