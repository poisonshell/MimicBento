# Block Development Guide

This guide explains how to create custom blocks for the  MimicBento  project using the fully extensible block system.

## Overview

The MimicBento project uses a **complete plugin-based architecture** that allows developers to create custom blocks without modifying any core code. Each block is a self-contained module that exports:

- A React component for rendering
- Configuration metadata with modern icon support
- Optional configuration form with 15+ field types
- Default content generator
- Optional preview and custom edit components

**✅ All core blocks have been migrated to this system**  
**✅ No legacy forms remain**  
**✅ Zero modification needed for extensions**
**✅ Modern React Icons system (Feather + Simple Icons)**
**✅ Beautiful AddBlockModal UI with category organization**

## Block Structure

### Basic Block Module

```typescript
// src/components/blocks/MyCustomBlock.tsx
import { BlockModule, BlockComponentProps, BlockConfig, BlockConfigForm } from '@/types/bento';

// Your block component
function MyCustomBlockComponent({ block, isMobile, isAdmin }: BlockComponentProps) {
  const { content } = block;
  
  return (
    <div className="p-4 h-full rounded-xl overflow-hidden">
      <h3>{content.title || 'My Custom Block'}</h3>
      <p>{content.description}</p>
      {content.url && <a href={content.url} className="text-blue-600">Learn more</a>}
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'my-custom-block',           // Unique identifier
  name: 'My Custom Block',           // Display name
  icon: 'FiPalette',                 // React Icons Feather icon name (recommended)
  description: 'A custom block with full form support',     // Description for add modal
  defaultSize: 'small',             // Default size when created
  supportedSizes: ['small', 'medium', 'large'], // Available sizes
  category: 'custom',               // Category for grouping
  version: '1.0.0',                 // Block version
  author: {
    name: 'Your Name',
    email: 'your.email@example.com',
    url: 'https://yourwebsite.com'
  }
};

// Configuration form with all supported field types
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'title',
      label: 'Title',
      type: 'text',
      required: true,
      placeholder: 'Enter title',
      validation: {
        max: 50,
        message: 'Title must be 50 characters or less'
      }
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Enter description',
      rows: 3
    },
    {
      key: 'url',
      label: 'Website URL',
      type: 'url',
      placeholder: 'https://example.com',
      dependencies: [{
        field: 'showLink',
        value: true
      }]
    },
    {
      key: 'showLink',
      label: 'Show link',
      type: 'checkbox',
      defaultValue: false
    }
  ]
};

// Default content generator
const getDefaultContent = () => ({
  title: '',
  description: '',
  url: '',
  showLink: false
});

// Block module export
export const blockModule: BlockModule = {
  config,
  Component: MyCustomBlockComponent,
  configForm,
  getDefaultContent
};

// Default export for backward compatibility
export default MyCustomBlockComponent;
```

## Icon System

### React Icons (Feather Icons) - Recommended

The system now uses **React Icons** with Feather Icons for consistent, beautiful UI icons. Use icon names as strings:

```typescript
// ✅ RECOMMENDED: React Icons Feather icon names
icon: 'FiCalendar'      // Calendar icon
icon: 'FiDatabase'      // Database icon  
icon: 'FiGamepad2'      // Gaming controller icon
icon: 'FiCamera'        // Camera icon
icon: 'FiMusic'         // Music note icon
icon: 'FiMap'           // Map icon
icon: 'FiUsers'         // People icon
icon: 'FiFileText'      // Document icon
icon: 'FiVideo'         // Video icon
icon: 'FiLink'          // Link icon
icon: 'FiClock'         // Clock icon
icon: 'FiImage'         // Image icon
icon: 'FiLayout'        // Layout/section icon
```

### Icon Compatibility

The icon system supports **multiple formats** for maximum compatibility:

```typescript
// Option A: React Icons Feather strings (recommended)
icon: 'FiCalendar'      // Shows beautiful Feather icon

// Option B: Emoji (legacy support)
icon: '🎮'             // Still works, shows emoji

// Option C: Custom React Components
icon: <CustomIcon />    // Custom SVG or component
icon: MyIconComponent   // Any React component
```

### Automatic Icon Mapping

