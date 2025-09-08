import { BlockModule, BlockRegistry, BlockConfig } from '@/types/bento';

/**
 * Central registry for all block types
 * Manages registration, discovery, and access to blocks
 */
class BentoBlockRegistry implements BlockRegistry {
  private blocks = new Map<string, BlockModule>();
  private initialized = false;

  /**
   * Register a new block module with comprehensive error handling
   */
  register(module: BlockModule, source: string = 'unknown'): void {
    try {
      // Add safety check for module and config
      if (!module) {
        console.error(`[${source}] Attempted to register undefined module`);
        return;
      }

      if (!module.config) {
        console.error(`[${source}] Block module missing config:`, module);
        return;
      }

      const { type } = module.config;

      if (!type) {
        console.error(
          `[${source}] Block config missing type field:`,
          module.config
        );
        return;
      }

      // Check for duplicate registration
      if (this.blocks.has(type)) {
        console.warn(
          `[${source}] Block type "${type}" is already registered. Overwriting...`
        );
      }

      // Validate the module
      if (!this.validateModule(module, source)) {
        console.error(`[${source}] Invalid block module for type "${type}"`);
        return;
      }

      this.blocks.set(type, module);
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[${source}] ✅ Registered block: ${type} (${module.config.name})`
        );
      }
    } catch (error) {
      console.error(`[${source}] Failed to register block:`, error);
    }
  }

  /**
   * Get all registered blocks (interface requirement - use getAllBlocks() for error-safe version)
   */
  getAll(): Map<string, BlockModule> {
    return new Map(this.blocks);
  }

  /**
   * Get a specific block by type (interface requirement - use getBlock() for error-safe version)
   */
  get(type: string): BlockModule | undefined {
    return this.blocks.get(type);
  }

  /**
   * Check if a block type is registered (interface requirement - use hasBlock() for error-safe version)
   */
  has(type: string): boolean {
    return this.blocks.has(type);
  }

  /**
   * Get all block configurations (interface requirement - use getAllBlocks().map(m => m.config) for error-safe version)
   */
  getConfigs(): BlockConfig[] {
    try {
      return this.getAllBlocks().map(module => module.config);
    } catch (error) {
      console.error('💥 Error getting configs:', error);
      return [];
    }
  }

  /**
   * Initialize the registry with core blocks and comprehensive error handling
   */
  async initialize() {
    if (this.initialized) return;

    const startTime = Date.now();
    let successCount = 0;
    let failureCount = 0;

    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🚀 Initializing block registry...');
      }

      // Load all core blocks with names for better error tracking
      const coreBlocks = [
        {
          name: 'ClockBlock',
          import: () => import('@/components/blocks/ClockBlock'),
        },
        {
          name: 'LinkBlock',
          import: () => import('@/components/blocks/LinkBlock'),
        },
        {
          name: 'NoteBlock',
          import: () => import('@/components/blocks/NoteBlock'),
        },
        {
          name: 'MusicBlock',
          import: () => import('@/components/blocks/MusicBlock'),
        },
        {
          name: 'VideoBlock',
          import: () => import('@/components/blocks/VideoBlock'),
        },
        {
          name: 'PhotoBlock',
          import: () => import('@/components/blocks/PhotoBlock'),
        },
        {
          name: 'SocialBlock',
          import: () => import('@/components/blocks/SocialBlock'),
        },
        {
          name: 'MapBlock',
          import: () => import('@/components/blocks/MapBlock'),
        },
        {
          name: 'SectionHeaderBlock',
          import: () => import('@/components/blocks/SectionHeaderBlock'),
        },
        {
          name: 'TextHeaderBlock',
          import: () => import('@/components/blocks/TextHeaderBlock'),
        },
        {
          name: 'GitActivityBlock',
          import: () => import('@/components/blocks/GitActivityBlock'),
        },
      ];

      // Register each core block with comprehensive error handling
      for (const { name, import: blockImport } of coreBlocks) {
        try {
          const blockModuleExport = await blockImport();

          if (blockModuleExport.blockModule) {
            this.register(blockModuleExport.blockModule, `core:${name}`);
            successCount++;
          } else {
            console.warn(`[core:${name}] ⚠️  Does not export blockModule`);
            failureCount++;
          }
        } catch (error) {
          console.error(`[core:${name}] ❌ Failed to load:`, error);
          failureCount++;
        }
      }

      // Load external blocks with error isolation
      await this.loadExternalBlocks();

      this.initialized = true;
      const duration = Date.now() - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log(`🎉 Block registry initialized in ${duration}ms:`);
        console.log(`   ✅ ${successCount} blocks loaded successfully`);
        if (failureCount > 0) {
          console.log(`   ❌ ${failureCount} blocks failed to load`);
        }
        console.log(`   📦 Total registered: ${this.blocks.size} blocks`);
      }
    } catch (error) {
      console.error('💥 Critical failure initializing block registry:', error);
      // Don't throw - allow partial initialization
      this.initialized = true; // Mark as initialized to prevent retry loops
    }
  }

  /**
   * Load external blocks from plugins directory with error isolation
   */
  private async loadExternalBlocks() {
    try {
      // In a real implementation, this would scan a plugins directory
      // For now, we'll just log that external loading is ready
      if (process.env.NODE_ENV === 'development') {
        console.log('🔌 External block loading system ready');
      }

      // Future: Add plugin discovery logic here
      // const pluginDir = path.join(process.cwd(), 'plugins');
      // const plugins = await fs.readdir(pluginDir);
      // ... load each plugin with error isolation
    } catch (error) {
      console.warn(
        '⚠️  External block loading failed (this is usually fine):',
        error
      );
    }
  }

  /**
   * Validate a block module before registration
   */
  private validateModule(module: BlockModule, source: string): boolean {
    const { config, Component } = module;

    // Check required config fields
    if (!config.type || !config.name || !config.icon || !config.description) {
      console.error(
        `[${source}] Block config missing required fields:`,
        config
      );
      return false;
    }

    // Check component
    if (!Component || typeof Component !== 'function') {
      console.error(`[${source}] Block component is invalid:`, Component);
      return false;
    }

    // Validate config form if provided
    if (module.configForm) {
      if (!Array.isArray(module.configForm.fields)) {
        console.error(`[${source}] Block configForm.fields must be an array`);
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

  /**
   * Get a block module with fallback error handling
   */
  getBlock(type: string): BlockModule | null {
    try {
      const block = this.blocks.get(type);

      if (!block) {
        console.warn(`⚠️  Block type "${type}" not found in registry`);
        return null;
      }

      // Validate the block is still functional
      if (!this.validateModule(block, `runtime:${type}`)) {
        console.error(`❌ Block "${type}" failed runtime validation`);
        return null;
      }

      return block;
    } catch (error) {
      console.error(`💥 Error retrieving block "${type}":`, error);
      return null;
    }
  }

  /**
   * Get all blocks with error recovery
   */
  getAllBlocks(): BlockModule[] {
    try {
      const blocks: BlockModule[] = [];

      for (const [type, module] of this.blocks.entries()) {
        try {
          // Validate each block before including it
          if (this.validateModule(module, `runtime:${type}`)) {
            blocks.push(module);
          } else {
            console.warn(`⚠️  Skipping invalid block: ${type}`);
          }
        } catch (error) {
          console.error(`❌ Error validating block "${type}":`, error);
        }
      }

      return blocks;
    } catch (error) {
      console.error('💥 Error getting all blocks:', error);
      return [];
    }
  }

  /**
   * Health check for the registry and all blocks
   */
  healthCheck(): { healthy: boolean; issues: string[]; blockCount: number } {
    const issues: string[] = [];
    let healthyBlocks = 0;

    try {
      if (!this.initialized) {
        issues.push('Registry not initialized');
      }

      for (const [type, module] of this.blocks.entries()) {
        try {
          if (this.validateModule(module, `health:${type}`)) {
            healthyBlocks++;
          } else {
            issues.push(`Block "${type}" failed validation`);
          }
        } catch (error) {
          issues.push(`Block "${type}" threw error: ${error}`);
        }
      }

      const result = {
        healthy: issues.length === 0,
        issues,
        blockCount: healthyBlocks,
      };

      if (issues.length > 0) {
        console.warn('🏥 Block registry health check found issues:', issues);
      }

      return result;
    } catch (error) {
      console.error('💥 Health check failed:', error);
      return {
        healthy: false,
        issues: [`Health check crashed: ${error}`],
        blockCount: 0,
      };
    }
  }

  /**
   * Get all available block types with error handling
   */
  getAvailableTypes(): string[] {
    try {
      const types: string[] = [];

      for (const [type, module] of this.blocks.entries()) {
        try {
          // Only include types for blocks that pass validation
          if (this.validateModule(module, `types:${type}`)) {
            types.push(type);
          }
        } catch (error) {
          console.warn(
            `⚠️  Skipping type "${type}" due to validation error:`,
            error
          );
        }
      }

      return types.sort();
    } catch (error) {
      console.error('💥 Error getting available types:', error);
      return [];
    }
  }

  /**
   * Check if a block type is registered and healthy
   */
  hasBlock(type: string): boolean {
    try {
      const block = this.blocks.get(type);
      return block ? this.validateModule(block, `check:${type}`) : false;
    } catch (error) {
      console.error(`💥 Error checking block "${type}":`, error);
      return false;
    }
  }

  /**
   * Get registry status and statistics
   */
  getStatus(): {
    initialized: boolean;
    totalBlocks: number;
    healthyBlocks: number;
    coreBlocks: number;
    externalBlocks: number;
  } {
    try {
      let healthyCount = 0;
      let coreCount = 0;
      let externalCount = 0;

      for (const [type, module] of this.blocks.entries()) {
        try {
          if (this.validateModule(module, `status:${type}`)) {
            healthyCount++;
          }

          // Determine if it's a core block based on common patterns
          if (
            [
              'clock',
              'link',
              'note',
              'music',
              'video',
              'photo',
              'social',
              'map',
              'section-header',
              'text-header',
              'git-activity',
            ].includes(type)
          ) {
            coreCount++;
          } else {
            externalCount++;
          }
        } catch (error) {
          console.warn(`⚠️  Error checking status of block "${type}":`, error);
        }
      }

      return {
        initialized: this.initialized,
        totalBlocks: this.blocks.size,
        healthyBlocks: healthyCount,
        coreBlocks: coreCount,
        externalBlocks: externalCount,
      };
    } catch (error) {
      console.error('💥 Error getting registry status:', error);
      return {
        initialized: false,
        totalBlocks: 0,
        healthyBlocks: 0,
        coreBlocks: 0,
        externalBlocks: 0,
      };
    }
  }
}

// Create and export the singleton instance
export const blockRegistry = new BentoBlockRegistry();

// Remove auto-initialization - let components initialize when needed
// blockRegistry.initialize().catch(console.error);

export default blockRegistry;
