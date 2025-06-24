'use client';

import BentoGrid from '@/components/BentoGrid';
import EditableProfile from '@/components/EditableProfile';
import Toast from '@/components/Toast';
import BlockEditModal from '@/components/BlockEditModal';
import AddBlockModal from '@/components/AddBlockModal';
import { getPortfolioData, savePortfolioData } from '@/services/portfolio';
import { useState, useEffect } from 'react';
import { BentoData, BentoBlock } from '@/types/bento';
import { notFound } from 'next/navigation';
import blockRegistry from '@/services/blockRegistry';
import { AdminPageSkeleton } from '@/components/BlockSkeleton';

export default function AdminPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<'desktop' | 'mobile'>(
    'desktop'
  );
  const [isRegistryReady, setIsRegistryReady] = useState(false);

  // Block editing state
  const [editingBlock, setEditingBlock] = useState<BentoBlock | null>(null);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);

  // Add block state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addPosition, setAddPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Toast state
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

  useEffect(() => {
    const isAdminEnabled =
      process.env.NODE_ENV === 'development' ||
      process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true';

    if (!isAdminEnabled) {
      notFound();
      return;
    }

    const initializeApp = async () => {
      try {
        // Initialize block registry first
        await blockRegistry.initialize();
        setIsRegistryReady(true);

        // Then load portfolio data
        const data = await getPortfolioData();
        setPortfolioData(data);
      } catch (error) {
        console.error('Failed to initialize admin page:', error);
        showToast('Failed to initialize application', 'error');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    // Detect mobile screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleNameChange = async (name: string) => {
    const updatedData = {
      ...portfolioData,
      profile: {
        ...portfolioData?.profile,
        name,
        bio: portfolioData?.profile?.bio || '',
        avatar: portfolioData?.profile?.avatar,
      },
    };

    setPortfolioData(updatedData);

    // Save immediately to server
    try {
      await savePortfolioData(updatedData);
      showToast('Name updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save name change:', error);
      showToast('Failed to save name change', 'error');
    }
  };

  const handleBioChange = async (bio: string) => {
    const updatedData = {
      ...portfolioData,
      profile: {
        ...portfolioData?.profile,
        bio,
        name: portfolioData?.profile?.name || 'Portfolio',
        avatar: portfolioData?.profile?.avatar,
      },
    };

    setPortfolioData(updatedData);

    // Save immediately to server
    try {
      await savePortfolioData(updatedData);
      showToast('Bio updated successfully!', 'success');
    } catch (error) {
      console.error('Failed to save bio change:', error);
      showToast('Failed to save bio change', 'error');
    }
  };

  const handleAvatarChange = async (avatar: string) => {
    const updatedData = {
      ...portfolioData,
      profile: {
        ...portfolioData?.profile,
        avatar,
        name: portfolioData?.profile?.name || 'Portfolio',
        bio: portfolioData?.profile?.bio || '',
      },
    };

    setPortfolioData(updatedData);

    // Save immediately to server
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
    setPortfolioData((prev: any) => ({
      ...prev,
      blocks: prev.blocks.map((block: any) =>
        block.id === blockId ? { ...block, position: newPosition } : block
      ),
    }));
  };

  const handleBlockSizeChange = (blockId: string, newSize: string) => {
    setPortfolioData((prev: any) => ({
      ...prev,
      blocks: prev.blocks.map((block: any) =>
        block.id === blockId ? { ...block, size: newSize } : block
      ),
    }));
  };

  const handleBlockEdit = (block: BentoBlock) => {
    setEditingBlock(block);
    setIsBlockModalOpen(true);
  };

  const handleBlockDelete = async (blockId: string) => {
    const updatedData = {
      ...portfolioData,
      blocks: (portfolioData?.blocks || []).filter(
        (block: any) => block.id !== blockId
      ),
    };

    setPortfolioData(updatedData);

    // Save immediately to server
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
      blocks: (portfolioData?.blocks || []).map((block: any) =>
        block.id === updatedBlock.id ? updatedBlock : block
      ),
    };

    setPortfolioData(updatedData);

    // Save immediately to server
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
    const updatedData = {
      ...portfolioData,
      blocks: [...(portfolioData?.blocks || []), newBlock],
    };

    setPortfolioData(updatedData);

    // Save immediately to server
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

  if (loading || !isRegistryReady) {
    return <AdminPageSkeleton />;
  }

  return (
    <>
      <main className="flex min-h-screen flex-col items-center justify-center overflow-x-hidden">
        <div className="flex min-h-screen w-full max-w-[1728px] flex-col">
          <div className="relative flex min-h-screen w-full flex-1 flex-col items-center">
            {selectedDevice === 'desktop' ? (
              // Desktop View
              <>
                <div className="flex h-full w-full max-w-[428px] items-center justify-center p-6 pt-12 pb-0 xl:absolute xl:top-0 xl:max-w-[min(100vw,1728px)] xl:items-stretch xl:justify-start xl:p-16">
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
                  className="flex h-full w-full max-w-[428px] flex-1 flex-col p-6 pt-0 xl:max-w-[1728px] xl:flex-row xl:p-16 overflow-x-hidden"
                  data-bento-container="true"
                >
                  <div className="mb-10 flex flex-col px-4 xl:mb-0 xl:mr-20 xl:flex-1 xl:px-0"></div>

                  <div
                    className="relative flex-1 xl:max-w-[1100px] xl:flex-none min-w-0"
                    data-grid-dropzone="true"
                  >
                    <BentoGrid
                      blocks={portfolioData?.blocks || []}
                      isMobile={isMobile}
                      isAdmin={true}
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
              // Mobile View - iPhone Mockup
              <div className="flex items-center justify-center min-h-screen p-8">
                <div className="relative">
                  {/* iPhone Mockup Frame */}
                  <div className="relative w-[375px] h-[812px] bg-black rounded-[3rem] p-2 shadow-2xl">
                    {/* iPhone Screen */}
                    <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                      {/* iPhone Notch */}
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-2xl z-10"></div>

                      {/* Mobile Content */}
                      <div className="flex flex-col h-full bg-gray-50 pt-8 px-6 pb-6 overflow-y-auto">
                        {/* Profile Section */}
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

                        {/* Mobile Grid - 2 columns */}
                        <div className="flex-1">
                          <BentoGrid
                            blocks={portfolioData?.blocks || []}
                            isMobile={true}
                            isAdmin={true}
                            onBlockPositionChange={handleBlockPositionChange}
                            onBlockSizeChange={handleBlockSizeChange}
                            onBlockEdit={handleBlockEdit}
                            onBlockDelete={handleBlockDelete}
                            onAddBlock={handleAddBlock}
                          />
                        </div>
                      </div>
                    </div>

                    {/* iPhone Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full opacity-60"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Toolbar */}
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-3 py-2 flex items-center space-x-2">
            {/* Save button */}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                saving
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white'
              }`}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>

            {/* Mobile/Desktop toggle */}
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

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Block Edit Modal */}
      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          isOpen={isBlockModalOpen}
          onClose={handleBlockModalClose}
          onSave={handleBlockSave}
          allBlocks={portfolioData.blocks}
        />
      )}

      {/* Add Block Modal */}
      {addPosition && (
        <AddBlockModal
          isOpen={isAddModalOpen}
          position={addPosition}
          onClose={handleAddModalClose}
          onAddBlock={handleAddBlockComplete}
          allBlocks={portfolioData.blocks}
        />
      )}
    </>
  );
}