Icons are automatically mapped in the AddBlockModal:
- **String names** → React Icons Feather components
- **Unrecognized strings** → Default fallback icon
- **React components** → Used directly
- **Emojis** → Displayed as fallback

### Popular React Icons (Feather) for Blocks

```typescript
// Content blocks
icon: 'FiFileText'      // Text/note blocks
icon: 'FiLink'          // Link blocks
icon: 'FiImage'         // Photo blocks
icon: 'FiVideo'         // Video blocks

// Social blocks
icon: 'FiUsers'         // Social profiles
icon: 'FiMessageCircle' // Chat/messaging
icon: 'FiShare2'        // Sharing blocks

// Utility blocks
icon: 'FiClock'         // Time/clock blocks
icon: 'FiCalendar'      // Calendar blocks
icon: 'FiMap'           // Location blocks
icon: 'FiSettings'      // Configuration blocks

// Media blocks
icon: 'FiMusic'         // Audio/music blocks
icon: 'FiPlay'          // Media player blocks
icon: 'FiHeadphones'    // Audio blocks

// Data blocks
icon: 'FiBarChart'      // Analytics blocks
icon: 'FiDatabase'      // Data blocks
icon: 'FiTrendingUp'    // Metrics blocks

// Custom blocks
icon: 'FiPackage'       // Plugin blocks
icon: 'FiZap'           // Action blocks
icon: 'FiStar'          // Featured blocks
```

## Configuration Options

### BlockConfig Interface

```typescript
interface BlockConfig {
  type: string;                    // Unique block type identifier
  name: string;                    // Display name in add modal
  icon: string | React.ReactNode;  // Icon - use React Icons Feather name string (recommended)
  description: string;             // Description in add modal
  defaultSize: BlockSize;          // Default size when creating
  supportedSizes?: BlockSize[];    // Available sizes (optional)
  category?: string;               // Category for grouping (optional)
  version?: string;                // Block version (optional)
  author?: AuthorInfo;             // Author information (optional)
  minAppVersion?: string;          // Minimum app version required (optional)
}
```

### Available Sizes

- `'small'` - 1x1 grid cell
- `'medium'` - 1x2 grid cells
- `'large'` - 2x2 grid cells
- `'wide'` - 2x1 grid cells
- `'extra-wide'` - 4x1 grid cells
- `'tall'` - 1x3 grid cells
- `'section-header'` - Full width header

### Block Categories

The **AddBlockModal** organizes blocks by category with color-coded badges:

- `'content'` - Content blocks (text, images, etc.) - **Blue badge**
- `'media'` - Media blocks (video, audio, images) - **Purple badge**
- `'social'` - Social media integrations - **Green badge**
- `'utility'` - Utility blocks (clock, weather, etc.) - **Orange badge**
- `'layout'` - Layout blocks (headers, sections) - **Gray badge**
- `'custom'` - Custom/third-party blocks - **Gray badge**

### AddBlockModal Features

The modern AddBlockModal provides:
- **Category organization** with visual separators
- **Beautiful card design** with icons and descriptions
- **Hover effects** and smooth transitions
- **Color-coded category badges**
- **Responsive 2-column grid layout**
- **Loading states** with professional spinners
- **Search-friendly organization**

## Configuration Forms

### Complete Field Type Support

The system supports **15+ field types** with full validation, dependencies, and custom components:

```typescript
interface BlockFormField {
  key: string;                    // Field identifier (maps to content property)
  label: string;                  // Field label
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'range' | 
        'url' | 'email' | 'password' | 'date' | 'datetime-local' | 'color' | 'file' | 'custom';
  defaultValue?: any;             // Default value
  required?: boolean;             // Whether field is required
  placeholder?: string;           // Placeholder text
  help?: string;                  // Help text
  rows?: number;                  // For textarea
  step?: number;                  // For number/range inputs
  accept?: string;                // For file inputs (e.g., 'image/*')
  options?: Array<{               // For select/radio fields
    value: string; 
    label: string; 
    disabled?: boolean;
  }>;
  validation?: {                  // Validation rules
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
    custom?: (value: any, allValues: any) => string | null;
    async?: (value: any, allValues: any) => Promise<string | null>;
  };
  dependencies?: Array<{          // Field dependencies
    field: string;
    value: any;
    condition?: 'equals' | 'not-equals' | 'contains' | 'greater-than' | 'less-than';
  }>;
  CustomComponent?: React.ComponentType<{  // For custom field types
    value: any;
    onChange: (value: any) => void;
    field: BlockFormField;
    error?: string;
  }>;
  group?: string;                 // Field grouping
}
```

