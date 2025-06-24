export interface BentoProfile {
  name: string;
  bio: string;
  avatar?: string;
}

export interface SocialLink {
  platform: string;
  username: string;
  url: string;
  verified?: boolean;
}

// Make block types extensible by allowing any string, while keeping common types for intellisense
export type BentoBlockType = string;

export interface BentoBlock {
  id: string;
  type: BentoBlockType;
  title?: string;
  content: any;
  size: 'small' | 'medium' | 'large' | 'wide' | 'tall' | 'section-header';
  position: {
    x: number;
    y: number;
  };
}

export interface BentoData {
  profile: BentoProfile;
  blocks: BentoBlock[];
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
  };
}

// ============ EXTENSIBLE BLOCK SYSTEM ============

/**
 * Configuration metadata for a block type
 */
export interface BlockConfig {
  /** Unique identifier for this block type */
  type: string;
  /** Display name for the block */
  name: string;
  /** Icon (emoji or React component) */
  icon: string | React.ReactNode;
  /** Description for the add block modal */
  description: string;
  /** Default size when creating a new block */
  defaultSize:
    | 'small'
    | 'medium'
    | 'large'
    | 'wide'
    | 'tall'
    | 'section-header';
  /** Available sizes this block supports */
  supportedSizes?: Array<
    'small' | 'medium' | 'large' | 'wide' | 'tall' | 'section-header'
  >;
  /** Category for grouping in the add modal */
  category?: string;
  /** Version of the block */
  version?: string;
  /** Author information */
  author?: {
    name: string;
    email?: string;
    url?: string;
  };
  /** Minimum app version required */
  minAppVersion?: string;
}

/**
 * Props passed to every block component
 */
export interface BlockComponentProps {
  /** Block data including content */
  block: BentoBlock;
  /** Whether in mobile view */
  isMobile?: boolean;
  /** Whether in admin/edit mode */
  isAdmin?: boolean;
  /** Called when block should be edited */
  onEdit?: (block: BentoBlock) => void;
  /** Called when block should be deleted */
  onDelete?: (blockId: string) => void;
}

/**
 * Configuration form field definition
 */
export interface BlockFormField {
  /** Field identifier */
  key: string;
  /** Field label */
  label: string;
  /** Input type */
  type:
    | 'text'
    | 'textarea'
    | 'select'
    | 'number'
    | 'url'
    | 'email'
    | 'password'
    | 'file'
    | 'color'
    | 'checkbox'
    | 'radio'
    | 'date'
    | 'datetime-local'
    | 'range'
    | 'custom'; // For custom components
  /** Default value */
  defaultValue?: any;
  /** Select options (for select/radio type) */
  options?: Array<{ value: string; label: string; disabled?: boolean }>;
  /** Whether field is required */
  required?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Help text */
  help?: string;
  /** Validation rules */
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    /** Custom validation function */
    custom?: (value: any, allValues: any) => string | null;
    /** Async validation function */
    async?: (value: any, allValues: any) => Promise<string | null>;
  };
  /** For range/number inputs */
  step?: number;
  /** For file inputs */
  accept?: string;
  /** For custom field types - React component */
  CustomComponent?: React.ComponentType<{
    value: any;
    onChange: (value: any) => void;
    field: BlockFormField;
    error?: string;
  }>;
  /** Field dependencies - show/hide based on other field values */
  dependencies?: {
    field: string;
    value: any;
    condition?:
      | 'equals'
      | 'not-equals'
      | 'contains'
      | 'greater-than'
      | 'less-than';
  }[];
  /** Field grouping */
  group?: string;
}

/**
 * Block configuration form definition
 */
export interface BlockConfigForm {
  /** Form fields for configuring the block */
  fields: BlockFormField[];
  /** Custom validation function */
  validate?: (data: any) => string | null;
}

/**
 * Complete block module definition
 */
export interface BlockModule {
  /** Block configuration metadata */
  config: BlockConfig;
  /** React component for rendering the block */
  Component: React.ComponentType<BlockComponentProps>;
  /** Configuration form definition */
  configForm?: BlockConfigForm;
  /** Default content when creating a new block */
  getDefaultContent?: () => any;
  /** Preview component for the add modal */
  PreviewComponent?: React.ComponentType<{ content: any }>;
  /** Custom edit modal component (optional) */
  EditComponent?: React.ComponentType<{
    block: BentoBlock;
    onSave: (block: BentoBlock) => void;
    onCancel: () => void;
  }>;
}

/**
 * Block registry for managing all available blocks
 */
export interface BlockRegistry {
  /** Register a new block type */
  register(module: BlockModule): void;
  /** Get all registered blocks */
  getAll(): Map<string, BlockModule>;
  /** Get a specific block by type */
  get(type: string): BlockModule | undefined;
  /** Check if a block type is registered */
  has(type: string): boolean;
  /** Get all block configs for the add modal */
  getConfigs(): BlockConfig[];
}
