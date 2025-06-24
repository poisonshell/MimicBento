import { BlockModule, BlockRegistry, BlockConfig } from '@/types/bento';

/**
 * Central registry for all block types
 * Manages registration, discovery, and access to blocks
 */
class BentoBlockRegistry implements BlockRegistry {
  private blocks = new Map<string, BlockModule>();
  private initialized = false;

  /**
   * Register a new block module
   */
  register(module: BlockModule): void {
    const { type } = module.config;

    if (this.blocks.has(type)) {
      console.warn(
        `Block type "${type}" is already registered. Overwriting...`
      );
    }

    // Validate the module
    if (!this.validateModule(module)) {
      throw new Error(`Invalid block module for type "${type}"`);
    }

    this.blocks.set(type, module);
    console.log(`Registered block: ${type} (${module.config.name})`);
  }

  /**
   * Get all registered blocks
   */
  getAll(): Map<string, BlockModule> {
    return new Map(this.blocks);
  }

  /**
   * Get a specific block by type
   */
  get(type: string): BlockModule | undefined {
    return this.blocks.get(type);
  }

  /**
   * Check if a block type is registered
   */
  has(type: string): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all block configs for the add modal
   */
  getConfigs(): BlockConfig[] {
    return Array.from(this.blocks.values()).map(module => module.config);
  }

  /**
   * Initialize the registry with core blocks
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load all core blocks
      const coreBlocks = [
        () => import('@/components/blocks/ClockBlock'),
        () => import('@/components/blocks/LinkBlock'),
        () => import('@/components/blocks/NoteBlock'),
        () => import('@/components/blocks/MusicBlock'),
        () => import('@/components/blocks/VideoBlock'),
        () => import('@/components/blocks/PhotoBlock'),
        () => import('@/components/blocks/SocialBlock'),
        () => import('@/components/blocks/MapBlock'),
        () => import('@/components/blocks/SectionHeaderBlock'),
      ];

      // Register each block
      for (const blockImport of coreBlocks) {
        try {
          const module = await blockImport();
          if (module.blockModule) {
            this.register(module.blockModule);
          }
        } catch (error) {
          console.warn('Failed to load core block:', error);
        }
      }

      // Load external blocks from plugins directory (if it exists)
      await this.loadExternalBlocks();

      this.initialized = true;
      console.log(`Block registry initialized with ${this.blocks.size} blocks`);
    } catch (error) {
      console.error('Failed to initialize block registry:', error);
      throw error;
    }
  }

  /**
   * Load external blocks from node_modules or plugins directory
   */
  private async loadExternalBlocks(): Promise<void> {
    // This would scan for external block packages
    // For now, we'll just log that this feature is available
    console.log('External block loading is ready for implementation');

    // In a real implementation, this would:
    // 1. Scan node_modules for packages matching a pattern (e.g., @bento-blocks/*)
    // 2. Scan a local plugins directory
    // 3. Dynamically import and register found blocks
  }

  /**
   * Validate a block module before registration
   */
  private validateModule(module: BlockModule): boolean {
    const { config, Component } = module;

    // Check required config fields
    if (!config.type || !config.name || !config.icon || !config.description) {
      console.error('Block config missing required fields:', config);
      return false;
    }

    // Check component
    if (!Component || typeof Component !== 'function') {
      console.error('Block component is invalid:', Component);
      return false;
    }

    // Validate config form if provided
    if (module.configForm) {
      if (!Array.isArray(module.configForm.fields)) {
        console.error('Block configForm.fields must be an array');
        return false;
      }
    }

    return true;
  }

  /**
   * Clear all registered blocks (useful for testing)
   */
  clear(): void {
    this.blocks.clear();
    this.initialized = false;
  }

  /**
   * Get blocks by category
   */
  getByCategory(category?: string): BlockConfig[] {
    return this.getConfigs().filter(config =>
      category ? config.category === category : !config.category
    );
  }

  /**
   * Search blocks by name or description
   */
  search(query: string): BlockConfig[] {
    const lowerQuery = query.toLowerCase();
    return this.getConfigs().filter(
      config =>
        config.name.toLowerCase().includes(lowerQuery) ||
        config.description.toLowerCase().includes(lowerQuery)
    );
  }
}

// Create and export the singleton instance
export const blockRegistry = new BentoBlockRegistry();

// Auto-initialize when imported (but don't await)
blockRegistry.initialize().catch(console.error);

export default blockRegistry;