### Enhanced Form UI

The configuration forms now feature:
- **Modern styling** with consistent spacing and typography
- **Professional file upload** with drag-and-drop styling
- **Better error handling** with visual feedback
- **Improved accessibility** with proper focus states
- **Responsive design** for all screen sizes

### Form Field Examples

```typescript
// Text input with validation
{
  key: 'title',
  label: 'Title',
  type: 'text',
  required: true,
  placeholder: 'Enter title',
  validation: {
    max: 100,
    message: 'Title must be 100 characters or less'
  }
}

// Textarea with custom rows
{
  key: 'description',
  label: 'Description',
  type: 'textarea',
  placeholder: 'Enter description',
  rows: 4
}

// Select dropdown
{
  key: 'style',
  label: 'Style',
  type: 'select',
  defaultValue: 'default',
  options: [
    { value: 'default', label: 'Default' },
    { value: 'modern', label: 'Modern' },
    { value: 'classic', label: 'Classic' }
  ]
}

// Radio buttons
{
  key: 'layout',
  label: 'Layout',
  type: 'radio',
  defaultValue: 'grid',
  options: [
    { value: 'grid', label: 'Grid Layout' },
    { value: 'list', label: 'List Layout' },
    { value: 'card', label: 'Card Layout' }
  ]
}

// URL input with validation
{
  key: 'link',
  label: 'Link URL',
  type: 'url',
  placeholder: 'https://example.com',
  validation: {
    pattern: '^https?://.*',
    message: 'Please enter a valid URL'
  }
}

// Email input
{
  key: 'contact',
  label: 'Contact Email',
  type: 'email',
  placeholder: 'user@example.com'
}

// Number input with range
{
  key: 'count',
  label: 'Item Count',
  type: 'number',
  defaultValue: 5,
  validation: {
    min: 1,
    max: 20,
    message: 'Must be between 1 and 20'
  }
}

// Range slider
{
  key: 'opacity',
  label: 'Opacity',
  type: 'range',
  defaultValue: 100,
  validation: { min: 0, max: 100 },
  step: 5
}

// Date picker
{
  key: 'eventDate',
  label: 'Event Date',
  type: 'date',
  required: true
}

// DateTime picker
{
  key: 'deadline',
  label: 'Deadline',
  type: 'datetime-local'
}

// Color picker
{
  key: 'accentColor',
  label: 'Accent Color',
  type: 'color',
  defaultValue: '#007bff'
}

// File upload with modern UI
{
  key: 'image',
  label: 'Image',
  type: 'file',
  accept: 'image/*',
  help: 'Upload an image file or enter a URL'
}

// Checkbox
{
  key: 'enabled',
  label: 'Enable feature',
  type: 'checkbox',
  defaultValue: true
}

// Field with dependencies
{
  key: 'customUrl',
  label: 'Custom URL',
  type: 'url',
  placeholder: 'https://custom.com',
  dependencies: [{
    field: 'useCustomUrl',
    value: true
  }]
}

// Custom component field
{
  key: 'advanced',
  label: 'Advanced Settings',
  type: 'custom',
  CustomComponent: MyAdvancedSettingsComponent
}
```

## Advanced Features

### Field Dependencies

Show/hide fields based on other field values:

```typescript
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'hasCustomIcon',
      label: 'Use custom icon',
      type: 'checkbox',
      defaultValue: false
    },
    {
      key: 'customIcon',
      label: 'Custom Icon URL',
      type: 'file',
      accept: 'image/*',
      dependencies: [{
        field: 'hasCustomIcon',
        value: true
      }]
    },
    {
      key: 'priority',
      label: 'Priority Level',
      type: 'select',
      options: [
        { value: 'low', label: 'Low' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
      ]
    },
    {
      key: 'urgentMessage',
      label: 'Urgent Message',
      type: 'textarea',
      dependencies: [{
        field: 'priority',
        value: 'urgent'
      }]
    }
  ]
};
```

