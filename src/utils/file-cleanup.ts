import { promises as fs } from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_FILE_PATH = path.join(
  process.cwd(),
  'public',
  'data',
  'portfolio.json'
);

const CLEANUP_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface PortfolioData {
  profile?: {
    avatar?: string;
  };
  blocks?: Array<{
    content?: {
      image?: string;
      [key: string]: unknown;
    };
  }>;
}

async function getReferencedImages(): Promise<Set<string>> {
  const referencedImages = new Set<string>();

  try {
    const dataContent = await fs.readFile(DATA_FILE_PATH, 'utf8');
    const data: PortfolioData = JSON.parse(dataContent);

    if (data.profile?.avatar) {
      referencedImages.add(data.profile.avatar);
    }

    if (data.blocks) {
      for (const block of data.blocks) {
        if (block.content?.image) {
          referencedImages.add(block.content.image);
        }

        if (block.content) {
          Object.values(block.content).forEach(value => {
            if (typeof value === 'string' && value.startsWith('/uploads/')) {
              referencedImages.add(value);
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Error reading portfolio data for cleanup:', error);
  }

  return referencedImages;
}

async function getUploadedFiles(): Promise<
  Array<{ name: string; path: string; mtime: Date }>
> {
  try {
    const files = await fs.readdir(UPLOADS_DIR);
    const fileStats = await Promise.all(
      files.map(async file => {
        const filePath = path.join(UPLOADS_DIR, file);
        const stats = await fs.stat(filePath);
        return {
          name: file,
          path: filePath,
          mtime: stats.mtime,
        };
      })
    );

    return fileStats;
  } catch (error) {
    console.error('Error reading uploads directory:', error);
    return [];
  }
}

export async function cleanupOldUploads(): Promise<{
  removed: string[];
  kept: string[];
  errors: string[];
}> {
  const result = {
    removed: [] as string[],
    kept: [] as string[],
    errors: [] as string[],
  };

  try {
    const referencedImages = await getReferencedImages();
    const uploadedFiles = await getUploadedFiles();
    const now = Date.now();

    for (const file of uploadedFiles) {
      const fileUrl = `/uploads/${file.name}`;
      const isReferenced = referencedImages.has(fileUrl);
      const isOld = now - file.mtime.getTime() > CLEANUP_AGE_MS;

      if (!isReferenced && isOld) {
        try {
          await fs.unlink(file.path);
          result.removed.push(file.name);
          console.log(`Cleaned up old file: ${file.name}`);
        } catch (error) {
          result.errors.push(`Failed to remove ${file.name}: ${error}`);
          console.error(`Failed to remove ${file.name}:`, error);
        }
      } else {
        result.kept.push(file.name);
      }
    }

    console.log(
      `Cleanup completed: ${result.removed.length} removed, ${result.kept.length} kept, ${result.errors.length} errors`
    );
  } catch (error) {
    console.error('Error during cleanup:', error);
    result.errors.push(`Cleanup failed: ${error}`);
  }

  return result;
}

export async function getUploadStats(): Promise<{
  totalFiles: number;
  totalSize: number;
  oldFiles: number;
  referencedFiles: number;
}> {
  try {
    const referencedImages = await getReferencedImages();
    const uploadedFiles = await getUploadedFiles();
    const now = Date.now();

    let totalSize = 0;
    let oldFiles = 0;
    let referencedFiles = 0;

    for (const file of uploadedFiles) {
      const stats = await fs.stat(file.path);
      totalSize += stats.size;

      const isOld = now - file.mtime.getTime() > CLEANUP_AGE_MS;
      if (isOld) oldFiles++;

      const isReferenced = referencedImages.has(`/uploads/${file.name}`);
      if (isReferenced) referencedFiles++;
    }

    return {
      totalFiles: uploadedFiles.length,
      totalSize,
      oldFiles,
      referencedFiles,
    };
  } catch (error) {
    console.error('Error getting upload stats:', error);
    return {
      totalFiles: 0,
      totalSize: 0,
      oldFiles: 0,
      referencedFiles: 0,
    };
  }
}

export async function manualCleanup(): Promise<{
  success: boolean;
  message: string;
  details?: {
    removed: string[];
    kept: string[];
    errors: string[];
    stats?: {
      totalFiles: number;
      totalSize: number;
      oldFiles: number;
      referencedFiles: number;
    };
  };
}> {
  try {
    const stats = await getUploadStats();

    if (stats.oldFiles === 0) {
      return {
        success: true,
        message: 'No old files to clean up',
        details: {
          removed: [],
          kept: [],
          errors: [],
          stats,
        },
      };
    }

    const result = await cleanupOldUploads();

    return {
      success: true,
      message: `Cleanup completed: ${result.removed.length} files removed`,
      details: { ...result, stats },
    };
  } catch (error) {
    return {
      success: false,
      message: `Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.NEXT_PUBLIC_ENABLE_ADMIN === 'true'
) {
  // Run initial cleanup after 5 minutes
  setTimeout(
    () => {
      cleanupOldUploads().catch(console.error);
    },
    5 * 60 * 1000
  );

  // Then run every 7 days (weekly)
  setInterval(
    () => {
      cleanupOldUploads().catch(console.error);
    },
    7 * 24 * 60 * 60 * 1000
  );
}
