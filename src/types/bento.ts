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
  content: Record<string, unknown>;
  size:
    | 'small'
    | 'medium'
    | 'large'
    | 'wide'
    | 'tall'
    | 'header-full'
    | 'header-half'
    | 'section-header';
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
    | 'header-full'
    | 'header-half'
    | 'section-header'; // Legacy support
  /** Available sizes this block supports */
  supportedSizes?: Array<
    | 'small'
    | 'medium'
    | 'large'
    | 'wide'
    | 'tall'
    | 'header-full'
    | 'header-half'
    | 'section-header'
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
  defaultValue?: unknown;
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
    custom?: (
      value: unknown,
      allValues: Record<string, unknown>
    ) => string | null;
    /** Async validation function */
    async?: (
      value: unknown,
      allValues: Record<string, unknown>
    ) => Promise<string | null>;
  };
  /** For range/number inputs */
  step?: number;
  /** For file inputs */
  accept?: string;
  /** For custom field types - React component */
  CustomComponent?: React.ComponentType<{
    value: unknown;
    onChange: (value: unknown) => void;
    field: BlockFormField;
    error?: string;
  }>;
  /** Field dependencies - show/hide based on other field values */
  dependencies?: {
    field: string;
    value: unknown;
    condition?:
      | 'equals'
      | 'not-equals'
      | 'contains'
      | 'greater-than'
      | 'less-than';
  }[];
  /** Field grouping */
  group?: string;
  /** Number of rows for textarea */
  rows?: number;
}

/**
 * Block configuration form definition
 */
export interface BlockConfigForm {
  /** Form fields for configuring the block */
  fields: BlockFormField[];
  /** Custom validation function */
  validate?: (data: Record<string, unknown>) => string | null;
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
  getDefaultContent?: () => Record<string, unknown>;
  /** Preview component for the add modal */
  PreviewComponent?: React.ComponentType<{ content: Record<string, unknown> }>;
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

// ============ BLOCK CONTENT TYPES ============

/**
 * Content type for photo blocks
 */
export interface PhotoBlockContent {
  url: string;
  alt?: string;
  title?: string;
}

/**
 * Content type for link blocks
 */
export interface LinkBlockContent {
  url: string;
  title?: string;
  description?: string;
  favicon?: string;
}

/**
 * Content type for note blocks
 */
export interface NoteBlockContent {
  text: string;
  fontSize?: 'small' | 'medium' | 'large';
  textAlign?: 'left' | 'center' | 'right';
}

/**
 * Content type for music blocks
 */
export interface MusicBlockContent {
  title: string;
  artist: string;
  album?: string;
  albumArt?: string;
  spotifyUrl?: string;
  appleMusicUrl?: string;
  isPlaying?: boolean;
}

/**
 * Content type for video blocks
 */
export interface VideoBlockContent {
  url: string;
  title?: string;
  thumbnail?: string;
  provider?: 'youtube' | 'vimeo' | 'direct';
  embedId?: string;
}

/**
 * Content type for social blocks
 */
export interface SocialBlockContent {
  platform: string;
  username: string;
  url: string;
  verified?: boolean;
  followerCount?: number;
  description?: string;
}

/**
 * Content type for clock blocks
 */
export interface ClockBlockContent {
  timezone: string;
  format: '12h' | '24h';
  showDate?: boolean;
  showSeconds?: boolean;
  label?: string;
}

/**
 * Content type for map blocks
 */
export interface MapBlockContent {
  location: string;
  latitude?: number;
  longitude?: number;
  zoom?: number;
  mapType?: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
  showMarker?: boolean;
  title?: string;
}

/**
 * Content type for section header blocks
 */
export interface SectionHeaderBlockContent {
  title: string;
  subtitle?: string;
  emoji?: string;
}

/**
 * Union type for all block content types
 */
export type BlockContent =
  | PhotoBlockContent
  | LinkBlockContent
  | NoteBlockContent
  | MusicBlockContent
  | VideoBlockContent
  | SocialBlockContent
  | ClockBlockContent
  | MapBlockContent
  | SectionHeaderBlockContent
  | Record<string, unknown>; // For custom/unknown block types

// ============ FORM TYPES ============

/**
 * Form field value type
 */
export type FormFieldValue =
  | string
  | number
  | boolean
  | string[]
  | File
  | null
  | undefined;

/**
 * Form data type for block configuration
 */
export type BlockFormData = Record<string, FormFieldValue>;

/**
 * Google Maps related types
 */
export interface GoogleMap {
  overlays?: GoogleOverlay[];
}

export interface GoogleMarker {
  setMap(map: GoogleMap | null): void;
}

export interface GoogleGeocoder {
  geocode(
    request: { address: string },
    callback: (results: GeocodeResult[] | null, status: string) => void
  ): void;
}

export interface GoogleInfoWindow {
  open(map?: GoogleMap, anchor?: GoogleMarker): void;
  close(): void;
  setContent(content: string | HTMLElement): void;
}

export interface GoogleLatLng {
  lat(): number;
  lng(): number;
}

export interface GoogleOverlay {
  setMap(map: GoogleMap | null): void;
}

export interface GooglePlacesService {
  findPlaceFromQuery(
    request: unknown,
    callback: (results: unknown[] | null, status: string) => void
  ): void;
}

export interface GoogleMapsConfig {
  google: {
    maps: {
      Map: new (
        element: HTMLElement,
        options: Record<string, unknown>
      ) => GoogleMap;
      Marker: new (options: Record<string, unknown>) => GoogleMarker;
      Geocoder: new () => GoogleGeocoder;
      InfoWindow: new (options?: Record<string, unknown>) => GoogleInfoWindow;
      LatLng: new (lat: number, lng: number) => GoogleLatLng;
      places: {
        PlacesService: new (map: GoogleMap) => GooglePlacesService;
        PlacesServiceStatus: Record<string, string>;
      };
    };
  };
}

/**
 * Geocoding result types
 */
export interface GeocodeResult {
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
  formatted_address: string;
  address_components: Array<{
    long_name: string;
    short_name: string;
    types: string[];
  }>;
}

export interface GeocodeResponse {
  results: GeocodeResult[];
  status: string;
}