### Custom Validation

```typescript
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'username',
      label: 'Username',
      type: 'text',
      validation: {
        custom: (value, allValues) => {
          if (value && value.length < 3) {
            return 'Username must be at least 3 characters';
          }
          if (value && !/^[a-zA-Z0-9_]+$/.test(value)) {
            return 'Username can only contain letters, numbers, and underscores';
          }
          return null;
        }
      }
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      validation: {
        async: async (value) => {
          if (value) {
            // Check if email is already taken
            const response = await fetch(`/api/check-email?email=${value}`);
            const result = await response.json();
            return result.taken ? 'Email is already taken' : null;
          }
          return null;
        }
      }
    }
  ],
  validate: (data) => {
    if (!data.username && !data.email) {
      return 'Either username or email is required';
    }
    return null;
  }
};
```

### Custom Components

```typescript
// Custom component for advanced settings
function CustomSettingsComponent({ value, onChange, field }: {
  value: any;
  onChange: (value: any) => void;
  field: BlockFormField;
}) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Advanced Settings</h4>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          placeholder="Setting 1"
          value={value?.setting1 || ''}
          onChange={e => onChange({ ...value, setting1: e.target.value })}
          className="border rounded px-3 py-2"
        />
        <input
          type="text"
          placeholder="Setting 2"
          value={value?.setting2 || ''}
          onChange={e => onChange({ ...value, setting2: e.target.value })}
          className="border rounded px-3 py-2"
        />
      </div>
    </div>
  );
}

// Use in form field
{
  key: 'advancedSettings',
  label: 'Advanced Configuration',
  type: 'custom',
  CustomComponent: CustomSettingsComponent,
  defaultValue: { setting1: '', setting2: '' }
}
```

### Preview Component

```typescript
function MyBlockPreview({ content }: { content: any }) {
  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">{content.title || 'Preview Title'}</div>
      <div className="text-gray-500 text-xs">{content.description}</div>
      {content.image && (
        <img src={content.image} alt="" className="w-full h-16 object-cover mt-2 rounded" />
      )}
    </div>
  );
}

export const blockModule: BlockModule = {
  config,
  Component: MyCustomBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: MyBlockPreview
};
```

### Custom Edit Modal

```typescript
function MyBlockEditModal({ block, onSave, onCancel }: {
  block: BentoBlock;
  onSave: (block: BentoBlock) => void;
  onCancel: () => void;
}) {
  const [editedBlock, setEditedBlock] = useState(block);

  return (
    <div className="p-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Custom Edit: {block.type}</h2>
      {/* Custom form UI */}
      <div className="flex space-x-2 mt-6">
        <button 
          onClick={() => onSave(editedBlock)}
          className="px-4 py-2 bg-black text-white rounded"
        >
          Save
        </button>
        <button 
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export const blockModule: BlockModule = {
  config,
  Component: MyCustomBlockComponent,
  EditComponent: MyBlockEditModal
};
```

## Component Props

### BlockComponentProps

```typescript
interface BlockComponentProps {
  block: BentoBlock;              // Complete block data
  isMobile?: boolean;             // Whether in mobile view
  isAdmin?: boolean;              // Whether in admin/edit mode
  onEdit?: (block: BentoBlock) => void;    // Edit callback
  onDelete?: (blockId: string) => void;    // Delete callback
}
```

### Accessing Block Data

```typescript
function MyBlockComponent({ block, isMobile, isAdmin }: BlockComponentProps) {
  const { content, title, size } = block;
  
  return (
    <div className={`p-4 h-full rounded-xl overflow-hidden ${isMobile ? 'text-sm' : 'text-base'}`}>
      {title && <h3 className="font-semibold mb-2">{title}</h3>}
      <p>{content.description}</p>
      {content.image && (
        <img 
          src={content.image} 
          alt={content.alt || ''} 
          className="w-full h-24 object-cover rounded mt-2"
        />
      )}
      {isAdmin && <div className="text-xs text-gray-500 mt-2">Admin mode</div>}
    </div>
  );
}
```

## Installation & Registration

