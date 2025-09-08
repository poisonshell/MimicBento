import {
  BlockModule,
  BlockComponentProps,
  BlockConfig,
  BlockConfigForm,
} from '@/types/bento';

function NoteBlockComponent({ block }: BlockComponentProps) {
  const { content, title } = block;

  const contentRecord = content as Record<string, unknown>;
  const text = typeof contentRecord.text === 'string' ? contentRecord.text : '';

  if (!text && !title) {
    return (
      <div className="flex items-center justify-center h-full p-4 text-gray-500">
        <span>Add your note text</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center h-full p-4 bg-white">
      <div className="text-gray-900 text-base whitespace-pre-wrap">
        {text || title}
      </div>
    </div>
  );
}

// Block configuration
const config: BlockConfig = {
  type: 'note',
  name: 'Note',
  icon: 'FiFileText',
  description: 'Text note or memo',
  defaultSize: 'small',
  supportedSizes: ['small', 'medium', 'large', 'wide', 'tall'],
  category: 'content',
  version: '1.0.0',
  author: {
    name: 'MimicBento',
  },
};

// Configuration form
const configForm: BlockConfigForm = {
  fields: [
    {
      key: 'text',
      label: 'Note Text',
      type: 'textarea',
      required: true,
      placeholder: 'Write your note here...',
      help: 'The main content of your note',
      validation: {
        max: 1000,
        message: 'Note must be 1000 characters or less',
      },
    },
  ],
  validate: (data: Record<string, unknown>) => {
    const text = typeof data.text === 'string' ? data.text : '';
    if (!text || text.trim().length === 0) {
      return 'Note text is required';
    }
    return null;
  },
};

// Default content when creating a new note block
const getDefaultContent = () => ({
  text: '',
});

// Preview component for the add modal
function NotePreviewComponent({
  content,
}: {
  content: Record<string, unknown>;
}) {
  const contentRecord = content as Record<string, unknown>;
  const text = typeof contentRecord.text === 'string' ? contentRecord.text : '';

  return (
    <div className="p-2 border rounded text-sm">
      <div className="font-medium">📝 Note</div>
      <div className="text-gray-500 text-xs mt-1 line-clamp-2">
        {text || 'Your note text will appear here...'}
      </div>
    </div>
  );
}

export const blockModule: BlockModule = {
  config,
  Component: NoteBlockComponent,
  configForm,
  getDefaultContent,
  PreviewComponent: NotePreviewComponent,
};

export default NoteBlockComponent;