### Core Blocks

Core blocks are **automatically registered** by the block registry. Simply place your block file in:
```
src/components/blocks/YourBlock.tsx
```

The registry will automatically discover and register any blocks that export a `blockModule`.

### External Blocks (Ready for Implementation)

External blocks can be installed as npm packages:

```bash
npm install @bento-blocks/weather-block
```

The block registry is ready to automatically discover and register external blocks following the naming convention `@bento-blocks/*`.

## Extension Compatibility

### Icon System Compatibility

The icon system is **100% backward compatible** for extensions:

```typescript
// ✅ All of these work perfectly:

// New: React Icons Feather strings (recommended)
icon: 'FiCalendar'      // → Beautiful Feather icon
icon: 'FiDatabase'      // → Professional icon

// Legacy: Emojis (still supported)
icon: '🎮'             // → Still displays
icon: '📊'             // → Works perfectly

// Advanced: Custom components  
icon: <MyCustomIcon />  // → Custom implementation
icon: MyIconComponent   // → Any React component
```

**Benefits for extension developers:**
- ✅ **No breaking changes** - existing blocks continue working
- ✅ **Progressive enhancement** - can upgrade to React Icons gradually
- ✅ **Automatic fallbacks** - unrecognized icons show default
- ✅ **No dependencies** - extensions don't need to install React Icons
- ✅ **Future-proof** - new icons can be added easily

### Dependencies

Extensions using the icon system don't need to:
- Install React Icons themselves
- Import any icon libraries  
- Handle icon mapping logic
- Worry about compatibility

The system handles everything automatically!

## Best Practices

### Icon Selection

1. **Use React Icons Feather names** for consistency: `'FiCalendar'`, `'FiDatabase'`, `'FiSettings'`
2. **Choose semantic icons** that clearly represent the block's purpose
3. **Test icon appearance** in both light and dark contexts
4. **Check icon availability** in React Icons Feather documentation
5. **Provide fallback descriptions** in block configuration

### Styling Guidelines

1. **Use Tailwind CSS** for consistency with the system
2. **Responsive design** - always test on mobile and desktop
3. **Container management** - use `h-full` to fill the available space
4. **Overflow handling** - use `rounded-xl overflow-hidden` on containers
5. **Consistent padding** - use `p-4` for standard padding

### Content Guidelines

1. **Handle empty content** gracefully with meaningful defaults
2. **Provide clear field labels** and help text
3. **Show loading states** for async operations
4. **Validate user input** with helpful error messages
5. **Support conditional fields** with dependencies

### Performance

1. **Lazy load heavy assets** to improve page load times
2. **Use React.memo** for components with expensive renders
3. **Minimize re-renders** by optimizing dependencies
4. **Optimize images** with proper sizing and formats

### Accessibility

1. **Use semantic HTML** elements appropriately
2. **Provide alt text** for all images
3. **Support keyboard navigation**
4. **Include ARIA labels** for complex interactions
5. **Ensure color contrast** meets accessibility standards

## Type Safety & Best Practices

The codebase has been enhanced with comprehensive type safety while maintaining flexibility for dynamic content:

### Core Type Improvements

#### 1. **Block Content Typing**
- Block content uses `Record<string, unknown>` for flexibility
- Type guards are used for safe property access
- Form fields use `unknown` for maximum compatibility

```typescript
// Safe content access pattern
const url = typeof content.url === 'string' ? content.url : '';
const title = typeof content.title === 'string' ? content.title : '';
const isEnabled = typeof content.enabled === 'boolean' ? content.enabled : false;
```

#### 2. **Form Field Value Types**
- Form values use `unknown` to handle various input types
- Type checking at point of use prevents runtime errors
- Proper fallbacks for undefined values

```typescript
// Form field type checking
const updateContent = (field: string, value: unknown) => {
  if (typeof value === 'string' && value.length > 0) {
    // Safe to use as string
  }
};
```

#### 3. **Admin Page Type Safety**
- Portfolio data properly typed as `BentoData | null`
- Block operations use explicit `BentoBlock` typing
- Error boundaries for undefined states

```typescript
setPortfolioData((prev: BentoData | null) => {
  if (!prev) return prev;
  return {
    ...prev,
    blocks: prev.blocks.map((block: BentoBlock) => 
      block.id === blockId ? updatedBlock : block
    ),
  };
});
```

### Type Guard Patterns

Use these patterns throughout the codebase for safe type checking:

```typescript
// String type checking
const safeString = typeof value === 'string' ? value : '';

// Number type checking  
const safeNumber = typeof value === 'number' ? value : 0;

// Boolean type checking
const safeBool = typeof value === 'boolean' ? value : false;

// Object property checking
if (typeof content.platform === 'string') {
  // Safe to use content.platform as string
}

// Array checking
if (Array.isArray(content.items)) {
  // Safe to use content.items as array
}
```

### Block Component Best Practices

#### 1. **Content Extraction**
Always extract and validate content properties at the top of components:

```typescript
function MyBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;
  
  // Extract and validate all needed properties
  const url = typeof content.url === 'string' ? content.url : '';
  const text = typeof content.text === 'string' ? content.text : '';
  const count = typeof content.count === 'number' ? content.count : 0;
  
  // Rest of component logic...
}
```

#### 2. **Preview Component Typing**
Preview components should expect flexible content:

```typescript
function MyBlockPreviewComponent({ 
  content 
}: { 
  content: Record<string, unknown> 
}) {
  const title = typeof content.title === 'string' ? content.title : 'Untitled';
  // Safe rendering logic...
}
```

#### 3. **Error Boundaries**
Always provide fallbacks for missing or invalid content:

```typescript
if (!url) {
  return (
    <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500">
      <span>Configure this block</span>
    </div>
  );
}
```

### Form Handling Best Practices

#### 1. **Dynamic Form Fields**
Handle form values safely with type checking:

```typescript
const currentValue = typeof content[field.key] === 'string' 
  ? content[field.key] 
  : field.defaultValue || '';
```

#### 2. **Value Updates**
Ensure type safety when updating values:

```typescript
const updateContent = (field: string, value: unknown) => {
  setBlockData(prev => ({
    ...prev,
    content: {
      ...(prev.content as Record<string, unknown>),
      [field]: value,
    },
  }));
};
```

### Error Handling Patterns

#### 1. **Validation Functions**
Use defensive programming for validation:

```typescript
const validateBlockData = (data: Record<string, unknown>) => {
  if (typeof data.url !== 'string' || !data.url) {
    return 'URL is required';
  }
  return null;
};
```

#### 2. **Runtime Checks**
Check types at runtime before using values:

```typescript
// Before using in JSX
{typeof content.title === 'string' && (
  <h2>{content.title}</h2>
)}

// Before passing to functions
if (typeof content.count === 'number') {
  processCount(content.count);
}
```

### Migration Guidelines

When updating existing components:

1. **Add type guards** for all content property access
2. **Extract content properties** at component start  
3. **Provide fallbacks** for undefined/invalid values
4. **Use explicit type checking** instead of truthy checks
5. **Test with invalid/missing data** to ensure robustness

### Benefits

- **Runtime Safety**: Prevents crashes from undefined properties
- **Developer Experience**: Clear error messages and predictable behavior  
- **Flexibility**: Supports dynamic content while maintaining safety
- **Maintainability**: Easier to debug and extend functionality
- **Third-party Compatibility**: Works with external block types

This approach ensures the block system remains flexible for extensibility while providing robust type safety for core functionality.

## Examples

See the existing blocks for reference implementations:
- `src/components/blocks/ClockBlock.tsx` - Simple utility block with timezone selection
- `src/components/blocks/LinkBlock.tsx` - Content block with URL validation  
- `src/components/blocks/PhotoBlock.tsx` - Media block with file upload
- `src/components/blocks/SocialBlock.tsx` - Complex block with platform selection
- `src/components/blocks/MapBlock.tsx` - Interactive block with external API

**All examples now use React Icons Feather icons:**
- ClockBlock: `icon: 'FiClock'`
- LinkBlock: `icon: 'FiLink'`  
- PhotoBlock: `icon: 'FiImage'`
- SocialBlock: `icon: 'FiUsers'`
- MapBlock: `icon: 'FiMap'`

## Testing

```typescript
// Example test for a custom block
import { render, screen } from '@testing-library/react';
import { blockModule } from './MyCustomBlock';

const { Component } = blockModule;

test('renders custom block with content', () => {
  const mockBlock = {
    id: 'test-123',
    type: 'my-custom-block',
    title: 'Test Title',
    content: { 
      description: 'Test Description',
      showLink: true,
      url: 'https://example.com'
    },
    size: 'small' as const,
    position: { x: 0, y: 0 }
  };

  render(<Component block={mockBlock} />);
  
  expect(screen.getByText('Test Title')).toBeInTheDocument();
  expect(screen.getByText('Test Description')).toBeInTheDocument();
  expect(screen.getByText('Learn more')).toBeInTheDocument();
});

test('validates configuration form', () => {
  const { configForm } = blockModule;
  
  // Test field validation
  const titleField = configForm.fields.find(f => f.key === 'title');
  expect(titleField?.required).toBe(true);
  expect(titleField?.validation?.max).toBe(50);
});

test('uses correct icon', () => {
  const { config } = blockModule;
  expect(config.icon).toBe('FiPalette'); // React Icons Feather icon name
});
```

## Publishing External Blocks

When creating external blocks for distribution:

1. **Package naming**: Use `@bento-blocks/your-block-name`
2. **Dependencies**: Mark React and Bento types as peer dependencies
3. **Documentation**: Include usage examples and screenshots
4. **TypeScript**: Provide complete type definitions
5. **Testing**: Include comprehensive tests
6. **Icons**: Use Lucide React names for consistency

```json
// package.json for external block
{
  "name": "@bento-blocks/weather-block",
  "version": "1.0.0",
  "description": "Weather block for Bento dashboards",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": ["dist"],
  "keywords": ["bento", "block", "weather", "dashboard"],
  "peerDependencies": {
    "react": "^18.0.0",
    "@types/react": "^18.0.0"
  },
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    }
  }
}
```

## System Architecture

### Block Registration Flow

1. **Discovery**: Registry scans for `blockModule` exports
2. **Validation**: Validates block configuration and components  
3. **Registration**: Adds block to available blocks map
4. **Icon Mapping**: Automatically maps icon names to components
5. **Form Generation**: Automatically creates configuration forms
6. **Runtime**: Blocks render using dynamic system

### Form System

- **Zero Configuration**: Works automatically for all field types
- **Dynamic Rendering**: Forms generated from field definitions
- **Validation**: Client-side and async validation support
- **Dependencies**: Conditional field display
- **File Upload**: Integrated upload with preview and modern UI
- **Theme Integration**: Automatic styling consistency
- **Icon Integration**: Beautiful Lucide React icons throughout

### UI System

- **Modern AddBlockModal**: Category organization, beautiful cards, hover effects
- **Professional Forms**: Enhanced styling, better UX, responsive design
- **Icon System**: Automatic Lucide React mapping with fallbacks
- **Theme Consistency**: Unified black/white design language

## Migration Notes

**All core blocks have been migrated to this system:**
✅ ClockBlock, LinkBlock, NoteBlock, MusicBlock, VideoBlock, PhotoBlock, SocialBlock, MapBlock
✅ All using React Icons Feather icons

**Legacy code removed:**
❌ No hardcoded forms remain
❌ No switch statements for block types
❌ No manual form implementations needed
❌ No emoji icons in core blocks (upgraded to React Icons Feather)

**Extension benefits:**
🚀 Zero modification required for new blocks
🚀 15+ field types supported out of the box
🚀 Advanced features like dependencies and custom components
🚀 Automatic form generation and validation
🚀 Beautiful React Icons Feather icon system
🚀 Modern AddBlockModal with categories
🚀 Complete type safety with TypeScript
🚀 100% backward compatibility for existing extensions

**Recent improvements:**
✨ React Icons Feather icon system implementation
✨ Beautiful AddBlockModal redesign with categories
✨ Enhanced form UI with modern styling
✨ Improved file upload experience
✨ Better error handling and loading states
✨ Professional hover effects and transitions

## Support

For questions or help with block development:
1. **Examples**: Check existing blocks in `src/components/blocks/`
2. **Types**: Refer to TypeScript interfaces in `src/types/bento.ts`
3. **Icons**: Browse React Icons Feather documentation for available icons
4. **Testing**: Test blocks in both mobile and desktop views
5. **Patterns**: Follow established conventions for consistency
6. **Documentation**: Keep this guide updated with new features 

## Error Handling & Debugging

The block registry includes comprehensive error handling for both core and third-party blocks:

### Error-Safe Methods

Use these methods for production code - they include error recovery and validation:

```typescript
// ✅ Error-safe methods (recommended)
const block = blockRegistry.getBlock(type);        // Returns null on error
const blocks = blockRegistry.getAllBlocks();       // Returns [] on error
const types = blockRegistry.getAvailableTypes();   // Returns [] on error
const isHealthy = blockRegistry.hasBlock(type);    // Returns false on error

// Health monitoring
const health = blockRegistry.healthCheck();
const status = blockRegistry.getStatus();
```

### Legacy Interface Methods

These methods are kept for interface compatibility but don't include error handling:

```typescript
// ⚠️ Legacy methods (use with caution)
const block = blockRegistry.get(type);             // Can return undefined
const blocks = blockRegistry.getAll();             // Returns raw Map
const configs = blockRegistry.getConfigs();        // Can throw errors
```

### Error Types & Recovery

The system handles various error scenarios:

1. **Module Loading Errors**: Failed imports are logged and skipped
2. **Validation Errors**: Invalid block configurations are rejected
3. **Runtime Errors**: Component errors are caught and logged
4. **Third-party Block Errors**: External blocks are isolated from core blocks

### Debugging Tools

#### Console Logging

The registry provides detailed console output with emojis for easy identification:

```
🚀 Initializing block registry...
[core:PhotoBlock] ✅ Registered block: photo (Photo Block)
[external:weather] ❌ Failed to load: Module not found
🎉 Block registry initialized in 45ms:
   ✅ 9 blocks loaded successfully
   ❌ 1 blocks failed to load
   📦 Total registered: 9 blocks
```

#### Health Check API

```typescript
const health = blockRegistry.healthCheck();
console.log(health);
// {
//   healthy: false,
//   issues: ["Block 'weather' failed validation"],
//   blockCount: 9
// }
```

#### Registry Status

```typescript
const status = blockRegistry.getStatus();
console.log(status);
// {
//   initialized: true,
//   totalBlocks: 9,
//   healthyBlocks: 9,
//   coreBlocks: 9,
//   externalBlocks: 0
// }
```

### Best Practices for Block Development

1. **Always use error-safe methods** in components and production code
2. **Test block validation** by checking health after registration
3. **Handle missing blocks gracefully** - components should render fallbacks
4. **Monitor console output** during development for early error detection
5. **Use source tagging** when registering external blocks:

```typescript
blockRegistry.register(myBlockModule, 'plugin:my-weather-block');
```

### Third-Party Block Guidelines

When developing external blocks:

1. **Export validation**: Ensure your block exports `blockModule` correctly
2. **Error boundaries**: Wrap your components in error boundaries
3. **Graceful degradation**: Handle missing dependencies gracefully
4. **Version compatibility**: Specify `minAppVersion` in your config
5. **Testing**: Test your block in isolation and with the full system

Example external block structure:
```typescript
// my-custom-block/index.ts
export const blockModule: BlockModule = {
  config: {
    type: 'my-custom',
    name: 'My Custom Block',
    icon: 'FiStar',
    description: 'A custom block',
    defaultSize: 'medium',
    minAppVersion: '1.0.0'
  },
  Component: MyCustomComponent,
  configForm: {
    fields: [/* ... */]
  },
  getDefaultContent: () => ({ message: 'Hello World' })
};
```

### Error Recovery Strategies

The system implements several recovery strategies:

1. **Partial Loading**: Continue loading other blocks if one fails
2. **Validation Skipping**: Skip invalid blocks but continue with valid ones  
3. **Runtime Isolation**: Block errors don't crash the entire system
4. **Fallback Rendering**: Missing blocks show error states instead of crashing
5. **Retry Prevention**: Mark registry as initialized even on partial failure

This ensures the application remains functional even when some blocks fail to load or encounter errors. 